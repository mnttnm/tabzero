import React from 'react';
import { SavedItem } from '../types';
import * as tabService from '../services/tabService';
import { Trash2, ExternalLink, FileText, Sparkles, Clock } from 'lucide-react';

interface SavedItemsListProps {
  items: SavedItem[];
  onClear: () => void;
}

export const SavedItemsList: React.FC<SavedItemsListProps> = ({ items, onClear }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
        <div className="p-4 bg-zinc-900 rounded-full mb-4">
            <Clock className="w-8 h-8" />
        </div>
        <p>No saved items yet.</p>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
        case 'note': return <FileText className="w-4 h-4 text-warning" />;
        case 'summary': return <Sparkles className="w-4 h-4 text-purple-400" />;
        default: return <Clock className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 animate-in slide-in-from-bottom duration-500">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Action List ({items.length})</h3>
        <button 
          onClick={onClear}
          className="text-xs text-danger hover:text-red-400 flex items-center gap-1 px-3 py-1 rounded hover:bg-white/5 transition-colors"
        >
          <Trash2 className="w-3 h-3" /> Clear All
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-surface border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors group">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    {getTypeIcon(item.type)}
                    <span className="text-xs font-mono uppercase text-zinc-500">{item.type}</span>
                    <span className="text-xs text-zinc-600">• {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <h4 className="font-medium text-zinc-200 mb-1 line-clamp-1">{item.title}</h4>
                <button 
                  onClick={() => tabService.openOrSwitchToUrl(item.url)}
                  className="text-xs text-zinc-500 hover:text-primary truncate block mb-2 text-left w-full hover:underline"
                >
                  {item.url}
                </button>

                {item.note && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-2 rounded-lg mt-2">
                    <p className="text-sm text-yellow-200/90">{item.note}</p>
                  </div>
                )}
                 {item.summary && (
                  <div className="bg-purple-500/10 border border-purple-500/20 p-2 rounded-lg mt-2">
                    <p className="text-sm text-purple-200/90 italic">AI: {item.summary}</p>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => tabService.openOrSwitchToUrl(item.url)}
                className="p-2 bg-zinc-900 rounded-lg text-zinc-400 group-hover:text-white group-hover:bg-primary transition-colors"
                title="Open Tab"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
