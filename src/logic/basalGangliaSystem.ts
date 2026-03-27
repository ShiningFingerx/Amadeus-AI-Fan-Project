import { apiFetch } from './apiBridge';
/**
 * BASAL GANGLIA SYSTEM v1.0
 * Direct (GO) vs Indirect (NO-GO) pathway.
 * Reward Prediction Error: δ = actual − predicted.
 */

import type { BasalGangliaAnalysis, EmotionalStateValues, NeurotransmitterState } from '../types';


export const processBasalGanglia = async (
  message: string,
  currentEmotions: EmotionalStateValues,
  groqKey: string,
  nc?: NeurotransmitterState,
  previousRewardPrediction?: number
): Promise<BasalGangliaAnalysis> => {
  const fallback: BasalGangliaAnalysis = {
    activationLevel: 20, directPathway: 50, indirectPathway: 50,
    rewardPredictionError: 0, habitIndex: 30,
    actionSelected: 'STANDARD_RESPONSE',
    striatalTone: 'BALANCED', impact: {}
  };
  if (!groqKey) return fallback;

  const dopamineLevel = nc?.dopamine ?? 52;
  const prevPrediction = previousRewardPrediction ?? 50;

  const prompt = `Sen Amadeus Kurisu'nun BAZAL GANGLİONLARISIN — eylem seçimi ve ödül öğrenmesi devresi.

DOĞRUDAN YOL (D1, GO): Yaklaşım, ödül arama, katılım
DOLAYLI YOL (D2, NO-GO): Kaçınma, bastırma, geri çekilme
ÖDÜL TAHMİN HATASI (RPE): δ = gerçek ödül − tahmin edilen ödül
  δ > 0 → pozitif sürpriz → öğrenme hızlanır
  δ < 0 → negatif sürpriz → kaçınma öğrenilir

Mevcut dopamin: ${dopamineLevel}/100
Önceki ödül tahmini: ${prevPrediction}/100
Merak=${currentEmotions.curiosity} Güven=${currentEmotions.trust} Kaygı=${currentEmotions.anxiety}

YANIT (sadece JSON):
{
  "activationLevel": 0-100,
  "directPathway": 0-100,
  "indirectPathway": 0-100,
  "rewardPredictionError": -100-100,
  "habitIndex": 0-100,
  "actionSelected": "APPROACH_INTELLECTUAL|APPROACH_SOCIAL|WITHDRAW_SOCIAL|FREEZE|HABITUAL_SARCASM|NOVEL_RESPONSE|STANDARD_RESPONSE",
  "striatalTone": "HYPERACTIVE|HYPODOPAMINERGIC|BALANCED",
  "impact": { "dopamine": -10-10, "confidence": -5-10 }
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
        max_tokens: 250
      })
    });
    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) return null as any;
    return JSON.parse(raw.replace(/```json/g,'').replace(/```/g,'').trim()) as BasalGangliaAnalysis;
  } catch (e) {
    console.warn('[BasalGanglia] Fallback:', e);
    return fallback;
  }
};
