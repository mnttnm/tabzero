import React from 'react';
import { X, Clock, StickyNote, Sparkles, ExternalLink, Star } from 'lucide-react';
import { ActionType } from '../types';

interface ReviewControlsProps {
  onAction: (action: ActionType) => void;
  disabled?: boolean;
}

export const ReviewControls: React.FC<ReviewControlsProps> = ({ onAction, disabled }) => {
  const buttons = [
    {
      action: ActionType.OPEN,
      label: 'Open',
      sub: '(o)',
      icon: <ExternalLink className="w-5 h-5" />,
      style: 'bg-white dark:bg-zinc-800 hover:bg-emerald-600 hover:text-white text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 shadow-sm',
    },
    {
      action: ActionType.CLOSE,
      label: 'Close',
      sub: '(x)',
      icon: <X className="w-5 h-5" />,
      style: 'bg-white dark:bg-zinc-800 hover:bg-danger hover:text-white text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 shadow-sm',
    },
    {
      action: ActionType.SAVE,
      label: 'Later',
      sub: '(s)',
      icon: <Clock className="w-5 h-5" />,
      style: 'bg-white dark:bg-zinc-800 hover:bg-primary hover:text-white text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 shadow-sm',
    },
    {
      action: ActionType.FAVORITE,
      label: 'Favorite',
      sub: '(f)',
      icon: <Star className="w-5 h-5" />,
      style: 'bg-white dark:bg-zinc-800 hover:bg-yellow-500 hover:text-white text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 shadow-sm',
    },
    // {
    //   action: ActionType.SUMMARIZE,
    //   label: 'AI Summary',
    //   sub: '(a)',
    //   icon: <Sparkles className="w-5 h-5" />,
    //   style: 'bg-zinc-800 hover:bg-purple-600 hover:text-white text-zinc-300 border-zinc-700',
    // },
    {
      action: ActionType.NOTE,
      label: 'Note',
      sub: '(n)',
      icon: <StickyNote className="w-5 h-5" />,
      style: 'bg-white dark:bg-zinc-800 hover:bg-warning hover:text-white text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 shadow-sm',
    },
    {
      action: ActionType.SKIP,
      label: 'Skip',
      sub: '(→)',
      icon: <ExternalLink className="w-5 h-5 rotate-90" />, // Using rotated external link as arrow for now, or just ArrowRight if I import it
      style: 'bg-white dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-600 hover:text-zinc-900 dark:hover:text-white text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 shadow-sm',
    },
  ];

  return (
    <div className="flex gap-4 mt-8">
      {buttons.map((btn) => (
        <button
          key={btn.action}
          onClick={() => onAction(btn.action)}
          disabled={disabled}
          className={`
            group flex flex-col items-center justify-center w-24 h-24 rounded-xl border
            transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
            ${btn.style}
          `}
        >
          <div className="mb-2 p-2 rounded-full bg-zinc-100 dark:bg-white/5 group-hover:bg-white/40 transition-colors">
            {btn.icon}
          </div>
          <span className="text-sm font-medium">{btn.label}</span>
          <span className="text-xs opacity-50 mt-1">{btn.sub}</span>
        </button>
      ))}
    </div>
  );
};
