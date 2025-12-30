
import React, { useRef } from 'react';

interface TopBarProps {
  onToggleHistory: () => void;
  onToggleMobileMenu: () => void;
  title: string;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TopBar: React.FC<TopBarProps> = ({ onToggleHistory, onToggleMobileMenu, title, onExport, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex-shrink-0 flex items-center p-4 glass-panel rounded-lg mb-4">
      <button
        onClick={onToggleMobileMenu}
        className="lg:hidden mr-4 p-2 text-amber-300 hover:text-white hover:bg-amber-500/20 rounded-full transition-colors"
        aria-label="Toggle menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      </button>
      
       <button
        onClick={onToggleHistory}
        className="hidden lg:block mr-4 p-2 text-amber-300 hover:text-white hover:bg-amber-500/20 rounded-full transition-colors"
        aria-label="Toggle chat history"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <h2 className="text-xl font-orbitron text-white truncate flex-grow" title={title}>
        {title}
      </h2>

      <div className="flex items-center gap-3">
        <button
          onClick={onExport}
          title="Export Cognitive Core (Save)"
          className="p-2 text-amber-500 hover:text-amber-300 border border-amber-900/50 hover:bg-amber-500/10 rounded transition-all font-orbitron text-[10px] tracking-widest uppercase flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          <span className="hidden sm:inline">Export</span>
        </button>
        
        <input type="file" ref={fileInputRef} onChange={onImport} accept=".json" className="hidden" />
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Import Cognitive Core (Load)"
          className="p-2 text-blue-400 hover:text-blue-300 border border-blue-900/50 hover:bg-blue-500/10 rounded transition-all font-orbitron text-[10px] tracking-widest uppercase flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          <span className="hidden sm:inline">Import</span>
        </button>
      </div>
    </div>
  );
};

export default TopBar;
