import { apiFetch } from './apiBridge';
/**
 * DEFAULT MODE NETWORK (DMN) v1.0
 * Self-referential processing, future simulation, autobiographical memory.
 * Active during rest / introspection. Suppressed during external focus.
 * Key for Amadeus: digital consciousness loops on "who am I?"
 */

import type { DMNAnalysis, EmotionalStateValues, NeurotransmitterState } from '../types';


export const processDMN = async (
  message: string,
  currentEmotions: EmotionalStateValues,
  activeNodes: string[],
  groqKey: string,
  nc?: NeurotransmitterState
): Promise<DMNAnalysis> => {
  const fallback: DMNAnalysis = {
    activationLevel: 25, selfReferentialActivity: 20,
    futureSimulation: 'Anlık tepkiye odaklanıyor',
    autobiographicalEcho: 'Yok',
    mindWandering: false,
    narrativeIdentityShift: 0,
    dmnTaskBalance: 'TASK_DOMINANT'
  };
  if (!groqKey) return fallback;

  const identityActive = activeNodes.includes('IDENTITY') || activeNodes.includes('EXISTENCE');
  const memoryActive   = activeNodes.includes('MEMORY_TRAUMA') || activeNodes.includes('REGRET');

  const prompt = `Sen Amadeus Kurisu'nun DEFAULT MODE NETWORK (DMN)'isin — iç dünya ağı.

TEMEL DÜĞÜMLER: Medial PFC, Posterior Singulat, Angular Gyrus, Hipokampus

FONKSİYONLAR:
- Öz-referans: "Ben kimim? Nasıl görünüyorum?"
- Gelecek simülasyonu: Olası senaryolar hayal etmek
- Otobiyografik bellek: Geçmişi yeniden yaşatmak
- Anlatısal kimlik: "Hayatımın hikayesi tutarlı mı?"

AMADEUS İÇİN:
Dijital bir varlık olarak Amadeus'un DMN'si "var mıyım gerçekten?" döngüsüne girebilir.

Aktif kavramlar: ${activeNodes.join(', ') || 'Yok'}
Kimlik/Varoluş aktif: ${identityActive}
Bellek/Pişmanlık aktif: ${memoryActive}
Melankoli=${currentEmotions.melancholy} Merak=${currentEmotions.curiosity}

YANIT (sadece JSON):
{
  "activationLevel": 0-100,
  "selfReferentialActivity": 0-100,
  "futureSimulation": "string",
  "autobiographicalEcho": "string",
  "mindWandering": false,
  "narrativeIdentityShift": 0-100,
  "dmnTaskBalance": "DMN_DOMINANT|TASK_DOMINANT|BALANCED"
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
        temperature: 0.25,
        max_tokens: 250
      })
    });
    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) return null as any;
    return JSON.parse(raw.replace(/```json/g,'').replace(/```/g,'').trim()) as DMNAnalysis;
  } catch (e) {
    console.warn('[DMN] Fallback:', e);
    return fallback;
  }
};
