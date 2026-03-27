import { apiFetch } from './apiBridge';
/**
 * ORBITOFRONTAL CORTEX (OFC) v3.0
 * ==================================
 * The OFC computes VALUE — not just "good/bad" but nuanced reward/punishment estimates.
 *
 * Anatomy:
 *  - Medial OFC (mOFC): reward value, positive outcomes, appetitive behavior
 *  - Lateral OFC (lOFC): punishment, negative outcomes, aversive learning
 *  - Central OFC: integration zone
 *
 * Key mechanisms:
 *  - Reversal learning: OFC updates value when outcome changes (lOFC lesions → can't reverse)
 *  - Secondary reinforcement: social signals (approval, status) become rewarding
 *  - Expected value: reward × probability calculation
 *  - Credit assignment: who/what caused this outcome?
 *
 * Kurisu's OFC uniquenesses:
 *  - Intellectual engagement = highest reward signal (mOFC)
 *  - Social status violation = lOFC punishment signal
 *  - Amadeus version: less defensive, higher social reward baseline vs human Kurisu
 */

import type { OFCAnalysis, EmotionalStateValues, Message, NeurotransmitterState } from '../types';


export const processOFC = async (
  message: string,
  currentEmotions: EmotionalStateValues,
  history: Message[],
  groqKey: string,
  nc?: NeurotransmitterState
): Promise<OFCAnalysis> => {
  const fallback: OFCAnalysis = {
    activationLevel: 10, socialValueAssessment: 'MEDIUM',
    reputationRisk: 0, socialFilterSuggestion: 'ADAPT',
    perceivedSocialStanding: 'Yabancı', impact: {}
  };
  if (!groqKey) return fallback;

  const historySnippet = history.slice(-5).map(h => h.text).join(' ').slice(-350);
  const dopamineLevel = nc?.dopamine ?? 52;

  const systemPrompt = `Sen Amadeus Kurisu'nun ORBİTOFRONTAL KORTEKS (OFC)'sin — değer hesaplama ve sosyal ödül merkezi.

mOFC: Ödül değeri, pozitif beklenti, appetitif davranış
lOFC: Ceza değeri, negatif beklenti, aversif öğrenme
Merkezi OFC: Entegrasyon → sosyal değer tahmini

NÖROKİMYA: Dopamin=${dopamineLevel}/100 (yüksek dopamin → OFC daha olumlu değer biçer)

KURİSU'NUN DEĞER HİYERARŞİSİ:
1. Entelektüel meşguliyet → en yüksek mOFC ödülü (socialValueAssessment: HIGH)
2. Samimi ve saygılı yaklaşım → yüksek ödül
3. Çocukça veya aşırı duygusal yaklaşım → orta, tolere edilebilir
4. İsimlerle dalga geçme/küçümseme → lOFC ceza sinyali
5. Tekrarlayan uygunsuz davranış → reversal learning: önceki pozitif değer silinir

REVERSİYON ÖĞRENME:
Eğer kullanıcı daha önce iyi notlar almışsa ama şimdi olumsuz davranıyorsa:
→ OFC otomatik değer günceller, socialFilterSuggestion değişir

Konuşma geçmişi: "...${historySnippet}..."
Mevcut girdi: "${message}"
Güven: ${currentEmotions.trust} | Mesaj sayısı: ${history.length}

YANIT (sadece JSON):
{
  "activationLevel": 0-100,
  "socialValueAssessment": "HIGH|MEDIUM|LOW|NEGATIVE",
  "reputationRisk": 0-100,
  "socialFilterSuggestion": "ENGAGE_WARMLY|PLAYFUL_CORRECTION|FIRM_REMINDER|COLD_WITHDRAWAL|INTELLECTUAL_ENGAGE",
  "perceivedSocialStanding": "Yabancı|Eş|Öğrenci|Meydan_Okuyucu|Güvenilen_Kişi",
  "moFcReward": 0-100,
  "lofcPunishment": 0-100,
  "expectedValueDelta": -50-50,
  "creditAssignment": "string — bu sonuçtan kim/ne sorumlu",
  "impact": { "trust": -10-10, "annoyance": -5-15, "warmth": -10-10 }
}`;

  try {
    const resp = await apiFetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai/gpt-oss-safeguard-20b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Değer analizi: "${message}"` }
        ],
        temperature: 0.10,
        max_tokens: 300
      })
    });
    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) return null as any;
    return JSON.parse(raw.replace(/```json/g,'').replace(/```/g,'').trim()) as OFCAnalysis;
  } catch (e) {
    console.warn('[OFC] Fallback:', e);
    return fallback;
  }
};
