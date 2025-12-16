import { TabData } from '../types';

declare const chrome: any;

const isExtension = typeof chrome !== 'undefined' && !!chrome.tabs;

import * as metadataService from './metadataService';
import * as colorUtils from '../utils/colorUtils';

export const getAllTabs = async (): Promise<TabData[]> => {
  if (isExtension) {
    return new Promise((resolve) => {
      chrome.tabs.query({}, async (tabs: any[]) => {
        // Filter out the extension tab itself
        const filtered = tabs.filter(t => !t.url.startsWith('chrome-extension://'));
        
        // Map basic data first
        const mapped: TabData[] = filtered.map(t => ({
              id: t.id || 0,
              title: t.title || 'Untitled',
              url: t.url || '',
              favIconUrl: t.favIconUrl,
              windowId: t.windowId,
              discarded: t.discarded
        }));

        // Enrich with metadata/gradients in parallel
        // We do this concurrently to not block the initial UI render too long, 
        // OR we could return basic data first and then update. 
        // For simplicity, we await here but it should be fast.
        // Enrich with metadata/gradients in parallel with concurrency limit
        // We process in batches to avoid overwhelming the network/browser and hitting rate limits (429)
        const enriched: TabData[] = [];
        const BATCH_SIZE = 5;

        for (let i = 0; i < mapped.length; i += BATCH_SIZE) {
            const batch = mapped.slice(i, i + BATCH_SIZE);
            
            // Process the current batch
            const batchResults = await Promise.all(batch.map(async (tab) => {
                try {
                    // Skip metadata extraction for discarded (suspended) tabs to avoid errors/hangs
                    if (tab.discarded) {
                         // Just use adaptive gradient
                         if (tab.favIconUrl) {
                            const dominant = await colorUtils.getDominantColor(tab.favIconUrl);
                            const gradient = colorUtils.getGradientFromColor(dominant);
                            return { ...tab, gradient };
                        }
                        return { ...tab, gradient: 'linear-gradient(135deg, #27272a 0%, #18181b 100%)' };
                    }

                    // 1. Try to get Open Graph Metadata
                    const metadata = await metadataService.getTabMetadata(tab.id);
                    if (metadata.image) {
                        return { ...tab, previewImage: metadata.image };
                    }

                    // 2. Fallback: Adaptive Gradient from Favicon
                    if (tab.favIconUrl) {
                        const dominant = await colorUtils.getDominantColor(tab.favIconUrl);
                        const gradient = colorUtils.getGradientFromColor(dominant);
                        return { ...tab, gradient };
                    }
                    
                    // 3. Generic Fallback
                    return { ...tab, gradient: 'linear-gradient(135deg, #27272a 0%, #18181b 100%)' };

                } catch (e) {
                    console.warn("Failed to enrich tab", tab.id, e);
                    return { ...tab, gradient: 'linear-gradient(135deg, #27272a 0%, #18181b 100%)' };
                }
            }));
            
            enriched.push(...batchResults);
        }

        resolve(enriched);
      });
    });
  } else {
    // Mock data for development
    return [
      { 
          id: 1, 
          title: 'React Documentation', 
          url: 'https://react.dev', 
          favIconUrl: 'https://react.dev/favicon.ico',
          gradient: 'linear-gradient(135deg, #149eca 0%, #18181b 100%)'
      },
      { 
          id: 2, 
          title: 'Tailwind CSS - Rapid UI', 
          url: 'https://tailwindcss.com', 
          favIconUrl: 'https://tailwindcss.com/favicon.ico',
          gradient: 'linear-gradient(135deg, #38bdf8 0%, #18181b 100%)'
      },
      { 
          id: 3, 
          title: 'Google Gemini API Docs', 
          url: 'https://ai.google.dev', 
          favIconUrl: 'https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030.png',
          previewImage: 'https://lh3.googleusercontent.com/X-a2e_bOaFowWdOXhQhIsq5yXqtc_eXmRwG5C8S06G_A-NJD4vX_qD_c9Q=w1200' // Mock OG
      },
      { 
          id: 4, 
          title: 'GitHub - Pull Requests', 
          url: 'https://github.com/pulls', 
          favIconUrl: 'https://github.com/fluidicon.png',
          gradient: 'linear-gradient(135deg, #000000 0%, #333333 100%)'
      },
      { 
          id: 5, 
          title: 'Hacker News', 
          url: 'https://news.ycombinator.com', 
          favIconUrl: 'https://news.ycombinator.com/favicon.ico',
          gradient: 'linear-gradient(135deg, #ff6600 0%, #18181b 100%)'
      },
    ];
  }
};

export const closeTab = async (tabId: number): Promise<void> => {
  if (isExtension) {
    return new Promise((resolve) => {
      chrome.tabs.remove(tabId, () => resolve());
    });
  } else {
    console.log(`[Mock] Closed tab ${tabId}`);
    return Promise.resolve();
  }
};

export const switchToTab = async (tabId: number, windowId?: number): Promise<void> => {
    if(isExtension) {
        if (windowId) await chrome.windows.update(windowId, { focused: true });
        await chrome.tabs.update(tabId, { active: true });
    } else {
        console.log(`[Mock] Switched to tab ${tabId}`);
    }
}

export const openOrSwitchToUrl = async (url: string): Promise<void> => {
  if (isExtension) {
    return new Promise((resolve) => {
      // Query all tabs in all windows
      chrome.tabs.query({}, async (tabs: any[]) => {
        // Simple exact match for now
        const existingTab = tabs.find(t => t.url === url);

        if (existingTab && existingTab.id) {
          await switchToTab(existingTab.id, existingTab.windowId);
        } else {
          await chrome.tabs.create({ url });
        }
        resolve();
      });
    });
  } else {
    console.log(`[Mock] Opening or switching to ${url}`);
    window.open(url, '_blank');
    return Promise.resolve();
  }
};

export const pinTab = async (tabId: number, pinned: boolean): Promise<void> => {
    if (isExtension) {
        await chrome.tabs.update(tabId, { pinned });
    } else {
        console.log(`[Mock] Pin tab ${tabId} = ${pinned}`);
    }
}

export const getCurrentTab = async (): Promise<TabData | null> => {
    if (isExtension) {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs.length > 0) {
             const t = tabs[0];
             return {
                id: t.id || 0,
                title: t.title || 'Untitled',
                url: t.url || '',
                favIconUrl: t.favIconUrl,
                windowId: t.windowId
             };
        }
        return null;
    } else {
        return { id: 999, title: "Mock Extension Tab", url: "extension://mock" };
    }
}

export const subscribeToTabRemoval = (callback: (tabId: number) => void): () => void => {
    if (isExtension) {
        const listener = (tabId: number) => callback(tabId);
        chrome.tabs.onRemoved.addListener(listener);
        return () => chrome.tabs.onRemoved.removeListener(listener);
    } else {
        return () => {};
    }
}

export const openTabsInNewWindow = async (urls: string[]): Promise<void> => {
    if (isExtension) {
        if (urls.length === 0) return;
        return new Promise((resolve) => {
             // Create window with the first URL
             chrome.windows.create({ url: urls[0] }, (win: any) => {
                 // Create tabs for rest
                 if (urls.length > 1) {
                     const remaining = urls.slice(1);
                     remaining.forEach(u => {
                         chrome.tabs.create({ windowId: win.id, url: u });
                     });
                 }
                 resolve();
             });
        });
    } else {
        console.log(`[Mock] Opening new window with ${urls.length} tabs`);
        if (urls.length > 0) window.open(urls[0], '_blank');
    }
}