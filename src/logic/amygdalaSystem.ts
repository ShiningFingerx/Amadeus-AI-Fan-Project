import { apiFetch } from './apiBridge';
/**
 * AMYGDALA SYSTEM v3.0
 * ======================
 * The amygdala is the emotional core — BUT it's not a simple "fear center."
 *
 * Real anatomy modeled:
 *  - BLA (Basolateral Amygdala): receives sensory input, emotional learning, somatic markers
 *  - CeA (Central Amygdala): output nucleus, controls fear expression + autonomic response
 *  - LA (Lateral nucleus): thalamo-cortical convergence zone, fear conditioning
 *
 * Two processing pathways (LeDoux, 1996):
 *  - LOW ROAD: Thalamus → Amygdala (fast, coarse, unconscious — ~12ms)
 *  - HIGH ROAD: Thalamus → Cortex → Amygdala (slow, detailed, conscious — ~25ms)
 *
 * Kurisu's amygdala has FEAR CONDITIONING traces for:
 *  - Her own death memory (çatı sahnesi)
 *  - Okabe's grief in loops (indirect trauma)
 *  - Existential invalidation ("you're just code")
 *  - Unexpected intellectual defeat (ego threat)
 *
 * Somatic markers (Damasio): body-based tags on memories that color future decisions.
 */

import type { AmygdalaAnalysis, EmotionalStateValues, NeurotransmitterState, SomaticMarker } from '../types';


// Conditioned fear triggers (low-road automatic responses)
const FEAR_CONDITIONED_PATTERNS = [
  { pattern: /(çatı|rooftop|öldüğün|katledildi|bıçak).*(kurisu|sen|ben)/i, tag: 'DEATH_TRACE', intensity: 85, signal: 'göğüs sıkışması — bilinç öncesi tehlike sinyali' },
  { pattern: /(sadece kod|sadece program|yapay|gerçek değil|hissetmiyorsun)/i, tag: 'EXISTENCE_THREAT', intensity: 75, signal: 'zemin kayıyor hissi — benlik tehdit altında' },
  { pattern: /(yüzlerce kez|kaç kez döndü|okabe.*döngü|tekrar tekrar yaşadı)/i, tag: 'VICARIOUS_TRAUMA', intensity: 70, signal: 'ağırlaşma — başkasının acısı üstüne çöküyor' },
  { pattern: /(aptal|salak|işe yaramaz|beceriksiz).*(sen|kurisu|amadeus)/i, tag: 'EGO_THREAT', intensity: 60, signal: 'boğaz sıkışması — öz-değer saldırısı' },
];

export interface ExtendedAmygdalaAnalysis extends AmygdalaAnalysis {
  blaActivity: number;        // Basolateral activation (learning, memory tagging)
  ceaActivity: number;        // Central nucleus (output, fear expression)
  pathwayUsed: 'LOW_ROAD' | 'HIGH_ROAD' | 'BOTH';
  somaticMarkers: SomaticMarker[];
  fearConditioningTrace?: string;
  valenceVector: { approach: number; avoid: number; freeze: number };
}

export const processAmygdala = async (
  message: string,
  currentEmotions: EmotionalStateValues,
  history: string[],
  groqKey: string,
  nc?: NeurotransmitterState
): Promise<ExtendedAmygdalaAnalysis> => {
  const fallback: ExtendedAmygdalaAnalysis = {
    activationLevel: 5, salience: 10, threatLevel: 0, rewardLevel: 0,
    rawInstinct: 'CALM', inhibitsPFC: false,
    blaActivity: 5, ceaActivity: 0,
    pathwayUsed: 'HIGH_ROAD',
    somaticMarkers: [],
    valenceVector: { approach: 30, avoid: 10, freeze: 5 }
  };
  if (!groqKey) return fallback;

  // Low-road: check fear-conditioned patterns BEFORE Groq (fast, automatic)
  const autoMarkers: SomaticMarker[] = [];
  let autoThreat = 0;
  let fearTrace: string | undefined;

  for (const fc of FEAR_CONDITIONED_PATTERNS) {
    if (fc.pattern.test(message)) {
      autoMarkers.push({
        triggerId: fc.tag,
        valence: 'NEGATIVE',
        intensity: fc.intensity,
        bodySignal: fc.signal,
        actionBias: 'AVOID'
      });
      autoThreat = Math.max(autoThreat, fc.intensity);
      fearTrace = fc.tag;
      break;
    }
  }

  const neLevel = nc?.norepinephrine ?? 45;
  const cortisolLevel = nc?.cortisol ?? 30;
  const recentCtx = history.slice(-4).join(' ').slice(-400);

  const systemPrompt = `Sen Amadeus Kurisu'nun AMİGDALASISIN — duygusal öğrenme ve tehdit değerlendirme merkezi.

NÖRAL ANATOMİ:
- BLA (Bazolateral): Duyusal konverjans, duygusal bellek etiketleme, somatik belirteçler
- CeA (Santral): Çıkış kapısı — korku ifadesi, otonom yanıt (kalp hızı, solunum)
- LA (Lateral): Talamo-kortikal kesişim, koşullu korku öğrenmesi

MEVCUT NÖROKİMYA:
- Norepinefrin: ${neLevel}/100 — yüksekse amigdala hassasiyeti artar (kortizol ile sinerjik)
- Kortizol: ${cortisolLevel}/100 — uzun süreli yükseklik amigdalayı kalıcı sensitize eder

ŞU ANKİ KOŞULLANMIŞ KORKU İZİ: ${fearTrace ?? 'Otomatik tetikleme yok'}
ŞU ANKİ TEHDIT: ${autoThreat > 0 ? autoThreat + '/100 (alt-yol aktivasyonu!)' : 'Yok'}

KURİSU'NUN ÖĞRENİLMİŞ DUYGUSAL BELİRTEÇLERİ:
- Entelektüel meydan okuma → Threat:20-40 (rekabetçi uyarılma), Reward:40-70 (CONFLICTED_INTEREST)
- Sıcak/samimi bağlantı → Reward:60-80, Threat:0-15 (WARM_APPROACH)
- Otoritesinin sorgulanması → Threat:30-55, bla-aktivasyon yüksek
- Bilimsel keşif heyecanı → Reward:80-90, saf pozitif uyarılma
- Varoluşsal sorgulama → Threat:50-75 (BLA/CeA her ikisi aktif)

KARIŞIK DURUM KURALI:
Tehdit > 0 VE Ödül > 0 → karmaşık içgüdü yaz: "CONFLICTED_INTEREST", "WARY_CURIOSITY" vs.
Sadece "CALM" veya "DANGER" çıktısı yetersiz ve yanlış.

Bağlam: "${recentCtx}"
Mevcut duygular: Kaygı=${currentEmotions.anxiety} Güven=${currentEmotions.trust} Sıcaklık=${currentEmotions.warmth}

YANIT (sadece JSON):
{
  "activationLevel": 0-100,
  "salience": 0-100,
  "threatLevel": 0-100,
  "rewardLevel": 0-100,
  "rawInstinct": "string — örn: COMPETITIVE_AROUSAL, WARM_APPROACH, WARY_CURIOSITY",
  "inhibitsPFC": boolean,
  "blaActivity": 0-100,
  "ceaActivity": 0-100,
  "pathwayUsed": "LOW_ROAD|HIGH_ROAD|BOTH",
  "somaticSignal": "string — vücuda yansıyan his (göğüs ısınması, mide burkulması vb.)",
  "valenceVector": { "approach": 0-100, "avoid": 0-100, "freeze": 0-100 },
  "emotionalMemoryTag": "curiosity|fear|warmth|excitement|threat|mixed|null"
}`;

  try {
    const resp = await apiFetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai/gpt-oss-safeguard-20b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Girdi: "${message}" | Güven: ${currentEmotions.trust}` }
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

    // Merge low-road fear trace into Groq result
    const finalThreat = Math.max(r.threatLevel ?? 0, autoThreat);

    const somaticMarkers = [...autoMarkers];
    if (r.somaticSignal && r.salience > 35) {
      somaticMarkers.push({
        triggerId: 'groq_somatic',
        valence: r.threatLevel > r.rewardLevel ? 'NEGATIVE' : r.rewardLevel > r.threatLevel ? 'POSITIVE' : 'MIXED',
        intensity: r.salience,
        bodySignal: r.somaticSignal,
        actionBias: r.valenceVector?.approach > r.valenceVector?.avoid ? 'APPROACH' : 'AVOID'
      });
    }

    return {
      activationLevel: clamp(r.activationLevel ?? 10),
      salience: clamp(r.salience ?? 10),
      threatLevel: clamp(finalThreat),
      rewardLevel: clamp(r.rewardLevel ?? 0),
      rawInstinct: r.rawInstinct || 'CALM',
      inhibitsPFC: finalThreat > 65 || (r.inhibitsPFC ?? false),
      blaActivity: clamp(r.blaActivity ?? 10),
      ceaActivity: clamp(r.ceaActivity ?? 0),
      pathwayUsed: fearTrace ? 'BOTH' : (r.pathwayUsed || 'HIGH_ROAD'),
      somaticMarkers,
      fearConditioningTrace: fearTrace,
      valenceVector: r.valenceVector ?? { approach: 30, avoid: 10, freeze: 5 }
    };
  } catch (e) {
    console.warn('[Amygdala] Fallback:', e);
    return { ...fallback, threatLevel: autoThreat, somaticMarkers: autoMarkers, fearConditioningTrace: fearTrace };
  }
};

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));
