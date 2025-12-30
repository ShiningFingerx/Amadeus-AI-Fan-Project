
import { GoogleGenAI, Type } from '@google/genai';
import type { Message, SynthesizedMemory, Conversation, EmotionalStateValues } from '../types';
import { Sender } from '../types';

export const synthesizeMemory = async (
  ai: GoogleGenAI,
  conversation: Conversation,
  username: string,
  currentEmotions: EmotionalStateValues
): Promise<Omit<SynthesizedMemory, 'id' | 'timestamp'> | null> => {
  // Sentezleme için en az 1 kullanıcı mesajı olmalı
  const userMessages = conversation.messages.filter(m => m.sender === Sender.User);
  if (userMessages.length === 0) return null;

  const conversationTranscript = conversation.messages
    .map(msg => {
      const prefix = msg.sender === Sender.User ? username : 'Amadeus';
      return `${prefix}: ${msg.text}`;
    })
    .join('\n');

  const prompt = `Lütfen şu konuşmayı analiz et ve Amadeus (Makise Kurisu) Bellek Arşivi için bir özet oluştur. 
  Kullanıcı: ${username}. Sen Amadeus sistemisin. 
  Bu konuşma senin için ne ifade ediyor? Hangi rasyonel veya duygusal çıkarımları yaptın?
  
  Mevcut Duygu Durumun: ${JSON.stringify(currentEmotions)}
  
  Yanıtın SADECE aşağıda tanımlanan şemaya uygun JSON formatında olmalıdır. Başka hiçbir metin ekleme.
  
  Konuşma İçeriği:
  ${conversationTranscript}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
        topP: 0.9,
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "summary", "intensity", "contextTags", "emotionalSnapshot"],
          properties: {
            title: { type: Type.STRING, description: "Belleğin kısa, bilimsel veya edebi başlığı." },
            summary: { type: Type.STRING, description: "Konuşmanın özeti (Amadeus'un bakış açısıyla, 1. şahıs)." },
            intensity: { type: Type.NUMBER, description: "Belleğin duygusal/mantıksal ağırlığı (0.0 - 1.0)." },
            contextTags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Anahtar kelimeler." },
            emotionalSnapshot: { 
              type: Type.OBJECT,
              description: "Bellek oluştuğunda sistemin yeni duygusal dengesi.",
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
    
    if (!response.text) return null;
    const cleanJson = response.text.trim();
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("Critical Failure in Neural Synthesis:", error);
    return null;
  }
};
