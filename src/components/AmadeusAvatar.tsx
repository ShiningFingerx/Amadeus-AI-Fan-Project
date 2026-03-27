
import React, { useState, useEffect } from 'react';
import DivergenceMeter from './DivergenceMeter';
import type { UserProfile, AmadeusState, AmygdalaAnalysis } from '../types';
import { kurisuImageDataUrl } from '../assets/kurisu_image';
import EmotionCores from './EmotionCores';
import PurposeCoresDisplay from './PurposeCoresDisplay';

const SystemClock: React.FC = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    const formatTime = (date: Date) => {
        const h = date.getHours().toString().padStart(2, '0');
        const m = date.getMinutes().toString().padStart(2, '0');
        const s = date.getSeconds().toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };
    return (
        <div className="text-center mb-2">
            <span className="text-[10px] text-amber-500 uppercase font-orbitron tracking-[0.2em] opacity-60">System Time</span>
            <div className="font-roboto-mono text-xl tracking-[0.1em] text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                {formatTime(time)}
            </div>
        </div>
    );
};

const StatusIndicator: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="flex justify-between items-baseline text-sm">
    <span className="text-amber-300 uppercase font-orbitron tracking-wider">{label}</span>
    <span className={`font-roboto-mono ${color}`}>{value}</span>
  </div>
);

const AmadeusAvatar: React.FC<{
    isLoading: boolean;
    userProfile: UserProfile;
    amadeusState: AmadeusState | undefined;
    onSignOut: () => void;
    onOpenAbout: () => void;
    onOpenSettings: () => void;
    onOpenMemories: () => void;
    onOpenKurisuProfile: () => void;
    isMusicPlaying: boolean;
    isMusicLoaded: boolean;
    onToggleMusic: () => void;
    onUploadMusic: () => void;
    onViewAvatar: () => void;
    isGlitching: boolean;
    onOpenLogs?: () => void;
    isSpeaking?: boolean;
    isTtsSpeaking?: boolean;
    lastMessage?: string;
    amygdala?: AmygdalaAnalysis | null;
}> = ({
    isLoading, userProfile, amadeusState, onSignOut, onOpenAbout, onOpenSettings,
    onOpenMemories, onOpenKurisuProfile, isMusicPlaying, isMusicLoaded,
    onToggleMusic, onUploadMusic, onViewAvatar, isGlitching, onOpenLogs
}) => {
  return (
    <div className="glass-panel p-6 rounded-lg h-full flex flex-col justify-between overflow-y-auto scrollbar-thin-amber">
      <div>
        <div className="text-center mb-6">
          <h1 className="text-4xl font-orbitron text-amber-300 tracking-widest glitch" data-text="AMADEUS">AMADEUS</h1>
          <p className="text-sm text-amber-400 font-roboto-mono">System Ver. 0.852943</p>
        </div>

        <div className="relative flex justify-center items-center my-8 h-48">
          <img
            src={kurisuImageDataUrl}
            alt="Makise Kurisu's Memory"
            className="absolute w-36 h-36 rounded-full object-cover opacity-20 pointer-events-none"
          />
          <svg width="200" height="200" viewBox="0 0 200 200" className="absolute">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor: '#ff8c00', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#f59e0b', stopOpacity: 1}} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle cx="100" cy="100" r="90" fill="none" stroke="url(#grad1)" strokeWidth="1" strokeDasharray="10 15" opacity="0.5" style={{animation: 'spin-slow 40s linear infinite', transformOrigin: 'center'}} />
            <circle cx="100" cy="100" r="80" fill="none" stroke="#ff8c00" strokeWidth="0.5" opacity="0.7" style={{animation: 'spin-slow-reverse 30s linear infinite', transformOrigin: 'center'}} />
            <g style={{animation: 'pulse-glow 3s ease-in-out infinite', filter: 'url(#glow)'}}>
              <circle cx="100" cy="100" r="30" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.8" />
              <circle cx="100" cy="100" r="20" fill="rgba(251, 191, 36, 0.3)" stroke="#fbbf24" strokeWidth="0.5" />
              {[...Array(8)].map((_, i) => (
                <line key={i} x1="100" y1="100" x2="100" y2="40" stroke="#ff8c00" strokeWidth="1" opacity="0.6"
                  style={{transform: `rotate(${i * 45}deg)`, transformOrigin: 'center'}} />
              ))}
            </g>
          </svg>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-2 border-t border-amber-500/30 pt-4">
          <StatusIndicator label="Cognition Core" value="Online" color="text-green-400" />
          <StatusIndicator label="Memory Matrix" value="Stable" color="text-green-400" />
          <StatusIndicator label="Feedback Loop" value="Active" color="text-cyan-400 animate-pulse" />
          <StatusIndicator label="Heuristic Logic" value={isLoading ? "Processing..." : "Idle"} color={isLoading ? "text-yellow-400 animate-pulse" : "text-amber-300"} />
        </div>

        {amadeusState && (
          <>
            <PurposeCoresDisplay cores={amadeusState.purposeCores} />
            <EmotionCores emotionalState={amadeusState.emotionalState} />
          </>
        )}

        <div className="pt-4 mt-4 border-t border-amber-500/30">
          <SystemClock />
          <DivergenceMeter isGlitching={isGlitching} />
        </div>

        <div className="pt-4 mt-4 border-t border-amber-500/30 grid grid-cols-2 gap-4">
          <button onClick={onOpenSettings} className="w-full text-center py-2 px-4 border border-amber-500/50 text-amber-300 rounded-md hover:bg-amber-500/20 hover:text-white transition-colors duration-300 font-orbitron tracking-wider">
            SETTINGS
          </button>
          <button onClick={onOpenAbout} className="w-full text-center py-2 px-4 border border-amber-500/50 text-amber-300 rounded-md hover:bg-amber-500/20 hover:text-white transition-colors duration-300 font-orbitron tracking-wider">
            ABOUT
          </button>
        </div>

        <div className="pt-4 mt-2 border-t border-amber-500/30">
          <button onClick={onOpenMemories} className="w-full text-center py-2 px-4 border border-amber-500/50 text-amber-300 rounded-md hover:bg-amber-500/20 hover:text-white transition-colors duration-300 font-orbitron tracking-wider">
            MEMORY ARCHIVE
          </button>
        </div>

        <div className="pt-4 mt-2 border-t border-amber-500/30">
          <button onClick={onOpenKurisuProfile} className="w-full text-center py-2 px-4 border border-amber-500/50 text-amber-300 rounded-md hover:bg-amber-500/20 hover:text-white transition-colors duration-300 font-orbitron tracking-wider">
            KURISU PROFILE
          </button>
        </div>

        <div className="pt-4 mt-2 border-t border-amber-500/30">
          <button onClick={onOpenLogs} className="w-full text-center py-2 px-4 border border-red-500/40 text-red-400/70 rounded-md hover:bg-red-500/20 hover:text-red-300 transition-colors duration-300 font-orbitron tracking-wider text-[10px] flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"/>
            COGNITIVE PULSE
          </button>
        </div>

        <div className="pt-4 mt-2 border-t border-amber-500/30">
          <button onClick={onViewAvatar} className="w-full flex items-center justify-center py-2 px-4 border border-amber-500/50 text-amber-300 rounded-md hover:bg-amber-500/20 hover:text-white transition-colors duration-300 font-orbitron tracking-wider">
            VIEW AVATAR
          </button>
        </div>

        <div className="pt-4 mt-2 border-t border-amber-500/30 grid grid-cols-2 gap-4">
          <button onClick={onUploadMusic} className="w-full text-center py-2 px-4 border border-amber-500/50 text-amber-300 rounded-md hover:bg-amber-500/20 hover:text-white transition-colors duration-300 font-orbitron tracking-wider">
            UPLOAD MUSIC
          </button>
          <button
            onClick={onToggleMusic}
            disabled={!isMusicLoaded}
            className="w-full flex items-center justify-center py-2 px-4 border border-amber-500/50 text-amber-300 rounded-md hover:bg-amber-500/20 hover:text-white transition-colors duration-300 font-orbitron tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isMusicPlaying ?
              <><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>MUSIC: ON</> :
              <><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>MUSIC: OFF</>
            }
          </button>
        </div>

        <div className="pt-4 mt-2 border-t border-amber-500/30">
          <div className="flex items-center gap-4">
            <img src={userProfile.picture} alt="User" className="w-12 h-12 rounded-full border-2 border-amber-400/50" />
            <div className="flex-grow">
              <p className="font-bold text-white truncate font-orbitron">{userProfile.name}</p>
              <p className="text-xs text-amber-300 truncate font-roboto-mono">{userProfile.email}</p>
            </div>
            <button
              onClick={onSignOut}
              className="flex-shrink-0 text-center py-2 px-3 border border-amber-500/50 text-amber-300 rounded-md hover:bg-amber-500/20 hover:text-white transition-colors duration-300 font-orbitron text-xs tracking-wider"
              title="Sign Out"
            >
              SIGN OUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmadeusAvatar;
