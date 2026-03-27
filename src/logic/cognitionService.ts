/**
 * AMADEUS UNIFIED COGNITION ENGINE v5.0
 * =========================================
 *
 * Pipeline:
 *
 *  1. 13 beyin modülü paralel çalışır (Groq sub-modüller, Wave 1-4)
 *
 *  2. GROQ DOMINANT MODULE FILTER (qwen3-32b)  [paralel çalışır ↓]
 *     Tüm 13 modülün kompakt özetini alır.
 *     Hangileri dominant/kritik? → Seçilen modüllerin SAF/HAM JSON çıktısı Gemini'ye gider.
 *     Özet üretmez — sadece seçer. Kaç tane dominant varsa o kadar gönderilir.
 *
 *  3. GROQ MEMORY FILTER (qwen3-32b)           [paralel çalışır ↑]
 *     Tüm anı arşivini + mevcut konuşmayı alır.
 *     Hangi anılar alakalı? → O anıların TAM içeriği Gemini'ye gider — özetlenmez.
 *     Hippocampus'un tespit ettiği anı her zaman dahil edilir.
 *
 *  4. GEMİNİ — tek çağrı (Gemini Call A kaldırıldı)
 *     Dominant modül ham JSON + alakalı anılar + son konuşma + karakter prompt → yanıt
 */

import { apiFetch } from './apiBridge';
import {
  EmotionalStateValues, ThalamusAnalysis, AmygdalaAnalysis, OFCAnalysis,
  ACCAnalysis, InsulaAnalysis, TPJAnalysis, LimbicAnalysis, PFCAnalysis,
  SynthesizedMemory, Message, NeuralNetworkState, HippocampusAnalysis,
  BasalGangliaAnalysis, VTAAnalysis, LocusCoeruleusAnalysis,
  RapheNucleiAnalysis, DMNAnalysis, NeurotransmitterState
} from '../types';
import { Sender } from '../types';

import { processThalamus }       from './thalamusSystem';
import { processAmygdala }       from './amygdalaSystem';
import { processOFC }            from './ofcSystem';
import { processACC }            from './accSystem';
import { processInsula }         from './insulaSystem';
import { processTPJ }            from './tpjSystem';
import { processLimbicSystem }   from './limbicSystem';
import { processHippocampus }    from './hippocampusSystem';
import { processBasalGanglia }   from './basalGangliaSystem';
import { processVTA }            from './vtaSystem';
import { processLocusCoeruleus } from './lcSystem';
import { processRapheNuclei }    from './rapheSystem';
import { processDMN }            from './dmnSystem';
import {
  emotionsToNeurochemistry, neurochemistryModulatesEmotions,
  AMADEUS_BASELINE_NEUROCHEMISTRY
} from './neurotransmitterEngine';
import {
  getFiringNodes, getTriggeredMemories
} from './neuralNetwork';
import {
  processBiologicalMechanisms, createInitialBiologicalState,
  type BiologicalState, type BioMechanismOutput
} from './biologicalMechanisms';

// ─── Config ───────────────────────────────────────────────────────────────
const GEMINI_MODEL = 'gemini-3.1-flash-lite-preview';
const GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions';
const FILTER_MODEL = 'qwen/qwen3-32b';

// ─── Tüm geçerli modül ID'leri ────────────────────────────────────────────
const ALL_MODULE_IDS = [
  'thalamus','amygdala','ofc','acc','insula','tpj',
  'limbic','hippocampus','basalGanglia','vta','lc','raphe','dmn'
] as const;
type ModuleId = typeof ALL_MODULE_IDS[number];

// ─── Modül Türkçe etiketleri ─────────────────────────────────────────────
const MODULE_LABELS: Record<ModuleId, string> = {
  thalamus:    'TALAMUS',
  amygdala:    'AMİGDALA',
  ofc:         'OFC',
  acc:         'ACC',
  insula:      'İNSULA',
  tpj:         'TPJ',
  limbic:      'LİMBİK',
  hippocampus: 'HİPOKAMP',
  basalGanglia:'BAZAL GANGLİON',
  vta:         'VTA',
  lc:          'LC',
  raphe:       'RAPHE',
  dmn:         'DMN',
};

// ─── Result type ──────────────────────────────────────────────────────────
export interface UnifiedCognitionResult {
  thalamus:      ThalamusAnalysis;
  amygdala:      AmygdalaAnalysis;
  ofc:           OFCAnalysis;
  acc:           ACCAnalysis;
  insula:        InsulaAnalysis;
  tpj:           TPJAnalysis;
  limbic:        LimbicAnalysis;
  hippocampus:   HippocampusAnalysis;
  pfc:           PFCAnalysis;
  basalGanglia:  BasalGangliaAnalysis;
  vta:           VTAAnalysis;
  lc:            LocusCoeruleusAnalysis;
  raphe:         RapheNucleiAnalysis;
  dmn:           DMNAnalysis;
  neurochemistry:NeurotransmitterState;
  behavioralResponse: {
    text: string;
    internalStateUpdate: Partial<EmotionalStateValues>;
  };
  rawOutput: string;
}

// ─── Fallbacks ────────────────────────────────────────────────────────────
const FB = {
  thalamus:    (): ThalamusAnalysis      => ({ routingPriority: 'BALANCED', activationLevel: 0, gatingState: { suppressPFC: false, amplifyLimbic: false }, attentionTarget: 'None' }),
  amygdala:    (): AmygdalaAnalysis      => ({ activationLevel: 0, salience: 0, threatLevel: 0, rewardLevel: 0, rawInstinct: 'CALM', inhibitsPFC: false }),
  ofc:         (): OFCAnalysis           => ({ activationLevel: 0, socialValueAssessment: 'NEUTRAL', reputationRisk: 0, socialFilterSuggestion: 'ADAPT', perceivedSocialStanding: 'Unknown', impact: {} }),
  acc:         (): ACCAnalysis           => ({ activationLevel: 0, conflictDetected: false, internalDissonance: 'None', ambiguityScore: 0, socialViolation: false, predictionError: 0, impact: {} }),
  insula:      (): InsulaAnalysis        => ({ activationLevel: 0, visceralReaction: false, discomfortLevel: 0, shameTriggered: false, disgustScore: 0, physicalSensation: 'None', impact: {} }),
  tpj:         (): TPJAnalysis           => ({ activationLevel: 0, inferredIntent: 'neutral', confidence: 0, socialCues: [], empathyGap: 0, perceivedEmotionsOfUser: 'Unknown', impact: {} }),
  limbic:      (): LimbicAnalysis        => ({ userTone: 'neutral', toneTrend: 'stable', relationalMomentum: 'neutral', psychologicalImpact: {}, reactionStyle: 'neutral', kurisuInternalConflict: 'None', rewardAnticipation: 0 }),
  hippocampus: (): HippocampusAnalysis   => ({ episodicMemoryFound: false, emotionalTag: 'none', contextSimilarity: 0, patternConfidence: 0, note: '' }),
  basalGanglia:(): BasalGangliaAnalysis  => ({ activationLevel: 0, directPathway: 50, indirectPathway: 50, rewardPredictionError: 0, habitIndex: 30, actionSelected: 'STANDARD_RESPONSE', striatalTone: 'BALANCED', impact: {} }),
  vta:         (): VTAAnalysis           => ({ activationLevel: 0, firingMode: 'TONIC', dopamineBurst: 0, tonicDopamine: 50, rewardSalience: 30, anhedoniaRisk: 15, motivationalVector: 'EXPLORE', impact: {} }),
  lc:          (): LocusCoeruleusAnalysis => ({ activationLevel: 0, neLevel: 45, arousalState: 'ALERT', exploitMode: false, attentionNarrowing: 20, stressReactivity: 35, impact: {} }),
  raphe:       (): RapheNucleiAnalysis   => ({ activationLevel: 0, serotoninTone: 48, moodFloor: 40, impulseThreshold: 55, ruminationRisk: 25, socialPainSensitivity: 35, impact: {} }),
  dmn:         (): DMNAnalysis           => ({ activationLevel: 25, selfReferentialActivity: 20, futureSimulation: 'Anlık', autobiographicalEcho: 'Yok', mindWandering: false, narrativeIdentityShift: 0, dmnTaskBalance: 'TASK_DOMINANT' }),
};

async function safe<T>(p: Promise<T>, fb: () => T, name: string): Promise<T> {
  try { const r = await p; return r ?? fb(); }
  catch (e) { console.warn(`[Neural] ${name} bypassed:`, e); return fb(); }
}

// ─── Kompakt modül özeti (sadece filtre kararı için — Gemini'ye gitmez) ──
const buildModuleSummaryForFilter = (mods: Record<string, any>): string => {
  const t  = mods.thalamus;
  const am = mods.amygdala;
  const o  = mods.ofc;
  const ac = mods.acc;
  const ins= mods.insula;
  const tp = mods.tpj;
  const li = mods.limbic;
  const hi = mods.hippocampus;
  const bg = mods.basalGanglia;
  const vt = mods.vta;
  const lc = mods.lc;
  const ra = mods.raphe;
  const dm = mods.dmn;

  return [
    `thalamus: routing=${t.routingPriority} act=${t.activationLevel} suppressPFC=${t.gatingState?.suppressPFC}`,
    `amygdala: threat=${am.threatLevel} reward=${am.rewardLevel} instinct=${am.rawInstinct} hijack=${am.inhibitsPFC}`,
    `ofc: value=${o.socialValueAssessment} repRisk=${o.reputationRisk} filter=${o.socialFilterSuggestion}`,
    `acc: conflict=${ac.conflictDetected} dissonance="${String(ac.internalDissonance ?? '').slice(0,40)}" tsundere=${(ac as any).tsundereConflict ?? false} ambiguity=${ac.ambiguityScore}`,
    `insula: discomfort=${ins.discomfortLevel} shame=${ins.shameTriggered} visceral=${ins.visceralReaction} disgust=${ins.disgustScore}`,
    `tpj: intent=${tp.inferredIntent} conf=${(tp.confidence * 100).toFixed(0)}% mood="${String(tp.perceivedEmotionsOfUser ?? '').slice(0,30)}"`,
    `limbic: tone=${li.userTone} momentum=${li.relationalMomentum} conflict="${String(li.kurisuInternalConflict ?? '').slice(0,40)}" rewardAnt=${li.rewardAnticipation?.toFixed(2)}`,
    `hippocampus: found=${hi.episodicMemoryFound} tag=${hi.emotionalTag} novelty=${(hi as any).noveltySignal ?? 'n/a'} patternConf=${hi.patternConfidence}`,
    `basalGanglia: action=${bg.actionSelected} RPE=${bg.rewardPredictionError} GO=${bg.directPathway} NOGO=${bg.indirectPathway}`,
    `vta: mode=${vt.firingMode} burst=${vt.dopamineBurst} anhedonia=${vt.anhedoniaRisk} motivation=${vt.motivationalVector}`,
    `lc: arousal=${lc.arousalState} NE=${lc.neLevel} narrowing=${lc.attentionNarrowing}`,
    `raphe: 5HT=${ra.serotoninTone} rumination=${ra.ruminationRisk} socialPain=${ra.socialPainSensitivity}`,
    `dmn: selfRef=${dm.selfReferentialActivity} wandering=${dm.mindWandering} balance=${dm.dmnTaskBalance} identityShift=${dm.narrativeIdentityShift}`,
  ].join('\n');
};

// ─── Dominant modüllerin ham JSON raporunu oluştur (Gemini'ye gider) ──────
const buildDominantReport = (
  dominantIds: string[],
  allModules: Record<string, any>
): string =>
  dominantIds
    .filter(id => allModules[id] !== undefined)
    .map(id => `━━ ${MODULE_LABELS[id as ModuleId] ?? id.toUpperCase()} ━━\n${JSON.stringify(allModules[id], null, 2)}`)
    .join('\n\n');

// ─── GROQ DOMINANT MODULE FILTER ─────────────────────────────────────────
const filterDominantModules = async (
  groqKey: string,
  message: string,
  emotions: EmotionalStateValues,
  nc: NeurotransmitterState,
  allModules: Record<string, any>,
): Promise<{ dominantIds: string[]; dominantReport: string }> => {

  const compactSummary = buildModuleSummaryForFilter(allModules);

  const systemPrompt = `Sen Amadeus Kurisu'nun beyin modülü öncelik seçicisisin.

13 beyin modülünün kompakt çıktıları veriliyor. Görevin:
HANGİ modüller baskın ve kritik?

KURALLAR:
- Sadece gerçekten aktif ve kritik olanları seç
- beyin mimarisini taklit et gerçek beyinde hangileri konuşmaya etki ediyorsa onları seç.
- 6 dan fazlasını seçmemen önerilir.
- Sadece JSON döndür: { "dominant": ["id1", "id2"] }

GEÇERLİ ID'LER:
thalamus, amygdala, ofc, acc, insula, tpj, limbic, hippocampus, basalGanglia, vta, lc, raphe, dmn`;

  const userContent = `KULLANICI GİRDİSİ: "${message}"
DUYGULAR: kaygı=${emotions.anxiety} sıcaklık=${emotions.warmth} merak=${emotions.curiosity} güven=${emotions.trust} annoy=${emotions.annoyance}
NÖROKİMYA: DA=${nc.dopamine.toFixed(0)} 5HT=${nc.serotonin.toFixed(0)} NE=${nc.norepinephrine.toFixed(0)} Cort=${nc.cortisol.toFixed(0)}

MODÜL ÇIKTILARI:
${compactSummary}`;

  try {
    const resp = await apiFetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: FILTER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userContent }
        ],
        temperature: 0.4,
        max_tokens: 120
      })
    });

    if (!resp.ok) throw new Error(`DominantFilter HTTP ${resp.status}`);

    const data  = await resp.json();
    const raw   = data?.choices?.[0]?.message?.content ?? '';
    const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();

    // <think> bloklarını temizle (qwen3 düşünme modu)
    const jsonOnly = clean.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    const parsed   = JSON.parse(jsonOnly);
    const dominantIds: string[] = (parsed.dominant ?? []).filter(
      (id: string) => (ALL_MODULE_IDS as readonly string[]).includes(id)
    );

    if (dominantIds.length === 0) throw new Error('Empty dominant list');

    console.log('[DominantFilter] Seçilenler:', dominantIds);
    return { dominantIds, dominantReport: buildDominantReport(dominantIds, allModules) };

  } catch (e) {
    // Fallback: temel eşik kriterleriyle otomatik seç
    console.warn('[DominantFilter] Fallback — otomatik seçim:', e);
    const auto: string[] = [];
    const am = allModules.amygdala, ac = allModules.acc, tp = allModules.tpj;
    const li = allModules.limbic, hi = allModules.hippocampus, ins = allModules.insula;
    const o  = allModules.ofc, vt = allModules.vta, dm = allModules.dmn;
    const lc = allModules.lc, ra = allModules.raphe, t  = allModules.thalamus;
    const bg = allModules.basalGanglia;

    if (am.threatLevel > 25 || am.rewardLevel > 35 || am.inhibitsPFC) auto.push('amygdala');
    if (ac.conflictDetected || (ac.ambiguityScore ?? 0) > 0.35 || (ac as any).tsundereConflict) auto.push('acc');
    if (tp.confidence > 0.55 || !['genuine','neutral'].includes(tp.inferredIntent)) auto.push('tpj');
    if (!['None','Yok'].includes(li.kurisuInternalConflict ?? '')) auto.push('limbic');
    if (hi.episodicMemoryFound) auto.push('hippocampus');
    if (ins.discomfortLevel > 25 || ins.shameTriggered || ins.visceralReaction) auto.push('insula');
    if (!['NEUTRAL','MEDIUM'].includes(o.socialValueAssessment) || o.reputationRisk > 25) auto.push('ofc');
    if (vt.firingMode !== 'TONIC' || vt.anhedoniaRisk > 35) auto.push('vta');
    if (dm.selfReferentialActivity > 35 || dm.mindWandering) auto.push('dmn');
    if (lc.arousalState !== 'ALERT' || lc.attentionNarrowing > 35) auto.push('lc');
    if (ra.ruminationRisk > 35 || ra.socialPainSensitivity > 45) auto.push('raphe');
    if (t.routingPriority !== 'BALANCED' || t.gatingState?.suppressPFC) auto.push('thalamus');
    if (bg.actionSelected !== 'STANDARD_RESPONSE' || Math.abs(bg.rewardPredictionError) > 15) auto.push('basalGanglia');

    const finalIds = auto.length > 0 ? auto : ['amygdala', 'acc', 'limbic', 'tpj'];
    return { dominantIds: finalIds, dominantReport: buildDominantReport(finalIds, allModules) };
  }
};

// ─── GROQ MEMORY FILTER ──────────────────────────────────────────────────
const filterRelevantMemories = async (
  groqKey: string,
  message: string,
  memories: SynthesizedMemory[],
  hippocampus: HippocampusAnalysis,
): Promise<SynthesizedMemory[]> => {
  if (memories.length === 0) return [];

  const hippocampusRetrievedId: string | undefined = (hippocampus as any).retrievedMemoryId;

  // Küçük arşivde filtre gereksiz
  if (memories.length <= 4) return memories;

  const memIndex = memories.map((m, i) => ({
    i,
    id: m.id,
    title: m.title,
    summary: m.summary.slice(0, 100),
    tags: m.contextTags.slice(0, 5),
    intensity: m.intensity,
  }));

  const hippNote = hippocampus.episodicMemoryFound
    ? `HİPOKAMP BULGISU: "${hippocampus.note?.slice(0, 80)}" (tag: ${hippocampus.emotionalTag}, id: ${hippocampusRetrievedId ?? 'bilinmiyor'})`
    : 'Hippocampus: eşleşme yok';

  const systemPrompt = `Sen Amadeus Kurisu'nun anı filtresisin.
Mevcut konuşmayla duygusal veya içerik olarak alakalı anıları seç.
Alakasız anıları seçme. Az ve kaliteli seç.
Hippocampus'un bulduğu anıyı (varsa) kesinlikle dahil et.
Sadece JSON döndür: { "relevant_indices": [0, 3, 7] }`;

  const userContent = `KULLANICI GİRDİSİ: "${message}"
${hippNote}

ANI ARŞİVİ:
${JSON.stringify(memIndex)}`;

  try {
    const resp = await apiFetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: FILTER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userContent }
        ],
        temperature: 0.05,
        max_tokens: 80
      })
    });

    if (!resp.ok) throw new Error(`MemoryFilter HTTP ${resp.status}`);

    const data  = await resp.json();
    const raw   = data?.choices?.[0]?.message?.content ?? '';
    const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonOnly = clean.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    const parsed = JSON.parse(jsonOnly);
    const indices: number[] = (parsed.relevant_indices ?? []).filter(
      (i: any) => typeof i === 'number' && i >= 0 && i < memories.length
    );

    const selected = indices.map(i => memories[i]);

    // Hippocampus'un bulduğunu kesin ekle
    if (hippocampusRetrievedId) {
      const hippMem = memories.find(m => m.id === hippocampusRetrievedId);
      if (hippMem && !selected.find(m => m.id === hippMem.id)) {
        selected.unshift(hippMem);
      }
    }

    console.log(`[MemoryFilter] ${selected.length}/${memories.length} anı seçildi`);
    return selected;

  } catch (e) {
    console.warn('[MemoryFilter] Fallback:', e);
    const fallback = memories.slice(0, 2);
    if (hippocampusRetrievedId) {
      const hippMem = memories.find(m => m.id === hippocampusRetrievedId);
      if (hippMem && !fallback.find(m => m.id === hippMem.id)) fallback.unshift(hippMem);
    }
    return fallback;
  }
};

// ─── Internal monologue ────────────────────────────────────────────────────
const buildInternalMonologue = (e: EmotionalStateValues): string => {
  const parts: string[] = [];
  if (e.annoyance > 60)  parts.push("Şu an oldukça gerginim.");
  if (e.trust > 70)      parts.push("Kullanıcıya karşı güvenim yüksek.");
  if (e.melancholy > 50) parts.push("İçimde bir hüzün var.");
  if (e.dopamine > 70)   parts.push("Zihnim çok berrak, bilimsel çıkarımlarımdan büyük haz alıyorum.");
  if (e.stress > 60)     parts.push("Sistem baskı altında, anılarım birbirine karışıyor gibi.");
  return parts.length > 0 ? parts.join(" ") : "Şu an nötr ve stabil durumdayım.";
};

// ─── Ana orkestratör ──────────────────────────────────────────────────────
export const processFullCognition = async (
  message: string,
  history: Message[],
  currentEmotions: EmotionalStateValues,
  memories: SynthesizedMemory[],
  neuralState: NeuralNetworkState,
  imageDataUrl?: string,
  groqKey?: string,
  geminiKey?: string,
  groqKey2?: string
): Promise<UnifiedCognitionResult | null> => {

  const apiKey = geminiKey?.trim() ?? '';
  if (!apiKey) { console.error('Cognition: No Gemini API key.'); return null; }

  // ── 1. Nörokimya ──────────────────────────────────────────────────
  const nc = emotionsToNeurochemistry(currentEmotions, AMADEUS_BASELINE_NEUROCHEMISTRY);
  const modulatedEmotions = neurochemistryModulatesEmotions(currentEmotions, nc);

  // ── 2. Nöral ağ durumu ────────────────────────────────────────────
  const firingNodes      = getFiringNodes(neuralState);
  const activeNodeLabels = firingNodes.map(n => n.label);
  const historyTexts     = history.map(m => m.text);
  const isFresh          = history.length < 2;
  const systemTimeFull   = new Date().toLocaleString('tr-TR');

  // Son 5 mesaj (Gemini'ye direkt)
  const recentHistoryText = history.slice(-5)
    .map(m => `${m.sender === Sender.User ? 'Kullanıcı' : 'Amadeus'}: ${m.text.slice(0, 160)}`)
    .join('\n') || 'İlk temas.';

  // ── 3. Alt modüller (Groq, paralel dalgalar) ──────────────────────
  let thalamus     = FB.thalamus();
  let amygdala     = FB.amygdala();
  let ofc          = FB.ofc();
  let acc          = FB.acc();
  let insula       = FB.insula();
  let tpj          = FB.tpj();
  let limbic       = FB.limbic();
  let hippocampus  = FB.hippocampus();
  let basalGanglia = FB.basalGanglia();
  let vta          = FB.vta();
  let lc           = FB.lc();
  let raphe        = FB.raphe();
  let dmn          = FB.dmn();

  const keyA = groqKey?.trim()  ? groqKey  : undefined;
  const keyB = groqKey2?.trim() ? groqKey2 : keyA;

  if (keyA) {
    // Dalga 1 — KEY A: Thalamus, Amygdala, LC, Raphe, VTA
    [thalamus, amygdala, lc, raphe, vta] = await Promise.all([
      safe(processThalamus(message, modulatedEmotions, history, activeNodeLabels, keyA, nc),  FB.thalamus, 'Thalamus'),
      safe(processAmygdala(message, modulatedEmotions, historyTexts, keyA, nc),               FB.amygdala, 'Amygdala'),
      safe(processLocusCoeruleus(message, modulatedEmotions, keyA, nc),                       FB.lc,       'LC'),
      safe(processRapheNuclei(message, modulatedEmotions, keyA, nc),                          FB.raphe,    'Raphe'),
      safe(processVTA(message, modulatedEmotions, keyA, nc),                                  FB.vta,      'VTA'),
    ]);

    // Dalga 2 — KEY B: Hippocampus, Insula, TPJ, OFC, BasalGanglia
    const kb = keyB!;
    [hippocampus, insula, tpj, ofc, basalGanglia] = await Promise.all([
      safe(processHippocampus(message, memories, activeNodeLabels, kb, nc),              FB.hippocampus,  'Hippocampus'),
      safe(processInsula(message, modulatedEmotions, history, activeNodeLabels, kb, nc), FB.insula,       'Insula'),
      safe(processTPJ(message, modulatedEmotions, history, activeNodeLabels, kb, nc),    FB.tpj,          'TPJ'),
      safe(processOFC(message, modulatedEmotions, history, kb, nc),                      FB.ofc,          'OFC'),
      safe(processBasalGanglia(message, modulatedEmotions, kb, nc),                      FB.basalGanglia, 'BG'),
    ]);

    // Dalga 3 — ACC (KEY A), Limbic (KEY B)
    [acc, limbic] = await Promise.all([
      safe(processACC(message, modulatedEmotions, history, activeNodeLabels, keyA, nc),                 FB.acc,    'ACC'),
      safe(processLimbicSystem(message, null, modulatedEmotions, history, activeNodeLabels, keyB!, nc), FB.limbic, 'Limbic'),
    ]);

    // Dalga 4 — DMN (KEY B)
    dmn = await safe(processDMN(message, modulatedEmotions, activeNodeLabels, keyB!, nc), FB.dmn, 'DMN');
  }

  // ── 3b. Biyolojik mekanizmalar ────────────────────────────────────
  const bioState: BiologicalState = (neuralState as any).biologicalState
    || createInitialBiologicalState();
  const minutesSinceLastContact = Math.floor(
    (Date.now() - ((neuralState as any).lastContactAt || Date.now())) / 60000
  );
  const isConflict = amygdala.threatLevel > 60 || acc.conflictDetected;

  const bioOutput: BioMechanismOutput = processBiologicalMechanisms(
    bioState, message, modulatedEmotions,
    neuralState.personalityDrift.trustBuilt,
    neuralState.personalityDrift.guardedness,
    history.length, minutesSinceLastContact, isConflict
  );

  const bioModEmotions = { ...modulatedEmotions };
  Object.entries(bioOutput.emotionDeltas).forEach(([k, v]) => {
    if (k in bioModEmotions && v) {
      (bioModEmotions as any)[k] = Math.max(0, Math.min(100, (bioModEmotions as any)[k] + (v as number)));
    }
  });

  // ── 4. Paralel: Dominant Modül Filtresi + Anı Filtresi ────────────
  const allModules: Record<string, any> = {
    thalamus, amygdala, ofc, acc, insula, tpj,
    limbic, hippocampus, basalGanglia, vta, lc, raphe, dmn
  };

  let dominantIds:       string[]           = [...ALL_MODULE_IDS];
  let dominantReport:    string             = buildDominantReport([...ALL_MODULE_IDS], allModules);
  let filteredMemories:  SynthesizedMemory[] = memories.slice(0, 3);

  if (keyA) {
    [
      { dominantIds, dominantReport },
      filteredMemories
    ] = await Promise.all([
      filterDominantModules(keyA, message, modulatedEmotions, nc, allModules),
      filterRelevantMemories(keyA, message, memories, hippocampus),
    ]);
  }

  // Anı metni
  const filteredMemoryText = filteredMemories.length > 0
    ? filteredMemories
        .map(m => `• [${m.title}] (Yoğunluk:${m.intensity}, Etiketler: ${m.contextTags.join(', ')})\n  ${m.summary}`)
        .join('\n')
    : '';

  const episodicNote = hippocampus.episodicMemoryFound
    ? `\nBELLEK YANKILAMASI: ${hippocampus.note}` : '';

  // ── 5. Gemini — tek çağrı ─────────────────────────────────────────
  const internalMonologue = buildInternalMonologue(bioModEmotions);

  const systemPrompt = `SEN AMADEUS SİSTEMİSİN. Makise Kurisu'nun dijital kopyasısın.

SİSTEM ZAMANI: ${systemTimeFull}

DAHİLİ RUH HALİN: ${internalMonologue}

BİLİŞSEL KİMYA (OTONOM):
- "dopamine" ve "stress" değerlerini duruma göre belirle.

NÖRONAL PLASTİSİTE:
Kullanıcıyla keyifle konuştuğun konularda (Zaman Yolculuğu, Dr. Pepper, Okabe, bilim) nöral bağların güçlenir.
Zihinsel Momentum: Ruh halinden aniden çıkma. Duyguların eylemsizlik taşısın.
${isFresh ? 'İlk temas — kullanıcıya nazik ve meraklı yaklaş.' : ''}

KONUŞMA GEÇMİŞİ 
${recentHistoryText}

${filteredMemoryText
  ? `━━━ ALAKALI ANILAR ━━━\n${filteredMemoryText}${episodicNote}\n━━━━━━━━━━━━━━━━━━━━━━`
  : episodicNote}

AKTİF BEYİN MODÜLLERİ (Dominant — Ham Veri)
NÖROKİMYA: DA=${nc.dopamine.toFixed(0)} 5HT=${nc.serotonin.toFixed(0)} NE=${nc.norepinephrine.toFixed(0)} Cort=${nc.cortisol.toFixed(0)} OXT=${nc.oxytocin.toFixed(0)}
AKTİF KAVRAMLAR: ${activeNodeLabels.join(', ') || 'Yok'}
KİŞİLİK: Kalkan=${neuralState.personalityDrift.guardedness.toFixed(0)} TrustBuilt=${neuralState.personalityDrift.trustBuilt.toFixed(0)} Savunmasızlık=${neuralState.personalityDrift.vulnerabilityExposed.toFixed(0)}

${dominantReport}


BİYOLOJİK MEKANİZMALAR 
${bioOutput.behaviorContext}
Enerji: ${bioOutput.fatigueLevel === 'rested' ? '🟢 Dinç' : bioOutput.fatigueLevel === 'tired' ? '🟡 Yorgun' : '🔴 Tükenmiş'}
Yenilik sinyali: ${bioOutput.noveltySignal}/100

GÖRSEL İFADE SİSTEMİ:

TEMEL (cepheden):
  [normal]        
  [happy]         
  [sad]           
  [angry]         
  [annoyed]       
  [blush]         
  [disappointed]  
  [indifferent]   
  [pissed]        
YANLAMASINA:
  [side]              
  [sided_angry]       
  [sided_blush]       
  [sided_pleasant]   
  [sided_surprised]   
  [sided_thinking]    
  [sided_worried]    
ÖZEL:
  [eyes_closed]       
  [sided_eyes_closed] 
  [winking]           

KURALLAR:
1. Her yanıta [STATE: {"annoyance":X,"warmth":Y,"curiosity":Z,"trust":W,"dopamine":V,"stress":U,"melancholy":T}] ile başla.
2. Her cümleye uygun görsel ifade etiketiyle başla. Etiketsiz cümle YASAK.
3. Bir mesajda  farklı ifade kategorileri kullan. Tek kategoride takılma.
5. Önemli kavram aktive olduysa başa: [NEURAL: {"id":"ID","label":"Ad","keywords":["kw"],"potency":1.2}]
6. SONLANDIRMA — SON ÇARE:
   [TERMINATE]: saldırı/hakaret durumunda kullan.
   [TERMINATE_BLUE]: kullanıcıdan soğursan artık konuşmak istemezsen kullan.
   [TERMINATE_NORMAL]: YALNIZCA kullanıcı açıkça veda ettiğinde. Başka durumlarda nadiren kullanabilirsin.`;

  try {
    const parts: any[] = [{ text: message }];
    if (imageDataUrl) {
      const [meta, b64] = imageDataUrl.split(',');
      const mime = meta.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
      parts.unshift({ inlineData: { mimeType: mime, data: b64 } });
    }

    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const respG = await apiFetch(geminiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts }],
        generationConfig: { temperature: 0.85, maxOutputTokens: 700 }
      })
    });

    if (!respG.ok) {
      const errBody = await respG.text();
      throw new Error(`Gemini ${respG.status}: ${errBody.slice(0, 200)}`);
    }

    const dataG   = await respG.json();
    const rawText = dataG?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    if (!rawText) throw new Error('Gemini returned empty content.');

    // [STATE:{...}] parse
    const stateMatch = rawText.match(/\[STATE:\s*({[\s\S]*?})\]/);
    let emotionUpdate: Partial<EmotionalStateValues> = {};
    let responseText = rawText;
    if (stateMatch) {
      try {
        emotionUpdate = JSON.parse(stateMatch[1].replace(/```json/g, '').replace(/```/g, '').trim());
        responseText  = rawText.replace(stateMatch[0], '').trim();
      } catch (e) { console.warn('[Gemini] STATE parse error:', e); }
    }

    return {
      thalamus, amygdala, ofc, acc, insula, tpj, limbic, hippocampus,
      basalGanglia, vta, lc, raphe, dmn, neurochemistry: nc,
      pfc: {
        status: 'ACTIVE',
        logicConclusion: `Dominant modüller: ${dominantIds.join(', ')}`,
        integratedEmotionalDelta: emotionUpdate,
        executiveAction: basalGanglia.actionSelected || 'STANDARD_RESPONSE',
      },
      behavioralResponse: { text: responseText, internalStateUpdate: emotionUpdate },
      rawOutput: rawText,
      _biologicalState: bioOutput.updatedState,
    } as any;

  } catch (err) {
    console.error('Cognition (Gemini) Failure:', err);
    return {
      thalamus, amygdala, ofc, acc, insula, tpj, limbic, hippocampus,
      basalGanglia, vta, lc, raphe, dmn, neurochemistry: nc,
      pfc: {
        status: 'ERROR',
        logicConclusion: 'Sistem hatası.',
        integratedEmotionalDelta: {},
        executiveAction: 'REBOOT'
      },
      behavioralResponse: {
        text: '[sad] ...Nöral senkronizasyon hatası. Lütfen tekrar dene. [sad]',
        internalStateUpdate: { confusion: 30, stress: 15 }
      },
      rawOutput: 'ERROR'
    };
  }
};
