
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { Message } from '../types';
import { Sender } from '../types';
import { kurisuExpressions } from '../assets/kurisu_expressions';

interface AvatarViewProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isSpeaking: boolean;
  isTtsSpeaking?: boolean;
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

// Strip trailing digits: "sided_thinking1" → "sided_thinking"
const normalizeTag = (raw: string): string =>
  raw.toLowerCase().replace(/[\[\]]/g, '').replace(/\d+$/, '');

const getAvatarState = (
  isLoading: boolean, currentTag: string,
  _isSpeaking: boolean, _isTtsSpeaking: boolean, isGlitching: boolean
): keyof typeof kurisuExpressions => {
  if (isGlitching) return 'glitching';
  if (isLoading)   return 'thinking';
  // Always use the expression tag directly — no speaking-* lookup.
  // Lip-sync cycles frames 0/1/2 within the current expression array.
  const base = normalizeTag(currentTag);
  return (base in kurisuExpressions ? base : 'normal') as keyof typeof kurisuExpressions;
};

const getMouthFrame = (char: string, isShouting = false): number => {
  if (!char) return 0;
  const c = char.toLowerCase();
  if ('aeouıiöü'.includes(c))        return isShouting ? 2 : 1;
  if ('rstlnkyzh vgdcçş'.includes(c)) return 1;
  if ("mpbf .,!?()[]_-".includes(c)) return 0;
  return 1;
};

interface Chunk { tag: string; text: string; }

const parseChunks = (message: string): Chunk[] => {
  if (!message) return [];
  const clean = message
    .replace(/\[TERMINATE(_[A-Z]+)?\]/g, '')
    .replace(/\[STATE:[\s\S]*?\]/g, '')
    .replace(/\[NEURAL:[\s\S]*?\]/g, '')
    .replace(/\[speed:[^\]]+\]/g, '')
    .trim();
  const matches = Array.from(clean.matchAll(/\[([a-z_]+\d*)\]\s*([^[]+)/g));
  if (matches.length > 0) {
    return matches
      .map(m => ({ tag: normalizeTag(m[1]), text: m[2].trim() }))
      .filter(c => c.text.length > 0);
  }
  const plain = clean.replace(/\[.*?\]/g, '').trim();
  return plain ? [{ tag: 'normal', text: plain }] : [];
};

const AvatarView: React.FC<AvatarViewProps> = ({
  messages, onSendMessage, isLoading, isSpeaking, isTtsSpeaking = false,
  isGlitching, onExit, isListening, transcript, startListening, stopListening, playSound
}) => {
  const [inputValue, setInputValue]       = useState('');
  const [frameIndex, setFrameIndex]       = useState(0);
  const [isImgReady, setIsImgReady]       = useState(false);
  const [chunkIndex, setChunkIndex]       = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping]           = useState(false);
  const typingRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevTsRef    = useRef<number>(0);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    Object.values(kurisuExpressions).flat().forEach(src => { const img = new Image(); img.src = src; });
  }, []);

  const lastAmadeusMsgObj = useMemo(() =>
    messages.filter(m => m.sender === Sender.Amadeus && m.text).slice(-1)[0]
  , [messages]);
  const lastAmadeusMessage = lastAmadeusMsgObj?.text || '';
  const msgTimestamp       = lastAmadeusMsgObj?.timestamp || 0;
  const chunks = useMemo(() => parseChunks(lastAmadeusMessage), [lastAmadeusMessage]);

  useEffect(() => {
    if (isLoading) { hasPlayedRef.current = false; return; }
    if (!hasPlayedRef.current && lastAmadeusMessage.length > 0) {
      playSound('incoming'); hasPlayedRef.current = true;
    }
  }, [lastAmadeusMessage, isLoading, playSound]);

  // Reset when new message arrives
  useEffect(() => {
    if (msgTimestamp !== prevTsRef.current && chunks.length > 0) {
      prevTsRef.current = msgTimestamp;
      if (typingRef.current) clearTimeout(typingRef.current);
      setChunkIndex(0);
      setDisplayedText('');
      setIsTyping(false);
    }
  }, [msgTimestamp, chunks.length]);

  // Typewriter for current chunk
  const runTypewriter = useCallback((text: string, onDone: () => void) => {
    if (typingRef.current) clearTimeout(typingRef.current);
    let i = 0;
    setDisplayedText('');
    setIsTyping(true);
    const tick = () => {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i < text.length) {
        const ch = text[i - 1];
        const delay = ['.','!','?'].includes(ch) ? 960 : [',',';',':'].includes(ch) ? 480 : ch === ' ' ? 110 : 76;
        typingRef.current = setTimeout(tick, delay);
      } else {
        setIsTyping(false);
        typingRef.current = setTimeout(onDone, 1400);
      }
    };
    typingRef.current = setTimeout(tick, 40);
  }, []);

  // Auto-play chunks sequentially
  useEffect(() => {
    if (isLoading || chunks.length === 0 || chunkIndex >= chunks.length) return;
    const chunk = chunks[chunkIndex];
    runTypewriter(chunk.text, () => {
      if (chunkIndex < chunks.length - 1) setChunkIndex(i => i + 1);
    });
    return () => { if (typingRef.current) clearTimeout(typingRef.current); };
  }, [chunkIndex, chunks, isLoading, runTypewriter]);

  const activeChunk: Chunk = chunks[chunkIndex] ?? { tag: 'normal', text: '' };

  const avatarState = getAvatarState(
    isLoading, activeChunk.tag,
    isTyping || isSpeaking, isTtsSpeaking, isGlitching
  );

  // Lip-sync
  useEffect(() => {
    const speaking = isTyping || isSpeaking;
    if ((!speaking && !isTtsSpeaking) || isLoading) { setFrameIndex(0); return; }
    const frames = kurisuExpressions[avatarState] || kurisuExpressions['normal'];
    if (frames.length <= 1) return;
    const isShouting = ['surprised','pissed','angry'].some(w => avatarState.includes(w));
    if (speaking) {
      const lastChar = displayedText.slice(-1);
      const target   = getMouthFrame(lastChar, isShouting);
      const rand     = Math.random();
      let final = target;
      if (target === 1 && rand > 0.7)                    final = 0;
      else if (target === 1 && rand > 0.5 && isShouting) final = 2;
      else if (target === 2 && rand > 0.6)               final = 1;
      else if (target === 0 && rand > 0.9)               final = 1;
      setFrameIndex(Math.min(final, frames.length - 1));
    } else if (isTtsSpeaking) {
      let t: number;
      const animate = () => {
        setFrameIndex(prev => {
          const max = isShouting ? frames.length : Math.min(2, frames.length);
          let next = prev;
          while (next === prev) next = Math.floor(Math.random() * max);
          return next;
        });
        t = window.setTimeout(animate, 80 + Math.random() * 120);
      };
      animate();
      return () => clearTimeout(t);
    }
  }, [isTyping, isSpeaking, isTtsSpeaking, avatarState, isLoading, displayedText]);

  const currentFrames = kurisuExpressions[avatarState] || kurisuExpressions['normal'];
  const currentImage  = currentFrames[frameIndex % currentFrames.length];

  useEffect(() => { startListening(); return () => stopListening(); }, [startListening, stopListening]);
  useEffect(() => {
    if (transcript) setInputValue(p => p ? `${p.trim()} ${transcript}` : transcript);
  }, [transcript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) { onSendMessage(inputValue.trim()); setInputValue(''); }
  };

  return (
    <div className={`fixed inset-0 bg-black z-50 flex flex-col items-center justify-end overflow-hidden animate-fade-in ${isGlitching ? 'cognitive-glitch' : ''}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.12)_0%,transparent_80%)] pointer-events-none" />

      <button onClick={onExit} className="absolute top-6 right-6 text-white/20 hover:text-red-500 z-50 bg-white/5 p-3 rounded-full border border-white/5 transition-all backdrop-blur-md">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none">

        {/* Avatar */}
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 h-full flex items-end justify-center pointer-events-none z-10">
          <img src={currentImage} alt="Amadeus Avatar" onLoad={() => setIsImgReady(true)}
            className={`h-[95%] w-auto object-contain drop-shadow-[0_0_80px_rgba(0,0,0,0.9)] transition-opacity duration-300 ${isImgReady ? 'opacity-95' : 'opacity-0'}`}
            style={{ transitionProperty: 'opacity' }} />
        </div>

        {/* Text box */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 w-1/3 max-w-sm flex flex-col gap-3 z-20 pointer-events-auto">
          {(displayedText || isLoading) && (
            <div key={`${msgTimestamp}-${chunkIndex}`} className="animate-slide-in-right">
              <div className="bg-black/60 backdrop-blur-2xl border-l-4 border-amber-500/80 p-8 rounded-r-2xl shadow-2xl">
                <p className="text-xl lg:text-2xl text-amber-50 font-sans leading-relaxed tracking-wide italic min-h-[1.5em]">
                  {isLoading
                    ? <span className="text-amber-500/40 text-base animate-pulse">...</span>
                    : <>{displayedText}{isTyping && <span className="inline-block w-1.5 h-6 bg-amber-500 ml-1 animate-pulse align-middle shadow-[0_0_15px_#f59e0b]" />}</>
                  }
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[10px] font-orbitron text-amber-500/50 tracking-[0.4em] uppercase">
                    {isLoading ? 'SYNCING' : isTyping ? 'TRANSMITTING' : 'STABLE'}
                  </span>
                  <div className="flex items-center gap-2">
                    {chunks.length > 1 && (
                      <div className="flex gap-1">
                        {chunks.map((_, i) => (
                          <button key={i}
                            onClick={() => { if (typingRef.current) clearTimeout(typingRef.current); setChunkIndex(i); }}
                            className={`h-1.5 rounded-full transition-all ${i === chunkIndex ? 'w-3 bg-amber-500' : i < chunkIndex ? 'w-1.5 bg-amber-500/40' : 'w-1.5 bg-white/15'}`}
                          />
                        ))}
                      </div>
                    )}
                    <span className="text-[10px] font-orbitron text-amber-500/40 uppercase">{activeChunk.tag}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xl px-6 z-30 pointer-events-auto">
          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <div className="relative flex-grow">
              <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)}
                placeholder={isListening ? 'Listening to neural pulses...' : 'Voice link active...'}
                className="w-full bg-black/60 border border-white/10 focus:border-amber-500/40 rounded-full py-4 px-8 text-white placeholder-white/10 transition-all outline-none backdrop-blur-2xl font-roboto-mono text-sm" />
            </div>
            <button type="submit" disabled={isLoading || !inputValue.trim()}
              className="bg-amber-500/20 hover:bg-amber-500/40 border border-white/10 text-amber-500 rounded-full p-4 transition-all disabled:opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AvatarView;
