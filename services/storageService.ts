import { SavedItem } from '../types';

declare const chrome: any;

const STORAGE_KEY = 'tabzero_saved_items';

const isExtension = typeof chrome !== 'undefined' && !!chrome.storage;

export const saveItem = async (item: SavedItem): Promise<void> => {
  if (isExtension) {
    const result = await chrome.storage.local.get([STORAGE_KEY]);
    const items = result[STORAGE_KEY] || [];
    items.unshift(item); // Add to top
    await chrome.storage.local.set({ [STORAGE_KEY]: items });
  } else {
    const existing = localStorage.getItem(STORAGE_KEY);
    const items = existing ? JSON.parse(existing) : [];
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