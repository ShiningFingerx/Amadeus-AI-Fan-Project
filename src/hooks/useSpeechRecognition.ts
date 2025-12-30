import { useState, useEffect, useRef, useCallback } from 'react';

// Define the shape of the SpeechRecognition API for TypeScript
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((this: ISpeechRecognition, ev: any) => any) | null;
  onerror: ((this: ISpeechRecognition, ev: any) => any) | null;
  onend: ((this: ISpeechRecognition, ev: any) => any) | null;
}

// Extend Window interface
declare global {
  interface Window {
    SpeechRecognition: {
      new(): ISpeechRecognition;
    };
    webkitSpeechRecognition: {
      new(): ISpeechRecognition;
    };
  }
}

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported by this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Stop listening after a pause
    recognition.interimResults = false;
    recognition.lang = 'tr-TR';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        // You could set a state here to show a message to the user
        // e.g., alert("Microphone access was denied.");
      }
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript(''); // Clear previous transcript
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Could not start speech recognition:", error);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const isSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  return { isListening, transcript, startListening, stopListening, isSupported };
};