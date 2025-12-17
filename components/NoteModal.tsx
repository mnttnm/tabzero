import React, { useState, useEffect, useRef } from 'react';
import { Bookmark, ListVideo, BookOpen } from 'lucide-react';

interface NoteModalProps {
  isOpen: boolean;
  onConfirm: (note: string) => void;
  onCancel: () => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  const [note, setNote] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setNote('');
      // Slight delay to allow render
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
        onConfirm(note);
    }
    if (e.key === 'Escape') {
        onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-surface border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Add a Note</h3>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">Why are you saving this for tomorrow?</p>
        
        <textarea
          ref={inputRef}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="E.g., Read section about hooks..."
          className="w-full h-32 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-4 placeholder:text-zinc-400"
        />

        <div className="flex justify-end gap-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(note)}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity shadow-sm shadow-blue-500/20"
          >
            Save Item
          </button>
        </div>
        <div className="mt-4 text-center space-y-1">
          <p className="text-xs text-zinc-400">Press <kbd className="font-sans px-1 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">⌘+Enter</kbd> to save</p>
        </div>
      </div>
    </div>
  );
};
