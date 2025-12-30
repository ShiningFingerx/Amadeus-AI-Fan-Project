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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative h-full w-full max-w-sm glass-panel flex flex-col animate-slide-in-left">
        <div className="p-4 flex-shrink-0 flex justify-between items-center border-b border-amber-500/30">
          <h2 className="text-2xl font-orbitron text-amber-300">Anı Arşivi</h2>
          <button
            onClick={onClose}
            aria-label="Close memory panel"
            className="text-amber-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow p-2 overflow-y-auto scrollbar-thin-amber">
          {sortedMemories.length > 0 ? (
            <ul className="space-y-3 p-2">
              {sortedMemories.map((memory) => (
                <li key={memory.id} className="bg-slate-800/40 p-4 rounded-lg border border-amber-500/20">
                  <h3 className="font-bold text-amber-300 font-orbitron mb-2">{memory.title}</h3>
                  <p className="text-sm text-amber-200 leading-relaxed font-sans whitespace-pre-wrap">{memory.summary}</p>
                  <p className="text-xs text-slate-500 mt-3 text-right font-roboto-mono">
                    {new Date(memory.timestamp).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-700/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4" /></svg>
                <p className="text-amber-400">Henüz sentezlenmiş bir anı yok.</p>
                <p className="text-xs text-slate-500 mt-2">Amadeus ile sohbet ettikçe, burası onun sizinle olan etkileşimlerinden oluşturduğu anılarla dolacak.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoryArchivePanel;