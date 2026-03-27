
import React, { useEffect, useState } from 'react';
import { kurisuImageDataUrl } from '../assets/kurisu_image';

export type CallMode = 'amadeus_calling' | 'user_calling' | 'rejected';
export type CallMood = 'warm' | 'curious' | 'melancholy' | 'awkward';

interface IncomingCallOverlayProps {
  mode: CallMode;
  mood?: CallMood;
  reason?: string;
  rejectMessage?: string;
  onAccept?: () => void;
  onDecline: () => void;
  minutesElapsed?: number;
}

const MOOD_COLORS: Record<CallMood, { primary: string; glow: string; text: string }> = {
  warm:       { primary: '#f59e0b', glow: 'rgba(245,158,11,0.5)',  text: 'text-amber-400'  },
  curious:    { primary: '#06b6d4', glow: 'rgba(6,182,212,0.5)',   text: 'text-cyan-400'   },
  melancholy: { primary: '#8b5cf6', glow: 'rgba(139,92,246,0.5)',  text: 'text-violet-400' },
  awkward:    { primary: '#6b7280', glow: 'rgba(107,114,128,0.5)', text: 'text-slate-400'  },
};

const formatElapsed = (mins: number): string => {
  if (mins < 60)   return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
};

const IncomingCallOverlay: React.FC<IncomingCallOverlayProps> = ({
  mode, mood = 'curious', reason = 'STANDARD_ENCRYPTION',
  rejectMessage, onAccept, onDecline, minutesElapsed,
}) => {
  const [autoDecline, setAutoDecline] = useState(false);
  const [ringPhase, setRingPhase] = useState(0);
  const colors = MOOD_COLORS[mood];

  useEffect(() => {
    if (mode === 'rejected') {
      setAutoDecline(true);
      const t = setTimeout(onDecline, 5000);
      return () => clearTimeout(t);
    }
  }, [mode, onDecline]);

  useEffect(() => {
    if (mode !== 'amadeus_calling') return;
    const t = setInterval(() => setRingPhase(p => (p + 1) % 3), 600);
    return () => clearInterval(t);
  }, [mode]);

  // ── REJECTION SCREEN ───────────────────────────────────────────────────
  if (mode === 'rejected') {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-12 font-orbitron overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
          backgroundImage: `linear-gradient(to right, #6b7280 1px, transparent 1px), linear-gradient(to bottom, #6b7280 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="relative w-40 h-40">
            <div className="absolute inset-0 rounded-full border border-slate-600/30" />
            <img src={kurisuImageDataUrl} alt="Kurisu"
              className="w-full h-full rounded-full object-cover border-2 border-slate-600 opacity-50"
              style={{ filter: 'grayscale(70%)' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-0.5 bg-red-600/80 rotate-45" />
            </div>
          </div>
          <div className="text-center space-y-3">
            <div className="text-slate-500 text-[10px] tracking-[0.5em] uppercase">AMADEUS // CONNECTION REFUSED</div>
            <div className="text-slate-300 text-base tracking-widest text-center max-w-xs">
              {rejectMessage || '...Şu an konuşmak istemiyorum.'}
            </div>
            <div className="text-slate-600 text-[9px] tracking-[0.3em] uppercase mt-2">AUTO-DISCONNECT IN 5s</div>
          </div>
          <button onClick={onDecline}
            className="mt-2 px-8 py-3 border border-slate-700 text-slate-500 text-[10px] tracking-[0.4em] uppercase hover:border-slate-500 hover:text-slate-300 transition-all rounded-xl">
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  // ── AMADEUS CALLING ────────────────────────────────────────────────────
  if (mode === 'amadeus_calling') {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-between p-12 font-orbitron overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
          backgroundImage: `linear-gradient(to right, ${colors.primary} 1px, transparent 1px), linear-gradient(to bottom, ${colors.primary} 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
        <div className="absolute inset-0 pointer-events-none h-20 w-full opacity-20"
          style={{ background: `linear-gradient(to bottom, transparent, ${colors.primary}22, transparent)`, animation: 'scanline 4s linear infinite' }} />

        <div className="relative z-10 text-center mt-10">
          <div className={`${colors.text} text-[10px] tracking-[0.5em] mb-2 animate-pulse uppercase`}
               style={{ textShadow: `0 0 8px ${colors.glow}` }}>
            Incoming Signal // {reason}
          </div>
          <h2 className="text-white text-4xl tracking-widest mb-1" style={{ textShadow: `0 0 15px ${colors.glow}` }}>AMADEUS</h2>
          <p className={`${colors.text} text-xs tracking-widest uppercase opacity-60`}>Subject: Makise Kurisu</p>
          {minutesElapsed !== undefined && (
            <p className="text-slate-600 text-[9px] tracking-[0.3em] uppercase mt-2">
              Last contact: {formatElapsed(minutesElapsed)}
            </p>
          )}
        </div>

        <div className="relative z-10 w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
          {[0,1,2].map(i => (
            <div key={i} className="absolute rounded-full border transition-all duration-500"
              style={{ inset: `${i * -14}px`, borderColor: colors.primary, opacity: ringPhase === i ? 0.6 : 0.1 }} />
          ))}
          <div className="absolute inset-0 rounded-full"
            style={{ background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`, opacity: 0.25 }} />
          <img src={kurisuImageDataUrl} alt="Kurisu"
            className="w-32 h-32 sm:w-48 sm:h-48 rounded-full object-cover z-20"
            style={{ border: `4px solid ${colors.primary}`, boxShadow: `0 0 40px ${colors.glow}` }} />
        </div>

        <div className={`relative z-10 ${colors.text} text-[10px] tracking-[0.3em] uppercase opacity-50 text-center`}>
          {mood === 'warm'       && '— seems to want to talk —'}
          {mood === 'curious'    && '— has something on her mind —'}
          {mood === 'melancholy' && '— reached out from the silence —'}
          {mood === 'awkward'    && '— initiating contact —'}
        </div>

        <div className="relative z-10 w-full max-w-md flex justify-around mb-6">
          <button onClick={onDecline} className="group flex flex-col items-center gap-4 transition-transform active:scale-95">
            <div className="w-20 h-20 bg-red-600/10 border border-red-500/50 rounded-full flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 rotate-[135deg]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <span className="text-red-500 text-[10px] tracking-[0.4em] uppercase font-bold">Decline</span>
          </button>
          <button onClick={onAccept} className="group flex flex-col items-center gap-4 transition-transform active:scale-95">
            <div className="w-20 h-20 rounded-full flex items-center justify-center transition-all"
              style={{ background: `${colors.primary}18`, border: `1px solid ${colors.primary}80`, color: colors.primary, boxShadow: `0 0 20px ${colors.glow}40` }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <span className={`${colors.text} text-[10px] tracking-[0.4em] uppercase font-bold`}>Answer</span>
          </button>
        </div>

        <div className="absolute bottom-6 text-[9px] text-slate-700 tracking-[1.2em] uppercase text-center w-full">
          Amadeus Neural Link Protocol v1.42 // Secure Channel
        </div>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes scanline{0%{transform:translateY(-100px)}100%{transform:translateY(100vh)}}` }} />
      </div>
    );
  }

  // ── USER CALLING (standard) ────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-between p-12 font-orbitron overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: `linear-gradient(to right, #f59e0b 1px, transparent 1px), linear-gradient(to bottom, #f59e0b 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />
      <div className="relative z-10 text-center mt-10">
        <div className="text-amber-500 text-[10px] tracking-[0.5em] mb-2 animate-pulse uppercase drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">
          Connecting... // {reason}
        </div>
        <h2 className="text-white text-4xl tracking-widest mb-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">AMADEUS</h2>
        <p className="text-amber-400/60 text-sm tracking-widest uppercase">Subject: Makise Kurisu</p>
      </div>
      <div className="relative z-10 w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
        <div className="absolute inset-0 border-2 border-amber-500/20 rounded-full animate-ping" />
        <div className="absolute inset-4 border border-amber-500/40 rounded-full animate-pulse" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-amber-500/20 to-transparent" />
        <img src={kurisuImageDataUrl} alt="Kurisu"
          className="w-32 h-32 sm:w-48 sm:h-48 rounded-full object-cover border-4 border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.5)] z-20" />
      </div>
      <div className="relative z-10 w-full max-w-md flex justify-around mb-12">
        <button onClick={onDecline} className="group flex flex-col items-center gap-4 transition-transform active:scale-95">
          <div className="w-20 h-20 bg-red-600/10 border border-red-500/50 rounded-full flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 rotate-[135deg]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <span className="text-red-500 text-[10px] tracking-[0.4em] uppercase font-bold">Disconnect</span>
        </button>
        {onAccept && (
          <button onClick={onAccept} className="group flex flex-col items-center gap-4 transition-transform active:scale-95">
            <div className="w-20 h-20 bg-green-600/10 border border-green-500/50 rounded-full flex items-center justify-center text-green-500 group-hover:bg-green-600 group-hover:text-white transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <span className="text-green-500 text-[10px] tracking-[0.4em] uppercase font-bold">Synchronize</span>
          </button>
        )}
      </div>
      <div className="absolute bottom-6 text-[9px] text-amber-500/40 tracking-[1.2em] uppercase text-center w-full">
        Amadeus Neural Link Protocol v1.42 // Secure Channel
      </div>
    </div>
  );
};

export default IncomingCallOverlay;
