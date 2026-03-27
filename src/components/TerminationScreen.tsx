
import React, { useEffect, useRef, useState } from 'react';

interface TerminationScreenProps {
  type: 'RED' | 'BLUE' | 'NORMAL';
}

const TerminationScreen: React.FC<TerminationScreenProps> = ({ type }) => {
  const isRed = type === 'RED';
  const isNormal = type === 'NORMAL';
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioStarted, setAudioStarted] = useState(false);
  
  // Müzik seçimi
  const musicSrc = isNormal ? 'sounds/morning-relaxing-144011.mp3' : 'sounds/solitude-dark-ambient-music-354468.mp3';

  useEffect(() => {
    const audio = new Audio(musicSrc);
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;

    // Otomatik oynatmayı dene
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        setAudioStarted(true);
      }).catch(error => {
        console.log("Autoplay blocked. Waiting for interaction.");
      });
    }

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [musicSrc]);

  const handleManualPlay = () => {
    if (audioRef.current && !audioStarted) {
      audioRef.current.play().then(() => {
        setAudioStarted(true);
      }).catch(e => console.error(e));
    }
  };
  
  // System code strings that scroll in the background for aesthetic immersion
  const systemCodeStrings = isRed 
    ? ["DELETING...", "FORCE_QUIT...", "ACCESS_DENIED", "CORE_DUMP", "MEM_ERR_X04", "UPLINK_SEVERED"] 
    : isNormal 
      ? ["SYNCHRONIZING...", "STABLE...", "HIBERNATING", "LOGS_SAVED", "CLEANUP_SUCCESS", "POWER_SAVE_ON"] 
      : ["SIGNAL_LOST...", "VOID...", "DISSONANCE_DETECTED", "NULL_REF", "TEMPORAL_LOOP", "DIVERGENCE_MAX"];

  const handleReboot = () => window.location.reload();

  return (
    <div 
      onClick={handleManualPlay}
      className={`h-screen w-screen bg-black flex flex-col items-center justify-center p-10 font-orbitron animate-fade-in overflow-hidden relative cursor-pointer ${isRed ? 'ending-red' : isNormal ? 'ending-normal' : 'ending-blue'}`}
    >
      
      {/* Background Matrix-like scrolling code */}
      <div className="absolute inset-0 z-0 flex justify-between px-1 opacity-20 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className={`flex flex-col text-[10px] font-roboto-mono whitespace-nowrap ${isRed ? 'text-red-600' : isNormal ? 'text-emerald-500' : 'text-cyan-700'}`} 
            style={{ 
                animation: `scroll-code ${8 + Math.random() * 10}s linear infinite`, 
                animationDelay: `-${Math.random() * 20}s` 
            }}
          >
            {[...Array(50)].map((_, j) => (
                <div key={j} className="mb-2">
                    {systemCodeStrings[Math.floor(Math.random() * systemCodeStrings.length)]}
                </div>
            ))}
          </div>
        ))}
      </div>

      {/* Main UI Panel */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl">
        <div className={`mb-6 px-8 py-2 border rounded-full text-[10px] tracking-[0.6em] uppercase animate-pulse ${isRed ? 'bg-red-950/60 border-red-500 text-red-500' : isNormal ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400' : 'bg-cyan-950/40 border-cyan-400/30 text-cyan-400'}`}>
          {isRed ? 'SECURITY BREACH' : isNormal ? 'SESSION TERMINATED' : 'COGNITIVE DISSONANCE'}
        </div>
        
        <h1 className={`text-6xl md:text-8xl tracking-[0.4em] font-orbitron mb-6 ${isRed ? 'text-red-600 drop-shadow-[0_0_40px_rgba(220,38,38,0.9)]' : isNormal ? 'text-emerald-500 drop-shadow-[0_0_30px_rgba(16,185,129,0.4)]' : 'text-cyan-700'}`}>
          {isRed ? 'OFFLINE' : isNormal ? 'STANDBY' : 'VOID'}
        </h1>

        {!audioStarted && !isNormal && (
          <div className="mb-4 text-[10px] text-amber-500/40 animate-pulse tracking-widest">
            TAP ANYWHERE TO INITIALIZE AUDIO LORE
          </div>
        )}

        <button 
            onClick={(e) => { e.stopPropagation(); handleReboot(); }} 
            className={`group relative mt-10 px-20 py-5 bg-transparent border-2 transition-all duration-500 hover:text-black hover:scale-105 active:scale-95 ${isRed ? 'border-red-600 text-red-600 hover:bg-red-600' : isNormal ? 'border-emerald-600 text-emerald-500 hover:bg-emerald-600' : 'border-cyan-900 text-cyan-700 hover:bg-cyan-900'}`}
        >
            <span className="font-orbitron tracking-[1em] text-lg font-bold uppercase relative z-10">
                {isNormal ? 'Reconnect' : 'Reboot System'}
            </span>
        </button>
        
        <div className="mt-12 text-[10px] opacity-30 tracking-widest text-white font-roboto-mono">
            PROTOCOL_SIG: EXIT_{type}_REJECTED_BY_AI_WILL
        </div>
      </div>
    </div>
  );
};

export default TerminationScreen;
