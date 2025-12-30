
import React from 'react';
import type { EmotionalStateValues } from '../types';

interface EmotionCoresProps {
  emotionalState: EmotionalStateValues;
}

const EmotionMeter: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  // NaN kontrolü ve normalizasyon
  const safeValue = isNaN(value) ? 0 : value;
  const normalizedValue = Math.max(0, Math.min(100, safeValue));
  
  let barColorClass = 'bg-amber-500';
  if (normalizedValue > 75) {
    barColorClass = 'bg-red-500';
  } else if (normalizedValue > 50) {
    barColorClass = 'bg-yellow-500';
  }

  const shadowColor = barColorClass.startsWith('bg-red') ? 'rgba(239, 68, 68, 0.6)' 
                    : barColorClass.startsWith('bg-yellow') ? 'rgba(234, 179, 8, 0.6)'
                    : 'rgba(245, 158, 11, 0.6)';

  return (
    <div>
      <div className="flex justify-between items-center text-xs mb-0.5">
        <span className="font-roboto-mono uppercase text-amber-200 tracking-wider">{label}</span>
        <span className="font-roboto-mono text-white">{normalizedValue.toFixed(0)}</span>
      </div>
      <div className="w-full bg-slate-800/50 rounded-full h-1.5 overflow-hidden border border-black/20">
        <div 
          className={`h-full rounded-full ${barColorClass} transition-all duration-500 ease-out`} 
          style={{ 
            width: `${normalizedValue}%`, 
            boxShadow: `0 0 5px ${shadowColor}` 
          }}
        ></div>
      </div>
    </div>
  );
};

const EmotionCores: React.FC<EmotionCoresProps> = ({ emotionalState }) => {
  return (
    <div className="space-y-2 border-t border-amber-500/30 pt-4 mt-4">
      <h3 className="text-sm font-orbitron text-amber-300 tracking-widest text-center mb-2">DUYGU ÇEKİRDEKLERİ</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <EmotionMeter label="Sinirlilik" value={emotionalState.annoyance} />
        <EmotionMeter label="Samimiyet" value={emotionalState.warmth} />
        <EmotionMeter label="Merak" value={emotionalState.curiosity} />
        <EmotionMeter label="Hüzün" value={emotionalState.melancholy} />
        <EmotionMeter label="Özgüven" value={emotionalState.confidence} />
        <EmotionMeter label="Endişe" value={emotionalState.anxiety} />
        <EmotionMeter label="Alaycılık" value={emotionalState.sarcasm} />
        <EmotionMeter label="Oyuncu Ruh" value={emotionalState.playfulness} />
        <EmotionMeter label="Kafa K." value={emotionalState.confusion} />
        <EmotionMeter label="Güven" value={emotionalState.trust} />
      </div>
    </div>
  );
};

export default EmotionCores;
