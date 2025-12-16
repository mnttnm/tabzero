import { TabData } from '../types';

declare const chrome: any;

const isExtension = typeof chrome !== 'undefined' && !!chrome.tabs;

export const getAllTabs = async (): Promise<TabData[]> => {
  if (isExtension) {
    return new Promise((resolve) => {
      chrome.tabs.query({ currentWindow: true }, (tabs: any[]) => {
        // Filter out the extension tab itself
        const mapped = tabs
            .filter(t => !t.url.startsWith('chrome-extension://'))
            .map(t => ({
              id: t.id || 0,
              title: t.title || 'Untitled',
              url: t.url || '',
              favIconUrl: t.favIconUrl,
              windowId: t.windowId
            }));
        resolve(mapped);
      });
    });
  } else {
    // Mock data for development
    return [
      { id: 1, title: 'React Documentation', url: 'https://react.dev', favIconUrl: 'https://react.dev/favicon.ico' },
      { id: 2, title: 'Tailwind CSS - Rapid UI', url: 'https://tailwindcss.com', favIconUrl: 'https://tailwindcss.com/favicon.ico' },
      { id: 3, title: 'Google Gemini API Docs', url: 'https://ai.google.dev', favIconUrl: 'https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030.png' },
      { id: 4, title: 'GitHub - Pull Requests', url: 'https://github.com/pulls', favIconUrl: 'https://github.com/fluidicon.png' },
      { id: 5, title: 'Hacker News', url: 'https://news.ycombinator.com', favIconUrl: 'https://news.ycombinator.com/favicon.ico' },
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