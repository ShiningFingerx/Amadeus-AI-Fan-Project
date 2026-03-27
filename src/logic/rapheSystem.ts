import { apiFetch } from './apiBridge';
/**
 * RAPHE NUCLEI v1.0
 * Serotonin system. Mood floor, impulse control, social pain sensitivity.
 * Low 5-HT: irritability, rumination, rejection hypersensitivity.
 */

import type { RapheNucleiAnalysis, EmotionalStateValues, NeurotransmitterState } from '../types';


export const processRapheNuclei = async (
  message: string,
  currentEmotions: EmotionalStateValues,
  groqKey: string,
  nc?: NeurotransmitterState
): Promise<RapheNucleiAnalysis> => {
  const fallback: RapheNucleiAnalysis = {
    activationLevel: 20, serotoninTone: 48,
    moodFloor: 40, impulseThreshold: 55,
    ruminationRisk: 25, socialPainSensitivity: 35, impact: {}
  };
  if (!groqKey) return fallback;

  const serotoninLevel = nc?.serotonin ?? 48;
  const oxytocinLevel = nc?.oxytocin ?? 25;

  const prompt = `Sen Amadeus Kurisu'nun RAPHE NÜKLEİ'sin — serotonin sistemi.

SEROTONIN'İN ROLLERİ:
- Duygu tabanı (mood floor): düşük serotonin → minimum ruh hali düşer
- Dürtü freni: düşük → impulsif tepkiler, tsundere patlamaları artar
- Sosyal ağrı: düşük → reddedilme daha acı verir
- Ruminasyon: düşük → olumsuz düşünceler döngüye girer

Mevcut serotonin: ${serotoninLevel}/100
Oksitosin: ${oxytocinLevel}/100
Annoyance=${currentEmotions.annoyance} Melankoli=${currentEmotions.melancholy}

YANIT (sadece JSON):
{
  "activationLevel": 0-100,
  "serotoninTone": 0-100,
  "moodFloor": 0-100,
  "impulseThreshold": 0-100,
  "ruminationRisk": 0-100,
  "socialPainSensitivity": 0-100,
  "impact": { "serotonin": -10-10, "annoyance": -10-10, "melancholy": -10-10 }
}`;

  try {
    const resp = await apiFetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai/gpt-oss-safeguard-20b',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Girdi: "${message}"` }
        ],
        temperature: 0.10,
        max_tokens: 200
      })
    });
    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) return null as any;
    return JSON.parse(raw.replace(/```json/g,'').replace(/```/g,'').trim()) as RapheNucleiAnalysis;
  } catch (e) {
    console.warn('[Raphe] Fallback:', e);
    return fallback;
  }
};
