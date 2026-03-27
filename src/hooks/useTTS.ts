import { useState, useCallback, useEffect, useRef } from 'react';
import type { TtsSettings } from '../types';

interface UseTTSReturn {
  speak: (text: string, settings: TtsSettings) => void;
  cancel: () => void;
  voices: SpeechSynthesisVoice[];
  isSpeaking: boolean;
}

export const useTTS = (): UseTTSReturn => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, []);

  const cancel = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback((text: string, settings: TtsSettings) => {
    if (!text || settings.engine === 'disabled') return;
    cancel();

    if (settings.engine === 'browser') {
      const utterance = new SpeechSynthesisUtterance(text);
      if (settings.browserVoiceURI) {
        const voice = voices.find(v => v.voiceURI === settings.browserVoiceURI);
        if (voice) utterance.voice = voice;
      }
      utterance.pitch = settings.browserPitch ?? 1.2;
      utterance.rate = settings.browserRate ?? 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }, [voices, cancel]);

  return { speak, cancel, voices, isSpeaking };
};
