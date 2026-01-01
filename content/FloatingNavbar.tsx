import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NotePopover } from './NotePopover';

declare const chrome: any;

type VisibilityMode = 'persistent' | 'on-demand';
type Position = { x: number; y: number } | null;

// Inline SVG icons to avoid external dependencies
const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const BookmarkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
  </svg>
);

const PenIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

export const FloatingNavbar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [visibilityMode, setVisibilityMode] = useState<VisibilityMode>('persistent');
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [position, setPosition] = useState<Position>(null);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Load settings on mount
  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_NAVBAR_SETTINGS' }, (response) => {
      if (response?.settings) {
        setVisibilityMode(response.settings.visibilityMode);
        setIsVisible(response.settings.visibilityMode === 'persistent');
      }
    });
  }, []);

  // Listen for toggle command from background
  useEffect(() => {
    const handleMessage = (message: { type: string }) => {
      if (message.type === 'TOGGLE_NAVBAR') {
        setIsVisible((prev) => {
          if (prev) {
            // Animate out before hiding
            setIsAnimatingOut(true);
            setTimeout(() => {
              setIsAnimatingOut(false);
            }, 150);
          }
          return !prev;
        });
      }
    };
    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  // Listen for settings changes
  useEffect(() => {
    const handleStorageChange = (
      changes: { [key: string]: { newValue?: any; oldValue?: any } },
      area: string
    ) => {
      if (area === 'local' && changes.navbar_settings) {
        const newSettings = changes.navbar_settings.newValue;
        setVisibilityMode(newSettings.visibilityMode);
        if (newSettings.visibilityMode === 'persistent') {
          setIsVisible(true);
        }
      }
    };
    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start drag on the container itself or navbar, not on buttons
    const target = e.target as HTMLElement;
    if (target.closest('.navbar-btn')) return;

    e.preventDefault();
    setIsDragging(true);

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;

      // Constrain to viewport
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add/remove global mouse listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const showFeedback = (text: string) => {
    setFeedback(text);
    setTimeout(() => setFeedback(null), 1500);
  };

  const handleAction = async (
    action: 'favorite' | 'save' | 'note',
    note?: string
  ) => {
    const data = {
      title: document.title,
      url: window.location.href,
      note,
    };

    chrome.runtime.sendMessage(
      { type: 'NAVBAR_ACTION', action, data },
      (response) => {
        if (response?.success) {
          const messages = {
            favorite: 'Added to favorites',
            save: 'Saved for later',
            note: 'Note saved',
          };
          showFeedback(messages[action]);
        } else if (response?.error) {
          showFeedback('Error: ' + response.error);
        }
      }
    );

    if (action === 'note') {
      setIsNoteOpen(false);
    }
  };

  // Don't render if not visible in on-demand mode
  if (!isVisible && visibilityMode === 'on-demand' && !isAnimatingOut) {
    return null;
  }

  const containerClasses = [
    'navbar-container',
    isVisible && !isAnimatingOut ? 'visible' : 'hidden',
    isDragging ? 'dragging' : '',
    position ? 'custom-position' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const containerStyle: React.CSSProperties = position
    ? { left: position.x, top: position.y, bottom: 'auto' }
    : {};

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      style={containerStyle}
      onMouseDown={handleMouseDown}
    >
      {feedback && !isNoteOpen && (
        <div className="feedback-toast">{feedback}</div>
      )}

      <NotePopover
        isOpen={isNoteOpen}
        onSave={(note) => handleAction('note', note)}
        onCancel={() => setIsNoteOpen(false)}
      />

      <div className="navbar">
        <button
          type="button"
          className="navbar-btn favorite"
          onClick={() => handleAction('favorite')}
          title="Add to favorites"
        >
          <StarIcon />
        </button>

        <div className="divider" />

        <button
          type="button"
          className="navbar-btn save"
          onClick={() => handleAction('save')}
          title="Save for later"
        >
          <BookmarkIcon />
        </button>

        <div className="divider" />

        <button
          type="button"
          className="navbar-btn note"
          onClick={() => setIsNoteOpen(true)}
          title="Add a note"
        >
          <PenIcon />
        </button>
      </div>
    </div>
  );
};
