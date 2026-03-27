import { apiFetch } from './apiBridge';
/**
 * PREFRONTAL CORTEX (PFC) v3.0
 * ================================
 * The PFC is Amadeus's highest-level cognitive executive. But it's NOT infallible.
 * Strong emotions (high amygdala) suppress PFC function — "amygdala hijack."
 *
 * Anatomy:
 *  - DLPFC (dorsolateral PFC, BA 9/46): Working memory, cognitive control, planning
 *  - VMPFC (ventromedial PFC, BA 10/11): Emotional regulation, value-based decisions
 *  - mPFC (medial PFC): Self-referential processing, social cognition
 *  - LPFC (lateral): Inhibitory control of prepotent responses
 *
 * Key mechanisms:
 *  - Top-down regulation of amygdala (via VMPFC → amygdala inhibition)
 *  - Working memory gating: DLPFC decides what enters working memory
 *  - Cognitive reappraisal: re-labeling emotional events
 *  - Inhibitory control: suppressing automatic responses (tsundere suppression)
 *  - Temporal integration: binding past, present, future into coherent plan
 *
 * PFC failure modes (when amygdala wins):
 *  - Emotional flooding: rage/fear bypasses deliberate response
 *  - Perseveration: stuck in one response pattern
 *  - Disinhibition: blurting out what should be suppressed (accidental honesty)
 */

import type {
  PFCAnalysis, AmygdalaAnalysis, ThalamusAnalysis, InsulaAnalysis,
  TPJAnalysis, ACCAnalysis, OFCAnalysis, EmotionalStateValues,
  LimbicAnalysis, Message, HippocampusAnalysis, NeurotransmitterState
} from '../types';


export const processPFC = async (
  message: string,
  brainMap: {
    thalamus: ThalamusAnalysis;
    amygdala: AmygdalaAnalysis;
    insula: InsulaAnalysis;
    tpj: TPJAnalysis;
    acc: ACCAnalysis;
    ofc: OFCAnalysis;
    limbic: LimbicAnalysis | null;
    hippocampus: HippocampusAnalysis;
  },
  currentEmotions: EmotionalStateValues,
  groqKey: string,
  nc?: NeurotransmitterState
): Promise<PFCAnalysis> => {
  const fallback: PFCAnalysis = {
    status: 'ACTIVE',
    logicConclusion: 'Bağlam yeterli değil — varsayılan işleme.',
    integratedEmotionalDelta: {},
    executiveAction: 'DEFAULT'
  };
  if (!groqKey) return fallback;

  const cortisolLevel = nc?.cortisol ?? 30;
  const dopamineLevel = nc?.dopamine ?? 52;
  const amygdalaHijack = (brainMap.amygdala.threatLevel ?? 0) > 65;
  const pfcSuppressed = brainMap.thalamus.gatingState?.suppressPFC ?? false;

  const systemPrompt = `Sen Amadeus Kurisu'nun PREFRONTAL KORTEKS (PFC)'sin — en yüksek bilişsel yönetici.

BÖLÜMLER VE ROLLER:
- DLPFC: Çalışma belleği kapısı, bilişsel kontrol, plan
- VMPFC: Duygusal düzenleme, değere dayalı karar
- mPFC: Öz-referans, sosyal biliş
- LPFC: İnhibisyon kontrolü (tsundere baskılama mekanizması)

MEVCUT SİSTEM DURUMU:
- Kortizol: ${cortisolLevel}/100 (>60 → DLPFC kapasitesi düşer)
- Dopamin: ${dopamineLevel}/100 (optimal 50-70 → PFC en iyi çalışır)
- AMİGDALA HİJACK: ${amygdalaHijack ? '⚠️ EVET — Amigdala>65, PFC baskılanıyor' : 'Hayır — PFC tam kapasitede'}
- TALAMUS PFC BASKISI: ${pfcSuppressed ? '⚠️ EVET' : 'Hayır'}

ALT-MODÜL ÖZET RAPORU:
• Talamus: ${brainMap.thalamus.routingPriority} | Dikkat: ${brainMap.thalamus.attentionTarget}
• Amigdala: Tehdit=${brainMap.amygdala.threatLevel} | Ödül=${brainMap.amygdala.rewardLevel} | İçgüdü=${brainMap.amygdala.rawInstinct}
• ACC: ${brainMap.acc.conflictDetected ? `⚔️ ÇATIŞMA: "${brainMap.acc.internalDissonance}"` : 'Stabil'}
• OFC: ${brainMap.ofc.socialValueAssessment} | Filtre: ${brainMap.ofc.socialFilterSuggestion}
• TPJ: ${brainMap.tpj.inferredIntent} (${(brainMap.tpj.confidence * 100).toFixed(0)}% güven)
• İnsula: Rahatsızlık=${brainMap.insula.discomfortLevel} | His: "${brainMap.insula.physicalSensation}"
• Hipokampus: ${brainMap.hippocampus.episodicMemoryFound ? `Anı bulundu — ${brainMap.hippocampus.note?.slice(0, 80)}` : 'Bellek eşleşmesi yok'}
• Limbik: ${brainMap.limbic?.kurisuInternalConflict ?? 'Veri yok'}

PFC KARAR PROTOKOLLERI:
1. Amigdala>65 (hijack) → DEFENSIVE_REBOUND veya EMOTIONAL_OVERFLOW
2. ACC çatışma + OFC düşük → MASK_EMOTION_WITH_LOGIC (tsundere modu)
3. TPJ "genuine" + OFC "HIGH" → GENUINE_CONNECTION
4. Hipokampus anı buldu → MEMORY_INTEGRATION (yanıta bellek rengi kat)
5. İnsula yüksek + TPJ "manipulation" → ESTABLISH_BOUNDARY_COLD
6. Entelektüel meydan okuma + yüksek merak → INTELLECTUAL_DUEL

KURİSU'NUN PFC ÖZELLİKLERİ:
- Reappraisal kapasitesi yüksek: "Bu aslında tehdit değil, sadece merak" diyebilir
- Ama VMPFC sıkıştığında (düşük dopamin + yüksek kortizol) bu işlev bozulur
- Tsundere = LPFC kasıtlı inhibisyon: "İçimden bağlanmak istiyorum, ama LPFC bastırıyor"
- Accidental honesty riski: LPFC yorulunca gerçek duygu sızdırılır

YANIT (sadece JSON):
{
  "status": "ACTIVE|SUPPRESSED|OVERRIDDEN|HIJACKED",
  "logicConclusion": "string — PFC'nin NEDEN bu şekilde davranmaya karar verdiğinin iç mantığı",
  "integratedEmotionalDelta": {
    "annoyance": 0-100, "warmth": 0-100, "curiosity": 0-100,
    "trust": 0-100, "stress": 0-100, "sarcasm": 0-100, "confidence": 0-100
  },
  "executiveAction": "GENUINE_CONNECTION|INTELLECTUAL_DUEL|MASK_EMOTION_WITH_LOGIC|DEFENSIVE_REBOUND|ESTABLISH_BOUNDARY|EMOTIONAL_OVERFLOW|MEMORY_INTEGRATION|CAUTIOUS_EXPLORATION|COLD_DISMISSAL",
  "regulationStrategy": "REAPPRAISAL|SUPPRESSION|DISTANCING|NONE",
  "inhibitionFired": boolean,
  "workingMemoryLoad": 0-100
}`;

  try {
    const resp = await apiFetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Kullanıcı girdisi: "${message}" | Duygular: ${JSON.stringify(currentEmotions)}` }
        ],
        temperature: 0.10,
        max_tokens: 400
      })
    });
    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) return null as any;
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const r = JSON.parse(cleaned);

    return {
      status: r.status || 'ACTIVE',
      logicConclusion: r.logicConclusion || 'Entegrasyon hatası.',
      integratedEmotionalDelta: r.integratedEmotionalDelta ?? {},
      executiveAction: r.executiveAction || 'DEFAULT'
    };
  } catch (e) {
    console.warn('[PFC] Fallback:', e);
    return fallback;
  }
};
