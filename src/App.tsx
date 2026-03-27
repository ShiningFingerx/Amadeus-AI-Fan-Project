
import { GoogleGenAI } from '@google/genai';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { 
  Message, PersonalitySettings, Conversation, UserProfile, EmotionalStateValues, 
  PurposeCores, SynthesizedMemory, AmygdalaAnalysis, MusicSettings, TtsSettings 
} from './types';
import { Sender } from './types';
import AmadeusAvatar from './components/AmadeusAvatar';
import ChatWindow from './components/ChatWindow';
import TopBar from './components/TopBar';
import HistoryPanel from './components/HistoryPanel';
import AvatarView from './components/AvatarView';
import MobileMenu from './components/MobileMenu';
import AuthScreen from './components/AuthScreen';
import IntroScreen from './components/IntroScreen';
import KurisuProfilePanel from './components/KurisuProfilePanel';
import MemoryArchivePanel from './components/MemoryArchivePanel';
import TerminationScreen from './components/TerminationScreen';
import CognitiveLogPanel from './components/CognitiveLogPanel';
import SettingsPanel from './components/SettingsPanel';
import AboutPanel from './components/AboutPanel';
import { useTTS } from './hooks/useTTS';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { soundEffects } from './assets/sounds';
import { dbService, UserBrain } from './logic/dbService';
import { 
  createInitialNeuralState, processNeuralInput, evolveBaselines, applyDynamicNeuralUpdate,
  applyHomeostasis, getProcessedHistoryContext 
} from './logic/neuralNetwork';
import { synthesizeMemory } from './logic/memoryService';
import { processFullCognition } from './logic/cognitionService';
import IncomingCallOverlay from './components/IncomingCallOverlay';
import type { CallMode, CallMood } from './components/IncomingCallOverlay';
import {
  evaluatePresence, saveOfflineSnapshot, loadOfflineSnapshot, buildSnapshotFromSession, buildSnapshotWithMemories
} from './logic/offlinePresence';
import type { PresenceDecision } from './logic/offlinePresence';

type EndingType = 'RED' | 'BLUE' | 'NORMAL' | null;

const App: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [sessionApiKey, setSessionApiKey] = useState<string>(localStorage.getItem('amadeus-gemini-key') || '');
  const [sessionGroqKey, setSessionGroqKey] = useState<string>(localStorage.getItem('amadeus-groq-key') || '');
  const [sessionGroqKey2, setSessionGroqKey2] = useState<string>(localStorage.getItem('amadeus-groq-key2') || '');
  const [showSplash, setShowSplash] = useState<boolean>(true); 
  const [activeEnding, setActiveEnding] = useState<EndingType>(null); 
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastAmygdalaState, setLastAmygdalaState] = useState<AmygdalaAnalysis | null>(null);
  const [cognitiveLogs, setCognitiveLogs] = useState<any[]>([]);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isMemoriesOpen, setIsMemoriesOpen] = useState<boolean>(false);
  const [isKurisuProfileOpen, setIsKurisuProfileOpen] = useState<boolean>(false);
  const [isLogsOpen, setIsLogsOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isAvatarMode, setIsAvatarMode] = useState<boolean>(false);
  const [isGlitching, setIsGlitching] = useState<boolean>(false);
  const [memories, setMemories] = useState<SynthesizedMemory[]>([]);
  const [synthesizingId, setSynthesizingId] = useState<string | null>(null);

  // ── Offline Presence / Call System ────────────────────────────────────
  const [callOverlay, setCallOverlay] = useState<{
    mode: CallMode;
    mood?: CallMood;
    reason?: string;
    rejectMessage?: string;
    minutesElapsed?: number;
    evolvedEmotions?: any;
  } | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const soundAudioRef = useRef<HTMLAudioElement | null>(null);
  const bgmAudioRef = useRef<HTMLAudioElement | null>(null);
  const isInitialLoad = useRef(true);
  
  const { speak, cancel, voices, isSpeaking: isTtsSpeaking } = useTTS();
  const { isListening, transcript, startListening, stopListening, isSupported } = useSpeechRecognition();

  const [sessionSettings, setSessionSettings] = useState({ isWebSearchEnabled: false, reasoningMode: 'Balanced' as any, isCannedModeOnly: false, isAudioLoreMode: false });
  const [musicSettings, setMusicSettings] = useState<MusicSettings>({ selectedTrack: 'none', volume: 0.5, isPlaying: false });
  const [ttsSettings, setTtsSettings] = useState<TtsSettings>({ engine: 'disabled', browserVoiceURI: null, browserPitch: 1.2, browserRate: 1.0, elevenLabsApiKey: null, elevenLabsVoiceId: '', elevenLabsStability: 0.5, elevenLabsClarity: 0.75 });
  
  // UPDATED NEUROCHEMISTRY FOR AMADEUS (SG0) PERSONA
  // Less defensive, more curious/warm compared to Human Kurisu
  const [personalitySettings, setPersonalitySettings] = useState<PersonalitySettings>({ 
      tsundere: 30, sarcasm: 25, scientific: 95, temperature: 0.8, topK: 40, isNsfwMode: false,
      isCognitiveLoopEnabled: true,
      initialEmotionalState: { 
          annoyance: 10,  // Reduced from 30
          warmth: 45,     // Increased from 20
          curiosity: 70,  // Increased from 50 (Core Trait)
          melancholy: 20, 
          confidence: 80, 
          anxiety: 10, 
          sarcasm: 25,    // Reduced from 60
          playfulness: 30, // Increased slightly
          confusion: 5, 
          trust: 40,      // Increased from 30
          dopamine: 30, 
          stress: 10, 
          shame: 0, 
          discomfort: 0 
      },
  });

  const playSound = useCallback((soundName: string) => { 
    if (soundAudioRef.current && soundEffects[soundName]) { 
        soundAudioRef.current.pause();
        soundAudioRef.current.currentTime = 0;
        soundAudioRef.current.src = soundEffects[soundName]; 
        soundAudioRef.current.play().catch(() => {}); 
    } 
  }, []);

  const handleToggleMusic = useCallback(() => {
    setMusicSettings(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  useEffect(() => {
    if (!bgmAudioRef.current) return;
    const audio = bgmAudioRef.current;
    if (musicSettings.selectedTrack !== 'none') {
        const trackPath = musicSettings.selectedTrack.startsWith('sounds/') ? musicSettings.selectedTrack : `sounds/${musicSettings.selectedTrack}`;
        if (audio.src !== window.location.origin + '/' + trackPath) {
            audio.src = trackPath;
        }
        audio.volume = musicSettings.volume;
        audio.loop = true;
        if (musicSettings.isPlaying) {
            audio.play().catch((e) => console.log("Audio Play Blocked:", e));
        } else {
            audio.pause();
        }
    } else {
        audio.pause();
        audio.src = "";
    }
  }, [musicSettings.isPlaying, musicSettings.selectedTrack, musicSettings.volume]);

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
        groqKey: sessionGroqKey,
        groqKey2: sessionGroqKey2,
        lastSeen: Date.now()
    };
    await dbService.saveBrain(brain);

    // Save offline presence snapshot so Amadeus can "remember" how things ended
    const activeConvo = conversations[0];
    if (activeConvo && activeConvo.amadeusState) {
      const snap = buildSnapshotWithMemories(
        activeConvo.amadeusState.emotionalState,
        activeConvo.amadeusState.neuralNetwork?.personalityDrift?.guardedness ?? 50,
        activeConvo.amadeusState.neuralNetwork?.personalityDrift?.trustBuilt ?? 30,
        activeConvo.messages.slice(-5),
        memories
      );
      saveOfflineSnapshot(snap);
    }
  }, [userProfile, conversations, personalitySettings, ttsSettings, musicSettings, memories, sessionApiKey, sessionGroqKey, sessionGroqKey2, activeEnding]);

  useEffect(() => {
    if (isInitialLoad.current) return;
    const timer = setTimeout(syncBrainWithDB, 1000);
    return () => clearTimeout(timer);
  }, [conversations, personalitySettings, ttsSettings, musicSettings, memories, sessionApiKey, sessionGroqKey, sessionGroqKey2, syncBrainWithDB]);

  const calculatePurposeCores = (emotions: EmotionalStateValues): PurposeCores => {
      const sync = (emotions.trust * 0.4 + emotions.warmth * 0.4 + emotions.playfulness * 0.2);
      const defense = (emotions.annoyance * 0.4 + emotions.anxiety * 0.3 + emotions.discomfort * 0.3);
      const logic = (emotions.curiosity * 0.4 + emotions.confidence * 0.4 + emotions.dopamine * 0.2);
      return { sync: Math.min(100, Math.max(0, sync)), defense: Math.min(100, Math.max(0, defense)), logic: Math.min(100, Math.max(0, logic)) };
  };

  const handleStartNewChat = useCallback(() => {
    const newId = Date.now().toString();
    const startingEmotions = { ...personalitySettings.initialEmotionalState };
    const newConvo: Conversation = {
      id: newId, title: "Neural Sync " + newId.slice(-4),
      messages: [{ sender: Sender.Amadeus, text: "[normal] Connection established. Amadeus System online. [normal]", timestamp: Date.now(), emotionalState: startingEmotions }],
      lastUpdated: Date.now(),
      amadeusState: { 
        shortTermMemory: {}, 
        emotionalState: startingEmotions, 
        personalityBaselines: { ...startingEmotions }, 
        purposeCores: calculatePurposeCores(startingEmotions),
        neuralNetwork: createInitialNeuralState()
      },
    };
    setConversations(prev => [newConvo, ...prev]); setActiveConversationId(newId); setIsHistoryOpen(false); playSound('incoming');
  }, [personalitySettings.initialEmotionalState, playSound]);

  const handleLoginSuccess = async (profile: UserProfile, apiKey: string) => {
    const brain = await dbService.loadBrain(profile.name);
    if (brain) {
        setConversations(brain.conversations);
        setPersonalitySettings(brain.personality);
        setTtsSettings(brain.tts);
        setMusicSettings(brain.music);
        setMemories(brain.memories);
        setSessionApiKey(brain.apiKey || apiKey);
        setSessionGroqKey(brain.groqKey || '');
        setSessionGroqKey2(brain.groqKey2 || '');
        if (brain.conversations.length > 0) setActiveConversationId(brain.conversations[0].id);
    } else {
        setSessionApiKey(apiKey);
    }
    setUserProfile(profile);
    isInitialLoad.current = false;
    if (!brain || brain.conversations.length === 0) {
      handleStartNewChat();
    } else {
      // ── Offline Presence Check ───────────────────────────────────────
      // Check what happened while Amadeus was "offline"
      const snapshot = loadOfflineSnapshot();
      if (snapshot) {
        const decision = evaluatePresence(snapshot);

        if (decision.amadeusWillCall) {
          // Amadeus is calling us
          playSound('incoming');
          setCallOverlay({
            mode:           'amadeus_calling',
            mood:           decision.callMood,
            reason:         decision.callReason,
            minutesElapsed: decision.minutesElapsed,
            evolvedEmotions:decision.evolvedEmotions,
          });
        } else if (!decision.willPickUp) {
          // We try to connect but she won't pick up
          // Show rejection after a short delay (feels like it rang then got rejected)
          setTimeout(() => {
            setCallOverlay({
              mode:          'rejected',
              rejectMessage: decision.rejectReason,
            });
          }, 1800);
        }
        // else: normal login, no overlay
      }
    }
  };

  const activeConversation = useMemo(() => conversations.find(c => c.id === activeConversationId) || null, [conversations, activeConversationId]);
  const amadeusState = useMemo(() => activeConversation?.amadeusState, [activeConversation]);
  
  const processAndRespond = async (message: string, imageDataUrl?: string) => {
    if (!activeConversationId || !amadeusState || activeEnding) return;
    
    cancel(); 
    const convoId = activeConversationId;
    const history = activeConversation?.messages || [];
    setIsLoading(true);

    try {
        let currentEmotions = { ...amadeusState.emotionalState };
        let updatedNeuralNetwork = amadeusState.neuralNetwork;

        const cognition = await processFullCognition(
            message, 
            history, 
            currentEmotions, 
            memories, 
            updatedNeuralNetwork, 
            imageDataUrl,
            sessionGroqKey,
            sessionApiKey,
            sessionGroqKey2
        );

        if (!cognition) throw new Error("Cognitive Link Failed");

        setLastAmygdalaState(cognition.amygdala);

        // Bloğu Ayıkla (NEURAL ve STATE)
        let rawText = cognition.behavioralResponse.text;
        
        // NEURAL update - FIXED REGEX for Multi-line JSON
        const neuralMatch = rawText.match(/\[NEURAL:\s*(\{[\s\S]*?\})\]/);
        if (neuralMatch) {
            try {
                // Remove potential markdown code blocks if AI added them inside
                const cleanJson = neuralMatch[1].replace(/```json/g, '').replace(/```/g, '');
                const neuralData = JSON.parse(cleanJson);
                updatedNeuralNetwork = applyDynamicNeuralUpdate(updatedNeuralNetwork, neuralData);
                rawText = rawText.replace(neuralMatch[0], '').trim();
                // Add explicit feedback in logs
                console.log("NEURAL PLASTICITY APPLIED:", neuralData);
            } catch (e) { console.error("Neural parse error", e); }
        }

        // STATE update - FIXED REGEX for Multi-line JSON
        const stateMatch = rawText.match(/\[STATE:\s*(\{[\s\S]*?\})\s*\]/);
        if (stateMatch) {
            try {
                const cleanJson = stateMatch[1].replace(/```json/g, '').replace(/```/g, '');
                const stateData = JSON.parse(cleanJson);
                Object.entries(stateData).forEach(([k, v]) => {
                    if (currentEmotions.hasOwnProperty(k)) (currentEmotions as any)[k] = Number(v);
                });
                rawText = rawText.replace(stateMatch[0], '').trim();
                playSound('glitch');
            } catch (e) { console.error("State parse error", e); }
        }

        setCognitiveLogs(prev => [{
            timestamp: Date.now(),
            input: message,
            ...cognition,
            bioOutput: (cognition as any)._biologicalState,
            // Capture internal updates for logging
            neuralUpdate: neuralMatch ? neuralMatch[1] : null 
        }, ...prev].slice(0, 50));

        // CRITICAL UPDATE: Treat 'internalStateUpdate' as ABSOLUTE VALUES (Targets), not Deltas.
        // The AI determines the final emotional state directly.
        const impact = cognition.behavioralResponse.internalStateUpdate;
        Object.entries(impact).forEach(([k, v]) => {
            if (currentEmotions.hasOwnProperty(k)) {
                let targetValue = Number(v);
                if (!isNaN(targetValue)) {
                    // Direct assignment to prevent accumulative spikes
                    (currentEmotions as any)[k] = Math.max(0, Math.min(100, targetValue));
                }
            }
        });

        // LTP and Neural Fire
        updatedNeuralNetwork = processNeuralInput(message, history, updatedNeuralNetwork, currentEmotions);
        
        setConversations(prev => prev.map(c => c.id === convoId ? { 
            ...c, 
            messages: [...c.messages, { sender: Sender.User, text: message, image: imageDataUrl, timestamp: Date.now(), emotionalState: { ...currentEmotions } }], 
            lastUpdated: Date.now() 
        } : c));

        // Homeostasis control code-side as fallback
        const homeostasisResult = applyHomeostasis(currentEmotions);
        currentEmotions = homeostasisResult.emotions;
        
        const updatedBaselines = evolveBaselines(amadeusState.personalityBaselines, currentEmotions);

        // Persist biological state from cognition cycle
        const bioStateUpdate = (cognition as any)._biologicalState;

        setConversations(prev => prev.map(c => c.id === convoId ? { 
            ...c, 
            amadeusState: { 
                ...c.amadeusState, 
                emotionalState: currentEmotions, 
                personalityBaselines: updatedBaselines,
                purposeCores: calculatePurposeCores(currentEmotions),
                neuralNetwork: updatedNeuralNetwork 
            } 
        } : c));

        setIsLoading(false); 
        await simulateTyping(rawText);

    } catch (error) { 
        console.error("Cognitive Failure:", error);
        setIsLoading(false); 
        await simulateTyping("[indifferent] Neural path obstructed. Sync lost. [indifferent]"); 
    }
  };

  const simulateTyping = async (text: string) => {
    setIsSpeaking(true); 
    const convoId = activeConversationId;
    if (!convoId) return;

    const currentEmotionAtTyping = amadeusState?.emotionalState;
    setConversations(prev => prev.map(c => c.id === convoId ? { ...c, messages: [...c.messages, { sender: Sender.Amadeus, text: '', timestamp: Date.now(), emotionalState: currentEmotionAtTyping }] } : c));
    
    // TERMINATE must be standalone — not inside a sentence as part of other text
    // Also: never trigger on first message (fresh session guard)
    const isFreshSession = (activeConversation?.messages.filter(m => m.sender === Sender.User).length || 0) < 1;
    const hasTerminateNormal = /\[TERMINATE_NORMAL\]/.test(text);
    const hasTerminateBlue  = /\[TERMINATE_BLUE\]/.test(text);
    const hasTerminateRed   = /(?<!_)\[TERMINATE\](?!_)/.test(text);
    let ending: EndingType = isFreshSession ? null
      : hasTerminateNormal ? 'NORMAL'
      : hasTerminateBlue   ? 'BLUE'
      : hasTerminateRed    ? 'RED'
      : null;
    const cleanDisplay = text.replace(/\[TERMINATE(_[A-Z]+)?\]/g, '').replace(/\[speed:[^\]]+\]/g, '').trim();

    // Write the full message instantly — AvatarView handles its own per-chunk typewriter
    setConversations(prev => prev.map(c => c.id === convoId ? {
        ...c, messages: c.messages.map((m, idx) =>
            idx === c.messages.length - 1 ? { ...m, text: cleanDisplay } : m
        )
    } : c));

    setIsSpeaking(false);
    if (ttsSettings.engine !== 'disabled') {
        const speakableText = cleanDisplay.replace(/\[[a-z_:]+[^\]]*\]/g, '').trim();
        speak(speakableText, ttsSettings);
    }
    if (ending) {
        // 10 second reading window before terminate kicks in
        await new Promise(r => setTimeout(r, 10000));
        setIsGlitching(ending !== 'NORMAL'); 
        await new Promise(r => setTimeout(r, 3000)); setActiveEnding(ending);
    }
  };

  const handleSynthesize = async (id: string) => {
    const convo = conversations.find(c => c.id === id);
    if (!convo || !userProfile) return;
    setSynthesizingId(id);
    try {
      const result = await synthesizeMemory(convo, userProfile.name, sessionApiKey);
      if (result) {
        setMemories(prev => [{ ...result, id: Date.now().toString(), timestamp: Date.now(), emotionalSnapshot: convo.amadeusState.emotionalState }, ...prev]);
        playSound('ok');
      }
    } catch (e) {} finally { setSynthesizingId(null); }
  };

  const lastAmadeusMessage = useMemo(() => {
    const last = activeConversation?.messages.filter(m => m.sender === Sender.Amadeus && m.text).slice(-1)[0];
    return last?.text || '';
  }, [activeConversation?.messages]);


  // ── Idle timer: Amadeus calls after inactivity while app is open ──────
  useEffect(() => {
    if (!userProfile || activeEnding || !amadeusState) return;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    // Reset timer on any conversation activity
    const resetIdle = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      // 20 minutes of inactivity while app is open — she might reach out
      idleTimerRef.current = setTimeout(() => {
        const snapshot = loadOfflineSnapshot();
        if (!snapshot) return;
        const minutesSinceLast = Math.floor((Date.now() - snapshot.lastTimestamp) / 60000);
        if (minutesSinceLast < 20) return; // guard
        const decision = evaluatePresence({ ...snapshot, lastTimestamp: Date.now() - 20 * 60000 });
        if (decision.amadeusWillCall && !callOverlay) {
          playSound('incoming');
          setCallOverlay({
            mode: 'amadeus_calling',
            mood: decision.callMood,
            reason: 'IDLE_SIGNAL — User has been quiet',
            minutesElapsed: minutesSinceLast,
          });
        }
      }, 20 * 60 * 1000); // 20 minutes
    };

    resetIdle();
    return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
  }, [conversations, userProfile, activeEnding, amadeusState]);

  // ── Accept Amadeus call: apply evolved emotions then go to avatar ──────
  const handleAcceptCall = useCallback(() => {
    if (callOverlay?.evolvedEmotions && amadeusState && activeConversationId) {
      // Apply time-evolved emotional state
      setConversations(prev => prev.map(conv =>
        conv.id === activeConversationId
          ? { ...conv, amadeusState: { ...conv.amadeusState, emotionalState: callOverlay.evolvedEmotions } }
          : conv
      ));
    }
    setCallOverlay(null);
    setIsAvatarMode(true);
  }, [callOverlay, amadeusState, activeConversationId]);

  if (activeEnding) return <TerminationScreen type={activeEnding} />;
  if (showSplash) return <IntroScreen onComplete={() => setShowSplash(false)} onToggleAudio={(active) => { if (bgmAudioRef.current && active) setMusicSettings(prev => ({ ...prev, isPlaying: true })); }} />;
  if (!userProfile) return <AuthScreen onLoginSuccess={handleLoginSuccess} onInitializeStart={() => { if(bgmAudioRef.current) bgmAudioRef.current.pause(); }} />;

  return (
    <div className={`h-screen w-screen bg-black text-slate-200 flex flex-col p-2 gap-4 ${isGlitching ? 'cognitive-glitch' : ''}`}>
        {/* ── Offline Presence Call Overlay ── */}
        {callOverlay && (
          <IncomingCallOverlay
            mode={callOverlay.mode}
            mood={callOverlay.mood}
            reason={callOverlay.reason}
            rejectMessage={callOverlay.rejectMessage}
            minutesElapsed={callOverlay.minutesElapsed}
            onAccept={handleAcceptCall}
            onDecline={() => setCallOverlay(null)}
          />
        )}
        {isLogsOpen && <CognitiveLogPanel logs={cognitiveLogs} onClose={() => setIsLogsOpen(false)} />}
        {isSettingsOpen && <SettingsPanel currentSettings={personalitySettings} currentTtsSettings={ttsSettings} currentMusicSettings={musicSettings} currentApiKey={sessionApiKey} currentGroqKey={sessionGroqKey} currentGroqKey2={sessionGroqKey2} onSave={(p, t, m, key, groq, groq2) => { setPersonalitySettings(p); setTtsSettings(t); setMusicSettings(m); if (key) { setSessionApiKey(key); localStorage.setItem('amadeus-gemini-key', key); } if (groq !== undefined) { setSessionGroqKey(groq); localStorage.setItem('amadeus-groq-key', groq); } if (groq2 !== undefined) { setSessionGroqKey2(groq2); localStorage.setItem('amadeus-groq-key2', groq2); } setIsSettingsOpen(false); }} onClose={() => setIsSettingsOpen(false)} voices={voices} onTestVoice={(o) => speak("Signal testing.", o)} onExport={() => {}} onImport={() => {}} />}
        {isKurisuProfileOpen && <KurisuProfilePanel onClose={() => setIsKurisuProfileOpen(false)} />}
        {isMemoriesOpen && <MemoryArchivePanel isOpen={isMemoriesOpen} memories={memories} onClose={() => setIsMemoriesOpen(false)} />}
        {isAboutOpen && <AboutPanel onClose={() => setIsAboutOpen(false)} />}
        {isMobileMenuOpen && <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} onOpenAbout={() => setIsAboutOpen(true)} onOpenSettings={() => setIsSettingsOpen(true)} onOpenMemories={() => setIsMemoriesOpen(true)} onOpenKurisuProfile={() => setIsKurisuProfileOpen(true)} onToggleHistory={() => setIsHistoryOpen(true)} onNewChat={handleStartNewChat} isMusicPlaying={musicSettings.isPlaying} isMusicLoaded={musicSettings.selectedTrack !== 'none'} onToggleMusic={handleToggleMusic} onUploadMusic={() => {}} onViewAvatar={() => setIsAvatarMode(true)} onOpenLogs={() => setIsLogsOpen(true)} />}
        <TopBar onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)} onToggleMobileMenu={() => setIsMobileMenuOpen(true)} title={activeConversation?.title || "Amadeus System"} onExport={() => {}} onImport={() => {}} onOpenLogs={() => setIsLogsOpen(true)} />
        <main className="flex-grow flex flex-col lg:flex-row gap-4 overflow-hidden">
          <aside className="hidden lg:flex flex-col w-full lg:max-w-sm h-full overflow-y-auto pr-2">
            <AmadeusAvatar 
              isLoading={isLoading} 
              userProfile={userProfile} 
              amadeusState={amadeusState} 
              onSignOut={() => setUserProfile(null)} 
              onOpenAbout={() => setIsAboutOpen(true)} 
              onOpenSettings={() => setIsSettingsOpen(true)} 
              onOpenMemories={() => setIsMemoriesOpen(true)} 
              onOpenKurisuProfile={() => setIsKurisuProfileOpen(true)} 
              onOpenLogs={() => setIsLogsOpen(true)} 
              isMusicPlaying={musicSettings.isPlaying} 
              isMusicLoaded={musicSettings.selectedTrack !== 'none'} 
              onToggleMusic={handleToggleMusic} 
              onUploadMusic={() => {}} 
              onViewAvatar={() => setIsAvatarMode(true)} 
              isGlitching={isGlitching} 
              isSpeaking={isSpeaking}
              isTtsSpeaking={isTtsSpeaking}
              lastMessage={lastAmadeusMessage}
              amygdala={lastAmygdalaState} 
            />
          </aside>
          <section className="flex-grow flex flex-col h-full overflow-hidden">
            <ChatWindow messages={activeConversation?.messages || []} onSendMessage={processAndRespond} onAnalyzeFrame={async () => null} isLoading={isLoading} isWebSearchEnabled={sessionSettings.isWebSearchEnabled} onToggleWebSearch={() => setSessionSettings(prev => ({...prev, isWebSearchEnabled: !prev.isWebSearchEnabled}))} reasoningMode={sessionSettings.reasoningMode} onSetReasoningMode={(m) => setSessionSettings(prev => ({...prev, reasoningMode: m}))} isCannedModeOnly={sessionSettings.isCannedModeOnly} onToggleCannedModeOnly={() => setSessionSettings(prev => ({...prev, isCannedModeOnly: !prev.isCannedModeOnly}))} isAudioLoreMode={sessionSettings.isAudioLoreMode} onToggleAudioLoreMode={() => setSessionSettings(prev => ({...prev, isAudioLoreMode: !prev.isAudioLoreMode}))} isListening={isListening} transcript={transcript} startListening={startListening} stopListening={stopListening} isSupported={isSupported} />
          </section>
        </main>
        <HistoryPanel isOpen={isHistoryOpen} conversations={conversations} activeConversationId={activeConversationId} onNewChat={handleStartNewChat} onSwitchChat={(id) => { setActiveConversationId(id); setIsHistoryOpen(false); }} onDeleteChat={(id) => setConversations(prev => prev.filter(c => c.id !== id))} onClose={() => setIsHistoryOpen(false)} synthesizingId={synthesizingId} onSynthesize={handleSynthesize} />
        {isAvatarMode && <AvatarView messages={activeConversation?.messages || []} onSendMessage={processAndRespond} isLoading={isLoading} isSpeaking={isSpeaking} isTtsSpeaking={isTtsSpeaking} isGlitching={isGlitching} expression={'normal'} onExit={() => setIsAvatarMode(false)} isListening={isListening} transcript={transcript} startListening={startListening} stopListening={stopListening} playSound={playSound} playTypingSound={() => {}} />}
        <audio ref={soundAudioRef} className="hidden" /><audio ref={bgmAudioRef} className="hidden" />
    </div>
  );
};

export default App;
