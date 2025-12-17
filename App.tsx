import React, { useState, useEffect, useCallback } from 'react';
import { TabData, ActionType, SavedItem } from './types';
import * as tabService from './services/tabService';
import * as storageService from './services/storageService';
import * as geminiService from './services/geminiService';

import { TabCard } from './components/TabCard';
import { ReviewControls } from './components/ReviewControls';
import { NoteModal } from './components/NoteModal';
import { Navbar } from './components/Navbar';
import { SavedItemsList } from './components/SavedItemsList';
import { SettingsModal } from './components/SettingsModal';

import { Loader2, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [view, setView] = useState<'review' | 'list'>('review');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ action: ActionType | null, visible: boolean }>({ action: null, visible: false });

  // Load tabs and saved items on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Cleanup duplicates on load
      await storageService.cleanupDuplicates();

      const [fetchedTabs, fetchedSaved] = await Promise.all([
        tabService.getAllTabs(),
        storageService.getSavedItems()
      ]);
      setSavedItems(fetchedSaved);

      // Deduplicate: Exclude tabs that are already saved
      const uniqueTabs = fetchedTabs.filter(t => !fetchedSaved.some(s => s.url === t.url));
      setTabs(uniqueTabs);

      setLoading(false);

      // Pin the extension tab for easy access
      const current = await tabService.getCurrentTab();
      if (current) {
        await tabService.pinTab(current.id, true);
      }
    };

    // Initial load
    loadData();
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

  // Listen for background metadata updates (preview images / gradients)
  useEffect(() => {
    const unsubscribe = tabService.subscribeToUpdates((updatedTab) => {
      setTabs(prev => prev.map(t => {
        if (t.id === updatedTab.id) {
          // Merge the update
          return { ...t, ...updatedTab };
        }
        return t;
      }));
    });
    return unsubscribe;
  }, []);

  const currentTab = tabs[currentIndex];
  const isFinished = tabs.length === 0 || currentIndex >= tabs.length;

  // Handles moving to the next tab after an action
  const advance = useCallback((tabIdToRemove?: number) => {
    // Optimistic removal: Remove by ID to avoid race conditions with background listener
    // (If we removed by index, and background listener already removed it, we'd delete the WRONG tab)
    if (tabIdToRemove) {
      setTabs(prev => prev.filter(t => t.id !== tabIdToRemove));
    } else {
      // Fallback: Remove by index if no ID provided (should only happen if logic is missed)
      setTabs(prev => prev.filter((_, idx) => idx !== currentIndex));
    }

    // Reset index logic
    if (currentIndex >= tabs.length - 1) {
      setCurrentIndex(0);
    }
  }, [currentIndex, tabs.length]);

  const handleAction = async (action: ActionType, extraData?: string) => {
    if (!currentTab || processing) return;

    // Trigger button feedback
    setFeedback({ action, visible: true });
    // Clear feedback quickly for "press" effect
    setTimeout(() => {
      setFeedback(prev => ({ ...prev, visible: false }));
    }, 200);

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

        case ActionType.FAVORITE:
          newItem.type = 'saved';
          newItem.favorite = true;
          await storageService.saveItem(newItem);
          await tabService.closeTab(currentTab.id);
          break;

        case ActionType.NOTE:
          // Modal logic handles the actual saving
          setIsNoteModalOpen(true);
          setProcessing(false); // Stop processing so modal can open
          return; // Exit here, handled by modal callback

        // case ActionType.SUMMARIZE:
        //   // Visual feedback for AI
        //   newItem.type = 'summary';
        //   const summary = await geminiService.summarizeTab(currentTab);
        //   newItem.summary = summary;
        //   await storageService.saveItem(newItem);
        //   await tabService.closeTab(currentTab.id);
        //   break;

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
      
      advance(currentTab.id);

    } catch (error: any) {
      console.error("Action failed", error);
      if (error.message === "MISSING_API_KEY") {
        setIsSettingsOpen(true);
      }
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
    advance(currentTab.id);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global check for blocking states
      if (loading || processing || isNoteModalOpen) return;
      
      // Ignore if typing in an input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      // Navigation Shortcuts (Allowed even if finished)
      if (e.key.toLowerCase() === 'd') {
        setView('list');
        return;
      }
      if (e.key.toLowerCase() === 'r') {
        setView('review');
        return;
      }

      // Action Shortcuts (Blocked if finished)
      if (isFinished) return;

      switch (e.key.toLowerCase()) {
        case 'x':
        case 'delete':
        case 'backspace':
          handleAction(ActionType.CLOSE);
          break;
        case 's':
          handleAction(ActionType.SAVE);
          break;
        case 'f':
          handleAction(ActionType.FAVORITE);
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
  }, [loading, isFinished, processing, isNoteModalOpen, currentTab, view]);

  // --- AUTO REFRESH ON VIEW CHANGE ---
  useEffect(() => {
    if (view === 'review') {
      handleRefresh();
    }
  }, [view]);


  // --- RENDER ---

  // --- REFRESH LOGIC ---
  const handleRefresh = async () => {
    setLoading(true);
    const [fetchedTabs, fetchedSaved] = await Promise.all([
      tabService.getAllTabs(),
      storageService.getSavedItems()
    ]);
    setSavedItems(fetchedSaved);

    // Deduplicate on refresh too
    const uniqueTabs = fetchedTabs.filter(t => !fetchedSaved.some(s => s.url === t.url));
    setTabs(uniqueTabs);
    setLoading(false);
  };

  const handleHardRefresh = () => {
    window.location.reload();
  };

  // --- RENDER ---

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col bg-background">
        <Navbar view={view} setView={setView} onRefresh={() => { }} onHardRefresh={handleHardRefresh} onOpenSettings={() => setIsSettingsOpen(true)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-zinc-400">Analyzing open tabs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      <Navbar
        view={view}
        setView={setView}
        onRefresh={handleRefresh}
        onHardRefresh={handleHardRefresh}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-hidden relative">

        {view === 'list' && (
          <div className="h-full overflow-y-auto">
            <SavedItemsList
              items={savedItems}
              onClear={async () => {
                // Logic moved to component or passed as is, checking list component changes next
                await storageService.clearSavedItems();
                setSavedItems([]);
              }}
              onUpdateItems={(items) => setSavedItems(items)}
            />
          </div>
        )}

        {view === 'review' && isFinished && (
          <div className="flex h-full w-full flex-col items-center justify-center text-zinc-100 animate-in fade-in duration-700">
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
              View Your Tabs
            </button>
          </div>
        )}

        {view === 'review' && !isFinished && (
          <div className="flex flex-col h-full w-full items-center justify-center relative">
            {/* Status Info (Moved from old top bar) */}
            <div className="absolute top-6 text-zinc-500 text-sm font-medium">
              {tabs.length} tabs remaining
            </div>

            {/* Stack Effect Background */}
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

            <ReviewControls
              onAction={handleAction}
              disabled={processing}
              activeAction={feedback.visible ? feedback.action : null}
            />

            {/* Shortcuts Help */}
            <div className="mt-12 flex gap-8 text-xs text-zinc-600 font-mono">
              <span>[O] Open</span>
              <span>[X] Close</span>
             <span>[S] Save</span>
              <span>[F] Favorite</span>
             <span>[A] AI Summary</span>
              <span>[N] Note</span>
              <span>[→] Skip</span>
            </div>
          </div>
        )}
      </div>

      <NoteModal 
        isOpen={isNoteModalOpen} 
        onConfirm={handleNoteConfirm} 
        onCancel={() => { setIsNoteModalOpen(false); setProcessing(false); }} 
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => { setIsSettingsOpen(false); setProcessing(false); }}
      />
    </div>
  );
};

export default App;