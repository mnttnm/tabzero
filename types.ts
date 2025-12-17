export interface TabData {
  id: number;
  title: string;
  url: string;
  favIconUrl?: string;
  windowId?: number;
  discarded?: boolean;
  previewImage?: string;
  gradient?: string;
}

export enum ActionType {
  CLOSE = 'CLOSE',
  SAVE = 'SAVE',
  NOTE = 'NOTE',
  SUMMARIZE = 'SUMMARIZE',
  OPEN = 'OPEN',
  SKIP = 'SKIP',
  FAVORITE = 'FAVORITE',
}

export interface SavedItem {
  id: string;
  originalTabId: number;
  title: string;
  url: string;
  timestamp: number;
  note?: string;
  summary?: string;
  tags?: string[];
  type: 'saved' | 'note' | 'summary';
  favorite?: boolean;
}

export type SavedItemStatus = 'all' | 'saved' | 'note' | 'summary' | 'favorite';

export interface TabAction {
  type: ActionType;
  label: string;
  icon: any; // Lucide icon component
  shortcut: string;
  color: string;
}
