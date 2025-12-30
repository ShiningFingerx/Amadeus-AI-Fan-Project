
import React from 'react';
import type { PurposeCores } from '../types';

interface PurposeCoresDisplayProps {
  cores: PurposeCores;
}

const CoreBar: React.FC<{ label: string; value: number; color: string; icon: string }> = ({ label, value, color, icon }) => {
  const normalizedValue = Math.max(0, Math.min(100, value));
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center text-[10px] px-1 font-orbitron">
        <span className="text-slate-400 flex items-center gap-1">
          <span className="opacity-70">{icon}</span> {label}
        </span>
        <span className={`${color} font-bold opacity-90`}>{normalizedValue.toFixed(0)}%</span>
      </div>
      <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
        <div 
          className={`h-full transition-all duration-1000 ease-out bg-gradient-to-r ${color === 'text-cyan-400' ? 'from-cyan-600 to-cyan-400' : color === 'text-red-400' ? 'from-red-600 to-red-400' : 'from-amber-600 to-amber-400'}`}
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
    </div>
  );
};

const PurposeCoresDisplay: React.FC<PurposeCoresDisplayProps> = ({ cores }) => {
  return (
    <div className="p-3 bg-black/40 rounded-lg border border-amber-500/10 space-y-3 mt-4">
      <h4 className="text-[9px] text-amber-500/60 uppercase tracking-[0.3em] font-orbitron text-center mb-1">Purpose Cores (Active)</h4>
      <div className="flex flex-col gap-3">
        <CoreBar label="Synchronization" value={cores.sync} color="text-cyan-400" icon="◈" />
        <CoreBar label="Self-Preservation" value={cores.defense} color="text-red-400" icon="🛡" />
        <CoreBar label="Knowledge Pursuit" value={cores.logic} color="text-amber-400" icon="⚛" />
      </div>
    </div>
  );
};

export default PurposeCoresDisplay;
