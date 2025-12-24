import React, { useState, useEffect } from 'react';
import { X, Save, Key, ExternalLink, Keyboard } from 'lucide-react';
import { getApiKey, setApiKey } from '../services/settingsService';
import { getNavbarSettings, setNavbarSettings, NavbarSettings } from '../services/storageService';

declare const chrome: any;

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [key, setKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [navbarMode, setNavbarMode] = useState<NavbarSettings['visibilityMode']>('persistent');

  useEffect(() => {
    if (isOpen) {
      getApiKey().then(k => setKey(k || ''));
      getNavbarSettings().then(settings => setNavbarMode(settings.visibilityMode));
    }
  }, [isOpen]);

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      await setApiKey(key);
      await setNavbarSettings({ visibilityMode: navbarMode });
      setSaving(false);
      onClose();
  };

  const openShortcutsPage = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-medium">
             <Key className="w-5 h-5 text-indigo-400" />
             <span>Settings</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Gemini API Key</label>
                    <input 
                        type="password" 
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono text-sm"
                        autoFocus
                    />
                </div>
                
                <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl space-y-2">
                    <p className="text-xs text-indigo-700 dark:text-indigo-200">
                Tab Triage uses Google's Gemini AI to summarize your tabs.
                        To enable this feature, you need to provide your own API Key.
                    </p>
                    <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium transition-colors"
                    >
                        Get a free Gemini API Key <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>

            {/* Floating Navbar Settings */}
            <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-medium">
                    <Keyboard className="w-4 h-4 text-amber-500" />
                    <span className="text-sm">Floating Save Bar</span>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Visibility Mode</label>
                    <select
                        value={navbarMode}
                        onChange={(e) => setNavbarMode(e.target.value as NavbarSettings['visibilityMode'])}
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm appearance-none cursor-pointer"
                    >
                        <option value="persistent">Always visible on pages</option>
                        <option value="on-demand">Show only with keyboard shortcut</option>
                    </select>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {navbarMode === 'persistent'
                            ? 'The save bar appears on all web pages automatically.'
                            : 'Press the keyboard shortcut to show/hide the save bar.'}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openShortcutsPage}
                    className="w-full py-2.5 px-4 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 font-medium rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                >
                    <Keyboard className="w-4 h-4" />
                    Customize Keyboard Shortcuts
                </button>
            </div>

            <button
                type="submit"
                disabled={saving}
                className="w-full py-3 px-4 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-medium rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
                {saving ? (
                    'Saving...'
                ) : (
                    <>
                        <Save className="w-4 h-4" />
                        Save Configuration
                    </>
                )}
            </button>
        </form>

      </div>
    </div>
  );
};
