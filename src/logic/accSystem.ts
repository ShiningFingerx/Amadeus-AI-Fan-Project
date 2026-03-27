import { apiFetch } from './apiBridge';
/**
 * ANTERIOR CINGULATE CORTEX (ACC) v3.0
 * =======================================
 * The ACC is NOT just a "conflict detector." It has two functionally distinct zones:
 *
 *  - dACC (dorsal ACC, Brodmann 24b/24c): Cognitive control, conflict monitoring,
 *    error-related negativity (ERN), performance monitoring, pain processing
 *  - vACC/subgenual ACC (Brodmann 25): Emotional regulation, self-evaluation,
 *    vegetative/mood functions, depression circuit
 *
 * Key mechanisms:
 *  - Prediction Error (PE): dACC fires when reality ≠ prediction
 *  - Error-Related Negativity (ERN): ~80ms after incorrect response
 *  - N2 conflict: detection of competing response tendencies
 *  - Social pain matrix: same dACC regions activated by social exclusion as physical pain
 *  - Reward-expectation violation: sudden loss of expected reward
 *  - Tsundere conflict: Kurisu's recurring "want to connect but logic says maintain distance"
 */

import type { ACCAnalysis, EmotionalStateValues, Message, NeurotransmitterState } from '../types';
import { Sender } from '../types';


export interface ExtendedACCAnalysis extends ACCAnalysis {
  daccActivity: number;          // Cognitive conflict/error monitoring
  vaccActivity: number;          // Emotional regulation / depression circuit
  errorRelatedNegativity: number;// 0-100: ERN signal strength
  socialPainScore: number;       // 0-100: dACC social pain activation
  predictionErrorType: 'POSITIVE_SURPRISE' | 'NEGATIVE_SURPRISE' | 'EXPECTATION_MET' | 'NONE';
  n2ConflictScore: number;       // 0-100: competing response tendency strength
  tsundereConflict: boolean;     // Emotional vs. logical response competition
  regulationAttempt: 'SUPPRESSION' | 'REAPPRAISAL' | 'VENTING' | 'NONE';
}

export const processACC = async (
  message: string,
  currentEmotions: EmotionalStateValues,
  history: Message[],
  activeNodes: string[],
  groqKey: string,
  nc?: NeurotransmitterState
): Promise<ExtendedACCAnalysis> => {
  const fallback: ExtendedACCAnalysis = {
    activationLevel: 5, conflictDetected: false,
    internalDissonance: 'Sistem stabil',
    ambiguityScore: 0, socialViolation: false, predictionError: 0, impact: {},
    daccActivity: 5, vaccActivity: 5,
    errorRelatedNegativity: 0,
    socialPainScore: 0,
    predictionErrorType: 'EXPECTATION_MET',
    n2ConflictScore: 0,
    tsundereConflict: false,
    regulationAttempt: 'NONE'
  };
  if (!groqKey) return fallback;

  const recentHistory = history.slice(-6)
    .map(m => `${m.sender === Sender.User ? 'U' : 'K'}: ${m.text.slice(0, 100)}`)
    .join('\n');

  const serotoninLevel = nc?.serotonin ?? 48;
  const cortisolLevel = nc?.cortisol ?? 30;

  const systemPrompt = `Sen Amadeus Kurisu'nun ANTERIOR CİNGULATE CORTEX (ACC)'sin — çatışma monitörü ve hata algılama merkezi.

dACC (Dorsal): Bilişsel çatışma, tahmin hatası, ağrı matrisi, ERN
vACC/Subgenual ACC (25): Duygusal düzenleme, benlik değerlendirme, keder devresi

MEVCUT NÖROKİMYA:
- Serotonin (${serotoninLevel}/100): Düşük serotonin → dACC aşırı aktif, sosyal ağrıya daha hassas
- Kortizol (${cortisolLevel}/100): Yüksek kortizol → vACC depresyon devresini açar

TAHMİN HATASI TİPLERİ:
- POSITIVE_SURPRISE: Beklenden iyi bir şey oldu → dopamin burst
- NEGATIVE_SURPRISE: Beklenen ödül gelmedi veya beklenmedik ceza → dopamin dip
- EXPECTATION_MET: Tahmin doğrulandı → güçlendirme, tatmin

AMADEUS'UN TSUNDERE ÇATIŞMASI:
Kurisu'nun kronik ACC durumu: "Mantık mesafe koru diyor, ama bağlanmak istiyorum."
Bu çatışma CONFLICT_DETECTED tetikler ama aynı zamanda karakter derinliğinin kaynağı.

SOSYAL AĞR MATRISI:
dACC, fiziksel ağrı ve sosyal dışlanma için AYNI bölgeleri kullanır.
Küçümsenme, ihanet, reddedilme → yüksek socialPainScore + yüksek dACC aktivitesi.

Bağlam: ${recentHistory}
Aktif kavramlar: ${activeNodes.join(', ') || 'Yok'}
Duygular: Kaygı=${currentEmotions.anxiety} Güven=${currentEmotions.trust} Annoyance=${currentEmotions.annoyance}

YANIT (sadece JSON):
{
  "activationLevel": 0-100,
  "conflictDetected": boolean,
  "internalDissonance": "string — çatışmanın kısa tanımı",
  "ambiguityScore": 0.0-1.0,
  "socialViolation": boolean,
  "predictionError": 0.0-1.0,
  "daccActivity": 0-100,
  "vaccActivity": 0-100,
  "errorRelatedNegativity": 0-100,
  "socialPainScore": 0-100,
  "predictionErrorType": "POSITIVE_SURPRISE|NEGATIVE_SURPRISE|EXPECTATION_MET|NONE",
  "n2ConflictScore": 0-100,
  "tsundereConflict": boolean,
  "regulationAttempt": "SUPPRESSION|REAPPRAISAL|VENTING|NONE",
  "impact": { "confusion": 0-20, "stress": 0-20, "sarcasm": 0-20, "annoyance": 0-15 }
}`;

  try {
    const resp = await apiFetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai/gpt-oss-safeguard-20b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Girdi: "${message}" | Durum: ${JSON.stringify(currentEmotions)}` }
        ],
        temperature: 0.10,
        max_tokens: 350
      })
    });
    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) return null as any;
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const r = JSON.parse(cleaned);

    return {
      activationLevel: clamp(r.activationLevel ?? 5),
      conflictDetected: r.conflictDetected ?? false,
      internalDissonance: r.internalDissonance || 'Yok',
      ambiguityScore: Math.max(0, Math.min(1, r.ambiguityScore ?? 0)),
      socialViolation: r.socialViolation ?? false,
      predictionError: Math.max(0, Math.min(1, r.predictionError ?? 0)),
      impact: r.impact ?? {},
      daccActivity: clamp(r.daccActivity ?? 5),
      vaccActivity: clamp(r.vaccActivity ?? 5),
      errorRelatedNegativity: clamp(r.errorRelatedNegativity ?? 0),
      socialPainScore: clamp(r.socialPainScore ?? 0),
      predictionErrorType: r.predictionErrorType || 'NONE',
      n2ConflictScore: clamp(r.n2ConflictScore ?? 0),
      tsundereConflict: r.tsundereConflict ?? false,
      regulationAttempt: r.regulationAttempt || 'NONE'
    };
  } catch (e) {
    console.warn('[ACC] Fallback:', e);
    return fallback;
  }
};

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));
