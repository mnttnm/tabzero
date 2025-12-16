import React from 'react';
import { LayoutDashboard, PlayCircle, RotateCw, RefreshCcw } from 'lucide-react';

interface NavbarProps {
  view: 'review' | 'list';
  setView: (view: 'review' | 'list') => void;
  onRefresh: () => void;
  onHardRefresh: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ view, setView, onRefresh, onHardRefresh }) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-800">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
        <span className="font-bold text-lg text-zinc-100 tracking-tight">TabZero</span>
      </div>

      <div className="flex items-center gap-1 bg-zinc-800/50 p-1 rounded-lg border border-zinc-700/50">
        <button
          onClick={() => setView('review')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            view === 'review'
              ? 'bg-zinc-700 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-700/50'
          }`}
        >
          <PlayCircle className="w-3.5 h-3.5" />
          Review
        </button>
        <button
          onClick={() => setView('list')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            view === 'list'
              ? 'bg-zinc-700 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-700/50'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Your Tabs
        </button>
      </div>

      <div className="flex items-center gap-2">
         <button
            onClick={onRefresh}
          title="Refresh Tabs List"
          className="flex items-center gap-2 px-3 py-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors bg-zinc-800/20"
          >
          <RotateCw className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Refresh</span>
          </button>
      </div>
    </div>
  );
};
