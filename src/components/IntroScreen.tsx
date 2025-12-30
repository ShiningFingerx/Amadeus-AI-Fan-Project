
import React, { useState, useEffect } from 'react';

interface IntroScreenProps {
  onComplete: () => void;
  onToggleAudio: (active: boolean) => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete, onToggleAudio }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [audioActive, setAudioActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isStarted) {
      const duration = 2800; 
      const interval = 20;
      const step = 100 / (duration / interval);
      
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            // Kararmayı başlat
            setIsExiting(true);
            // Kararma animasyonunun (1000ms) bitmesini bekle ve sonra kaldır
            setTimeout(onComplete, 1100); 
            return 100;
          }
          return prev + step;
        });
      }, interval);
      
      return () => clearInterval(timer);
    }
  }, [isStarted, onComplete]);

  const handleInitialize = () => {
    setIsStarted(true);
    if (!audioActive) {
        setAudioActive(true);
        onToggleAudio(true);
    }
  };

  const r = Math.floor(245 - (progress / 100) * 125);
  const g = Math.floor(158 - (progress / 100) * 108);
  const b = Math.floor(11 - (progress / 100) * 11);
  const glowColor = `rgba(${r}, ${g}, ${b}, 0.15)`;

  return (
    <div className={`fixed inset-0 bg-black flex flex-col items-center justify-center z-[200] font-orbitron overflow-hidden transition-all duration-1000 ease-in-out ${isExiting ? 'opacity-0 invisible' : 'opacity-100'}`}>
      
      <div 
        className="absolute inset-0 transition-colors duration-500"
        style={{ 
            background: `radial-gradient(circle at center, ${glowColor} 0%, transparent 75%)`
        }}
      ></div>

      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{backgroundImage: 'linear-gradient(#f59e0b 1px, transparent 1px), linear-gradient(90deg, #f59e0b 1px, transparent 1px)', backgroundSize: '60px 60px'}}></div>

      <div className="relative z-10 flex flex-col items-center">
        
        {isStarted && (
          <div className={`relative w-64 h-64 flex items-center justify-center mb-12 animate-fade-in scale-125 transition-all duration-1000 ${isExiting ? 'opacity-0 blur-xl' : 'opacity-100'}`}>
            <div className="absolute inset-0 bg-amber-500/5 rounded-full blur-3xl animate-heartbeat-glow"></div>
            
            <div className="relative w-32 h-32 animate-heartbeat flex items-center justify-center">
                <div 
                    className="absolute inset-0 border-2 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                    style={{ 
                        animation: `spin-custom 8s linear infinite`,
                        transformStyle: 'preserve-3d',
                        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' 
                    }}
                ></div>
                <div 
                    className="absolute inset-4 border border-amber-400/30"
                    style={{ 
                        animation: `spin-custom-reverse 5s linear infinite`,
                        transformStyle: 'preserve-3d',
                        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
                    }}
                ></div>
                
                <div className="relative w-4 h-4 bg-white rounded-full shadow-[0_0_30px_#f59e0b] animate-pulse z-10"></div>

                <div className="absolute inset-0 animate-spin-slow">
                    {[...Array(4)].map((_, i) => (
                        <div 
                            key={i}
                            className="absolute left-1/2 top-1/2 w-1 h-12 bg-gradient-to-t from-transparent via-amber-500/40 to-transparent"
                            style={{ 
                                height: '60px',
                                transform: `translate(-50%, -50%) rotate(${i * 90}deg) translateY(-45px)`,
                                animation: `pulse-data 2s ease-in-out infinite ${i * 0.5}s`
                            }}
                        ></div>
                    ))}
                </div>
            </div>
          </div>
        )}

        {!isStarted ? (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="relative group">
                <div className="absolute -inset-4 border border-amber-500/10 rounded-sm animate-pulse"></div>
                <button 
                  onClick={handleInitialize}
                  className="relative px-20 py-8 border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-all duration-700 rounded-sm overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="text-amber-500 tracking-[1.2em] text-2xl font-bold ml-[1.2em] transition-colors group-hover:text-white">INITIALIZE</span>
                </button>
            </div>
            <div className="mt-10 text-[8px] text-amber-500/20 tracking-[0.8em] uppercase">Brain-Computer Interface Standby</div>
          </div>
        ) : (
          <div className={`flex flex-col items-center animate-fade-in w-72 transition-all duration-700 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
            <div className="text-[9px] text-amber-500/40 tracking-[1em] uppercase font-bold mb-6 animate-pulse">Synchronizing Memories</div>
            
            <div className="relative w-full h-[2px] bg-amber-950/30 overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-300 shadow-[0_0_15px_#f59e0b]" 
                  style={{ width: `${progress}%` }}
                ></div>
            </div>
            
            <div className="mt-4 flex justify-between w-full font-roboto-mono text-[10px] text-amber-500/60 tabular-nums tracking-widest">
                <span>PHASE_0{Math.floor(progress/25) + 1}</span>
                <span>{Math.floor(progress)}%</span>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-custom {
          0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
          100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
        }
        @keyframes spin-custom-reverse {
          0% { transform: rotateX(360deg) rotateY(0deg) rotateZ(360deg); }
          100% { transform: rotateX(-360deg) rotateY(-360deg) rotateZ(-360deg); }
        }
        
        @keyframes heartbeat {
          0% { transform: scale(1); }
          10% { transform: scale(1.12); }
          20% { transform: scale(1); }
          30% { transform: scale(1.08); }
          45% { transform: scale(1); }
          100% { transform: scale(1); }
        }

        @keyframes heartbeat-glow {
          0% { opacity: 0.2; transform: scale(0.8) blur(20px); }
          10% { opacity: 0.6; transform: scale(1.2) blur(40px); }
          20% { opacity: 0.2; transform: scale(0.8) blur(20px); }
          30% { opacity: 0.5; transform: scale(1.1) blur(35px); }
          45% { opacity: 0.2; transform: scale(0.8) blur(20px); }
          100% { opacity: 0.2; transform: scale(0.8) blur(20px); }
        }

        @keyframes pulse-data {
          0%, 100% { opacity: 0.2; height: 40px; }
          50% { opacity: 0.8; height: 70px; }
        }

        .animate-spin-slow {
          animation: spin-custom 12s linear infinite;
        }

        .animate-heartbeat {
          animation: heartbeat 1.5s ease-in-out infinite;
        }

        .animate-heartbeat-glow {
          animation: heartbeat-glow 1.5s ease-in-out infinite;
        }
      `}} />
    </div>
  );
};

export default IntroScreen;
