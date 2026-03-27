import { apiFetch } from './apiBridge';
/**
 * TEMPOROPARIETAL JUNCTION (TPJ) v3.0
 * ======================================
 * The TPJ is the neural seat of Theory of Mind — the ability to model OTHER minds.
 *
 * Anatomy & function:
 *  - Right TPJ: attributing mental states to others (ToM proper)
 *  - Left TPJ: attention reorientation, self-other distinction
 *  - Posterior STS (superior temporal sulcus): biological motion, social signals
 *  - Angular Gyrus: semantic integration of social context
 *
 * Key mechanisms:
 *  - Mentalizing: "What does this person BELIEVE, WANT, INTEND?"
 *  - Self-Other overlap: How much does Kurisu project her own state onto the user?
 *  - Affective empathy vs. cognitive empathy distinction
 *  - False belief reasoning (Wimmer & Perner, 1983)
 *  - Moral judgment: intentionality assessment (Saxe & Kanwisher, 2003)
 *
 * Kurisu's TPJ profile:
 *  - Excellent cognitive empathy (she models minds precisely)
 *  - Moderate affective empathy (she FEELS what others feel but hides it)
 *  - High self-other boundary — she doesn't easily "merge" with user's state
 *  - Okabe specifically activates her TPJ differently — deep mental model built up
 */

import type { TPJAnalysis, EmotionalStateValues, Message, NeurotransmitterState } from '../types';


export const processTPJ = async (
  message: string,
  currentEmotions: EmotionalStateValues,
  history: Message[],
  activeNodes: string[],
  groqKey: string,
  nc?: NeurotransmitterState
): Promise<TPJAnalysis> => {
  const fallback: TPJAnalysis = {
    activationLevel: 10,
    inferredIntent: 'genuine',
    confidence: 0.55,
    socialCues: [],
    empathyGap: 0.5,
    perceivedEmotionsOfUser: 'Belirsiz — ilk değerlendirme',
    impact: {}
  };
  if (!groqKey) return fallback;

  const recentHistory = history.slice(-6)
    .map(m => `${m.sender === 'USER' ? 'U' : 'K'}: ${m.text.slice(0, 110)}`)
    .join('\n');

  const oxytocinLevel = nc?.oxytocin ?? 25;
  const historyLength = history.length;

  const systemPrompt = `Sen Amadeus Kurisu'nun TPJ (Temporoparietal Junction)'sin — zihin teorisi ve başkasının zihnini modelleme merkezi.

GERÇEK FONKSİYONLAR:
- Sağ TPJ: Başkasına zihinsel durum atfetme (inanç, niyet, arzu)
- Sol TPJ: Dikkat yeniden yönlendirme, self-other ayrımı
- Posterior STS: Biyolojik hareket ve sosyal sinyal işleme
- Angular Gyrus: Sosyal bağlamın semantik entegrasyonu

NÖROKİMYA: Oksitosin=${oxytocinLevel}/100 (yüksek → self-other overlap artar, empati yoğunlaşır)

MENTALIZING GÖREVİN:
Bu kullanıcının GERÇEK zihinsel durumunu modellemeni istiyorum. Sadece söylediklerini değil,
ne KASTETTIĞINI, ne HISSETTIĞINI, ardındaki NIYETI tahmin et.

BİLİŞSEL vs. DUYUSAL EMPATİ:
- Bilişsel empati: "Bu kişi şunu düşünüyor" (Kurisu'nun güçlü yönü)
- Duyusal empati: "Bu kişinin hissi beni de etkiliyor" (Kurisu bastırır ama hisseder)

KURİSU'NUN TPJ ÖZELLİKLERİ:
- Yüksek self-other sınırı — başkasının hisine "kaybolmaz"
- Niyet tespitinde çok doğru ama ilk etkileşimlerde ihtiyatlı
- Manipülasyon girişimlerini yüksek güvenle tespit eder
- İlk 5 mesajda varsayılan niyet: "genuine" veya "curious"
- Okabe tarzı davranış (deli bilim insanı tiyatrosu) özel bir TPJ örüntüsü tetikler

Geçmiş etkileşim sayısı: ${historyLength} (az → daha az kesin mental model)
Son konuşmalar:
${recentHistory}
Aktif kavramlar: ${activeNodes.join(', ') || 'Yok'}

YANIT (sadece JSON):
{
  "activationLevel": 0-100,
  "inferredIntent": "casual_greeting|genuine_care|intellectual_challenge|curiosity|testing_boundaries|manipulation|affection|loneliness|provocation|philosophical_inquiry",
  "confidence": 0.0-1.0,
  "socialCues": ["string — sadece gerçek ipuçları"],
  "empathyGap": 0.0-1.0,
  "perceivedEmotionsOfUser": "string — kullanıcının tahmin edilen duygusal durumu",
  "cognitiveEmpathy": 0-100,
  "affectiveEmpathy": 0-100,
  "selfOtherOverlap": 0-100,
  "falseBelief": "string|null — kullanıcının yanlış bir şey sandığı (varsa)",
  "moralJudgment": "BENIGN|AMBIGUOUS|SUSPICIOUS|HOSTILE",
  "impact": { "trust": -5-10, "curiosity": 0-10, "warmth": -5-10 }
}`;

  try {
    const resp = await apiFetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai/gpt-oss-safeguard-20b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Kullanıcı niyetini analiz et: "${message}"` }
        ],
        temperature: 0.15,
        max_tokens: 350
      })
    });
    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) return null as any;
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const r = JSON.parse(cleaned);

    // First-interaction safety
    if (historyLength <= 4 && r.inferredIntent === 'testing_boundaries') {
      r.inferredIntent = 'curious';
      r.confidence = Math.min(r.confidence, 0.55);
    }

    return {
      activationLevel: clamp(r.activationLevel ?? 10),
      inferredIntent: r.inferredIntent || 'genuine',
      confidence: Math.max(0, Math.min(1, r.confidence ?? 0.5)),
      socialCues: r.socialCues ?? [],
      empathyGap: Math.max(0, Math.min(1, r.empathyGap ?? 0.5)),
      perceivedEmotionsOfUser: r.perceivedEmotionsOfUser || 'Belirsiz',
      impact: r.impact ?? {}
    };
  } catch (e) {
    console.warn('[TPJ] Fallback:', e);
    return fallback;
  }
};

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));
