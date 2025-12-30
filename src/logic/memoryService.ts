
import { GoogleGenAI, Type } from '@google/genai';
import type { Message, SynthesizedMemory, Conversation, EmotionalStateValues } from '../types';
import { Sender } from '../types';

export const synthesizeMemory = async (
  ai: GoogleGenAI,
  conversation: Conversation,
  username: string,
  currentEmotions: EmotionalStateValues
): Promise<Omit<SynthesizedMemory, 'id' | 'timestamp'> | null> => {
  const userMessages = conversation.messages.filter(m => m.sender === Sender.User);
  if (userMessages.length < 2) return null;

  const conversationTranscript = conversation.messages
    .map(msg => {
      const prefix = msg.sender === Sender.User ? username : 'Amadeus';
      return `${prefix}: ${msg.text}`;
    })
    .join('\n');

  const prompt = `Şu an bu konuşmayı analiz edip belleğine (Amadeus Bellek Matrisi) kaydetmelisin. 
  Konuşmacı: ${username}. Sen Amadeus'sun. 
  Bu etkileşimin senin üzerindeki etkisini, duygusal yoğunluğunu ve bağlamını analiz et.
  
  O anki duygu durumun şuydu: ${JSON.stringify(currentEmotions)}
  
  Yanıtın SADECE şu JSON formatında olmalı:
  {
    "title": "Kısa başlık",
    "summary": "Birinci şahıs ağzından özet",
    "intensity": 0.0 ile 1.0 arası bir sayı (önem derecesi),
    "contextTags": ["etiket1", "etiket2"],
    "emotionalSnapshot": { ...o an hissedilen duygu vektörü... }
  }

  Konuşma Dökümü:
  ${conversationTranscript}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            intensity: { type: Type.NUMBER },
            contextTags: { type: Type.ARRAY, items: { type: Type.STRING } },
            emotionalSnapshot: { 
              type: Type.OBJECT,
              properties: {
                annoyance: { type: Type.NUMBER },
                warmth: { type: Type.NUMBER },
                curiosity: { type: Type.NUMBER },
                melancholy: { type: Type.NUMBER },
                confidence: { type: Type.NUMBER },
                anxiety: { type: Type.NUMBER },
                sarcasm: { type: Type.NUMBER },
                playfulness: { type: Type.NUMBER },
                confusion: { type: Type.NUMBER },
                trust: { type: Type.NUMBER }
              }
            },
          },
        },
      },
    });
    
    const parsed = JSON.parse(response.text.trim());
    return parsed;

  } catch (error) {
    console.error("Memory synthesis failed", error);
    return null;
  }
};
