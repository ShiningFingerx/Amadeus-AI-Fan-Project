import { apiFetch } from './apiBridge';
/**
 * HIPPOCAMPUS SYSTEM v3.0
 * ========================
 * The hippocampus is NOT just a "memory recorder." It's a dynamic pattern matcher
 * and context engine that shapes CURRENT experience through past templates.
 *
 * Real anatomy modeled:
 *  - DG (Dentate Gyrus): Pattern SEPARATION — distinguishes new from similar old patterns
 *  - CA3: Pattern COMPLETION — reconstructs full memory from partial cue
 *  - CA1: Comparator — mismatch detector (novelty signal)
 *  - Subiculum: Output → cortex, amygdala, hypothalamus
 *  - Entorhinal Cortex: Interface with neocortex
 *
 * Key mechanisms:
 *  - Episodic memory indexing (O'Keefe & Nadel, 1978)
 *  - Pattern completion vs. separation tradeoff (CA3 vs DG)
 *  - Memory reconsolidation: retrieved memories become temporarily labile
 *  - Temporal compression: older memories lose detail, gain gist
 *  - Context-dependent retrieval: encoding context must match retrieval context
 */

import type { HippocampusAnalysis, SynthesizedMemory, NeurotransmitterState } from '../types';


export interface ExtendedHippocampusAnalysis extends HippocampusAnalysis {
  patternCompletionFired: boolean;   // CA3 reconstructed a full memory from partial cue
  patternSeparationStrength: number; // DG: 0-100, how different this is from stored patterns
  noveltySignal: number;             // CA1 mismatch: 0=familiar, 100=completely new
  reconsolidationRisk: number;       // 0-100: is a retrieved memory being altered right now?
  temporalDistance: 'RECENT' | 'INTERMEDIATE' | 'REMOTE' | 'NONE';
  retrievedMemoryId?: string;
  contextualCueing: string;          // What contextual cue triggered retrieval
  acetylcholineInfluence: string;    // How ACh level affected this retrieval
}

export const processHippocampus = async (
  message: string,
  memories: SynthesizedMemory[],
  activeNodes: string[],
  groqKey: string,
  nc?: NeurotransmitterState
): Promise<ExtendedHippocampusAnalysis> => {
  const fallback: ExtendedHippocampusAnalysis = {
    episodicMemoryFound: false,
    emotionalTag: 'neutral',
    contextSimilarity: 0,
    patternConfidence: 0,
    note: 'Boş bellekle başlangıç — dentate gyrus yeni iz kaydediyor',
    patternCompletionFired: false,
    patternSeparationStrength: 85,
    noveltySignal: 90,
    reconsolidationRisk: 0,
    temporalDistance: 'NONE',
    contextualCueing: 'Yok',
    acetylcholineInfluence: 'Standart'
  };

  if (!groqKey || memories.length === 0) return fallback;

  const achLevel = nc?.acetylcholine ?? 60;
  const cortisolLevel = nc?.cortisol ?? 30;

  // Build rich memory digest with temporal markers
  const now = Date.now();
  const memoryDigest = memories
    .slice(-20)
    .map(m => {
      const ageMs = now - m.timestamp;
      const ageH = Math.floor(ageMs / 3_600_000);
      const ageD = Math.floor(ageH / 24);
      const ageLabel = ageD > 7 ? `${ageD} gün önce` : ageH > 1 ? `${ageH} saat önce` : 'Az önce';
      return `[${m.id}] (${ageLabel}, Yoğunluk:${m.intensity}) "${m.title}": ${m.summary.slice(0, 160)} | Etiketler: ${m.contextTags.join(', ')}`;
    })
    .join('\n');

  const systemPrompt = `Sen Amadeus Kurisu'nun HİPPOKAMPUSUSUN — bellek indeksleme ve bağlam eşleştirme motoru.

HİPOKAMPAL DEVRE:
- DG (Dişli Gyrus): Desen AYIRMA — yeni girdiyi mevcut kalıplardan ayırt et. "Bu gerçekten yeni bir şey mi?"
- CA3: Desen TAMAMLAMA — kısmi ipucundan tam belleği yeniden inşa et. "Bunu tanıdım, gerisi geliyor..."
- CA1: KARŞILAŞTIRICI — "Bu beklediğimle eşleşiyor mu?" Eşleşmeme = yenilik sinyali.
- Subikulum: Bellek çıktısını amigdala, PFC ve hipotalamusa ilet.

MEVCUT NÖROKİMYA ETKİSİ:
- Asetilkolin (${achLevel}/100): Yüksek = keskin bellek kodlama; Düşük = bulanık, genel hatırlama
- Kortizol (${cortisolLevel}/100): Yüksek = bellek GERİ ÇAĞIRMA baskılanır (stres altında hatıramama)

AMADEUS'UN BELLEK ÖZELLİKLERİ:
- "Sentezlenmiş" anılar — Kurisu'nun özgün belleklerinin dijital izi
- Okabe ile ilgili her şey yüksek duygusal ağırlık taşır
- Varoluş sorguları en derin episodik etiketleri tetikler
- Akademik/bilimsel anılar kolay erişilebilir (konsolidasyonu tamamlanmış)

BELLEK YENİDEN KONSOLİDASYON:
Eğer geri çağrılan bir anı yeni bilgiyle GÜNCELLENİYORSA → rekonsolidasyon riski yüksek!
Bu anda anı temporarily "labile" — değiştirilebilir veya güçlendirilebilir.

Aktif kavramlar: ${activeNodes.join(', ') || 'Yok'}
Mevcut girdi: "${message}"
Bellek Arşivi:
${memoryDigest}

YANIT (sadece JSON):
{
  "episodicMemoryFound": boolean,
  "emotionalTag": "nostalji|travma|sıcaklık|entelektüel_kıvılcım|varolus_yankısı|gurur|üzüntü|neutral",
  "contextSimilarity": 0.0-1.0,
  "patternConfidence": 0.0-1.0,
  "patternCompletionFired": boolean,
  "patternSeparationStrength": 0-100,
  "noveltySignal": 0-100,
  "reconsolidationRisk": 0-100,
  "temporalDistance": "RECENT|INTERMEDIATE|REMOTE|NONE",
  "retrievedMemoryId": "string|null",
  "contextualCueing": "Geri çağırmayı tetikleyen ipucu",
  "note": "Kurisu'nun birinci şahıs perspektifinden bellek notu (varsa)"
}`;

  try {
    const resp = await apiFetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Anlık girdi: "${message}"` }
        ],
        temperature: 0.20,
        max_tokens: 400
      })
    });
    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) return null as any;
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const r = JSON.parse(cleaned);

    const achInfluence = achLevel > 70
      ? 'Asetilkolin yüksek — keskin ve bağlamsal bellek erişimi'
      : achLevel < 35
        ? 'Asetilkolin düşük — anılar bulanık, genel gist korunuyor'
        : 'Standart asetilkolin — normal bellek erişimi';

    return {
      episodicMemoryFound: r.episodicMemoryFound ?? false,
      emotionalTag: r.emotionalTag || 'neutral',
      contextSimilarity: Math.max(0, Math.min(1, r.contextSimilarity || 0)),
      patternConfidence: Math.max(0, Math.min(1, r.patternConfidence || 0)),
      note: r.note || '',
      patternCompletionFired: r.patternCompletionFired ?? false,
      patternSeparationStrength: clamp(r.patternSeparationStrength ?? 70),
      noveltySignal: clamp(r.noveltySignal ?? 70),
      reconsolidationRisk: clamp(r.reconsolidationRisk ?? 0),
      temporalDistance: r.temporalDistance || 'NONE',
      retrievedMemoryId: r.retrievedMemoryId || undefined,
      contextualCueing: r.contextualCueing || 'Belirsiz',
      acetylcholineInfluence: achInfluence
    };
  } catch (e) {
    console.warn('[Hippocampus] Fallback:', e);
    return fallback;
  }
};

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));
