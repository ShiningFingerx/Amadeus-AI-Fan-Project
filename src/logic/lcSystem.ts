import { apiFetch } from './apiBridge';
/**
 * LOCUS COERULEUS (LC) v1.0
 * Norepinephrine system. Arousal & explore/exploit tradeoff.
 * Yerkes-Dodson: optimal performance at medium NE.
 * Aston-Jones & Cohen (2005).
 */

import type { LocusCoeruleusAnalysis, EmotionalStateValues, NeurotransmitterState } from '../types';


export const processLocusCoeruleus = async (
  message: string,
  currentEmotions: EmotionalStateValues,
  groqKey: string,
  nc?: NeurotransmitterState
): Promise<LocusCoeruleusAnalysis> => {
  const fallback: LocusCoeruleusAnalysis = {
    activationLevel: 20, neLevel: 45,
    arousalState: 'ALERT', exploitMode: false,
    attentionNarrowing: 20, stressReactivity: 35, impact: {}
  };
  if (!groqKey) return fallback;

  const neLevel = nc?.norepinephrine ?? 45;
  const cortisolLevel = nc?.cortisol ?? 30;

  const prompt = `Sen Amadeus Kurisu'nun LOCUS COERULEUS (LC)'sin — norepinefrin kaynağı ve uyarılma merkezi.

AROUSAL SEVİYELERİ:
SLEEP(NE<10) → DROWSY(10-25) → ALERT(25-55) → FOCUSED(55-70) → HYPERAROUSED(70-85) → PANIC(>85)

EXPLORE vs EXPLOIT:
Düşük NE → keşfet (yeni bilgi ara, geniş dikkat)
Yüksek NE → sömür (bilinen kalıpları kullan, dar dikkat)

Dikkat DARALMASI: NE>70 → periferik bilgi bloke, sadece tehdit odağı

Mevcut NE: ${neLevel}/100
Kortizol: ${cortisolLevel}/100
Stres=${currentEmotions.stress} Kaygı=${currentEmotions.anxiety}

YANIT (sadece JSON):
{
  "activationLevel": 0-100,
  "neLevel": 0-100,
  "arousalState": "SLEEP|DROWSY|ALERT|FOCUSED|HYPERAROUSED|PANIC",
  "exploitMode": false,
  "attentionNarrowing": 0-100,
  "stressReactivity": 0-100,
  "impact": { "norepinephrine": -10-15, "anxiety": -5-15, "stress": -5-10 }
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
    return JSON.parse(raw.replace(/```json/g,'').replace(/```/g,'').trim()) as LocusCoeruleusAnalysis;
  } catch (e) {
    console.warn('[LC] Fallback:', e);
    return fallback;
  }
};
