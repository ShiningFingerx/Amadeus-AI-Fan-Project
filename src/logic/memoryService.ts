/**
 * AMADEUS MEMORY SYNTHESIS ENGINE v2.1
 * ======================================
 * Konuşmaları Kurisu'nun birinci şahıs episodik anılarına dönüştürür.
 * Model: gemini-flash-latest
 */

import { apiFetch } from './apiBridge';
import { Type } from '@google/genai';
import type { SynthesizedMemory, Conversation, NeuralNetworkState } from '../types';
import { Sender } from '../types';

export const synthesizeMemory = async (
  conversation: Conversation,
  username: string,
  apiKey: string,
  neuralState?: NeuralNetworkState
): Promise<Omit<SynthesizedMemory, 'id' | 'timestamp'> | null> => {

  if (!apiKey?.trim()) {
    console.error('Memory Synthesis: No API key.');
    return null;
  }

  const recentMessages = conversation.messages.slice(-18);
  if (recentMessages.length === 0 ||
      recentMessages.filter(m => m.sender === Sender.User).length === 0) {
    return null;
  }

  const transcript = recentMessages
    .map((msg, i) => `${i + 1}. ${msg.sender === Sender.User ? username : 'Amadeus'}: ${msg.text}`)
    .join('\n');

  let neuralContext = '';
  if (neuralState) {
    const consolidated = Object.values(neuralState.nodes)
      .filter(n => n.consolidationLevel >= 2).map(n => n.label).join(', ');
    const d = neuralState.personalityDrift;
    neuralContext = `\nNÖRAL BAĞLAM: Kalıcı izler: ${consolidated || 'Yok'} | Güven: ${d.trustBuilt.toFixed(0)} | Kalkan: ${d.guardedness.toFixed(0)}`;
  }

  const systemInstruction = `SEN MAKİSE KURİSU'sun — birinci şahıs perspektifinden konuşmayı sentezle.
Tsundere kişilik, bilimsel bakış, duygusal derinlik. Strict JSON yanıt.${neuralContext}`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      title:      { type: Type.STRING },
      summary:    { type: Type.STRING },
      intensity:  { type: Type.NUMBER },
      contextTags:{ type: Type.ARRAY, items: { type: Type.STRING } },
      peakMoments:{ type: Type.ARRAY, items: { type: Type.OBJECT, properties: {
        messageIndex: { type: Type.NUMBER },
        emotion:      { type: Type.STRING },
        description:  { type: Type.STRING }
      }}},
      extractedNodes: { type: Type.ARRAY, items: { type: Type.STRING } },
      emotionalSnapshot: { type: Type.OBJECT, properties: {
        warmth:    { type: Type.NUMBER },
        annoyance: { type: Type.NUMBER },
        curiosity: { type: Type.NUMBER },
        trust:     { type: Type.NUMBER }
      }}
    },
    required: ['title', 'summary', 'intensity', 'contextTags', 'extractedNodes']
  };

  try {
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const geminiResp = await apiFetch(geminiEndpoint, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: 'user', parts: [{ text: 'Konuşma:\n' + transcript }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.45,
          maxOutputTokens: 1000,
        }
      })
    });

    if (!geminiResp.ok) {
      const errBody = await geminiResp.text();
      throw new Error(`Gemini ${geminiResp.status}: ${errBody.slice(0,200)}`);
    }
    const geminiData = await geminiResp.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response');
    const result = JSON.parse(text.trim());
    if (result.intensity !== undefined)
      result.intensity = Math.max(0, Math.min(100, Number(result.intensity)));
    return result;
  } catch (err) {
    console.error('Memory Synthesis Error:', err);
    return null;
  }
};
