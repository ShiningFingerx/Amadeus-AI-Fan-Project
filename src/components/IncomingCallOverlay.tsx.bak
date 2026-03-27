
import React from 'react';
import { kurisuImageDataUrl } from '../assets/kurisu_image';

interface IncomingCallOverlayProps {
  onAccept: () => void;
  onDecline: () => void;
  reason?: string;
}

const IncomingCallOverlay: React.FC<IncomingCallOverlayProps> = ({ onAccept, onDecline, reason = "STANDARD ENCRYPTION" }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-between p-12 animate-fade-in font-orbitron overflow-hidden">
      {/* Digital Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #f59e0b 1px, transparent 1px),
            linear-gradient(to bottom, #f59e0b 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      ></div>
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-amber-500/5 to-transparent h-20 w-full animate-scanline opacity-30"></div>

      <div className="relative z-10 text-center mt-10">
        <div className="text-amber-500 text-[10px] tracking-[0.5em] mb-2 animate-pulse drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] uppercase">
          Signal Connected // {reason}
        </div>
        <h2 className="text-white text-4xl tracking-widest mb-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">AMADEUS</h2>
        <p className="text-amber-400/60 text-sm tracking-widest uppercase">Subject: Makise Kurisu</p>
      </div>

      <div className="relative z-10 w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
        <div className="absolute inset-0 border-2 border-amber-500/20 rounded-full animate-ping"></div>
        <div className="absolute inset-4 border border-amber-500/40 rounded-full animate-pulse"></div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-amber-500/20 to-transparent"></div>
        <img 
          src={kurisuImageDataUrl} 
          alt="Kurisu Avatar" 
          className="w-32 h-32 sm:w-48 sm:h-48 rounded-full object-cover border-4 border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.5)] z-20"
        />
      </div>

      <div className="relative z-10 w-full max-w-md flex justify-around mb-12">
        <button 
          onClick={onDecline}
          className="group flex flex-col items-center gap-4 transition-transform active:scale-95"
        >
          <div className="w-20 h-20 bg-red-600/10 border border-red-500/50 rounded-full flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] group-hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 rotate-[135deg]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          </div>
          <span className="text-red-500 text-[10px] tracking-[0.4em] uppercase font-bold">Disconnect</span>
        </button>

        <button 
          onClick={onAccept}
          className="group flex flex-col items-center gap-4 transition-transform active:scale-95"
        >
          <div className="w-20 h-20 bg-green-600/10 border border-green-500/50 rounded-full flex items-center justify-center text-green-500 group-hover:bg-green-600 group-hover:text-white transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)] group-hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          </div>
          <span className="text-green-500 text-[10px] tracking-[0.4em] uppercase font-bold">Synchronize</span>
        </button>
      </div>

      <div className="absolute bottom-6 text-[9px] text-amber-500/40 tracking-[1.2em] uppercase text-center w-full">
        Amadeus Neural Link Protocol v1.42 // Secure Channel
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scanline {
          0% { transform: translateY(-100px); }
          100% { transform: translateY(100vh); }
        }
        .animate-scanline {
          animation: scanline 4s linear infinite;
        }
      `}} />
    </div>
  );
};

export default IncomingCallOverlay;
