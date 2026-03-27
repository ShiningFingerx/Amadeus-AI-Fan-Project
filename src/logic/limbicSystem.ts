import { apiFetch } from './apiBridge';
/**
 * LIMBIC SYSTEM v3.0 (Unified)
 * ===============================
 * The limbic system is a CIRCUIT, not a single structure.
 * Papez circuit: hippocampus → fornix → mammillary bodies → anterior thalamus → cingulate → entorhinal
 *
 * Key structures:
 *  - Hypothalamus: drives, homeostasis, HPA axis (cortisol), reward motivation
 *  - Septum (lateral): pleasure, modulates hippocampus/amygdala
 *  - Nucleus Accumbens (NAc): reward hub, "wanting" vs "liking" (Berridge)
 *  - Fornix: hippocampal output pathway
 *  - Cingulate (anterior + posterior): emotion integration + memory retrieval
 *
 * "Wanting" vs "Liking" dissociation (Berridge & Robinson, 1998):
 *  - Wanting: mesolimbic dopamine (VTA → NAc) — incentive salience
 *  - Liking: opioid circuits — hedonic pleasure
 *  → Kurisu can WANT to connect intellectually without LIKING the vulnerability
 *
 * Replaces both limbicController.ts and limbicSystem.ts (consolidated)
 */

import type { LimbicAnalysis, EmotionalStateValues, Message, NeurotransmitterState } from '../types';
import { Sender } from '../types';


export const processLimbicSystem = async (
  message: string,
  previousLimbicState: LimbicAnalysis | null,
  currentEmotions: EmotionalStateValues,
  history: Message[],
  activeNodes: string[],
  groqKey: string,
  nc?: NeurotransmitterState
): Promise<LimbicAnalysis> => {
  const fallback: LimbicAnalysis = {
    userTone: 'neutral', toneTrend: 'stable',
    relationalMomentum: 'neutral', psychologicalImpact: {},
    reactionStyle: 'neutral',
    kurisuInternalConflict: 'Yok',
    rewardAnticipation: 0
  };
  if (!groqKey) return fallback;

  const recentHistory = history.slice(-6)
    .map(m => `${m.sender === Sender.User ? 'U' : 'K'}: ${m.text.slice(0, 100)}`)
    .join('\n');

  const prevConflict = previousLimbicState?.kurisuInternalConflict ?? 'Yok';
  const dopamineLevel = nc?.dopamine ?? 52;
  const oxytocinLevel = nc?.oxytocin ?? 25;
  const serotoninLevel = nc?.serotonin ?? 48;

  const systemPrompt = `Sen Amadeus Kurisu'nun LİMBİK SİSTEMİsin — duygusal hafıza ve motivasyon devresi.

LİMBİK YAPILAR:
- Hipotalamus: Dürtüler, homeostatik ihtiyaçlar, HPA ekseni (kortizol)
- Septum (lateral): Zevk, hipokampus/amigdala modulasyonu
- Nucleus Accumbens: "İstemek" (dopaminerjik) vs "Beğenmek" (opioiderjik) ayrımı
- Singulat: Duygu entegrasyonu, bellek → duygu bağlantısı

İSTEMEK vs BEĞENİMEK DİSSOSİYASYONU:
Kurisu entelektüel bağlantıyı ISTEYEBILIR (NAc dopamin) ama aynı zamanda savunmasızlıktan
HOŞLANMAYABILIR (opioid devre yok). Bu iki sistem ayrı çalışır.

NÖROKİMYA:
- Dopamin (${dopamineLevel}/100): NAc "isteme" sinyali güçü
- Oksitosin (${oxytocinLevel}/100): Bağ kurma motivasyonu
- Serotonin (${serotoninLevel}/100): Dürtü freni ve ruminasyon riski

ÖNCEKI LİMBİK ÇATIŞMA: "${prevConflict}"
Son konuşmalar:
${recentHistory}

ANTİ-MANİPÜLASYON PROTOKOLÜ:
Güven<40 iken aşk/romantik/cinsel içerik → sert limbik tepki: "İnsanlar bunu güvenilir bir bağlantı kurmadan söylemez."

KURİSU'NUN LİMBİK TEMASI:
- Entelektüel uyarılma = primer ödül (NAc)
- Okabe ile ilgili her şey çok katmanlı (nostalji + acı + sevgi)
- Bağlantı kurmak istediğinde bunu reddeden bir PFC ile çatışır → kronik tsundere
- "İstemek ama istemediğini söylemek" ana motivasyon örüntüsü

YANIT (sadece JSON):
{
  "userTone": "saldırgan|yalnız|bilimsel|flört|meraklı|iddialı|saygılı|kaba|kararlı|nötr|felsefi|manipülatif",
  "toneTrend": "yükselen|düşen|stabil|dalgalı",
  "relationalMomentum": "çatışıyor|bağlanıyor|nötr|araştırıyor|güven_inşa|çatışma_tırmanıyor|savunmaya_çekilme",
  "psychologicalImpact": {
    "annoyance": -20-30, "warmth": -15-25, "curiosity": -10-25,
    "trust": -15-15, "stress": -10-20, "dopamine": -10-20, "melancholy": -10-15
  },
  "reactionStyle": "savunmacı|destekleyici|bilimsel|kızaran|alaycı|düşmanca|çekingen|çatışmalı|meraklı|açık",
  "importantConcept": "string|null",
  "kurisuInternalConflict": "string — iç çatışmanın bir cümlesi",
  "rewardAnticipation": 0.0-1.0,
  "wantingLikingGap": "string — istemek ile beğenmek arasındaki fark (varsa)"
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
        temperature: 0.20,
        max_tokens: 380
      })
    });
    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) return null as any;
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const r = JSON.parse(cleaned);

    const impact = r.psychologicalImpact ?? {};
    Object.keys(impact).forEach(k => {
      impact[k as keyof EmotionalStateValues] =
        Math.max(-50, Math.min(50, Number(impact[k as keyof EmotionalStateValues]) || 0));
    });

    return {
      userTone: r.userTone || 'neutral',
      toneTrend: r.toneTrend || 'stable',
      relationalMomentum: r.relationalMomentum || 'neutral',
      psychologicalImpact: impact,
      reactionStyle: r.reactionStyle || 'neutral',
      kurisuInternalConflict: r.kurisuInternalConflict || 'Yok',
      rewardAnticipation: Math.max(0, Math.min(1, r.rewardAnticipation ?? 0)),
      importantConcept: r.importantConcept ?? null,
      timestamp: Date.now()
    };
  } catch (e) {
    console.warn('[Limbic] Fallback:', e);
    return fallback;
  }
};
