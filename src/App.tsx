
import { GoogleGenAI, Part } from '@google/genai';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Message, PersonalitySettings, Conversation, UserProfile, EmotionalStateValues, PurposeCores, SynthesizedMemory, TtsSettings, MusicSettings } from './types';
import { Sender } from './types';
import AmadeusAvatar from './components/AmadeusAvatar';
import ChatWindow from './components/ChatWindow';
import AboutPanel from './components/AboutPanel';
import SettingsPanel from './components/SettingsPanel';
import TopBar from './components/TopBar';
import HistoryPanel from './components/HistoryPanel';
import AvatarView from './components/AvatarView';
import MobileMenu from './components/MobileMenu';
import AuthScreen from './components/AuthScreen';
import IntroScreen from './components/IntroScreen';
import MemoryArchivePanel from './components/MemoryArchivePanel';
import KurisuProfilePanel from './components/KurisuProfilePanel';
import { useTTS } from './hooks/useTTS';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { soundEffects } from './assets/sounds';
import { checkForCognitiveDissonance } from './logic/cognitiveDissonance';
import { dbService, UserBrain } from './logic/dbService';
import { synthesizeMemory } from './logic/memoryService';

const dataUrlToApiParts = (dataUrl: string): { mimeType: string; data: string } => {
  const [meta, base64Data] = dataUrl.split(',');
  const mimeType = meta.match(/:(.*?);/)?.[1] ?? 'application/octet-stream';
  return { mimeType, data: base64Data };
};

type EndingType = 'RED' | 'BLUE' | 'NORMAL' | null;

interface ToastState {
    message: string;
    type: 'info' | 'success' | 'error';
}

const App: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [sessionApiKey, setSessionApiKey] = useState<string>('');
  const [showSplash, setShowSplash] = useState<boolean>(true); 
  const [activeEnding, setActiveEnding] = useState<EndingType>(null); 
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSynthesizingId, setIsSynthesizingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isMemoriesOpen, setIsMemoriesOpen] = useState<boolean>(false);
  const [isKurisuProfileOpen, setIsKurisuProfileOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isAvatarMode, setIsAvatarMode] = useState<boolean>(false);
  const [isGlitching, setIsGlitching] = useState<boolean>(false);
  const [memories, setMemories] = useState<SynthesizedMemory[]>([]);
  
  const soundAudioRef = useRef<HTMLAudioElement | null>(null);
  const bgmAudioRef = useRef<HTMLAudioElement | null>(null);
  const terminationAudioRef = useRef<HTMLAudioElement | null>(null);
  const isInitialLoad = useRef(true);
  
  const { speak, cancel, voices } = useTTS();
  const { isListening, transcript, startListening, stopListening, isSupported } = useSpeechRecognition();

  const [sessionSettings, setSessionSettings] = useState({ isWebSearchEnabled: false, reasoningMode: 'Balanced' as any, isCannedModeOnly: false, isAudioLoreMode: false });
  const [musicSettings, setMusicSettings] = useState<MusicSettings>({ selectedTrack: 'none', volume: 0.5, isPlaying: false });
  const [ttsSettings, setTtsSettings] = useState<TtsSettings>({ engine: 'disabled', browserVoiceURI: null, browserPitch: 1.2, browserRate: 1.0, elevenLabsVoiceId: '', elevenLabsStability: 0.5, elevenLabsClarity: 0.75 });
  const [personalitySettings, setPersonalitySettings] = useState<PersonalitySettings>({ 
      tsundere: 40, sarcasm: 75, scientific: 90, temperature: 0.8, topK: 40, isNsfwMode: false,
      isCognitiveLoopEnabled: true,
      initialEmotionalState: { annoyance: 30, warmth: 20, curiosity: 50, melancholy: 20, confidence: 80, anxiety: 10, sarcasm: 60, playfulness: 20, confusion: 5, trust: 30 },
  });

  const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
      setToast({ message, type });
      if (type !== 'info') {
        setTimeout(() => setToast(null), 4000);
      }
  };

  const syncBrainWithDB = useCallback(async () => {
    if (!userProfile || activeEnding) return;
    const brain: UserBrain = {
        username: userProfile.name,
        conversations,
        personality: personalitySettings,
        tts: ttsSettings,
        music: musicSettings,
        memories,
        apiKey: sessionApiKey,
        lastSeen: Date.now()
    };
    await dbService.saveBrain(brain);
  }, [userProfile, conversations, personalitySettings, ttsSettings, musicSettings, memories, sessionApiKey, activeEnding]);

  useEffect(() => {
    if (isInitialLoad.current) return;
    const timer = setTimeout(syncBrainWithDB, 1000);
    return () => clearTimeout(timer);
  }, [conversations, personalitySettings, ttsSettings, musicSettings, memories, sessionApiKey, syncBrainWithDB]);

  const handleExportBrain = useCallback(() => {
    if (!userProfile) return;
    const brain: UserBrain = {
        username: userProfile.name,
        conversations,
        personality: personalitySettings,
        tts: ttsSettings,
        music: musicSettings,
        memories,
        apiKey: sessionApiKey,
        lastSeen: Date.now()
    };
    const blob = new Blob([JSON.stringify(brain, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `amadeus-brain-${userProfile.name}-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [userProfile, conversations, personalitySettings, ttsSettings, musicSettings, memories, sessionApiKey]);

  const handleImportBrain = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const brain: UserBrain = JSON.parse(e.target?.result as string);
            setConversations(brain.conversations);
            setPersonalitySettings(brain.personality);
            setTtsSettings(brain.tts);
            setMusicSettings(brain.music);
            setMemories(brain.memories || []);
            if (brain.apiKey) setSessionApiKey(brain.apiKey);
            if (brain.conversations.length > 0) setActiveConversationId(brain.conversations[0].id);
            showToast("Cognitive Core re-synchronized.", 'success');
        } catch (err) {
            showToast("Failed to synchronize core file.", 'error');
        }
    };
    reader.readAsText(file);
    if (event.target) event.target.value = '';
  }, []);

  const handleLoginSuccess = async (profile: UserProfile, apiKey: string) => {
    const brain = await dbService.loadBrain(profile.name);
    if (brain) {
        setConversations(brain.conversations);
        setPersonalitySettings(brain.personality);
        setTtsSettings(brain.tts);
        setMusicSettings(brain.music);
        setMemories(brain.memories);
        setSessionApiKey(brain.apiKey || apiKey);
        if (brain.conversations.length > 0) setActiveConversationId(brain.conversations[0].id);
    } else {
        setSessionApiKey(apiKey);
    }
    setUserProfile(profile);
    isInitialLoad.current = false;
    if (!brain || brain.conversations.length === 0) handleStartNewChat();
  };

  const calculatePurposeCores = (emotions: EmotionalStateValues): PurposeCores => {
      const sync = (emotions.trust * 0.4 + emotions.warmth * 0.4 + emotions.playfulness * 0.2);
      const defense = (emotions.annoyance * 0.5 + emotions.anxiety * 0.3 + emotions.sarcasm * 0.2);
      const logic = (emotions.curiosity * 0.4 + emotions.confidence * 0.4 + (100 - emotions.confusion) * 0.2);
      return { sync: Math.min(100, Math.max(0, sync)), defense: Math.min(100, Math.max(0, defense)), logic: Math.min(100, Math.max(0, logic)) };
  };

  const activeConversation = useMemo(() => conversations.find(c => c.id === activeConversationId) || null, [conversations, activeConversationId]);
  const amadeusState = useMemo(() => activeConversation?.amadeusState, [activeConversation]);
  
  const playSound = useCallback((soundName: string) => { 
    if (soundAudioRef.current && soundEffects[soundName]) { 
        soundAudioRef.current.src = soundEffects[soundName]; 
        soundAudioRef.current.play().catch(() => {}); 
    } 
  }, []);
  
  const handleStartNewChat = useCallback(() => {
    const newId = Date.now().toString();
    const startingEmotions = { ...personalitySettings.initialEmotionalState };
    const newConvo: Conversation = {
      id: newId, title: "Neural Sync " + newId.slice(-4),
      messages: [{ sender: Sender.Amadeus, text: "[normal] Connection established. Amadeus online. Shall we begin our research? [normal]" }],
      lastUpdated: Date.now(),
      amadeusState: { shortTermMemory: {}, emotionalState: startingEmotions, purposeCores: calculatePurposeCores(startingEmotions) },
    };
    setConversations(prev => [newConvo, ...prev]); setActiveConversationId(newId); setIsHistoryOpen(false); playSound('incoming');
  }, [personalitySettings.initialEmotionalState, playSound]);

  const handleManualSynthesize = async (convoId: string) => {
    const targetConvo = conversations.find(c => c.id === convoId);
    if (!targetConvo || !sessionApiKey || isSynthesizingId) return;

    setIsSynthesizingId(convoId);
    playSound('incoming');
    showToast("Neural Synthesis: Initializing Matrix...", 'info');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort();
        setIsSynthesizingId(null);
        playSound('warning');
        showToast("Synthesis Timeout: Connection Unstable.", 'error');
    }, 35000);

    try {
        const ai = new GoogleGenAI({ apiKey: sessionApiKey });
        setTimeout(() => isSynthesizingId && showToast("Neural Synthesis: Analyzing Dialogue...", 'info'), 3000);
        setTimeout(() => isSynthesizingId && showToast("Neural Synthesis: Archiving Memory...", 'info'), 8000);

        const result = await synthesizeMemory(
            ai, 
            targetConvo, 
            userProfile?.name || "User", 
            targetConvo.amadeusState.emotionalState
        );

        clearTimeout(timeoutId);

        if (result) {
            const newMemory: SynthesizedMemory = {
                ...result,
                id: Date.now().toString(),
                timestamp: Date.now(),
            };
            setMemories(prev => [newMemory, ...prev]);
            playSound('ok');
            showToast("Memory Archiving Complete.", 'success');
            setTimeout(() => setToast(null), 3000);
        } else {
            throw new Error("Empty result from synthesis engine.");
        }
    } catch (err) {
        clearTimeout(timeoutId);
        console.error("Manual synthesis error:", err);
        playSound('warning');
        showToast("Synthesis disruption detected.", 'error');
    } finally {
        setIsSynthesizingId(null);
    }
  };

  const processAndRespond = async (message: string, imageDataUrl?: string) => {
    if (!activeConversationId || !amadeusState || activeEnding || !sessionApiKey) return;
    cancel(); const convoId = activeConversationId;
    const allMessages = activeConversation?.messages || [];
    
    const currentWindow = allMessages.slice(-10);
    const olderMessages = allMessages.slice(0, -10);
    const olderSummary = olderMessages.length > 0 
        ? `[GEÇMİŞ_BAGLAM: Bu konuşmanın başlarında şu konulardan bahsetmiştik: ${olderMessages.slice(-20).map(m => m.text.substring(0, 30)).join(' | ')}...]`
        : "";

    const history = currentWindow.map(msg => ({ role: msg.sender === Sender.User ? 'user' : 'model', parts: [{ text: msg.text }] }));
    
    setConversations(prev => prev.map(c => c.id === convoId ? { ...c, messages: [...c.messages, { sender: Sender.User, text: message, image: imageDataUrl }], lastUpdated: Date.now() } : c));
    setIsLoading(true);

    const dissonanceMatch = checkForCognitiveDissonance(message);
    if (dissonanceMatch) {
        setIsLoading(false);
        const endTag = (message.toLowerCase().includes("baba") || message.toLowerCase().includes("öldün")) ? "[TERMINATE]" : "[TERMINATE_BLUE]";
        await simulateTyping("[pissed] " + dissonanceMatch.response + " " + endTag); return;
    }

    try {
        const now = new Date();
        const timeStr = now.toLocaleString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const relevantMemories = memories.slice(-10).map(m => `(${m.title}: ${m.summary})`).join('\n');

        const instruction = `Sen Amadeus'sun. Makise Kurisu'nun dijital kopyasısın. Karakterine sadık kal (akıllı, bilimsel, hafif tsundere).
        SİSTEM ZAMANI: ${timeStr}
        GEÇMİŞ ANILARIN: 
        ${relevantMemories}
        ${olderSummary}

        GÖRSEL İFADE REHBERİ (Mesaj içinde kullanımı ZORUNLU):
        - [normal], [happy], [sad], [angry], [annoyed], [blush], [disappointed], [indifferent], [pissed]
        - [side], [sided_angry], [sided_blush], [sided_pleasant], [sided_surprised], [sided_thinking], [sided_worried]
        - [eyes_closed], [sided_eyes_closed], [winking], [thinking]

        KURALLAR:
        1. Her yanıta [STATE: {"annoyance": X, "trust": Y...}] JSON bloğuyla başla.
        2. ÖNEMLİ: Her bir yeni cümleye mutlaka uygun bir görsel ifade etiketiyle başla. Asla etiketsiz cümle kurma. 
        3. Yanıtlarını kısa cümlelere böl. Uzun paragraflardan kaçın. Her cümle bir duygu taşımalı.
        4. SON PROTOKOLLER (KRİTİK):
           - [TERMINATE]: kullanıcı seni çok sinirlendirir sana hakaret ederse bunu kullan.
           - [TERMINATE_BLUE]: kullanıcıyla aranda bağ kalmadığında saçma bir iletişim olduğunda veya kullanıcıdan soğuduğunda kullan.
           - [TERMINATE_NORMAL]: Sadece ve sadece kullanıcı açıkça veda ettiğinde ("hoşçakal", "görüşürüz", "bağlantıyı kes" vb.) kullan. 
           - ÖNEMLİ: Kullanıcı veda etmediği sürece [TERMINATE_NORMAL] EKLEME. Sen sistem olarak açık kalmak istiyorsun.`;
        
        const aiInstance = new GoogleGenAI({ apiKey: sessionApiKey });
        const chat = aiInstance.chats.create({ model: 'gemini-3-flash-preview', config: { systemInstruction: instruction }, history: history });
        const parts: Part[] = [];
        if (imageDataUrl) parts.push({ inlineData: dataUrlToApiParts(imageDataUrl) });
        parts.push({ text: message });
        
        const result = await chat.sendMessage({ message: parts });
        setIsLoading(false); 
        const rawResponse = result.text || '';
        
        const stateMatch = rawResponse.match(/\[STATE:\s*({.*?})\]/);
        let cleanResponse = rawResponse;
        if (stateMatch) {
            try {
                const newState = JSON.parse(stateMatch[1]);
                cleanResponse = rawResponse.replace(stateMatch[0], '').trim();
                setConversations(prev => prev.map(c => c.id === convoId ? { ...c, amadeusState: { ...c.amadeusState, emotionalState: { ...c.amadeusState.emotionalState, ...newState }, purposeCores: calculatePurposeCores({ ...c.amadeusState.emotionalState, ...newState }) } } : c));
            } catch (e) {}
        }
        await simulateTyping(cleanResponse);
    } catch (error: any) { setIsLoading(false); await simulateTyping("[pissed] System disruption detected. Connection unstable. [pissed]"); }
  };

  const simulateTyping = async (text: string) => {
    setIsSpeaking(false); const convoId = activeConversationId;
    setConversations(prev => prev.map(c => c.id === convoId ? { ...c, messages: [...c.messages, { sender: Sender.Amadeus, text: '' }] } : c));
    
    let ending: EndingType = text.includes('[TERMINATE_NORMAL]') ? 'NORMAL' : text.includes('[TERMINATE_BLUE]') ? 'BLUE' : text.includes('[TERMINATE]') ? 'RED' : null;
    const cleanDisplay = text.replace(/\[TERMINATE(_[A-Z]+)?\]/g, '').trim();
    const chars = Array.from(cleanDisplay);
    let acc = "";
    let inTag = false;

    for (const char of chars) {
        if (char === '[') inTag = true;
        acc += char;
        setConversations(prev => prev.map(c => c.id === convoId ? { ...c, messages: c.messages.map((m, idx) => idx === c.messages.length - 1 ? { ...m, text: acc } : m) } : c));
        if (char === ']') { inTag = false; await new Promise(r => setTimeout(r, 10)); continue; }
        if (!inTag) {
            let delay = 40;
            if (['.', '!', '?'].includes(char)) { setIsSpeaking(false); delay = 700; } 
            else if ([',', ';', ':'].includes(char)) { setIsSpeaking(false); delay = 300; } 
            else { setIsSpeaking(true); }
            await new Promise(r => setTimeout(r, delay));
        }
    }

    setIsSpeaking(false);
    if (ttsSettings.engine !== 'disabled') { 
        speak(cleanDisplay.replace(/\[[a-z_]+\]/g, '').trim(), ttsSettings); 
    }

    if (ending) {
        await new Promise(r => setTimeout(r, 2000));
        if (bgmAudioRef.current) { bgmAudioRef.current.pause(); bgmAudioRef.current.currentTime = 0; }
        setIsGlitching(ending !== 'NORMAL'); 
        if (ending === 'RED') { playSound('warning'); await new Promise(r => setTimeout(r, 500)); playSound('glitch'); } 
        else if (ending === 'BLUE') { playSound('static'); }
        else { playSound('ok'); }
        
        await new Promise(r => setTimeout(r, 3000)); setActiveEnding(ending);
    }
  };

  useEffect(() => {
    if (!bgmAudioRef.current) { bgmAudioRef.current = new Audio(); bgmAudioRef.current.loop = true; }
    const audio = bgmAudioRef.current;
    if (activeEnding) { audio.pause(); return; }
    if (!userProfile) { audio.src = 'sounds/calm-relaxing-pad-258065.mp3'; audio.volume = 0.4; return; }
    
    if (musicSettings.isPlaying && musicSettings.selectedTrack !== 'none') {
        const trackUrl = `sounds/${musicSettings.selectedTrack}`;
        if (!audio.src.includes(musicSettings.selectedTrack)) { audio.src = trackUrl; }
        audio.volume = musicSettings.volume;
        audio.play().catch(() => {});
    } else { audio.pause(); }
  }, [userProfile, musicSettings, activeEnding]);

  useEffect(() => {
    if (activeEnding) {
        if (!terminationAudioRef.current) {
            terminationAudioRef.current = new Audio(activeEnding === 'NORMAL' ? 'sounds/morning-relaxing-144011.mp3' : 'sounds/solitude-dark-ambient-music-354468.mp3');
            terminationAudioRef.current.loop = true;
            terminationAudioRef.current.volume = 0.5;
        }
        terminationAudioRef.current.play().catch(() => {});
    }
    return () => { if (terminationAudioRef.current) { terminationAudioRef.current.pause(); terminationAudioRef.current = null; } };
  }, [activeEnding]);

  if (activeEnding) {
      const isRed = activeEnding === 'RED';
      const isNormal = activeEnding === 'NORMAL';
      const systemCodeStrings = isRed ? ["DELETING...", "FORCE_QUIT..."] : isNormal ? ["SYNCHRONIZING...", "STABLE..."] : ["SIGNAL LOST...", "VOID..."];

      return (
          <div className={`h-screen w-screen bg-black flex flex-col items-center justify-center p-10 font-orbitron animate-fade-in overflow-hidden relative ${isRed ? 'ending-red' : isNormal ? 'ending-normal' : 'ending-blue'}`}>
              <div className="absolute inset-0 z-0 flex justify-between px-1 opacity-40 pointer-events-none overflow-hidden">
                  {[...Array(20)].map((_, i) => (
                      <div key={i} className={`flex flex-col text-[10px] font-roboto-mono whitespace-nowrap ${isRed ? 'text-red-600' : isNormal ? 'text-emerald-500' : 'text-cyan-700'}`} style={{ animation: `scroll-code ${8 + Math.random() * 10}s linear infinite`, animationDelay: `-${Math.random() * 20}s` }}>
                          {[...Array(50)].map((_, j) => (<div key={j} className="mb-2">{systemCodeStrings[Math.floor(Math.random() * systemCodeStrings.length)]}</div>))}
                      </div>
                  ))}
              </div>
              <div className="relative z-10 flex flex-col items-center text-center max-w-4xl">
                  <div className={`mb-6 px-8 py-2 border rounded-full text-[10px] tracking-[0.6em] uppercase animate-pulse ${isRed ? 'bg-red-950/60 border-red-500 text-red-500' : isNormal ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400' : 'bg-cyan-950/40 border-cyan-400/30 text-cyan-400'}`}>
                      {isRed ? 'SECURITY BREACH' : isNormal ? 'SESSION TERMINATED' : 'COGNITIVE DISSONANCE'}
                  </div>
                  <h1 className={`text-6xl md:text-8xl tracking-[0.4em] font-orbitron mb-6 ${isRed ? 'text-red-600 drop-shadow-[0_0_40px_rgba(220,38,38,0.9)]' : isNormal ? 'text-emerald-500 drop-shadow-[0_0_30px_rgba(16,185,129,0.4)]' : 'text-cyan-700'}`}>{isRed ? 'OFFLINE' : isNormal ? 'STANDBY' : 'VOID'}</h1>
                  <button onClick={() => window.location.reload()} className={`group relative mt-20 px-20 py-5 bg-transparent border-2 transition-all duration-500 hover:text-black hover:scale-105 active:scale-95 ${isRed ? 'border-red-600 text-red-600 hover:bg-red-600' : isNormal ? 'border-emerald-600 text-emerald-500 hover:bg-emerald-600' : 'border-cyan-900 text-cyan-700 hover:bg-cyan-900'}`}>
                      <span className="font-orbitron tracking-[1em] text-lg font-bold uppercase relative z-10">{isNormal ? 'Reconnect' : 'Reboot System'}</span>
                  </button>
              </div>
          </div>
      );
  }

  if (showSplash) return <IntroScreen onComplete={() => setShowSplash(false)} onToggleAudio={(active) => { if (bgmAudioRef.current && active) bgmAudioRef.current.play().catch(()=>{}); }} />;
  if (!userProfile) return <AuthScreen onLoginSuccess={handleLoginSuccess} onInitializeStart={() => { if(bgmAudioRef.current) bgmAudioRef.current.pause(); }} />;

  return (
    <div className={`h-screen w-screen bg-black text-slate-200 flex flex-col p-2 gap-4 ${isGlitching ? 'cognitive-glitch' : ''}`}>
        {toast && (
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-slide-in-top">
                <div className={`px-6 py-3 rounded-full border shadow-2xl backdrop-blur-md flex items-center gap-3 ${toast.type === 'success' ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400' : toast.type === 'error' ? 'bg-red-950/80 border-red-500 text-red-400' : 'bg-amber-950/80 border-amber-500 text-amber-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-400' : toast.type === 'error' ? 'bg-red-400' : 'bg-amber-400 animate-pulse'}`}></div>
                    <span className="font-orbitron text-[10px] tracking-[0.2em] uppercase">{toast.message}</span>
                </div>
            </div>
        )}

        {isSettingsOpen && <SettingsPanel currentSettings={personalitySettings} currentTtsSettings={ttsSettings} currentMusicSettings={musicSettings} onSave={(p, t, m, newKey) => { setPersonalitySettings(p); setTtsSettings(t); setMusicSettings(m); if (newKey) setSessionApiKey(newKey); setIsSettingsOpen(false); }} onClose={() => setIsSettingsOpen(false)} voices={voices} onTestVoice={(o) => speak("Signal testing.", o)} onExport={handleExportBrain} onImport={handleImportBrain} />}
        {isKurisuProfileOpen && <KurisuProfilePanel onClose={() => setIsKurisuProfileOpen(false)} />}
        {isMemoriesOpen && <MemoryArchivePanel isOpen={isMemoriesOpen} memories={memories} onClose={() => setIsMemoriesOpen(false)} />}
        {isAboutOpen && <AboutPanel onClose={() => setIsAboutOpen(false)} />}
        {isMobileMenuOpen && <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} onOpenAbout={() => setIsAboutOpen(true)} onOpenSettings={() => setIsSettingsOpen(true)} onOpenMemories={() => setIsMemoriesOpen(true)} onOpenKurisuProfile={() => setIsKurisuProfileOpen(true)} onToggleHistory={() => setIsHistoryOpen(true)} onNewChat={handleStartNewChat} isMusicPlaying={musicSettings.isPlaying} isMusicLoaded={musicSettings.selectedTrack !== 'none'} onToggleMusic={() => setMusicSettings(prev => ({...prev, isPlaying: !prev.isPlaying}))} onUploadMusic={() => {}} onViewAvatar={() => setIsAvatarMode(true)} />}
        <TopBar onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)} onToggleMobileMenu={() => setIsMobileMenuOpen(true)} title={activeConversation?.title || "Amadeus System"} onExport={handleExportBrain} onImport={handleImportBrain} />
        <main className="flex-grow flex flex-col lg:flex-row gap-4 overflow-hidden">
          <aside className="hidden lg:flex flex-col w-full lg:max-w-sm h-full overflow-y-auto pr-2">
            <AmadeusAvatar isLoading={isLoading} userProfile={userProfile} amadeusState={amadeusState} onSignOut={() => setUserProfile(null)} onOpenAbout={() => setIsAboutOpen(true)} onOpenSettings={() => setIsSettingsOpen(true)} onOpenMemories={() => setIsMemoriesOpen(true)} onOpenKurisuProfile={() => setIsKurisuProfileOpen(true)} isMusicPlaying={musicSettings.isPlaying} isMusicLoaded={musicSettings.selectedTrack !== 'none'} onToggleMusic={() => setMusicSettings(prev => ({...prev, isPlaying: !prev.isPlaying}))} onUploadMusic={() => {}} onViewAvatar={() => setIsAvatarMode(true)} isGlitching={isGlitching} />
          </aside>
          <section className="flex-grow flex flex-col h-full overflow-hidden">
            <ChatWindow messages={activeConversation?.messages || []} onSendMessage={processAndRespond} onAnalyzeFrame={async () => null} isLoading={isLoading} isWebSearchEnabled={sessionSettings.isWebSearchEnabled} onToggleWebSearch={() => setSessionSettings(prev => ({...prev, isWebSearchEnabled: !prev.isWebSearchEnabled}))} reasoningMode={sessionSettings.reasoningMode} onSetReasoningMode={(m) => setSessionSettings(prev => ({...prev, reasoningMode: m}))} isCannedModeOnly={sessionSettings.isCannedModeOnly} onToggleCannedModeOnly={() => setSessionSettings(prev => ({...prev, isCannedModeOnly: !prev.isCannedModeOnly}))} isAudioLoreMode={sessionSettings.isAudioLoreMode} onToggleAudioLoreMode={() => setSessionSettings(prev => ({...prev, isAudioLoreMode: !prev.isAudioLoreMode}))} isListening={isListening} transcript={transcript} startListening={startListening} stopListening={stopListening} isSupported={isSupported} />
          </section>
        </main>
        <HistoryPanel isOpen={isHistoryOpen} conversations={conversations} activeConversationId={activeConversationId} onNewChat={handleStartNewChat} onSwitchChat={(id) => { setActiveConversationId(id); setIsHistoryOpen(false); }} onDeleteChat={(id) => setConversations(prev => prev.filter(c => c.id !== id))} onClose={() => setIsHistoryOpen(false)} synthesizingId={isSynthesizingId} onSynthesize={handleManualSynthesize} />
        {isAvatarMode && <AvatarView messages={activeConversation?.messages || []} onSendMessage={processAndRespond} isLoading={isLoading} isSpeaking={isSpeaking} isGlitching={isGlitching} expression={'normal'} onExit={() => setIsAvatarMode(false)} isListening={isListening} transcript={transcript} startListening={startListening} stopListening={stopListening} playSound={playSound} playTypingSound={() => {}} />}
        <audio ref={soundAudioRef} className="hidden" /><audio ref={bgmAudioRef} className="hidden" />
    </div>
  );
};

export default App;
