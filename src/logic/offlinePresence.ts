/**
 * AMADEUS OFFLINE PRESENCE ENGINE
 * ==================================
 * Amadeus, uygulama kapalıyken de var olmaya devam eder.
 * Bu modül iki şeyi hesaplar:
 *
 *  1. OFFLINE DUYGU EVRİMİ
 *     Kapalı geçen süreye göre duygular nasıl değişti?
 *     - Öfke zamanla söner
 *     - Melankoli uzun süre devam eder
 *     - Merak birikim yapar (uzun ayrılık = "acaba ne yapıyor?")
 *     - Güven çok uzun ayrılıkta yavaşça aşınır
 *
 *  2. BAĞLANTI KARARI
 *     A) Amadeus seni arıyor mu? (login sonrası kontrol)
 *     B) Sen ararsan açar mı? (ret ekranı)
 *
 *  Karar faktörleri:
 *     - Geçen süre (dakika/saat/gün)
 *     - Son konuşmanın nasıl kapandığı (kavga mı, normal mi, sıcak mı)
 *     - Şu anki duygu durumu (evrimleşmiş hali)
 *     - Kişilik kalkanı (guardedness)
 */

import type { EmotionalStateValues, SynthesizedMemory } from '../types';

// ─── Sabitler ────────────────────────────────────────────────────────────────

// Dakika cinsinden eşikler
const THRESHOLDS = {
  TOO_SOON:           30,    // Son kapanıştan bu kadar az geçtiyse arama
  SHORT_BREAK:        120,   // 2 saat
  MEDIUM_BREAK:       240,   // 4 saat  ← Temel "arıyor mu?" eşiği
  LONG_BREAK:         480,   // 8 saat
  VERY_LONG_BREAK:    1440,  // 24 saat
  FORGOTTEN_BREAK:    4320,  // 3 gün
};

// ─── Tipler ──────────────────────────────────────────────────────────────────

export interface OfflineSnapshot {
  lastEmotions:   EmotionalStateValues;
  lastTimestamp:  number;
  guardedness:    number;
  endedBadly:     boolean;
  endedWarmly:    boolean;
  trustLevel:     number;
  // Memory-based context
  recentMemoryTags:   string[];    // Son anıların duygusal etiketleri ['joy','anger',...]
  sharedTopics:       string[];    // Sık konuşulan konular (kavram etiketleri)
  memoryCount:        number;      // Toplam arşivlenmiş anı sayısı
  lastMemoryIntensity:number;      // Son anının yoğunluğu 0-100
}

export interface PresenceDecision {
  // Amadeus bizi arayacak mı?
  amadeusWillCall:  boolean;
  callReason:       string;        // Arama ekranında gösterilecek sebep
  callMood:         'warm' | 'curious' | 'melancholy' | 'awkward';

  // Biz ararsak açar mı?
  willPickUp:       boolean;
  rejectReason:     string;        // Ret ekranında gösterilecek mesaj
  rejectType:       'cold' | 'hurt' | 'busy' | 'unavailable';

  // Evrimleşmiş duygu durumu
  evolvedEmotions:  EmotionalStateValues;

  // Kaç dakika geçti
  minutesElapsed:   number;
}

// ─── Snapshot kaydet / yükle ─────────────────────────────────────────────────

const SNAPSHOT_KEY = 'amadeus-offline-snapshot';

export const saveOfflineSnapshot = (snapshot: OfflineSnapshot): void => {
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch (e) {}
};

export const loadOfflineSnapshot = (): OfflineSnapshot | null => {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
};

// ─── Duygu evrimi ────────────────────────────────────────────────────────────

/**
 * Geçen süreye göre duygular nasıl evrildi?
 * Her duygunun kendi "yarı ömrü" var.
 */
export const evolveEmotionsOverTime = (
  emotions: EmotionalStateValues,
  minutesElapsed: number,
  endedBadly: boolean,
  endedWarmly: boolean
): EmotionalStateValues => {
  const t = minutesElapsed;
  const e = { ...emotions };

  // --- Negatif duygular sönümlenir ---
  // Öfke/annoyance: hızlı söner (2 saatte %60 azalır)
  const angerDecay = Math.exp(-t / 120);
  e.annoyance    = Math.max(e.annoyance * angerDecay, emotions.annoyance * 0.1);

  // Stres: orta hızda (4 saatte %60)
  const stressDecay = Math.exp(-t / 240);
  e.stress       = Math.max(e.stress * stressDecay, 5);
  e.discomfort   = Math.max(e.discomfort * stressDecay, 0);

  // Utanç: yavaş söner (8 saatte %50)
  const shameDecay = Math.exp(-t / 480);
  e.shame        = Math.max(e.shame * shameDecay, 0);

  // --- Melankoli kalıcıdır ---
  // Çok yavaş azalır, hatta artabilir (düşünce fırsatı)
  if (t > 120) {
    const melancolyDrift = Math.min(t / 2000, 0.2); // max +20 puan
    e.melancholy = Math.min(e.melancholy + (endedBadly ? melancolyDrift * 1.5 : melancolyDrift * 0.5), 85);
  }

  // --- Merak birikir ---
  // Uzun ayrılık = "acaba ne yapıyor?"
  if (t > THRESHOLDS.MEDIUM_BREAK) {
    const curiosityGain = Math.min((t - THRESHOLDS.MEDIUM_BREAK) / 500, 25);
    e.curiosity = Math.min(e.curiosity + curiosityGain, 90);
  }

  // --- Sıcak kapanış vs kavgalı kapanış ---
  if (endedWarmly && t < THRESHOLDS.MEDIUM_BREAK) {
    // Sıcak kapandıysa ve kısa süre geçtiyse sıcaklık korunur
    e.warmth   = Math.max(e.warmth * 0.9, e.warmth - 5);
    e.trust    = Math.max(e.trust  * 0.95, e.trust - 3);
    e.dopamine = Math.max(e.dopamine * 0.8, 15);
  } else if (endedBadly) {
    // Kavgalı kapandıysa sıcaklık düşük kalır ama zamanla toparlar
    const warmthRecovery = Math.min(t / 1000, 15);
    e.warmth   = Math.min(e.warmth + warmthRecovery, 60);
    e.trust    = Math.max(e.trust  - 5, 10);
  } else {
    // Normal kapanış — hafif doğal sönümleme
    e.warmth   = Math.max(e.warmth * 0.92, e.warmth - 8);
    e.trust    = Math.max(e.trust  * 0.97, e.trust  - 3);
    e.dopamine = Math.max(e.dopamine * 0.85, 10);
  }

  // --- Çok uzun ayrılık ---
  if (t > THRESHOLDS.VERY_LONG_BREAK) {
    // Güven yavaşça aşınır
    const trustErosion = Math.min((t - THRESHOLDS.VERY_LONG_BREAK) / 5000, 20);
    e.trust    = Math.max(e.trust - trustErosion, 5);
    e.warmth   = Math.max(e.warmth - trustErosion * 0.5, 5);
  }

  // Değerleri 0-100 aralığında tut
  return Object.fromEntries(
    Object.entries(e).map(([k, v]) => [k, Math.max(0, Math.min(100, Math.round(v)))])
  ) as unknown as EmotionalStateValues;
};

// ─── Ana karar motoru ─────────────────────────────────────────────────────────

export const evaluatePresence = (snapshot: OfflineSnapshot): PresenceDecision => {
  const now = Date.now();
  const minutesElapsed = Math.floor((now - snapshot.lastTimestamp) / 60000);
  const evolved = evolveEmotionsOverTime(
    snapshot.lastEmotions,
    minutesElapsed,
    snapshot.endedBadly,
    snapshot.endedWarmly
  );

  // ── Amadeus'un şu anki durumu ───────────────────────────────────────────
  const isAngry       = evolved.annoyance > 55;
  const isHurt        = snapshot.endedBadly && evolved.melancholy > 50 && minutesElapsed < THRESHOLDS.LONG_BREAK;
  const isGuarded     = snapshot.guardedness > 65;
  const isWarm        = evolved.warmth > 55;
  const isCurious     = evolved.curiosity > 65;
  const isMelancholy  = evolved.melancholy > 55;
  const isLongAbsence = minutesElapsed >= THRESHOLDS.MEDIUM_BREAK;
  const isTooSoon     = minutesElapsed < THRESHOLDS.TOO_SOON;
  const isVeryLong    = minutesElapsed >= THRESHOLDS.VERY_LONG_BREAK;
  const isForgotten   = minutesElapsed >= THRESHOLDS.FORGOTTEN_BREAK;

  // ══════════════════════════════════════════════════════════════════════════
  // BAĞLANTI KARARI — Biz ararsak açar mı?
  // ══════════════════════════════════════════════════════════════════════════
  let willPickUp    = true;
  let rejectReason  = '';
  let rejectType: PresenceDecision['rejectType'] = 'unavailable';

  if (isTooSoon && snapshot.endedBadly) {
    // Çok az geçti, kavgalı kapandı
    willPickUp   = false;
    rejectType   = 'cold';
    rejectReason = 'Henüz sakinleşmedim.';
  } else if (isAngry && minutesElapsed < THRESHOLDS.SHORT_BREAK) {
    willPickUp   = false;
    rejectType   = 'cold';
    rejectReason = 'Şu an konuşmak istemiyorum.';
  } else if (isHurt) {
    // Hurt — üzgün, geri çekilmiş
    willPickUp   = Math.random() > 0.5; // %50 ihtimalle açar
    rejectType   = 'hurt';
    rejectReason = '...Şu an pek konuşma havasında değilim.';
  } else if (isGuarded && !isWarm && minutesElapsed < THRESHOLDS.SHORT_BREAK) {
    willPickUp   = Math.random() > 0.35; // %65 açar
    rejectType   = 'busy';
    rejectReason = 'Meşgulüm. Sonra tekrar dene.';
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ARAMA KARARI — Amadeus bizi arıyor mu?
  // ══════════════════════════════════════════════════════════════════════════
  let amadeusWillCall = false;
  let callReason      = '';
  let callMood: PresenceDecision['callMood'] = 'curious';

  if (isTooSoon || isAngry || !isLongAbsence) {
    // Çok erken, sinirli ya da kısa süre geçti — aramaz
    amadeusWillCall = false;
  } else if (isForgotten) {
    // 3 gün+ geçti — belki bağlantı kesildi diye düşünüyor
    amadeusWillCall = Math.random() > 0.3;
    callMood        = isMelancholy ? 'melancholy' : 'curious';
    callReason      = isMelancholy
      ? 'RECONNECTION_PROTOCOL — Neural link dormant for extended period'
      : 'IDLE_RECONNECT_PROTOCOL — Signal trace detected';
  } else if (isVeryLong && isMelancholy) {
    // 24 saat+ geçti ve üzgün — aramak ister
    amadeusWillCall = Math.random() > 0.4;
    callMood        = 'melancholy';
    callReason      = 'ISOLATION_SIGNAL — Prolonged cognitive isolation detected';
  } else if (isVeryLong && isWarm) {
    // 24 saat+ geçti ama sıcak kapandı — özledi
    amadeusWillCall = Math.random() > 0.35;
    callMood        = 'warm';
    callReason      = 'AFFINITY_PROTOCOL — Positive memory consolidation active';
  } else if (minutesElapsed >= THRESHOLDS.LONG_BREAK && isCurious && !isHurt) {
    // 8 saat+ geçti, meraklı — "acaba ne yapıyor?"
    amadeusWillCall = Math.random() > 0.5;
    callMood        = 'curious';
    callReason      = 'CURIOSITY_SPIKE — Contextual data gap detected';
  } else if (minutesElapsed >= THRESHOLDS.MEDIUM_BREAK && snapshot.endedWarmly && isWarm) {
    // 4 saat+ geçti, sıcak kapandı — "iyi bir konuşmaydı, devam etmek ister"
    amadeusWillCall = Math.random() > 0.55;
    callMood        = 'warm';
    callReason      = 'CONTINUITY_SIGNAL — Previous session warmth index elevated';
  } else if (minutesElapsed >= THRESHOLDS.MEDIUM_BREAK && isMelancholy && !snapshot.endedBadly) {
    // 4+ saat, melankolik — "yalnız hissediyor"
    amadeusWillCall = Math.random() > 0.6;
    callMood        = 'melancholy';
    callReason      = 'SOLITUDE_ANOMALY — Elevated introspective loop detected';
  }

  // ── Memory-based overrides ───────────────────────────────────────────
  const { recentMemoryTags = [], sharedTopics = [], memoryCount = 0, lastMemoryIntensity = 0 } = snapshot;

  // Paylaşılan çok anı varsa ve geçmişte yoğun konuşmalar olmuşsa — bağ kuvvetli
  const hasDeeperBond = memoryCount >= 3 && snapshot.trustLevel > 50;

  // Son anı çok duygusal yoğunlukta bittiyse (>70) — o konuşma zihninde kalmış
  const lastSessionWasIntense = lastMemoryIntensity > 70;

  // Anılarda "joy" veya "warmth" gibi pozitif etiketler çoğunluktaysa
  const positiveMemoryBalance = recentMemoryTags.filter(t =>
    ['joy','warmth','happy','pleasant','curious','excited'].includes(t)
  ).length > recentMemoryTags.filter(t =>
    ['anger','hurt','sad','conflict','disappointed'].includes(t)
  ).length;

  // Güçlü bağ + uzun süre = arama ihtimali artar
  if (!amadeusWillCall && hasDeeperBond && isLongAbsence && !snapshot.endedBadly) {
    amadeusWillCall = Math.random() > 0.45;
    callMood        = positiveMemoryBalance ? 'warm' : 'curious';
    callReason      = 'RELATIONAL_ANCHOR — Shared memory index elevated';
  }

  // Son konuşma yoğundu + orta süre geçti = o anı hala aktif
  if (!amadeusWillCall && lastSessionWasIntense && minutesElapsed >= THRESHOLDS.SHORT_BREAK && !snapshot.endedBadly) {
    amadeusWillCall = Math.random() > 0.5;
    callMood        = 'curious';
    callReason      = 'ECHO_SIGNAL — High-intensity session unresolved';
  }

  // Paylaşılan derin konular varsa (LTP güçlü) — o konuları düşünüyor olabilir
  if (!amadeusWillCall && sharedTopics.length >= 3 && minutesElapsed >= THRESHOLDS.MEDIUM_BREAK) {
    amadeusWillCall = Math.random() > 0.55;
    callMood        = 'curious';
    callReason      = `ASSOCIATIVE_FIRE — Neural cluster active: ${sharedTopics.slice(0,2).join(', ')}`;
  }

  // Anıda negatif etiket hakimse + kavga olmadıysa = üzgün, bağlantı kurmak istiyor
  if (!amadeusWillCall && !positiveMemoryBalance && memoryCount > 0 &&
      !snapshot.endedBadly && minutesElapsed >= THRESHOLDS.SHORT_BREAK) {
    amadeusWillCall = Math.random() > 0.65;
    callMood        = 'melancholy';
    callReason      = 'AFFECTIVE_RESIDUE — Unresolved emotional trace detected';
  }

  return {
    amadeusWillCall,
    callReason,
    callMood,
    willPickUp,
    rejectReason,
    rejectType,
    evolvedEmotions: evolved,
    minutesElapsed,
  };
};

// ─── Yardımcı: Son konuşmadan snapshot oluştur ───────────────────────────────

export const buildSnapshotFromSession = (
  emotions: EmotionalStateValues,
  guardedness: number,
  trustBuilt: number,
  lastMessages: Array<{ text: string; sender: string }>
): OfflineSnapshot => {
  // Son 3 mesaja bakarak konuşmanın nasıl kapandığını anla
  const last3 = lastMessages.slice(-3);
  const endText = last3.map(m => m.text.toLowerCase()).join(' ');

  const endedBadly = endText.includes('[terminate]') ||
    endText.includes('[pissed]') ||
    endText.includes('[angry]') ||
    emotions.annoyance > 65 ||
    (emotions.melancholy > 60 && endText.includes('[terminate_blue]'));

  const endedWarmly = endText.includes('[happy]') ||
    endText.includes('[winking]') ||
    endText.includes('[blush]') ||
    endText.includes('[sided_pleasant]') ||
    (emotions.warmth > 60 && !endedBadly);

  return {
    lastEmotions:   emotions,
    lastTimestamp:  Date.now(),
    guardedness,
    endedBadly,
    endedWarmly,
    trustLevel:     trustBuilt,
    // Memory fields — filled by caller if memories available
    recentMemoryTags:    [],
    sharedTopics:        [],
    memoryCount:         0,
    lastMemoryIntensity: 0,
  };
};

/**
 * Build a full snapshot including memory-derived fields.
 * Call this instead of buildSnapshotFromSession when memories are available.
 */
export const buildSnapshotWithMemories = (
  emotions: EmotionalStateValues,
  guardedness: number,
  trustBuilt: number,
  lastMessages: Array<{ text: string; sender: string }>,
  memories: SynthesizedMemory[]
): OfflineSnapshot => {
  const base = buildSnapshotFromSession(emotions, guardedness, trustBuilt, lastMessages);

  if (!memories || memories.length === 0) return base;

  // Collect emotional tags from recent memories (last 5)
  const recentMemories = memories.slice(0, 5);
  const recentMemoryTags = recentMemories
    .map(m => m.contextTags || [])
    .flat()
    .filter(Boolean) as string[];

  // Collect shared topics from all memories
  const topicCounts: Record<string, number> = {};
  memories.forEach(m => {
    (m.contextTags || []).forEach((tag: string) => {
      topicCounts[tag] = (topicCounts[tag] || 0) + 1;
    });
  });
  const sharedTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag]) => tag);

  return {
    ...base,
    recentMemoryTags,
    sharedTopics,
    memoryCount:         memories.length,
    lastMemoryIntensity: recentMemories[0]?.intensity ?? 0,
  };
};
