
import { useState, useCallback, useEffect, useRef } from 'react';
import type { TtsSettings } from '../types';

export const useTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const populateVoiceList = () => {
      if (!window.speechSynthesis) return;
      const allVoices = window.speechSynthesis.getVoices();
      if (allVoices.length > 0) setVoices(allVoices);
    };

    populateVoiceList();
    if (window.speechSynthesis?.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = populateVoiceList;
    }

    audioRef.current = new Audio();
    audioRef.current.onended = () => setIsSpeaking(false);
    audioRef.current.onerror = (e) => {
        console.error("Audio playback error:", e);
        setIsSpeaking(false);
    };

    return () => {
        if(audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
        }
    }
  }, []);

  // Sadece ses dosyasını çekip hazırlayan fonksiyon
  const prefetchGptSovits = async (text: string, settings: TtsSettings): Promise<string | null> => {
    const endpoint = settings.gptSovitsEndpoint || 'http://127.0.0.1:9880';
    const cleanText = text.replace(/\*\*|「|」|\*/g, '').trim();
    const url = `${endpoint}/?text=${encodeURIComponent(cleanText)}&text_language=tr`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`GPT-SoVITS error: ${response.status}`);
      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error("Failed to prefetch GPT-SoVITS:", error);
      return null;
    }
  };

  const cancel = useCallback(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(async (text: string, settings: TtsSettings, preloadedUrl?: string) => {
      cancel();
      
      if (settings.engine === 'gpt-sovits') {
          if (!audioRef.current) return;
          setIsSpeaking(true);
          const url = preloadedUrl || await prefetchGptSovits(text, settings);
          if (url) {
              audioRef.current.src = url;
              audioRef.current.play();
          } else {
              setIsSpeaking(false);
          }
      } else if (settings.engine === 'browser') {
          if (!text || !window.speechSynthesis) return;
          const cleanText = text.replace(/\*\*|「|」|\*/g, '');
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = 'tr-TR';
          const turkishVoices = voices.filter(v => v.lang === 'tr-TR');
          let selectedVoice = settings.browserVoiceURI ? voices.find(v => v.voiceURI === settings.browserVoiceURI) : null;
          if (!selectedVoice && turkishVoices.length > 0) selectedVoice = turkishVoices[0];
          if (selectedVoice) utterance.voice = selectedVoice;
          utterance.pitch = settings.browserPitch;
          utterance.rate = settings.browserRate;
          utterance.onstart = () => setIsSpeaking(true);
          utterance.onend = () => setIsSpeaking(false);
          window.speechSynthesis.speak(utterance);
      } else if (settings.engine === 'elevenlabs') {
          if (!text || !audioRef.current || !settings.elevenLabsApiKey) return;
          setIsSpeaking(true);
          try {
              const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${settings.elevenLabsVoiceId}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'xi-api-key': settings.elevenLabsApiKey },
                  body: JSON.stringify({ text, model_id: "eleven_multilingual_v2", voice_settings: { stability: settings.elevenLabsStability, similarity_boost: settings.elevenLabsClarity } }),
              });
              const audioBlob = await response.blob();
              audioRef.current.src = URL.createObjectURL(audioBlob);
              audioRef.current.play();
          } catch (e) { setIsSpeaking(false); }
      }
  }, [voices, cancel]);

  return { isSpeaking, speak, cancel, voices, prefetchGptSovits };
};
