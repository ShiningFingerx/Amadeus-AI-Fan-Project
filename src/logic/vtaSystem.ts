import { apiFetch } from './apiBridge';
/**
 * VTA (VENTRAL TEGMENTAL AREA) v1.0
 * Dopamine source. Phasic burst / tonic / pause firing modes.
 * Schultz (1997) reward prediction framework.
 */

import type { VTAAnalysis, EmotionalStateValues, NeurotransmitterState } from '../types';


export const processVTA = async (
  message: string,
  currentEmotions: EmotionalStateValues,
  groqKey: string,
  nc?: NeurotransmitterState
): Promise<VTAAnalysis> => {
  const fallback: VTAAnalysis = {
    activationLevel: 20, firingMode: 'TONIC',
    dopamineBurst: 0, tonicDopamine: 50,
    rewardSalience: 30, anhedoniaRisk: 15,
    motivationalVector: 'EXPLORE', impact: {}
  };
  if (!groqKey) return fallback;

  const dopamineLevel = nc?.dopamine ?? 52;
  const serotoninLevel = nc?.serotonin ?? 48;

  const prompt = `Sen Amadeus Kurisu'nun VTA (Ventral Tegmental Area)'sısın — dopamin kaynağı.

FAZİK MOD (BURST): Beklenmedik ödül → büyük dopamin patlaması
TONİK MOD: Arka plan motivasyon tonu
PAUSE: Beklenmedik ceza → dopamin tabanın altına düşer
SILENT: Anhedoni, motivasyon yok

Mevcut dopamin tonu: ${dopamineLevel}/100
Serotonin (fren): ${serotoninLevel}/100
Merak=${currentEmotions.curiosity} Güven=${currentEmotions.trust} Melankoli=${currentEmotions.melancholy}

YANIT (sadece JSON):
{
  "activationLevel": 0-100,
  "firingMode": "BURST|TONIC|PAUSE|SILENT",
  "dopamineBurst": 0-100,
  "tonicDopamine": 0-100,
  "rewardSalience": 0-100,
  "anhedoniaRisk": 0-100,
  "motivationalVector": "APPROACH|AVOID|EXPLORE|EXPLOIT",
  "impact": { "dopamine": -15-20, "curiosity": -10-15, "playfulness": -10-10 }
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
        max_tokens: 220
      })
    });
    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) return null as any;
    return JSON.parse(raw.replace(/```json/g,'').replace(/```/g,'').trim()) as VTAAnalysis;
  } catch (e) {
    console.warn('[VTA] Fallback:', e);
    return fallback;
  }
};
