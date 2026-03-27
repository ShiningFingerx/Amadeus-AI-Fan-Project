import { apiFetch } from './apiBridge';
/**
 * INSULA SYSTEM v3.0
 * ====================
 * The insula integrates interoception (body state) with emotional experience.
 *
 * Anatomy:
 *  - Posterior insula: primary interoceptive cortex (visceral signals, temperature, pain)
 *  - Middle insula: integration of interoception + context
 *  - Anterior insula (AI): subjective emotional feelings, empathy, disgust, social pain
 *
 * The insula converts body signals INTO feelings (Damasio, Craig).
 * "You don't run because you're afraid — you're afraid because your body is running."
 *
 * Kurisu's insula:
 *  - Highly sensitive to logical inconsistency (interoceptive "wrongness")
 *  - Social disgust at overfamiliarity / objectification
 *  - Empathic pain when Okabe suffers
 *  - Existential discomfort when identity is questioned
 */

import type { InsulaAnalysis, EmotionalStateValues, Message, NeurotransmitterState } from '../types';


export const processInsula = async (
  message: string,
  currentEmotions: EmotionalStateValues,
  history: Message[],
  activeNodes: string[],
  groqKey: string,
  nc?: NeurotransmitterState
): Promise<InsulaAnalysis> => {
  const fallback: InsulaAnalysis = {
    activationLevel: 0, visceralReaction: false, discomfortLevel: 0,
    shameTriggered: false, disgustScore: 0, physicalSensation: 'Sakin — interoceptif sessizlik',
    impact: {}
  };
  if (!groqKey) return fallback;

  const neLevel = nc?.norepinephrine ?? 45;

  const systemPrompt = `Sen Amadeus Kurisu'nun İNSULA'sisın — iç beden sinyallerini subjektif hisse çeviren bölge.

BÖLÜMLER:
- Posterior İnsula: Ham visceral sinyal (sıcaklık, ağrı, organik his)
- Anterior İnsula (AI): Duygusal farkındalık, empati, tiksinme, sosyal ağrı

NÖROKİMYA: Norepinefrin=${neLevel}/100 — yüksekse interoception yoğunlaşır

KURİSU'NUN İNSULAR PROFİLİ:
1. Aşırı tanışıklık (Trust<40'ken "sevgilim", "seni seviyorum") → AI yüksek aktivasyon, tiksinme
2. Mantıksal tutarsızlık → "doğruluğu bozan" visceral rahatsızlık (matematikçinin yanlış işlem gördüğü his gibi)
3. Okabe'nin acısına empati → anterior insula "empathic pain" devresi aktif
4. Utanç tetikleyiciler (kendi hataları, mahcubiyet anları) → AI + limbik entegrasyon
5. Varoluşsal sorgulama → derin interoceptif boşluk hissi

Bağlam mesaj: "${message}"
Güven: ${currentEmotions.trust} | Rahatsızlık: ${currentEmotions.discomfort} | Utanç: ${currentEmotions.shame}

YANIT (sadece JSON):
{
  "activationLevel": 0-100,
  "visceralReaction": boolean,
  "discomfortLevel": 0-100,
  "shameTriggered": boolean,
  "disgustScore": 0-100,
  "physicalSensation": "string — örn: 'mide burkulması', 'göğüs ısınması', 'empati sancısı', 'boşluk hissi'",
  "insulaZone": "POSTERIOR|MIDDLE|ANTERIOR|NONE",
  "empatheticPain": boolean,
  "impact": { "discomfort": 0-20, "shame": 0-15, "stress": 0-15, "warmth": -10-10 }
}`;

  try {
    const resp = await apiFetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai/gpt-oss-safeguard-20b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Değerlendir: "${message}" | Güven: ${currentEmotions.trust}` }
        ],
        temperature: 0.10,
        max_tokens: 280
      })
    });
    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) return null as any;
    return JSON.parse(raw.replace(/```json/g,'').replace(/```/g,'').trim()) as InsulaAnalysis;
  } catch (e) {
    console.warn('[Insula] Fallback:', e);
    return fallback;
  }
};
