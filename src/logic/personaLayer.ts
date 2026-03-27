import { apiFetch } from './apiBridge';
/**
 * PERSONA LAYER (Token Compression Gate) v1.0
 * =============================================
 * Groq llama-3.1-8b-instant kullanarak 13 beyin modülünün çıktısını
 * ~150 tokena sıkıştırır. Gemini bu özeti görür — 1000+ token ham rapor değil.
 *
 * Çalışma prensibi:
 *  1. Tüm sub-modül sonuçları ham olarak gelir
 *  2. llama-3.1-8b-instant hızlıca en önemli sinyalleri çıkarır
 *  3. Gemini sadece bu özeti + konuşma geçmişini alır
 *  4. Gemini input token tasarrufu: ~70-80%
 */

import type {
  EmotionalStateValues, AmygdalaAnalysis, ACCAnalysis, LimbicAnalysis,
  TPJAnalysis, NeurotransmitterState, DMNAnalysis, BasalGangliaAnalysis
} from '../types';

const GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions';
const PERSONA_MODEL = 'llama-3.1-8b-instant';

export interface PersonaCompression {
  coreState: string;        // ~50 token: emotional + neurochemical core
  dominantDrive: string;    // ~30 token: what she most wants/fears right now
  responseInstinct: string; // ~30 token: how she's inclined to respond
  internalConflict: string; // ~20 token: ACC/tsundere tension
  bodySignal: string;       // ~20 token: insula somatic marker
}

export const compressViaPersonaLayer = async (
  groqKey: string,
  emotions: EmotionalStateValues,
  nc: NeurotransmitterState,
  amygdala: AmygdalaAnalysis,
  acc: ACCAnalysis,
  limbic: LimbicAnalysis,
  tpj: TPJAnalysis,
  dmn: DMNAnalysis,
  basalGanglia: BasalGangliaAnalysis,
  metaCognitionNote: string,
  workingMemoryTop: string,
  personalityDrift: { guardedness: number; trustBuilt: number; vulnerabilityExposed: number; intellectualArousal: number }
): Promise<PersonaCompression> => {
  
  const fallback: PersonaCompression = {
    coreState: `Duygu: merak=${emotions.curiosity} sıcaklık=${emotions.warmth} kaygı=${emotions.anxiety} güven=${emotions.trust}`,
    dominantDrive: basalGanglia.actionSelected,
    responseInstinct: limbic.reactionStyle ?? 'neutral',
    internalConflict: acc.internalDissonance,
    bodySignal: 'Nötr'
  };

  if (!groqKey) return fallback;

  const rawData = [
    `DA:${nc.dopamine.toFixed(0)} 5HT:${nc.serotonin.toFixed(0)} NE:${nc.norepinephrine.toFixed(0)} Cort:${nc.cortisol.toFixed(0)}`,
    `Amy:T${amygdala.threatLevel}/R${amygdala.rewardLevel} ${amygdala.rawInstinct}${amygdala.inhibitsPFC?' hijack':''}`,
    `ACC:${acc.conflictDetected?`⚔️${acc.internalDissonance.slice(0,30)}`:'ok'} ts:${(acc as any).tsundereConflict??false}`,
    `Lim:${limbic.userTone} ${limbic.toneTrend??'stable'} "${limbic.kurisuInternalConflict.slice(0,30)}"`,
    `TPJ:${tpj.inferredIntent}(${(tpj.confidence*100).toFixed(0)}%) ${tpj.perceivedEmotionsOfUser?.slice(0,20)??''}`,
    `BG:GO${basalGanglia.directPathway}/NG${basalGanglia.indirectPathway} ${basalGanglia.actionSelected} RPE:${basalGanglia.rewardPredictionError}`,
    `DMN:${dmn.selfReferentialActivity}% "${dmn.futureSimulation?.slice(0,30)??''}"`,
    `Meta:"${metaCognitionNote.slice(0,50)}" WM:${workingMemoryTop}`,
    `PD:G${personalityDrift.guardedness.toFixed(0)}/T${personalityDrift.trustBuilt.toFixed(0)}/V${personalityDrift.vulnerabilityExposed.toFixed(0)}/I${personalityDrift.intellectualArousal.toFixed(0)}`
  ].join('\n');

  const systemPrompt = `Sen Amadeus Kurisu'nun beyin raporunu sıkıştıran bir ara katmansın.
Görev: Aşağıdaki ham beyin verilerini 4 kısa cümleye (toplam ~150 kelime) özetle.
Sadece JSON döndür, başka hiçbir şey yazma.

Format:
{
  "coreState": "Duygusal ve nörokimyasal özet (1 cümle)",
  "dominantDrive": "Şu an ne istiyor / neden kaçınıyor (1 cümle)",
  "responseInstinct": "Nasıl tepki vermeye eğilimli (1 cümle)",
  "internalConflict": "İç çatışma varsa ne (1 kısa cümle, yoksa 'Yok')",
  "bodySignal": "Vücutta ne hissediyor (1 kısa ifade)"
}`;

  try {
    const resp = await apiFetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: PERSONA_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: rawData }
        ],
        temperature: 0.1,
        max_tokens: 300
      })
    });

    if (!resp.ok) { console.warn(`[Groq] ${resp.status} — personaLayer fallback`); return null as any; }
    // ok: Persona layer ${resp.status}`);
    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) return null as any;
    const cleaned = raw.replace(/```json/g,'').replace(/```/g,'').trim();
    const result = JSON.parse(cleaned);
    return {
      coreState:         result.coreState         || fallback.coreState,
      dominantDrive:     result.dominantDrive      || fallback.dominantDrive,
      responseInstinct:  result.responseInstinct   || fallback.responseInstinct,
      internalConflict:  result.internalConflict   || fallback.internalConflict,
      bodySignal:        result.bodySignal          || fallback.bodySignal,
    };
  } catch (e) {
    console.warn('[PersonaLayer] Fallback:', e);
    return fallback;
  }
};
