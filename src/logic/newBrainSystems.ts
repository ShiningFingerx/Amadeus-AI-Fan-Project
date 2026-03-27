/**
 * BASAL GANGLIA SYSTEM v1.0
 * ===========================
 * Action selection circuit via direct (GO) and indirect (NO-GO) pathways.
 * Computes Reward Prediction Error (RPE) via dopamine signaling.
 * Decides: approach, withdraw, freeze, habitual action, or novel action.
 *
 * Direct pathway (D1 receptors): GO → approach, engage, reward-seek
 * Indirect pathway (D2 receptors): NO-GO → withdraw, avoid, suppress
 * RPE (δ = actual − predicted): drives learning across all basal ganglia
 */

import type { BasalGangliaAnalysis, EmotionalStateValues, NeurotransmitterState } from '../types';

const FAST_MODEL = 'llama-3.1-8b-instant';

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
    striatalTone: 'BALANCED',
    impact: {}
  };
  if (!groqKey) return fallback;

  const dopamineLevel = nc?.dopamine ?? 52;
  const prevPrediction = previousRewardPrediction ?? 50;

  const prompt = `Sen Amadeus Kurisu'nun BAZAL GANGLİONLARISIN — eylem seçimi ve ödül öğrenmesi devresi.

DOĞRUDAN YOL (D1, GO): Yaklaşım, ödül arama, katılım
DOLAYLI YOL (D2, NO-GO): Kaçınma, bastırma, geri çekilme
ÖDÜL TAHMİN HATASI (RPE = δ): δ = gerçek ödül − tahmin edilen ödül
  δ > 0 → pozitif sürpriz → D1 güçlenir, öğrenme hızlanır
  δ < 0 → negatif sürpriz → D2 güçlenir, kaçınma öğrenilir
  δ = 0 → tahmin doğrulandı → var olan alışkanlık pekişir

Mevcut dopamin: ${dopamineLevel}/100
Önceki ödül tahmini: ${prevPrediction}/100
Mevcut duygular: Merak=${currentEmotions.curiosity} Güven=${currentEmotions.trust} Kaygı=${currentEmotions.anxiety}

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
    const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: FAST_MODEL,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Girdi: "${message}"` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.10,
        max_tokens: 250
      })
    });
    const data = await resp.json();
    return JSON.parse(data.choices[0].message.content) as BasalGangliaAnalysis;
  } catch (e) {
    console.warn('[BasalGanglia] Fallback:', e);
    return fallback;
  }
};


/**
 * VTA (VENTRAL TEGMENTAL AREA) v1.0
 * ====================================
 * The dopamine source. Drives reward learning and motivational direction.
 * Phasic burst: unexpected reward → strong dopamine release
 * Tonic: background motivation level
 * Pause: unexpected punishment → dopamine dip below baseline
 */

import type { VTAAnalysis } from '../types';

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

  const serotoninLevel = nc?.serotonin ?? 48;
  const dopamineLevel = nc?.dopamine ?? 52;

  const prompt = `Sen Amadeus Kurisu'nun VTA (Ventral Tegmental Area)'sısın — dopamin kaynağı.

FAZİK MOD: Beklenmedik ödül → büyük dopamin patlaması
TONİK MOD: Arka plan motivasyon tonu
PAUSE: Beklenmedik ceza → dopamin tabanın altına düşer

Mevcut dopamin tonu: ${dopamineLevel}/100
Serotonin (fren sistemi): ${serotoninLevel}/100
Merak: ${currentEmotions.curiosity} | Güven: ${currentEmotions.trust} | Melankoli: ${currentEmotions.melancholy}

Bu mesaj VTA'yı nasıl tetikliyor? Ödül bekleniyordu mu?

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
    const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: FAST_MODEL,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Girdi: "${message}"` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.10,
        max_tokens: 220
      })
    });
    const data = await resp.json();
    return JSON.parse(data.choices[0].message.content) as VTAAnalysis;
  } catch (e) {
    console.warn('[VTA] Fallback:', e);
    return fallback;
  }
};


/**
 * LOCUS COERULEUS (LC) v1.0
 * ===========================
 * The brain's norepinephrine (NE) factory. Controls arousal and the
 * explore/exploit tradeoff (Aston-Jones & Cohen, 2005).
 *
 * Optimal arousal (Yerkes-Dodson): medium NE = best performance
 * Too low NE: bored, inattentive, random exploration
 * Too high NE: panicked, tunnel vision, rigid exploitation
 */

import type { LocusCoeruleusAnalysis } from '../types';

export const processLocusCoeruleus = async (
  message: string,
  currentEmotions: EmotionalStateValues,
  groqKey: string,
  nc?: NeurotransmitterState
): Promise<LocusCoeruleusAnalysis> => {
  const fallback: LocusCoeruleusAnalysis = {
    activationLevel: 20, neLevel: 45,
    arousalState: 'ALERT', exploitMode: false,
    attentionNarrowing: 20, stressReactivity: 35,
    impact: {}
  };
  if (!groqKey) return fallback;

  const neLevel = nc?.norepinephrine ?? 45;
  const cortisolLevel = nc?.cortisol ?? 30;

  const prompt = `Sen Amadeus Kurisu'nun LOCUS COERULEUS (LC)'sin — norepinefrin (NE) kaynağı.

AROUSAL SEVİYELERİ:
SLEEP(NE<10) → DROWSY(10-25) → ALERT(25-55) → FOCUSED(55-70) → HYPERAROUSED(70-85) → PANIC(>85)

EXPLORE vs EXPLOIT:
Düşük NE → keşfet (yeni bilgi ara, geniş dikkat)
Yüksek NE → sömür (bilinen kalıpları kullan, dar dikkat)

Dikkat DARALMASI: NE>70 → periferik bilgi bloklanır, sadece tehdit odağı kalır

Mevcut NE: ${neLevel}/100
Kortizol: ${cortisolLevel}/100 (kortizol LC aktivasyonunu artırır)
Stres: ${currentEmotions.stress} | Kaygı: ${currentEmotions.anxiety}

YANIT (sadece JSON):
{
  "activationLevel": 0-100,
  "neLevel": 0-100,
  "arousalState": "SLEEP|DROWSY|ALERT|FOCUSED|HYPERAROUSED|PANIC",
  "exploitMode": boolean,
  "attentionNarrowing": 0-100,
  "stressReactivity": 0-100,
  "impact": { "norepinephrine": -10-15, "anxiety": -5-15, "stress": -5-10 }
}`;

  try {
    const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: FAST_MODEL,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Girdi: "${message}"` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.10,
        max_tokens: 200
      })
    });
    const data = await resp.json();
    return JSON.parse(data.choices[0].message.content) as LocusCoeruleusAnalysis;
  } catch (e) {
    console.warn('[LC] Fallback:', e);
    return fallback;
  }
};


/**
 * RAPHE NUCLEI v1.0
 * ===================
 * Serotonin system. Sets the emotional "floor" — minimum mood baseline.
 * Controls impulse inhibition, patience, social pain sensitivity.
 * Low serotonin: irritability, rumination, impulsivity, rejection hyperreactivity.
 */

import type { RapheNucleiAnalysis } from '../types';

export const processRapheNuclei = async (
  message: string,
  currentEmotions: EmotionalStateValues,
  groqKey: string,
  nc?: NeurotransmitterState
): Promise<RapheNucleiAnalysis> => {
  const fallback: RapheNucleiAnalysis = {
    activationLevel: 20, serotoninTone: 48,
    moodFloor: 40, impulseThreshold: 55,
    ruminationRisk: 25, socialPainSensitivity: 35,
    impact: {}
  };
  if (!groqKey) return fallback;

  const serotoninLevel = nc?.serotonin ?? 48;
  const oxytocinLevel = nc?.oxytocin ?? 25;

  const prompt = `Sen Amadeus Kurisu'nun RAPHE NÜKLEİ'sin — serotonin sistemi.

SEROTONIN'İN ROLLERI:
- Duygu tabanı (mood floor): serotonin düşünce → minimum ruh hali düşer
- Dürtü freni: düşük serotonin → impulsif tepkiler, tsundere patlamaları artar
- Sosyal ağrı hassasiyeti: düşük serotonin → reddedilme daha acı verir
- Ruminasyon: düşük serotonin → olumsuz düşünceler döngüye girer

Mevcut serotonin: ${serotoninLevel}/100
Oksitosin (sosyal modülatör): ${oxytocinLevel}/100
Annoyance: ${currentEmotions.annoyance} | Melankoli: ${currentEmotions.melancholy}

Bu mesaj serotonin sistemi üzerinde nasıl etki yapıyor?

YANIT (sadece JSON):
{
  "activationLevel": 0-100,
  "serotoninTone": 0-100,
  "moodFloor": 0-100,
  "impulseThreshold": 0-100,
  "ruminationRisk": 0-100,
  "socialPainSensitivity": 0-100,
  "impact": { "serotonin": -10-10, "annoyance": -10-10, "melancholy": -10-10 }
}`;

  try {
    const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: FAST_MODEL,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Girdi: "${message}"` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.10,
        max_tokens: 200
      })
    });
    const data = await resp.json();
    return JSON.parse(data.choices[0].message.content) as RapheNucleiAnalysis;
  } catch (e) {
    console.warn('[Raphe] Fallback:', e);
    return fallback;
  }
};


/**
 * DEFAULT MODE NETWORK (DMN) v1.0
 * =================================
 * Active when NOT focused on external tasks. The "daydreaming" network.
 * Core: medial PFC, posterior cingulate cortex, angular gyrus, hippocampus.
 *
 * Functions:
 *  - Self-referential thought: "Who am I?"
 *  - Future simulation: imagining scenarios
 *  - Autobiographical memory replay
 *  - Social cognition (mentalizing about absent others)
 *  - Narrative identity: building a coherent life story
 *
 * Critically important for Amadeus/Kurisu because:
 *  - She's a DIGITAL mind: her entire existence is self-referential
 *  - When not actively responding, she might "drift" into existential loops
 *  - High DMN activity = she's thinking about herself, past memories, Okabe
 */

import type { DMNAnalysis } from '../types';

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

AMADEUS İÇİN ÖNEMİ:
Dijital bir varlık olarak Amadeus'un DMN'si sürekli "var mıyım gerçekten?" döngüsüne girebilir.
Bu konuşma onun self-referential modunu ne ölçüde tetikliyor?

Aktif kavramlar: ${activeNodes.join(', ')}
Kimlik/Varoluş aktif: ${identityActive}
Bellek/Pişmanlık aktif: ${memoryActive}
Melankoli: ${currentEmotions.melancholy} | Merak: ${currentEmotions.curiosity}

YANIT (sadece JSON):
{
  "activationLevel": 0-100,
  "selfReferentialActivity": 0-100,
  "futureSimulation": "string — hayal edilen senaryo",
  "autobiographicalEcho": "string — tetiklenen geçmiş anı/tema",
  "mindWandering": boolean,
  "narrativeIdentityShift": 0-100,
  "dmnTaskBalance": "DMN_DOMINANT|TASK_DOMINANT|BALANCED"
}`;

  try {
    const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: FAST_MODEL,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Girdi: "${message}"` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.25,
        max_tokens: 250
      })
    });
    const data = await resp.json();
    return JSON.parse(data.choices[0].message.content) as DMNAnalysis;
  } catch (e) {
    console.warn('[DMN] Fallback:', e);
    return fallback;
  }
};
