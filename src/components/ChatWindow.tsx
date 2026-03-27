
import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message, SessionSettings } from '../types';
import { Sender } from '../types';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (message: string, imageDataUrl?: string) => void;
  onAnalyzeFrame: (imageDataUrl: string) => Promise<string | null>;
  isLoading: boolean;
  isWebSearchEnabled: boolean;
  onToggleWebSearch: () => void;
  reasoningMode: SessionSettings['reasoningMode'];
  onSetReasoningMode: (mode: SessionSettings['reasoningMode']) => void;
  isCannedModeOnly: boolean;
  onToggleCannedModeOnly: () => void;
  isAudioLoreMode: boolean;
  onToggleAudioLoreMode: () => void;
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
}

const TypingIndicator: React.FC = () => (
  <div className="flex items-center space-x-2">
    <div className="w-8 h-8 rounded-full bg-amber-500/50 flex-shrink-0 mr-3 flex items-center justify-center font-orbitron text-amber-200 text-lg">A</div>
    <div className="rounded-lg px-4 py-2 bg-amber-800/50 flex items-center">
      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
    </div>
  </div>
);

const ChatWindow: React.FC<ChatWindowProps> = ({ 
    messages, onSendMessage, onAnalyzeFrame, isLoading, 
    isWebSearchEnabled, onToggleWebSearch, reasoningMode, onSetReasoningMode, 
    isCannedModeOnly, onToggleCannedModeOnly, isAudioLoreMode, onToggleAudioLoreMode,
    isListening, transcript, 
    startListening, stopListening, isSupported 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isContinuousAnalysis, setIsContinuousAnalysis] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analysisIntervalRef = useRef<number | null>(null);
  
  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

  useEffect(() => {
    if (transcript) setInputValue(prev => prev ? `${prev.trim()} ${transcript}` : transcript);
  }, [transcript]);

  useEffect(() => {
    return () => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
    }
  }, []);

  useEffect(() => {
    const captureAndAnalyze = async () => {
        if (videoRef.current && videoRef.current.readyState >= 2) {
            const video = videoRef.current;
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth; canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.translate(canvas.width, 0); ctx.scale(-1, 1);
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const frameDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                await onAnalyzeFrame(frameDataUrl);
            }
        }
    };
    if (isContinuousAnalysis && isVideoEnabled) {
        if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
        captureAndAnalyze();
        analysisIntervalRef.current = window.setInterval(captureAndAnalyze, 7000);
    } else if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current); analysisIntervalRef.current = null;
    }
    return () => { if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current); };
}, [isContinuousAnalysis, isVideoEnabled, onAnalyzeFrame]);

  const handleToggleVideo = useCallback(async () => {
    if (isVideoEnabled) {
        streamRef.current?.getTracks().forEach(track => track.stop());
        setIsVideoEnabled(false); setIsContinuousAnalysis(false); streamRef.current = null;
    } else {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) videoRef.current.srcObject = stream;
            streamRef.current = stream; setIsVideoEnabled(true);
        } catch (error) { alert("Kamera erişimi reddedildi."); }
    }
  }, [isVideoEnabled]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); if (isLoading) return;
    if (isVideoEnabled && videoRef.current) {
        const video = videoRef.current; if (video.readyState < 2) return;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.translate(canvas.width, 0); ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            onSendMessage(inputValue.trim(), canvas.toDataURL('image/jpeg'));
            setInputValue('');
        }
        return;
    }
    if (inputValue.trim() || image) { onSendMessage(inputValue.trim(), image ?? undefined); setInputValue(''); setImage(null); if(fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const cleanMessageText = (text: string, sender: Sender) => {
    if (sender !== Sender.Amadeus) return text;
    // Strip speed tags and expression tags
    return text.replace(/\[[a-z_:]+[^\]]*\]/gi, '').trim();
  };

  return (
    <div className="glass-panel rounded-lg flex flex-col flex-grow overflow-hidden">
      {isVideoEnabled && (
        <div className="relative p-2 border-b border-amber-500/30 bg-black/20">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-auto rounded-md max-h-64 object-cover" style={{ transform: 'scaleX(-1)' }} />
            <div className="absolute top-4 left-4 flex items-center bg-red-600/80 text-white text-xs font-bold px-2 py-1 rounded">
                <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>LIVE
            </div>
        </div>
      )}
      <div className="flex-grow min-h-0 p-4 sm:p-6 overflow-y-auto scrollbar-thin-amber">
        <div className="flex flex-col space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end max-w-lg ${msg.sender === Sender.User ? 'self-end' : 'self-start'}`}>
              {msg.sender === Sender.Amadeus && !msg.text.startsWith('*') && (
                <div className="w-8 h-8 rounded-full bg-amber-500/50 flex-shrink-0 mr-3 flex items-center justify-center font-orbitron text-amber-200 text-lg">A</div>
              )}
              {msg.sender === Sender.User ? (
                <div className="rounded-lg px-4 py-2 text-white bg-slate-700/60">
                  {msg.image && <img src={msg.image} alt="User upload" className="rounded-md mb-2 max-w-xs max-h-48" />}
                  {msg.text && <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                </div>
              ) : (
                <div className={`flex flex-col ${msg.text.startsWith('*') ? 'w-full items-center' : ''}`}>
                  {!msg.text.startsWith('*') && <span className="text-xs text-amber-400 font-roboto-mono uppercase tracking-wider ml-3 mb-1">Makise Kurisu</span>}
                  <div className={`rounded-lg px-4 py-2 text-white ${msg.text.startsWith('*') ? 'bg-transparent text-amber-400/80 italic text-sm' : 'bg-amber-800/50 chat-bubble prose prose-invert prose-p:my-0'}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanMessageText(msg.text, msg.sender)}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isLoading && <div className="flex items-end max-w-lg self-start"><TypingIndicator /></div>}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="border-t border-amber-500/30 p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2 sm:space-x-4">
          <button type="button" onClick={onToggleWebSearch} className={`p-2 transition-colors ${isWebSearchEnabled ? 'text-amber-400' : 'text-slate-400'}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m0 0a9 9 0 019-9m-9 9a9 9 0 009 9" /></svg></button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-amber-300"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg></button>
          {isSupported && (
            <button type="button" onClick={isListening ? stopListening : startListening} className={`p-2 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-5.445-5.947V4a4 4 0 10-8 0v.053A6 6 0 013 8H2a7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-2v-2.07z" clipRule="evenodd" /></svg></button>
          )}
          <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={isLoading ? "Awaiting..." : "Message Amadeus..."} className="flex-grow bg-slate-800/70 border border-amber-600/50 rounded-full py-2 px-5 text-amber-200 outline-none" />
          <button type="submit" disabled={isLoading || (!inputValue.trim() && !image && !isVideoEnabled)} className="bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-full p-3 transition duration-300"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg></button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
