import React, { useState, useEffect, useCallback } from 'react';
import { TabData, ActionType, SavedItem } from './types';
import * as tabService from './services/tabService';
import * as storageService from './services/storageService';
import * as geminiService from './services/geminiService';

import { TabCard } from './components/TabCard';
import { ReviewControls } from './components/ReviewControls';
import { NoteModal } from './components/NoteModal';
import { SavedItemsList } from './components/SavedItemsList';
import { Loader2, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [view, setView] = useState<'review' | 'list'>('review');

  // Load tabs and saved items on mount
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const [fetchedTabs, fetchedSaved] = await Promise.all([
        tabService.getAllTabs(),
        storageService.getSavedItems()
      ]);
      setTabs(fetchedTabs);
      setSavedItems(fetchedSaved);
      setLoading(false);

      // Pin the extension tab for easy access
      const current = await tabService.getCurrentTab();
      if (current) {
        await tabService.pinTab(current.id, true);
      }
    };
    init();
  }, []);

  // Listen for tab removal to keep list in sync
  useEffect(() => {
    const unsubscribe = tabService.subscribeToTabRemoval((tabId) => {
        setTabs(prev => {
            const index = prev.findIndex(t => t.id === tabId);
            // If the closed tab hasn't been reached yet, or is the current one, simple filter is fine
            // But if we closed a tab *before* our current index (i.e. we mocked skipped it),
            // we need to shift index down to maintain position on the same visual tab.
            if (index !== -1 && index < currentIndex) {
                setCurrentIndex(c => Math.max(0, c - 1));
            }
            return prev.filter(t => t.id !== tabId);
        });
    });
    return unsubscribe;
  }, [currentIndex]);

  const currentTab = tabs[currentIndex];
  const isFinished = tabs.length === 0 || currentIndex >= tabs.length;

  // Handles moving to the next tab after an action
  const advance = useCallback(() => {
    // Determine next index. If we remove the current item, we essentially stay at same index (unless it was last)
    // But since we are likely modifying the array, let's just remove the current item from list
    setTabs(prev => prev.filter((_, idx) => idx !== currentIndex));
    // Reset index not needed if we remove item at currentIndex, subsequent items shift up.
    // However, ensure we don't go out of bounds.
    if (currentIndex >= tabs.length - 1) {
        // Last item was processed
        setCurrentIndex(0); // Actually irrelevant if array is empty
    }
  }, [currentIndex, tabs.length]);

  const handleAction = async (action: ActionType, extraData?: string) => {
    if (!currentTab || processing) return;
    setProcessing(true);

    try {
      const newItem: SavedItem = {
        id: crypto.randomUUID(),
        originalTabId: currentTab.id,
        title: currentTab.title,
        url: currentTab.url,
        timestamp: Date.now(),
        type: 'saved' // default
      };

      switch (action) {
        case ActionType.CLOSE:
          await tabService.closeTab(currentTab.id);
          break;

        case ActionType.SAVE:
          newItem.type = 'saved';
          await storageService.saveItem(newItem);
          await tabService.closeTab(currentTab.id);
          break;

        case ActionType.NOTE:
          // Modal logic handles the actual saving
          setIsNoteModalOpen(true);
          setProcessing(false); // Stop processing so modal can open
          return; // Exit here, handled by modal callback

        case ActionType.SUMMARIZE:
          // Visual feedback for AI
          newItem.type = 'summary';
          const summary = await geminiService.summarizeTab(currentTab);
          newItem.summary = summary;
          await storageService.saveItem(newItem);
          await tabService.closeTab(currentTab.id);
          break;

        case ActionType.OPEN:
          // Just open/switch and do nothing else (don't advance)
          await tabService.switchToTab(currentTab.id, currentTab.windowId);
          setProcessing(false);
          return; // Return early so we don't advance

        case ActionType.SKIP:
            // Just move to next tab
            setCurrentIndex(prev => prev + 1);
            setProcessing(false);
            return; // Exit early, no advance() (which removes item)
      }
      
      // Update local saved list for immediate feedback
      if (action !== ActionType.CLOSE) {
          const updated = await storageService.getSavedItems();
          setSavedItems(updated);
      }
      
      advance();

    } catch (error) {
      console.error("Action failed", error);
    } finally {
       if (action !== ActionType.NOTE) setProcessing(false);
    }
  };

  const handleNoteConfirm = async (note: string) => {
    if (!currentTab) return;
    setIsNoteModalOpen(false);
    setProcessing(true);

    const newItem: SavedItem = {
      id: crypto.randomUUID(),
      originalTabId: currentTab.id,
      title: currentTab.title,
      url: currentTab.url,
      timestamp: Date.now(),
      type: 'note',
      note: note
    };

    await storageService.saveItem(newItem);
    await tabService.closeTab(currentTab.id);
    
    const updated = await storageService.getSavedItems();
    setSavedItems(updated);
    
    setProcessing(false);
    advance();
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (loading || isFinished || processing || isNoteModalOpen) return;
      
      // Ignore if typing in an input (though we don't have many here except modal)
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      switch (e.key.toLowerCase()) {
        case 'x':
        case 'delete':
        case 'backspace':
          handleAction(ActionType.CLOSE);
          break;
        case 's':
          handleAction(ActionType.SAVE);
          break;
        case 'n':
          handleAction(ActionType.NOTE);
          break;
        case 'a':
          handleAction(ActionType.SUMMARIZE);
          break;
        case 'o':
          if (currentTab) tabService.switchToTab(currentTab.id, currentTab.windowId);
          break;
        case 'arrowright':
            // Logic for skip
            handleAction(ActionType.SKIP);
             break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, isFinished, processing, isNoteModalOpen, currentTab]); // Dependencies crucial for closure context


  // --- RENDER ---

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-zinc-400">
        <div className="flex flex-col items-center gap-4">
           <Loader2 className="w-8 h-8 animate-spin text-primary" />
           <p>Analyzing open tabs...</p>
        </div>
      </div>
    );
  }

  // Finished State
  if (isFinished && view === 'review') {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-zinc-100 animate-in fade-in duration-700">
         <div className="mb-8 p-6 bg-green-500/10 rounded-full border border-green-500/20">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
         </div>
         <h1 className="text-4xl font-bold mb-4">All Clear!</h1>
         <p className="text-zinc-400 mb-8 max-w-md text-center">
           You have reviewed all open tabs. You can now close this tab or review your action items.
         </p>
         <button 
           onClick={() => setView('list')}
           className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-medium transition-colors border border-zinc-700"
         >
           View Saved Items
         </button>
      </div>
    );
  }

  // List View
  if (view === 'list') {
      return (
          <div className="min-h-screen bg-background p-8">
              <SavedItemsList items={savedItems} onClear={async () => {
                  await storageService.clearSavedItems();
                  setSavedItems([]);
              }} />
              <div className="fixed bottom-8 right-8">
                   <button 
                     onClick={() => setView('review')}
                     disabled={tabs.length === 0}
                     className="px-4 py-2 bg-zinc-800 text-zinc-400 rounded-lg hover:text-white disabled:opacity-50"
                   >
                       Back to Review
                   </button>
              </div>
          </div>
      )
  }

  // Main Review Interface
  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      {/* Top Status Bar */}
      <div className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
           <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
           <span className="font-mono text-sm text-zinc-400">TAB ZERO PROTOCOL</span>
        </div>
        <div className="text-zinc-500 text-sm font-medium">
            {tabs.length} tabs remaining
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
         {/* Stack Effect Background (Purely visual) */}
         <div className="absolute w-full max-w-xl h-64 bg-zinc-800/20 rounded-2xl transform translate-y-4 scale-95 -z-10" />
         <div className="absolute w-full max-w-lg h-64 bg-zinc-800/10 rounded-2xl transform translate-y-8 scale-90 -z-20" />

         {/* Active Card */}
         {currentTab && (
            <div className="w-full flex justify-center px-4 relative">
                {processing && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-[2px]">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    </div>
                )}
                <TabCard tab={currentTab} isActive={true} />
            </div>
         )}
         
         <ReviewControls onAction={handleAction} disabled={processing} />
         
         {/* Shortcuts Help */}
         <div className="mt-12 flex gap-8 text-xs text-zinc-600 font-mono">
             <span>[O] Open</span>
             <span>[X] Close</span>
             <span>[S] Save</span>
             <span>[A] AI Summary</span>
             <span>[N] Note</span>
             <span>[→] Skip</span>
         </div>
         
         <div className="absolute top-6 right-8">
            <button 
                onClick={() => setView('list')}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors uppercase font-medium tracking-wider"
            >
                Start Dashboard
            </button>
         </div>
      </div>

      <NoteModal 
        isOpen={isNoteModalOpen} 
        onConfirm={handleNoteConfirm} 
        onCancel={() => { setIsNoteModalOpen(false); setProcessing(false); }} 
      />
    </div>
  );
};

export default App;