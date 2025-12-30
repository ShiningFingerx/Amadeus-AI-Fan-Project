import React from 'react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAbout: () => void;
  onOpenSettings: () => void;
  onOpenMemories: () => void;
  onOpenKurisuProfile: () => void;
  onToggleHistory: () => void;
  onNewChat: () => void;
  isMusicPlaying: boolean;
  isMusicLoaded: boolean;
  onToggleMusic: () => void;
  onUploadMusic: () => void;
  onViewAvatar: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen, onClose, onOpenAbout, onOpenSettings, onOpenMemories, onOpenKurisuProfile, onToggleHistory, onNewChat,
  isMusicPlaying, isMusicLoaded, onToggleMusic, onUploadMusic,
  onViewAvatar
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative h-full w-full max-w-xs glass-panel flex flex-col animate-slide-in-left">
        <div className="p-4 flex-shrink-0 flex justify-between items-center border-b border-amber-500/30">
          <h2 className="text-2xl font-orbitron text-amber-300">Menu</h2>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="text-amber-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-grow p-4 overflow-y-auto scrollbar-thin-amber space-y-4">
            <button
                onClick={onNewChat}
                className="w-full text-center py-3 px-4 border border-amber-500/50 bg-amber-500/20 text-white rounded-md hover:bg-amber-500/30 transition-colors duration-300 font-orbitron tracking-wider"
            >
                + NEW CHAT
            </button>
            <button
                onClick={onToggleHistory}
                className="w-full text-center py-3 px-4 border border-amber-500/50 text-amber-300 rounded-md hover:bg-amber-500/20 hover:text-white transition-colors duration-300 font-orbitron tracking-wider"
            >
                CHAT HISTORY
            </button>
             <button
                onClick={onOpenMemories}
                className="w-full text-center py-3 px-4 border border-amber-500/50 text-amber-300 rounded-md hover:bg-amber-500/20 hover:text-white transition-colors duration-300 font-orbitron tracking-wider"
            >
                MEMORY ARCHIVE
            </button>
             <button
                onClick={onOpenKurisuProfile}
                className="w-full text-center py-3 px-4 border border-amber-500/50 text-amber-300 rounded-md hover:bg-amber-500/20 hover:text-white transition-colors duration-300 font-orbitron tracking-wider"
            >
                KURISU PROFILE
            </button>
            <div className="border-t border-amber-500/30 pt-4 space-y-4">
                 <button
                    onClick={onOpenSettings}
                    className="w-full text-center py-2 px-4 border border-amber-500/50 text-amber-300 rounded-md hover:bg-amber-500/20 hover:text-white transition-colors duration-300 font-orbitron tracking-wider"
                >
                    SETTINGS
                </button>
                <button
                    onClick={onOpenAbout}
                    className="w-full text-center py-2 px-4 border border-amber-500/50 text-amber-300 rounded-md hover:bg-amber-500/20 hover:text-white transition-colors duration-300 font-orbitron tracking-wider"
                >
                    ABOUT
                </button>
            </div>

            <div className="border-t border-amber-500/30 pt-4 space-y-4">
                <button
                    onClick={onViewAvatar}
                    className="w-full flex items-center justify-center py-2 px-4 border border-amber-500/50 text-amber-300 rounded-md hover:bg-amber-500/20 hover:text-white transition-colors duration-300 font-orbitron tracking-wider"
                >
                    VIEW AVATAR
                </button>
            </div>

            <div className="border-t border-amber-500/30 pt-4 grid grid-cols-2 gap-4">
                <button
                    onClick={onUploadMusic}
                    className="w-full text-center py-2 px-4 border border-amber-500/50 text-amber-300 rounded-md hover:bg-amber-500/20 hover:text-white transition-colors duration-300 font-orbitron tracking-wider"
                >
                    UPLOAD
                </button>
                <button
                    onClick={onToggleMusic}
                    disabled={!isMusicLoaded}
                    className="w-full flex items-center justify-center py-2 px-4 border border-amber-500/50 text-amber-300 rounded-md hover:bg-amber-500/20 hover:text-white transition-colors duration-300 font-orbitron tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isMusicPlaying ? 
                        <><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>ON</> : 
                        <><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>OFF</>
                    }
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;