import React, { useState, useEffect, useMemo } from 'react';
import { SavedItem, SavedItemStatus } from '../types';
import * as tabService from '../services/tabService';
import * as storageService from '../services/storageService';
import { Trash2, ExternalLink, FileText, Sparkles, Clock, Star, Layout, Filter, AlertCircle } from 'lucide-react';

interface SavedItemsListProps {
  items: SavedItem[];
  onClear: () => void;
  onUpdateItems: (items: SavedItem[]) => void;
}

export const SavedItemsList: React.FC<SavedItemsListProps> = ({ items, onClear, onUpdateItems }) => {
  const [filter, setFilter] = useState<SavedItemStatus>('all');
  const [confirmClear, setConfirmClear] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // --- Filtering ---
  const filteredItems = useMemo(() => {
    const filtered = items.filter(item => {
      if (filter === 'all') return true;
      if (filter === 'favorite') return item.favorite;
      return item.type === filter;
    });

    // Custom Sort: Fav+Note -> Fav -> Note -> Remaining
    return filtered.sort((a, b) => {
      const aScore = (a.favorite ? 2 : 0) + (a.note ? 1 : 0);
      const bScore = (b.favorite ? 2 : 0) + (b.note ? 1 : 0);

      if (aScore !== bScore) return bScore - aScore; // Higher score first

      return b.timestamp - a.timestamp; // Then by time
    });
  }, [items, filter]);

  // --- Keyboard Navigation ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Common shortcuts
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          if (selectedIndex >= 0 && selectedIndex < filteredItems.length) {
            handleOpenItem(filteredItems[selectedIndex]);
          }
          break;
        case 'f':
          if (selectedIndex >= 0 && selectedIndex < filteredItems.length) {
            toggleFavorite(filteredItems[selectedIndex]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredItems, selectedIndex]);

  // --- Actions ---
  const toggleFavorite = async (item: SavedItem) => {
    const updatedItem = { ...item, favorite: !item.favorite };
    await storageService.saveItem(updatedItem);

    // Update local state via parent to reflect immediately
    const newItems = items.map(i => i.id === item.id ? updatedItem : i);
    onUpdateItems(newItems);
  };

  const handleOpenItem = async (item: SavedItem) => {
    // Open the url
    await tabService.openOrSwitchToUrl(item.url);
    // Remove from storage
    await storageService.deleteItem(item.id);
    // Update local state
    const newItems = items.filter(i => i.id !== item.id);
    onUpdateItems(newItems);
  };

  const handleOpenAll = async () => {
    const urls = filteredItems.map(i => i.url);
    await tabService.openTabsInNewWindow(urls);

    // Remove all opened items
    // We filter out the IDs of items we just opened
    const idsToRemove = new Set(filteredItems.map(i => i.id));

    // Iterate delete for storage consistency
    for (const item of filteredItems) {
      await storageService.deleteItem(item.id);
    }

    const newItems = items.filter(i => !idsToRemove.has(i.id));
    onUpdateItems(newItems);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'note': return <FileText className="w-4 h-4 text-warning" />;
      case 'summary': return <Sparkles className="w-4 h-4 text-purple-500" />;
      default: return <Clock className="w-4 h-4 text-primary" />;
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 min-h-[50vh]">
        <div className="p-4 bg-zinc-900 rounded-full mb-4">
            <Clock className="w-8 h-8" />
        </div>
        <p>No saved items yet.</p>
        <p className="text-xs mt-2 text-zinc-600">Review tabs to populate this list.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-6 pb-20 animate-in slide-in-from-bottom duration-500 px-4">

      {/* Controls Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            Saved Items
            <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">{filteredItems.length}</span>
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAll}
              disabled={filteredItems.length === 0}
              className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 px-3 py-1.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
              title="Open all filtered items in a new window"
            >
              <Layout className="w-3.5 h-3.5" /> Open in Window
            </button>

            {confirmClear ? (
              <div className="flex items-center gap-2 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                <span className="text-xs text-red-500 dark:text-red-400">Sure?</span>
                <button onClick={onClear} className="text-xs font-bold text-red-600 dark:text-red-500 hover:underline">Yes</button>
                <button onClick={() => setConfirmClear(false)} className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">No</button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                  className="text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 flex items-center gap-1 px-3 py-1.5 rounded hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          <Filter className="w-4 h-4 text-zinc-400 mr-2 shrink-0" />
          {(['all', 'favorite', 'saved', 'note', 'summary'] as SavedItemStatus[]).map((f) => (
            <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all whitespace-nowrap ${filter === f
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-100/50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-300'
                    }`}
                >
                  {f}
                </button>
              ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredItems.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <div
              key={item.id}
              className={`
                    relative group transition-all duration-200
                    bg-surface border rounded-xl p-4
                    ${isSelected
                  ? 'border-primary ring-1 ring-primary/50 bg-blue-50/50 dark:bg-zinc-800/50'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm'}
                `}
              onClick={() => setSelectedIndex(index)}
            >
              <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      {getTypeIcon(item.type)}
                      <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">{item.type}</span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-600">• {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {item.favorite && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 ml-auto mr-12 sm:mr-0 sm:ml-2" />}
                    </div>

                  <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-1 line-clamp-1 text-sm sm:text-base leading-snug">
                      {item.title}
                    </h4>

                    <a
                      href="#"
                    onClick={(e) => { e.preventDefault(); handleOpenItem(item); }}
                      className="text-xs text-zinc-500 hover:text-primary truncate block mb-2 w-full hover:underline font-mono"
                    >
                      {item.url}
                    </a>

                    {item.note && (
                    <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 p-2.5 rounded-lg mt-2 relative">
                      <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400 dark:bg-yellow-500/30 rounded-l-lg" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-200/90 pl-2 leading-relaxed">{item.note}</p>
                      </div>
                    )}
                    {item.summary && (
                    <div className="bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 p-2.5 rounded-lg mt-2 relative">
                      <div className="absolute top-0 left-0 w-1 h-full bg-purple-400 dark:bg-purple-500/30 rounded-l-lg" />
                      <p className="text-sm text-purple-800 dark:text-purple-200/90 italic pl-2 leading-relaxed">{item.summary}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <button 
                    onClick={(e) => { e.stopPropagation(); handleOpenItem(item); }}
                    className="p-2 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors border border-zinc-200 dark:border-zinc-800 shadow-sm"
                    title="Open Tab and Remove from List [Enter]"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(item); }}
                    className={`p-2 rounded-lg transition-colors border shadow-sm ${item.favorite
                      ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-200 dark:border-yellow-500/20'
                      : 'bg-white dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 border-zinc-200 dark:border-zinc-800 hover:text-yellow-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
                      title="Toggle Favorite [F]"
                    >
                      <Star className={`w-4 h-4 ${item.favorite ? 'fill-yellow-500' : ''}`} />
                    </button>
                  </div>
                </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && filter !== 'all' && (
          <div className="text-center py-12">
            <p className="text-zinc-500 text-sm">No items match the filter '{filter}'.</p>
            <button onClick={() => setFilter('all')} className="mt-2 text-xs text-primary hover:underline">Clear Filter</button>
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-[10px] text-zinc-600 font-mono">
          Shortcuts: [↓/↑] Navigate • [Enter] Open • [F] Favorite
        </p>
      </div>
    </div>
  );
};
