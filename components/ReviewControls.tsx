import React from 'react';
import { X, Clock, StickyNote, Sparkles, ExternalLink, Star } from 'lucide-react';
import { ActionType } from '../types';

interface ReviewControlsProps {
  onAction: (action: ActionType) => void;
  disabled?: boolean;
  activeAction?: ActionType | null;
}

export const ReviewControls: React.FC<ReviewControlsProps> = ({ onAction, disabled, activeAction }) => {
  const buttons = [
    {
      action: ActionType.OPEN,
      label: 'Open',
      sub: '(o)',
      icon: <ExternalLink className="w-5 h-5" />,
      style: 'bg-white dark:bg-zinc-800 hover:bg-emerald-600 hover:text-white text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 shadow-sm',
      activeStyle: '!bg-emerald-600 !text-white ring-4 ring-emerald-500/30 ring-offset-2 dark:ring-offset-zinc-900',
    },
    {
      action: ActionType.CLOSE,
      label: 'Close',
      sub: '(x)',
      icon: <X className="w-5 h-5" />,
      style: 'bg-white dark:bg-zinc-800 hover:bg-danger hover:text-white text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 shadow-sm',
      activeStyle: '!bg-danger !text-white ring-4 ring-red-500/30 ring-offset-2 dark:ring-offset-zinc-900',
    },
    {
      action: ActionType.SAVE,
      label: 'Later',
      sub: '(s)',
      icon: <Clock className="w-5 h-5" />,
      style: 'bg-white dark:bg-zinc-800 hover:bg-primary hover:text-white text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 shadow-sm',
      activeStyle: '!bg-primary !text-white ring-4 ring-blue-500/30 ring-offset-2 dark:ring-offset-zinc-900',
    },
    {
      action: ActionType.FAVORITE,
      label: 'Favorite',
      sub: '(f)',
      icon: <Star className="w-5 h-5" />,
      style: 'bg-white dark:bg-zinc-800 hover:bg-yellow-500 hover:text-white text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 shadow-sm',
      activeStyle: '!bg-yellow-500 !text-white ring-4 ring-yellow-500/30 ring-offset-2 dark:ring-offset-zinc-900',
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
      activeStyle: '!bg-warning !text-white ring-4 ring-amber-500/30 ring-offset-2 dark:ring-offset-zinc-900',
    },
    {
      action: ActionType.SKIP,
      label: 'Skip',
      sub: '(→)',
      icon: <ExternalLink className="w-5 h-5 rotate-90" />, // Using rotated external link as arrow for now, or just ArrowRight if I import it
      style: 'bg-white dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-600 hover:text-zinc-900 dark:hover:text-white text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 shadow-sm',
      activeStyle: '!bg-zinc-200 dark:!bg-zinc-600 !text-zinc-900 dark:!text-white ring-4 ring-zinc-500/30 ring-offset-2 dark:ring-offset-zinc-900',
    },
  ];

  return (
    <div className="flex gap-4 mt-8">
      {buttons.map((btn) => {
        const isActive = activeAction === btn.action;
        return (
          <button
            key={btn.action}
            onClick={() => onAction(btn.action)}
            disabled={disabled}
            className={`
              group flex flex-col items-center justify-center w-24 h-24 rounded-xl border
              transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed
              ${isActive ? 'scale-95 ' + btn.activeStyle : 'active:scale-95 ' + btn.style}
            `}
          >
            <div className={`
              mb-2 p-2 rounded-full transition-colors
              ${isActive ? 'bg-white/20' : 'bg-zinc-100 dark:bg-white/5 group-hover:bg-white/40'}
            `}>
              {btn.icon}
            </div>
            <span className="text-sm font-medium">{btn.label}</span>
            <span className="text-xs opacity-50 mt-1">{btn.sub}</span>
          </button>
        );
      })}
    </div>
  );
};
