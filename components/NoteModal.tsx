import React, { useState, useEffect, useRef } from 'react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-surface border border-zinc-700 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
        <h3 className="text-xl font-bold text-white mb-2">Add a Note</h3>
        <p className="text-zinc-400 text-sm mb-4">Why are you saving this for tomorrow?</p>
        
        <textarea
          ref={inputRef}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="E.g., Read section about hooks..."
          className="w-full h-32 bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-4"
        />

        <div className="flex justify-end gap-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(note)}
            className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-blue-600 transition-colors"
          >
            Save Note
          </button>
        </div>
        <div className="mt-4 text-center">
            <span className="text-xs text-zinc-600">Press ⌘+Enter to save</span>
        </div>
      </div>
    </div>
  );
};
