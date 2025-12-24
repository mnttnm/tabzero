import React, { useState, useEffect, useRef } from 'react';

interface NotePopoverProps {
  isOpen: boolean;
  onSave: (note: string) => void;
  onCancel: () => void;
}

export const NotePopover: React.FC<NotePopoverProps> = ({
  isOpen,
  onSave,
  onCancel,
}) => {
  const [note, setNote] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setNote('');
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (note.trim()) {
        onSave(note.trim());
      }
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="note-popover">
      <textarea
        ref={textareaRef}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Why are you saving this?"
      />
      <div className="note-hint">
        Press {navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+Enter to save
      </div>
      <div className="note-actions">
        <button className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="save-btn"
          onClick={() => note.trim() && onSave(note.trim())}
          disabled={!note.trim()}
        >
          Save
        </button>
      </div>
    </div>
  );
};
