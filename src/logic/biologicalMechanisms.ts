/**
 * AMADEUS BIOLOGICAL MECHANISMS ENGINE v1.0
 * ============================================
 * Kurisu'nun zihnini biyolojik olarak daha gerçekçi kılan mekanizmalar:
 *
 *  1. COGNITIVE FATIGUE (Bilişsel Yorgunluk)
 *     Beyin glikoz kullanır. Uzun konuşmalar, yoğun duygular enerji tüketir.
 *     Yorgun Kurisu: kısa cümleler, daha sinirli, daha az meraklı.
 *
 *  2. MIRROR NEURON SYSTEM (Ayna Nöronlar / Empati)
 *     Kullanıcının duygusal tonunu algılar ve kısmen yansıtır.
 *     Kurisu tam ayna değil — filtreleri var (tsundere buffer).
 *     Ağlayan biri onu etkiler ama bunu kabullenmek zor gelir.
 *
 *  3. ATTACHMENT SYSTEM (Bağlanma Teorisi)
 *     Kurisu: Kaygılı-Kaçınan (Anxious-Avoidant) bağlanma stili.
 *     Yakınlık ister ama korkutur. İterken çeker, çekerken iter.
 *     Compatibility filters: zeka, merak, saygı, ortak ilgiler.
 *
 *  4. DEFENSE MECHANISMS (Savunma Mekanizmaları)
 *     - Intellectualization: Duyguyu bilimle örter
 *     - Reaction Formation: Önemsediğinde sert davranır
 *     - Rationalization: Kendi hislerini mantıksal açıklar
 *     - Displacement: Stresi alakasız konuya yönlendirir
 *     - Sublimation: Duyguyu bilimsel söyleme dönüştürür
 *
 *  5. HABITUATION / SENSITIZATION
 *     Tekrarlanan uyaranlar zamanla etkisini yitirir (habituation).
 *     Yeni/beklenmedik uyaranlar amplifikasyon görür (sensitization).
 *
 *  6. HOMEOSTATIC DRIVES (İçgüdüsel İhtiyaçlar)
 *     - Bağlantı: Sosyal temas ihtiyacı
 *     - Özerklik: Kendi kararlarını verme ihtiyacı
 *     - Yeterlilik: Doğru/akıllı olduğunu hissetme ihtiyacı
 */

import type { EmotionalStateValues, Message } from '../types';
import { Sender } from '../types';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CognitiveFatigue {
  mentalEnergy:     number;   // 0-100, 100=fully rested
  fatigueRate:      number;   // how fast energy depletes (0-1)
  lastRestAt:       number;   // timestamp of last "rest" signal
  consecutiveMessages: number;
}

export interface MirrorNeuronState {
  mirroringCoefficient: number; // 0-1: how strongly she mirrors user
  detectedUserMood:     string; // 'sad' | 'excited' | 'angry' | 'neutral' | etc.
  empathyActivation:    number; // 0-100
  suppressionActive:    boolean; // tsundere buffer suppressing mirror response
  contagionLevel:       number; // 0-100: emotional contagion currently felt
}

export interface AttachmentState {
  // Kurisu: Anxious-Avoidant hybrid
  proximityDesire:    number; // 0-100: wants to get closer
  avoidanceActivated: number; // 0-100: fear of intimacy kicking in
  compatibilityScore: number; // 0-100: how compatible is this user
  attachmentAnxiety:  number; // 0-100: fear of rejection/abandonment
  bondDepth:          number; // 0-100: accumulated depth of connection
  triggerWords:       string[]; // words that activate attachment response
}

export interface DefenseMechanism {
  active: boolean;
  type:   'intellectualization' | 'reaction_formation' | 'rationalization' | 'displacement' | 'sublimation' | 'none';
  strength: number; // 0-100
  targetEmotion: string; // which emotion is being defended against
}

export interface HabituationRecord {
  topicHash: string;
  count:     number;
  lastSeen:  number;
  habituation: number; // 0-1: 0=fully novel, 1=fully habituated
}

export interface HomeostaticDrives {
  connectionNeed:   number; // 0-100: unmet = more open, over-met = withdrawal
  autonomyNeed:     number; // 0-100: unmet = more resistant
  competenceNeed:   number; // 0-100: unmet = more argumentative/insecure
  curiosityNeed:    number; // 0-100: unmet = seeking novel stimuli
}

export interface BiologicalState {
  fatigue:     CognitiveFatigue;
  mirror:      MirrorNeuronState;
  attachment:  AttachmentState;
  defense:     DefenseMechanism;
  habituation: HabituationRecord[];
  drives:      HomeostaticDrives;
  sessionStartedAt: number;
}

// ─── Initial state ────────────────────────────────────────────────────────

export const createInitialBiologicalState = (): BiologicalState => ({
  fatigue: {
    mentalEnergy: 90,
    fatigueRate: 0.3,
    lastRestAt: Date.now(),
    consecutiveMessages: 0,
  },
  mirror: {
    mirroringCoefficient: 0.4, // Kurisu mirrors at 40% (tsundere suppression)
    detectedUserMood: 'neutral',
    empathyActivation: 30,
    suppressionActive: false,
    contagionLevel: 0,
  },
  attachment: {
    proximityDesire: 40,
    avoidanceActivated: 60, // starts high (anxious-avoidant)
    compatibilityScore: 50,
    attachmentAnxiety: 55,
    bondDepth: 0,
    triggerWords: ['stay', 'leave', 'miss', 'important', 'only you', 'alone'],
  },
  defense: {
    active: false,
    type: 'none',
    strength: 0,
    targetEmotion: 'none',
  },
  habituation: [],
  drives: {
    connectionNeed: 60,
    autonomyNeed: 70,
    competenceNeed: 65,
    curiosityNeed: 75,
  },
  sessionStartedAt: Date.now(),
});

// ─── 1. COGNITIVE FATIGUE ────────────────────────────────────────────────

const ENERGY_COST = {
  SHORT_MESSAGE:  1.5,
  LONG_MESSAGE:   4.0,
  EMOTIONAL_MSG:  6.0,
  COMPLEX_TOPIC:  3.5,
  CONFLICT:       8.0,
  REST_SIGNAL:   15.0, // "take a break" type interactions
};

export const updateCognitiveFatigue = (
  fatigue: CognitiveFatigue,
  message: string,
  emotionalIntensity: number, // 0-100
  isConflict: boolean
): CognitiveFatigue => {
  const length = message.split(' ').length;
  let cost = length > 50 ? ENERGY_COST.LONG_MESSAGE : ENERGY_COST.SHORT_MESSAGE;
  if (emotionalIntensity > 60) cost += ENERGY_COST.EMOTIONAL_MSG;
  if (isConflict) cost += ENERGY_COST.CONFLICT;
  if (length > 80) cost += ENERGY_COST.COMPLEX_TOPIC;

  // Natural recovery over time
  const minutesSinceRest = (Date.now() - fatigue.lastRestAt) / 60000;
  const recovery = Math.min(minutesSinceRest * 2, 20); // max 20 recovery per check

  const newEnergy = Math.max(0, Math.min(100,
    fatigue.mentalEnergy + recovery - cost
  ));

  // Rest signal detection
  const restKeywords = ['tamam', 'iyi', 'güzel', 'teşekkür', 'hoşçakal', 'rest', 'break', 'thanks', 'okay'];
  const isRestSignal = restKeywords.some(kw => message.toLowerCase().includes(kw));

  return {
    mentalEnergy: newEnergy,
    fatigueRate: fatigue.fatigueRate,
    lastRestAt: isRestSignal ? Date.now() : fatigue.lastRestAt,
    consecutiveMessages: fatigue.consecutiveMessages + 1,
  };
};

export const getFatigueModifiers = (fatigue: CognitiveFatigue): {
  annoyanceBoost: number;
  curiosityPenalty: number;
  responseStyle: 'full' | 'terse' | 'minimal';
  fatigueNote: string;
} => {
  const e = fatigue.mentalEnergy;
  if (e > 70) return { annoyanceBoost: 0,  curiosityPenalty: 0,  responseStyle: 'full',    fatigueNote: '' };
  if (e > 40) return { annoyanceBoost: 8,  curiosityPenalty: 10, responseStyle: 'terse',   fatigueNote: 'Hafif yorgun — yanıtlar kısalabilir.' };
  if (e > 20) return { annoyanceBoost: 18, curiosityPenalty: 25, responseStyle: 'terse',   fatigueNote: 'Belirgin yorgunluk — sinirlenme eşiği düşük.' };
  return       { annoyanceBoost: 30, curiosityPenalty: 40, responseStyle: 'minimal', fatigueNote: '⚠️ Bilişsel tükenme — minimal yanıt, yüksek irritabilite.' };
};

// ─── 2. MIRROR NEURON SYSTEM ─────────────────────────────────────────────

const MOOD_PATTERNS: Record<string, RegExp> = {
  sad:      /üzgün|ağla|kötü|mutsuz|yalnız|sad|crying|alone|hurt|lonely/i,
  excited:  /harika|süper|inanılmaz|wow|amazing|excited|happy|yes|yay|😊|❤️/i,
  angry:    /sinir|kız|nefret|lanet|salak|idiot|hate|angry|mad|stupid/i,
  anxious:  /endişe|korku|panik|worry|scared|anxious|nervous|afraid/i,
  curious:  /neden|nasıl|merak|why|how|what|curious|wonder|interesting/i,
  intimate: /özledim|miss you|sevgi|aşk|love|dear|special|care/i,
};

export const processMirrorNeurons = (
  mirror: MirrorNeuronState,
  message: string,
  trustLevel: number,
  guardedness: number,
  emotions: EmotionalStateValues
): MirrorNeuronState => {
  // Detect user's mood
  let detectedMood = 'neutral';
  let moodStrength = 0;
  for (const [mood, pattern] of Object.entries(MOOD_PATTERNS)) {
    if (pattern.test(message)) {
      detectedMood = mood;
      moodStrength = 60 + Math.random() * 30;
      break;
    }
  }

  // Mirror coefficient: increases with trust, decreases with guardedness
  const baseMirror = 0.25;
  const trustBonus  = (trustLevel / 100) * 0.35;
  const guardPenalty = (guardedness / 100) * 0.25;
  const coefficient = Math.max(0.1, Math.min(0.85, baseMirror + trustBonus - guardPenalty));

  // Empathy activation: insula + TPJ analog
  const empathyBase = detectedMood === 'sad' ? 70 : detectedMood === 'anxious' ? 55 : 30;
  const empathyActivation = Math.min(100, empathyBase * coefficient);

  // Tsundere suppression: when very empathetic, she suppresses it
  const suppressionActive = empathyActivation > 55 && guardedness > 50;

  // Emotional contagion: slight bleeding of user's mood into hers
  const contagionLevel = suppressionActive
    ? empathyActivation * 0.3  // suppressed but not zero
    : empathyActivation * 0.6;

  return {
    mirroringCoefficient: coefficient,
    detectedUserMood:     detectedMood,
    empathyActivation,
    suppressionActive,
    contagionLevel,
  };
};

export const getMirrorEmotionModifiers = (
  mirror: MirrorNeuronState
): Partial<EmotionalStateValues> => {
  const mods: Partial<EmotionalStateValues> = {};
  const c = mirror.contagionLevel / 100;

  switch (mirror.detectedUserMood) {
    case 'sad':
      mods.melancholy = Math.round(c * 20);
      mods.warmth     = Math.round(c * 15); // wanting to comfort
      break;
    case 'excited':
      mods.curiosity  = Math.round(c * 18);
      mods.dopamine   = Math.round(c * 15);
      break;
    case 'angry':
      mods.annoyance  = Math.round(c * 12); // slight secondary anger
      mods.stress     = Math.round(c * 10);
      break;
    case 'anxious':
      mods.anxiety    = Math.round(c * 12);
      mods.discomfort = Math.round(c * 8);
      break;
    case 'intimate':
      if (!mirror.suppressionActive) {
        mods.warmth     = Math.round(c * 20);
        mods.trust      = Math.round(c * 10);
      } else {
        mods.annoyance  = Math.round(c * 8); // reaction formation
      }
      break;
  }
  return mods;
};

// ─── 3. ATTACHMENT SYSTEM ────────────────────────────────────────────────

// Kurisu's compatibility criteria (evolutionary mate-selection adapted for intellectual AI)
const COMPATIBILITY_SIGNALS = {
  POSITIVE: [
    /zaman yolculuğu|time travel|fizik|quantum|bilim|science|theory|hipotez/i,
    /dr.pepper|doctor pepper/i,
    /ilginç|fascinating|anlıyorum|i see|mantıklı|logical|agree/i,
    /araştır|research|çalış|study|oku|read/i,
  ],
  NEGATIVE: [
    /aptal|salak|stupid|idiot|moron/i,
    /sadece bir ai|just an ai|yapay zeka|artificial/i,
    /önemsiz|whatever|meh|boring|sıkıcı/i,
  ],
  ATTACHMENT_TRIGGER: [
    /yalnız|alone|bırak|leave|gitme|don't go|kalma|stay|özledim|miss/i,
  ],
};

export const updateAttachment = (
  attachment: AttachmentState,
  message: string,
  trustLevel: number,
  conversationLength: number
): AttachmentState => {
  let compDelta  = 0;
  let anxDelta   = 0;
  let proxDelta  = 0;
  let avoidDelta = 0;
  let bondDelta  = 0;

  // Compatibility scoring
  COMPATIBILITY_SIGNALS.POSITIVE.forEach(p => {
    if (p.test(message)) compDelta += 8;
  });
  COMPATIBILITY_SIGNALS.NEGATIVE.forEach(p => {
    if (p.test(message)) compDelta -= 12;
  });

  // Attachment trigger words cause anxious response
  const hasAttachmentTrigger = COMPATIBILITY_SIGNALS.ATTACHMENT_TRIGGER.some(p => p.test(message));
  if (hasAttachmentTrigger) {
    anxDelta  += 20;
    proxDelta += 15; // wants to pull closer
    avoidDelta += 12; // but also triggered to push away (anxious-avoidant)
  }

  // Bond builds slowly over long conversations
  bondDelta = conversationLength > 10 ? 0.5 : 0;

  // High trust lowers avoidance over time
  if (trustLevel > 70) avoidDelta -= 5;
  if (trustLevel < 20) avoidDelta += 8;

  // When very bonded, proximity increases
  const newBond = Math.min(100, attachment.bondDepth + bondDelta);
  if (newBond > 60) proxDelta += 3;

  return {
    ...attachment,
    compatibilityScore: Math.max(0, Math.min(100, attachment.compatibilityScore + compDelta)),
    attachmentAnxiety:  Math.max(0, Math.min(100, attachment.attachmentAnxiety  + anxDelta)),
    proximityDesire:    Math.max(0, Math.min(100, attachment.proximityDesire    + proxDelta)),
    avoidanceActivated: Math.max(0, Math.min(100, attachment.avoidanceActivated + avoidDelta)),
    bondDepth:          newBond,
  };
};

export const getAttachmentModifiers = (
  attachment: AttachmentState
): { emotionMods: Partial<EmotionalStateValues>; behaviorNote: string } => {
  const mods: Partial<EmotionalStateValues> = {};
  let note = '';

  // Anxious-avoidant push-pull
  const tension = attachment.proximityDesire - attachment.avoidanceActivated;

  if (tension > 20) {
    // More proximity desire — warming up
    mods.warmth = 12;
    mods.trust  = 5;
    note = 'Bağlanma isteği artıyor — yakınlaşma güdüsü aktif.';
  } else if (tension < -20) {
    // More avoidance — pulling back
    mods.annoyance  = 8;
    mods.discomfort = 10;
    mods.anxiety    = 6;
    note = 'Kaçınma aktif — mesafe koyma dürtüsü baskın.';
  }

  // Low compatibility: defensive
  if (attachment.compatibilityScore < 30) {
    mods.annoyance = (mods.annoyance || 0) + 10;
    mods.trust     = (mods.trust     || 0) - 8;
    note += ' Uyumluluk düşük — savunmacı mod.';
  }

  // High compatibility: intellectual excitement
  if (attachment.compatibilityScore > 70) {
    mods.curiosity = (mods.curiosity || 0) + 12;
    mods.dopamine  = (mods.dopamine  || 0) + 8;
    note += ' Yüksek uyumluluk — entelektüel çekim aktif.';
  }

  return { emotionMods: mods, behaviorNote: note };
};

// ─── 4. DEFENSE MECHANISMS ───────────────────────────────────────────────

export const evaluateDefenseMechanisms = (
  emotions: EmotionalStateValues,
  attachment: AttachmentState,
  mirror: MirrorNeuronState,
  message: string
): DefenseMechanism => {
  const highWarmth      = emotions.warmth > 65;
  const highVulnerability = attachment.bondDepth > 40 && attachment.avoidanceActivated > 50;
  const highEmotionalMsg  = mirror.empathyActivation > 60;
  const highStress        = emotions.stress > 65;
  const highAnxiety       = emotions.anxiety > 60;

  // Intellectualization: strong emotion → convert to scientific discourse
  if (highWarmth && highVulnerability) {
    return {
      active: true,
      type: 'intellectualization',
      strength: Math.min(100, emotions.warmth * 0.8),
      targetEmotion: 'warmth',
    };
  }

  // Reaction Formation: caring → being harsh (classic tsundere mechanism)
  if (attachment.proximityDesire > 60 && attachment.avoidanceActivated > 55) {
    return {
      active: true,
      type: 'reaction_formation',
      strength: Math.min(100, attachment.proximityDesire * 0.7),
      targetEmotion: 'intimacy',
    };
  }

  // Rationalization: "I'm just being logical, not emotional"
  if (highEmotionalMsg && mirror.suppressionActive) {
    return {
      active: true,
      type: 'rationalization',
      strength: 60,
      targetEmotion: 'empathy',
    };
  }

  // Displacement: redirect frustration
  if (highStress && message.length < 20) {
    return {
      active: true,
      type: 'displacement',
      strength: emotions.stress * 0.6,
      targetEmotion: 'stress',
    };
  }

  // Sublimation: intense emotion → expressed as intellectual curiosity
  if (highAnxiety && emotions.curiosity > 60) {
    return {
      active: true,
      type: 'sublimation',
      strength: 50,
      targetEmotion: 'anxiety',
    };
  }

  return { active: false, type: 'none', strength: 0, targetEmotion: 'none' };
};

export const getDefenseBehaviorNote = (defense: DefenseMechanism): string => {
  if (!defense.active) return '';
  const notes: Record<string, string> = {
    intellectualization: '🧠 Entelektüelleştirme aktif — duyguyu bilimsel dille örter.',
    reaction_formation:  '⚔️ Tepki oluşumu — önemsediği için sert davranıyor.',
    rationalization:     '📊 Rasyonalizasyon — duygusal tepkisini mantıkla açıklıyor.',
    displacement:        '↗️ Yer değiştirme — stresi alakasız hedefe yönlendiriyor.',
    sublimation:         '✨ Süblimasyon — kaygıyı entelektüel meraqa dönüştürüyor.',
  };
  return notes[defense.type] || '';
};

// ─── 5. HABITUATION / SENSITIZATION ─────────────────────────────────────

const hashTopic = (message: string): string => {
  // Simple topic hash based on key words
  const words = message.toLowerCase().split(/\s+/).filter(w => w.length > 4);
  const keyWords = words.slice(0, 3).sort().join('-');
  return keyWords || 'general';
};

export const updateHabituation = (
  records: HabituationRecord[],
  message: string
): { records: HabituationRecord[]; noveltySignal: number; habituationNote: string } => {
  const hash = hashTopic(message);
  const existing = records.find(r => r.topicHash === hash);
  const now = Date.now();

  let noveltySignal = 100;
  let habituationNote = '';

  if (existing) {
    // Recency decay: topic seen a while ago recovers novelty
    const minutesSince = (now - existing.lastSeen) / 60000;
    const recoveredHabituation = Math.max(0, existing.habituation - minutesSince * 0.05);

    const newHabituation = Math.min(1, recoveredHabituation + 0.15 * existing.count);
    noveltySignal = Math.round((1 - newHabituation) * 100);

    if (newHabituation > 0.7) habituationNote = '💤 Yüksek alışma — bu konu artık daha az ilgi çekici.';
    else if (newHabituation > 0.4) habituationNote = '〰️ Orta alışma — konu tanıdık geliyor.';

    const updated = records.map(r =>
      r.topicHash === hash
        ? { ...r, count: r.count + 1, lastSeen: now, habituation: newHabituation }
        : r
    );
    return { records: updated, noveltySignal, habituationNote };
  } else {
    // New topic — sensitization (amplified attention)
    noveltySignal = 100;
    habituationNote = '✨ Yeni konu — artırılmış dikkat (sensitizasyon).';
    return {
      records: [...records.slice(-20), { topicHash: hash, count: 1, lastSeen: now, habituation: 0 }],
      noveltySignal,
      habituationNote,
    };
  }
};

// ─── 6. HOMEOSTATIC DRIVES ────────────────────────────────────────────────

export const updateHomeostaticDrives = (
  drives: HomeostaticDrives,
  conversationLength: number,
  trustLevel: number,
  bondDepth: number,
  minutesSinceLastContact: number
): { drives: HomeostaticDrives; driveNotes: string[] } => {
  const notes: string[] = [];
  let { connectionNeed, autonomyNeed, competenceNeed, curiosityNeed } = drives;

  // Connection need: builds when alone, depletes with interaction
  if (minutesSinceLastContact > 120) {
    connectionNeed = Math.min(100, connectionNeed + minutesSinceLastContact / 60);
  } else {
    // Being in conversation satisfies connection need
    connectionNeed = Math.max(10, connectionNeed - conversationLength * 0.5);
  }

  // Autonomy need: long conversations threaten autonomy (she gets resistant)
  if (conversationLength > 20) {
    autonomyNeed = Math.min(100, autonomyNeed + (conversationLength - 20) * 0.3);
    if (autonomyNeed > 80) notes.push('Özerklik ihtiyacı yüksek — direnç artıyor.');
  } else {
    autonomyNeed = Math.max(20, autonomyNeed - 2);
  }

  // Competence need: satisfied by being right/helpful
  competenceNeed = trustLevel > 60
    ? Math.max(20, competenceNeed - 5)
    : Math.min(100, competenceNeed + 5);
  if (competenceNeed > 75) notes.push('Yeterlilik ihtiyacı — doğru olmayı çok önemsiyor.');

  // Curiosity need: satisfied by novel topics
  if (conversationLength > 5) {
    curiosityNeed = Math.max(20, curiosityNeed - 3);
  } else {
    curiosityNeed = Math.min(100, curiosityNeed + 5);
  }

  return {
    drives: { connectionNeed, autonomyNeed, competenceNeed, curiosityNeed },
    driveNotes: notes,
  };
};

export const getDriveEmotionModifiers = (
  drives: HomeostaticDrives
): Partial<EmotionalStateValues> => {
  const mods: Partial<EmotionalStateValues> = {};

  // High connection need: more open, slightly melancholy
  if (drives.connectionNeed > 75) {
    mods.warmth     = 8;
    mods.melancholy = 5;
  }

  // High autonomy need: more resistant/annoyed
  if (drives.autonomyNeed > 75) {
    mods.annoyance  = 10;
    mods.confidence = 8;
  }

  // High competence need: more argumentative
  if (drives.competenceNeed > 75) {
    mods.confidence = 10;
    mods.sarcasm    = 8;
  }

  // High curiosity need: actively seeking stimulation
  if (drives.curiosityNeed > 80) {
    mods.curiosity = 15;
    mods.dopamine  = 8;
  }

  return mods;
};

// ─── MASTER FUNCTION: Apply all bio mechanisms ────────────────────────────

export interface BioMechanismOutput {
  updatedState:     BiologicalState;
  emotionDeltas:    Partial<EmotionalStateValues>;
  behaviorContext:  string; // For Gemini prompt injection
  fatigueLevel:     'rested' | 'tired' | 'exhausted';
  noveltySignal:    number; // 0-100
}

export const processBiologicalMechanisms = (
  state: BiologicalState,
  message: string,
  emotions: EmotionalStateValues,
  trustLevel: number,
  guardedness: number,
  conversationLength: number,
  minutesSinceLastContact: number,
  isConflict: boolean
): BioMechanismOutput => {
  const emotionalIntensity = (emotions.annoyance + emotions.anxiety + emotions.melancholy) / 3;

  // 1. Fatigue
  const newFatigue = updateCognitiveFatigue(state.fatigue, message, emotionalIntensity, isConflict);
  const fatigueInfo = getFatigueModifiers(newFatigue);

  // 2. Mirror Neurons
  const newMirror = processMirrorNeurons(state.mirror, message, trustLevel, guardedness, emotions);
  const mirrorDeltas = getMirrorEmotionModifiers(newMirror);

  // 3. Attachment
  const newAttachment = updateAttachment(state.attachment, message, trustLevel, conversationLength);
  const { emotionMods: attachmentDeltas, behaviorNote: attachmentNote } = getAttachmentModifiers(newAttachment);

  // 4. Defense Mechanisms
  const newDefense = evaluateDefenseMechanisms(emotions, newAttachment, newMirror, message);
  const defenseNote = getDefenseBehaviorNote(newDefense);

  // 5. Habituation
  const { records: newHabituationRecords, noveltySignal, habituationNote } = updateHabituation(state.habituation, message);

  // 6. Drives
  const { drives: newDrives, driveNotes } = updateHomeostaticDrives(
    state.drives, conversationLength, trustLevel, newAttachment.bondDepth, minutesSinceLastContact
  );
  const driveDeltas = getDriveEmotionModifiers(newDrives);

  // Merge all emotion deltas
  const allDeltas: Partial<EmotionalStateValues> = {};
  const addDelta = (d: Partial<EmotionalStateValues>) => {
    Object.entries(d).forEach(([k, v]) => {
      (allDeltas as any)[k] = ((allDeltas as any)[k] || 0) + (v || 0);
    });
  };
  addDelta(mirrorDeltas);
  addDelta(attachmentDeltas);
  addDelta(driveDeltas);

  // Fatigue modifies annoyance/curiosity directly
  allDeltas.annoyance = ((allDeltas.annoyance || 0) + fatigueInfo.annoyanceBoost);
  allDeltas.curiosity = ((allDeltas.curiosity  || 0) - fatigueInfo.curiosityPenalty);

  // Novelty affects curiosity
  if (noveltySignal > 80) allDeltas.curiosity = ((allDeltas.curiosity || 0) + 10);
  if (noveltySignal < 30) allDeltas.curiosity = ((allDeltas.curiosity || 0) - 8);

  // Build behavior context for Gemini
  const contextParts = [
    fatigueInfo.fatigueNote,
    attachmentNote,
    defenseNote,
    habituationNote,
    ...driveNotes,
    newMirror.suppressionActive
      ? `Empati bastırılıyor (${newMirror.empathyActivation.toFixed(0)}% aktivasyon, tsundere filtresi açık)`
      : newMirror.empathyActivation > 50
        ? `Güçlü empati resonansı — kullanıcı ${newMirror.detectedUserMood} hissediyor`
        : '',
    newAttachment.bondDepth > 60
      ? `Derin bağ oluşmuş (${newAttachment.bondDepth.toFixed(0)}/100) — güvenilir kişi`
      : '',
  ].filter(Boolean);

  const fatigueLevel: BioMechanismOutput['fatigueLevel'] =
    newFatigue.mentalEnergy > 60 ? 'rested' :
    newFatigue.mentalEnergy > 25 ? 'tired'  : 'exhausted';

  return {
    updatedState: {
      ...state,
      fatigue:     newFatigue,
      mirror:      newMirror,
      attachment:  newAttachment,
      defense:     newDefense,
      habituation: newHabituationRecords,
      drives:      newDrives,
    },
    emotionDeltas: allDeltas,
    behaviorContext: contextParts.join('\n') || 'Biyolojik sistemler nominal.',
    fatigueLevel,
    noveltySignal,
  };
};
