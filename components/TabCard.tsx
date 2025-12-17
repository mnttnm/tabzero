import React from 'react';
import { TabData } from '../types';
import { ExternalLink, Globe } from 'lucide-react';

interface TabCardProps {
  tab: TabData;
  isActive: boolean;
}

export const TabCard: React.FC<TabCardProps> = ({ tab, isActive }) => {


  return (
    <div 
      className={`
        relative w-full max-w-2xl bg-surface rounded-2xl border 
        transition-all duration-500 ease-out transform
        ${isActive ? 'opacity-100 scale-100 border-zinc-200 dark:border-zinc-700 shadow-2xl' : 'opacity-0 scale-95 border-transparent absolute'}
      `}
    >
      {/* Header / Top Bar */}
      <div className="flex items-center gap-3 p-4 border-b border-zinc-200 dark:border-zinc-800">
        {tab.favIconUrl ? (
          <img src={tab.favIconUrl} alt="" className="w-6 h-6 rounded-sm bg-white/10 dark:bg-zinc-800 p-0.5" />
        ) : (
          <Globe className="w-6 h-6 text-zinc-500" />
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white truncate">{tab.title}</h2>
          <p className="text-sm text-zinc-500 truncate">{tab.url}</p>
        </div>
        <a 
          href={tab.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          title="Open in new tab"
        >
          <ExternalLink className="w-5 h-5 text-zinc-400" />
        </a>
      </div>

      {/* Preview Area */}
      <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 overflow-hidden group flex items-center justify-center">
        
        {/* Case 1: Rich Preview Image */}
        {tab.previewImage ? (
          <div className="absolute inset-0 p-4 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
            {/* Blurred Background for Ambiance */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl scale-110"
              style={{ backgroundImage: `url(${tab.previewImage})` }}
            />

            {/* Main Image - Contain/Fit */}
            <img
              src={tab.previewImage}
              alt={tab.title}
              className="relative z-10 w-full h-full object-contain rounded-lg shadow-lg"
            />
          </div>
        ) : (
          /* Case 2: Gradient Fallback */
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: tab.gradient || 'linear-gradient(135deg, var(--surface) 0%, var(--background) 100%)',
              opacity: 1
            }}
          >
            {/* Large Central Icon - Wrapped in white/light container for visibility */}
            <div className="relative z-10 p-4 rounded-2xl bg-white/20 backdrop-blur-md shadow-2xl border border-white/30">
              {tab.favIconUrl ? (
                <img
                  src={tab.favIconUrl} 
                    alt=""
                    className="w-12 h-12 object-contain p-1 bg-white rounded-xl shadow-sm"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}

                {/* Fallback Globe Icon */}
                <div className={`${tab.favIconUrl ? 'hidden' : 'flex'} items-center justify-center`}>
                  <Globe className="w-12 h-12 text-zinc-200" />
                </div>
              </div>
            </div>
        )}
      </div>
    </div>
  );
};
