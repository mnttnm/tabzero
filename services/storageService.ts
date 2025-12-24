import { SavedItem } from '../types';

declare const chrome: any;

const STORAGE_KEY = 'tab_triage_saved_items';
const NAVBAR_SETTINGS_KEY = 'navbar_settings';

export interface NavbarSettings {
  visibilityMode: 'persistent' | 'on-demand';
}

const isExtension = typeof chrome !== 'undefined' && !!chrome.storage;

export const saveItem = async (item: SavedItem): Promise<void> => {
  if (isExtension) {
    const result = await chrome.storage.local.get([STORAGE_KEY]);
    let items = result[STORAGE_KEY] || [];
    // Deduplicate: Remove existing item with same URL if it exists
    items = items.filter((i: SavedItem) => i.url !== item.url);
    items.unshift(item); // Add to top
    await chrome.storage.local.set({ [STORAGE_KEY]: items });
  } else {
    const existing = localStorage.getItem(STORAGE_KEY);
    let items = existing ? JSON.parse(existing) : [];
    items = items.filter((i: SavedItem) => i.url !== item.url);
    items.unshift(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
};

export const getSavedItems = async (): Promise<SavedItem[]> => {
  if (isExtension) {
    const result = await chrome.storage.local.get([STORAGE_KEY]);
    return result[STORAGE_KEY] || [];
  } else {
    const existing = localStorage.getItem(STORAGE_KEY);
    return existing ? JSON.parse(existing) : [];
  }
};

export const clearSavedItems = async (): Promise<void> => {
  if (isExtension) {
    await chrome.storage.local.remove(STORAGE_KEY);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export const deleteItem = async (id: string): Promise<void> => {
  if (isExtension) {
    const result = await chrome.storage.local.get([STORAGE_KEY]);
    const items = result[STORAGE_KEY] || [];
    const updated = items.filter((i: SavedItem) => i.id !== id);
    await chrome.storage.local.set({ [STORAGE_KEY]: updated });
  } else {
    const existing = localStorage.getItem(STORAGE_KEY);
    const items = existing ? JSON.parse(existing) : [];
    const updated = items.filter((i: SavedItem) => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
};

export const cleanupDuplicates = async (): Promise<void> => {
    const items = await getSavedItems();
    if (items.length === 0) return;

    // Map URL -> best item
    const uniqueMap = new Map<string, SavedItem>();

    for (const item of items) {
        if (!uniqueMap.has(item.url)) {
            uniqueMap.set(item.url, item);
        } else {
            const existing = uniqueMap.get(item.url)!;
            // logic: keep one with favorite or note, else newer
            const existingScore = (existing.favorite ? 2 : 0) + (existing.note ? 1 : 0);
            const newScore = (item.favorite ? 2 : 0) + (item.note ? 1 : 0);

            if (newScore > existingScore) {
                uniqueMap.set(item.url, item);
            } else if (newScore === existingScore) {
                 // If scores equal, keep newer one? Or keep existing?
                 // Usually newer is better? Or stick to first found?
                 // Let's keep existing to maintain stability unless newer is much better.
                 // Actually, if I just saved a tab, I want that one.
                 // Let's assume 'items' is sorted by date desc usually (unshift).
                 // So the first one we encounter is the newest.
                 // If we encounter another with same URL later, it is older.
                 // So we just keep the first one we find (newest), unless an older one has better score?
                 // Wait, this loop processes items in order.
                 // If items[0] is newest.
                 // If we find items[5] same URL.
                 // If items[5] has note but items[0] doesn't, we want items[5].
            }
        }
    }
    
    // The loop above simple 'first win' isn't enough if a later (older) item has a note.
    // Let's do a proper Reduce.
    
    // Group by URL
    const groups: Record<string, SavedItem[]> = {};
    items.forEach(i => {
        if (!groups[i.url]) groups[i.url] = [];
        groups[i.url].push(i);
    });

    const cleaned: SavedItem[] = [];
    Object.values(groups).forEach(group => {
        // Sort group: Best score first, then newest
        group.sort((a, b) => {
             const aScore = (a.favorite ? 2 : 0) + (a.note ? 1 : 0);
             const bScore = (b.favorite ? 2 : 0) + (b.note ? 1 : 0);
             if (aScore !== bScore) return bScore - aScore;
             return b.timestamp - a.timestamp;
        });
        cleaned.push(group[0]);
    });

    // Re-sort entire list by timestamp desc (or just order by newest)
    cleaned.sort((a, b) => b.timestamp - a.timestamp);

    // Save back
    if (isExtension) {
        await chrome.storage.local.set({ [STORAGE_KEY]: cleaned });
    } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    }
};

// Navbar settings
const DEFAULT_NAVBAR_SETTINGS: NavbarSettings = {
  visibilityMode: 'persistent',
};

export const getNavbarSettings = async (): Promise<NavbarSettings> => {
  if (isExtension) {
    const result = await chrome.storage.local.get([NAVBAR_SETTINGS_KEY]);
    return result[NAVBAR_SETTINGS_KEY] || DEFAULT_NAVBAR_SETTINGS;
  } else {
    const existing = localStorage.getItem(NAVBAR_SETTINGS_KEY);
    return existing ? JSON.parse(existing) : DEFAULT_NAVBAR_SETTINGS;
  }
};

export const setNavbarSettings = async (settings: NavbarSettings): Promise<void> => {
  if (isExtension) {
    await chrome.storage.local.set({ [NAVBAR_SETTINGS_KEY]: settings });
  } else {
    localStorage.setItem(NAVBAR_SETTINGS_KEY, JSON.stringify(settings));
  }
};