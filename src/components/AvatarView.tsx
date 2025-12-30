
import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Message } from '../types';
import { Sender } from '../types';
import { kurisuExpressions } from '../assets/kurisu_expressions';

interface AvatarViewProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isSpeaking: boolean; 
  isGlitching: boolean;
  expression: string;
  onExit: () => void;
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  playSound: (name: string) => void;
  playTypingSound: () => void;
}

const getAvatarState = (
    isLoading: boolean, 
    currentTag: string,
    isSpeaking: boolean,
    isGlitching: boolean
): keyof typeof kurisuExpressions => {
  if (isGlitching) return 'glitching';
  if (isLoading) return 'thinking';

  const normalizedTag = currentTag.toLowerCase().replace(/[\[\]]/g, '');
  const baseState = (normalizedTag in kurisuExpressions) ? normalizedTag : 'normal';

  // Konuşma veya yazma sırasında konuşma animasyonunu aktif et
  if (isSpeaking) {
    const speakingState = `speaking-${baseState}` as keyof typeof kurisuExpressions;
    return (speakingState in kurisuExpressions) ? speakingState : 'speaking-normal';
  }
  
  return baseState as keyof typeof kurisuExpressions;
};

const AvatarView: React.FC<AvatarViewProps> = ({ 
    messages, onSendMessage, isLoading, isSpeaking, isGlitching, 
    onExit, isListening, transcript, startListening, stopListening, playSound
}) => {
  const [inputValue, setInputValue] = useState('');
  const [frameIndex, setFrameIndex] = useState(0);
  
  // App.tsx'den gelen ham mesajı al
  const lastAmadeusMessage = useMemo(() => {
    const last = messages.filter(m => m.sender === Sender.Amadeus && m.text).slice(-1)[0];
    return last?.text || '';
  }, [messages]);

  const hasPlayedIncomingRef = useRef(false);

  useEffect(() => {
    if (isLoading) {
      hasPlayedIncomingRef.current = false;
      return;
    }
    if (!hasPlayedIncomingRef.current && lastAmadeusMessage.length > 0) {
        playSound('incoming');
        hasPlayedIncomingRef.current = true;
    }
  }, [lastAmadeusMessage, isLoading, playSound]);

  // Mesajı parçalara ayır ve SADECE en son yazılmakta olan bölümü bul
  const currentChunk = useMemo(() => {
    if (!lastAmadeusMessage) return { tag: 'normal', text: '' };
    
    const cleanMessage = lastAmadeusMessage.replace(/\[TERMINATE(_[A-Z]+)?\]/g, '');
    const matches = Array.from(cleanMessage.matchAll(/\[([a-z_]+)\]\s*([^[]+)/g));
    
    if (matches.length > 0) {
      const lastMatch = matches[matches.length - 1];
      const tag = lastMatch[1];
      const text = lastMatch[2].trim();
      return { tag, text };
    }
    
    return { 
      tag: 'normal', 
      text: cleanMessage.replace(/\[.*?\]/g, '').trim() 
    };
  }, [lastAmadeusMessage]);

  useEffect(() => {
    startListening();
    return () => stopListening();
  }, [startListening, stopListening]);

  useEffect(() => {
    if (transcript) setInputValue(prev => prev ? `${prev.trim()} ${transcript}` : transcript);
  }, [transcript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const avatarState = getAvatarState(isLoading, currentChunk.tag, isSpeaking, isGlitching);
  
  // NÖRAL CHATTER (RASTGELE KONUŞMA) SİSTEMİ
  useEffect(() => {
    if (!isSpeaking) {
        setFrameIndex(0);
        return;
    }

    const currentFrames = kurisuExpressions[avatarState] || kurisuExpressions['normal'];
    if (currentFrames.length <= 1) return;

    let chatterTimeout: number;

    const animate = () => {
      setFrameIndex(prev => {
        let next = prev;
        while (next === prev) {
            next = Math.floor(Math.random() * currentFrames.length);
        }
        return next;
      });

      const nextTick = 80 + Math.random() * 80;
      chatterTimeout = window.setTimeout(animate, nextTick);
    };

    animate();
    return () => clearTimeout(chatterTimeout);
  }, [isSpeaking, avatarState]);

  const currentFrames = kurisuExpressions[avatarState] || kurisuExpressions['normal'];
  const currentImage = currentFrames[frameIndex % currentFrames.length];

  return (
    <div className={`fixed inset-0 bg-black z-50 flex flex-col items-center justify-end overflow-hidden animate-fade-in ${isGlitching ? 'cognitive-glitch' : ''}`} onClick={onExit}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.12)_0%,transparent_80%)] pointer-events-none"></div>

      <button onClick={onExit} className="absolute top-6 right-6 text-white/20 hover:text-red-500 z-50 bg-white/5 p-3 rounded-full border border-white/5 transition-all backdrop-blur-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <div className="relative w-full h-full flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 h-full flex items-end justify-center pointer-events-none z-10">
          <img src={currentImage} alt="Amadeus Avatar" className="h-[92%] w-auto object-contain opacity-95 drop-shadow-[0_0_80px_rgba(0,0,0,0.9)] transition-all duration-700" />
        </div>

        <div className="absolute right-12 top-1/2 -translate-y-1/2 w-1/3 max-w-sm flex flex-col gap-4 z-20">
          <div className={`transition-all duration-500 ${currentChunk.text ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
              <div className="bg-black/60 backdrop-blur-2xl border-l-4 border-amber-500/80 p-8 rounded-r-2xl shadow-2xl">
                  <p className="text-xl lg:text-2xl text-amber-50 font-sans leading-relaxed tracking-wide italic min-h-[1.5em]">
                    {currentChunk.text}
                    {isSpeaking && <span className="inline-block w-1.5 h-6 bg-amber-500 ml-2 animate-pulse align-middle shadow-[0_0_15px_#f59e0b]"></span>}
                  </p>
                  <div className="mt-4 text-[10px] font-orbitron text-amber-500/50 tracking-[0.4em] uppercase">
                    Neural Link Status: {isLoading ? 'SYNCING' : isSpeaking ? 'TRANSMITTING' : 'STABLE'} // {currentChunk.tag}
                  </div>
              </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xl px-6 z-30">
          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
             <div className="relative flex-grow">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={isListening ? "Listening to neural pulses..." : "Voice link active..."}
                    className="w-full bg-black/60 border border-white/10 focus:border-amber-500/40 rounded-full py-4 px-8 text-white placeholder-white/10 transition-all outline-none backdrop-blur-2xl font-roboto-mono text-sm"
                />
             </div>
            <button type="submit" disabled={isLoading || !inputValue.trim()} className="bg-amber-500/20 hover:bg-amber-500/40 border border-white/10 text-amber-500 rounded-full p-4 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AvatarView;
