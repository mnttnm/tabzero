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
        ${isActive ? 'opacity-100 scale-100 border-zinc-700 shadow-2xl' : 'opacity-0 scale-95 border-transparent absolute'}
      `}
    >
      {/* Header / Top Bar */}
      <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
        {tab.favIconUrl ? (
          <img src={tab.favIconUrl} alt="" className="w-6 h-6 rounded-sm" />
        ) : (
          <Globe className="w-6 h-6 text-zinc-500" />
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-white truncate">{tab.title}</h2>
          <p className="text-sm text-zinc-500 truncate">{tab.url}</p>
        </div>
        <a 
          href={tab.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
          title="Open in new tab"
        >
          <ExternalLink className="w-5 h-5 text-zinc-400" />
        </a>
      </div>

      {/* Preview Area */}
      <div className="relative aspect-video w-full bg-zinc-900 border-t border-zinc-800 overflow-hidden group flex items-center justify-center">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 opacity-100" />
        
        {/* Large Favicon / Icon */}
        <div className="relative z-10 flex flex-col items-center gap-4 transition-transform duration-500 group-hover:scale-110">
            {tab.favIconUrl ? (
              <img 
                src={tab.favIconUrl} 
                alt={tab.title} 
                className="w-20 h-20 rounded-xl shadow-2xl"
                onError={(e) => {
                  // Fallback if favicon fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`
              ${tab.favIconUrl ? 'hidden' : 'flex'} 
              w-20 h-20 items-center justify-center rounded-xl bg-zinc-800 shadow-2xl border border-zinc-700
            `}>
               <Globe className="w-10 h-10 text-zinc-500" />
            </div>
            
            {/* Domain Pill */}
            <div className="px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-sm">
                <span className="text-xs text-zinc-400 font-medium">
                    {new URL(tab.url).hostname.replace('www.', '')}
                </span>
            </div>
        </div>
      </div>
    </div>
  );
};
