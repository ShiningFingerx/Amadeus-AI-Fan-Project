
import React from 'react';
import type { SynthesizedMemory } from '../types';

interface MemoryArchivePanelProps {
  isOpen: boolean;
  memories: SynthesizedMemory[];
  onClose: () => void;
}

const MemoryArchivePanel: React.FC<MemoryArchivePanelProps> = ({ isOpen, memories, onClose }) => {
  if (!isOpen) return null;

  const sortedMemories = [...memories].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="fixed inset-0 z-40">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      ></div>
      <div className="relative h-full w-full max-w-md glass-panel flex flex-col animate-slide-in-left border-r border-amber-500/30">
        <div className="p-6 flex-shrink-0 flex justify-between items-center border-b border-amber-500/30 bg-amber-500/5">
          <div>
            <h2 className="text-2xl font-orbitron text-amber-300 tracking-tighter">Memory Archive</h2>
            <p className="text-[9px] text-amber-500/50 uppercase tracking-[0.3em] font-roboto-mono mt-1">Classified Log // Subject 004</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close memory panel"
            className="p-2 text-amber-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow p-4 overflow-y-auto scrollbar-thin-amber space-y-6">
          {sortedMemories.length > 0 ? (
            <ul className="space-y-6">
              {sortedMemories.map((memory) => (
                <li key={memory.id} className="relative group">
                  <div className="absolute -left-2 top-0 bottom-0 w-0.5 bg-amber-500/20 group-hover:bg-amber-500 transition-colors"></div>
                  <div className="bg-slate-900/40 p-5 rounded-r-lg border border-white/5 hover:border-amber-500/30 transition-all">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-amber-400 font-orbitron text-sm tracking-wide leading-tight uppercase">{memory.title}</h3>
                        <span className="text-[8px] font-roboto-mono text-amber-600/50 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                            SYNC_ID: {memory.id.slice(-6)}
                        </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed font-sans italic opacity-90 border-l-2 border-amber-500/10 pl-3 mb-4">
                      "{memory.summary}"
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {memory.contextTags?.map(tag => (
                            <span key={tag} className="text-[9px] text-cyan-500/70 font-roboto-mono">#{tag}</span>
                        ))}
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-white/5">
                        <div className="flex gap-2">
                             {memory.emotionalSnapshot && (
                                 <div className="flex items-center gap-1">
                                     <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                                     <span className="text-[9px] text-cyan-600 font-bold uppercase font-orbitron">Neural Stabilized</span>
                                 </div>
                             )}
                        </div>
                        <p className="text-[9px] text-slate-600 font-roboto-mono">
                            {new Date(memory.timestamp).toLocaleString('tr-TR')}
                        </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-40">
                <div className="w-16 h-16 border-2 border-dashed border-amber-900 rounded-full flex items-center justify-center mb-6 animate-spin-slow">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4" /></svg>
                </div>
                <p className="text-amber-700 font-orbitron text-xs tracking-widest uppercase">Archive Empty</p>
                <p className="text-[10px] text-slate-700 mt-2 font-roboto-mono">Initiate neural synchronization to populate matrix logs.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoryArchivePanel;
