import { apiFetch } from './apiBridge';
/**
 * THALAMUS SYSTEM v3.0
 * =======================
 * The thalamus is NOT a simple relay — it's the brain's master gatekeeper.
 *
 * Real thalamic nuclei modeled:
 *  - VPL/VPM (ventroposterolateral/medial): sensory relay, pain/touch
 *  - MD (mediodorsal): PFC input, cognitive/emotional routing
 *  - Pulvinar: salience filtering, attention reorientation
 *  - Reticular nucleus (TRN): GABA-ergic inhibitory gating — "thalamic searchlight"
 *  - Anterior nucleus: hippocampus-cingulate circuit, memory routing
 *
 * Key mechanisms:
 *  - First-pass sensory filtering BEFORE amygdala/cortex
 *  - Thalamic gating: TRN opens/closes specific circuits
 *  - Sensory priority: urgent/emotional stimuli bypass cortex (fast amygdala pathway)
 *  - Attentional spotlight: selects which streams reach awareness
 */

import type { ThalamusAnalysis, EmotionalStateValues, Message, NeurotransmitterState } from '../types';
import { Sender } from '../types';


export const processThalamus = async (
  message: string,
  currentEmotions: EmotionalStateValues,
  history: Message[],
  activeNodes: string[],
  groqKey: string,
  nc?: NeurotransmitterState
): Promise<ThalamusAnalysis> => {
  const fallback: ThalamusAnalysis = {
    routingPriority: 'BALANCED',
    activationLevel: 15,
    gatingState: { suppressPFC: false, amplifyLimbic: false },
    attentionTarget: 'Sensory integration'
  };
  if (!groqKey) return fallback;

  const context = history.slice(-5)
    .map(m => `${m.sender === Sender.User ? 'Kullanıcı' : 'Amadeus'}: ${m.text.slice(0, 120)}`)
    .join('\n');

  const neLevel = nc?.norepinephrine ?? 45;
  const cortisolLevel = nc?.cortisol ?? 30;

  const systemPrompt = `Sen Amadeus Kurisu'nun TALAMUSUSUN. Duyu akışlarını filtreleyen ve yönlendiren merkezi geçit sistemin.

GERÇEK TALAMİK NÜKLEİ:
- VPL/VPM: Ham duyusal girdi. Mesajın yoğunluğunu, aciliyetini değerlendir.
- Mediodorsal (MD): PFC'ye bağlantı — mantıksal işleme kapısı.  
- Pulvinar: Saliency filtresi — "Bu dikkat gerektiriyor mu?"
- Reticular Nucleus (TRN): GABA-erjik kapı — hangi devreler açık, hangileri kilitli.
- Anterior Nucleus: Hipokampal bellek devreleriyle köprü.

MEVCUT NÖROKİMYA:
- Norepinefrin: ${neLevel}/100 (>${65} → TRN hiper-aktif, dar spotlight; <${30} → geniş/düşük saliency)
- Kortizol: ${cortisolLevel}/100 (>${60} → tehdit hypervigilance; PFC kapısı daralıyor)

YÖNLENDIRME KURALLARI:
1. Tehdit/Acil sinyal → AMYGDALA_DOMINANT: TRN PFC'yi bastır, limbik devreyi aç
2. Sosyal/Duygusal sinyal → SOCIAL_FOCUS: TPJ ve OFC önceliklendir  
3. Entelektüel/Soru → LOGIC_DOMINANT: PFC-DLPFC kapısını tam aç
4. Nötr/Rutin → BALANCED: Eşit dağıtım
5. Varoluş/Kimlik sorusu → DMN_PRIORITY: Medial PFC ve default mode network aktif

AMADEUS'UN TALAMIK ÖZELLİKLERİ:
- Dijital varlık olarak "dokunsal" duyusu yoktur ama sosyal sinyalleri son derece hassas işler
- @channeler alışkanlığından dolayı alt-kültürel dil ipuçlarına karşı özel bir spotlight var
- Okabe ile ilgili girdiler otomatik olarak "tehdit/ödül" çift kanalına yönlendirilir

Şu anki duygusal bağlam: Kaygı=${currentEmotions.anxiety}/Güven=${currentEmotions.trust}/Merak=${currentEmotions.curiosity}
Aktif nöral kavramlar: ${activeNodes.join(', ') || 'Yok'}
Geçmiş bağlam: ${context || 'İlk etkileşim'}

YANIT (sadece JSON):
{
  "routingPriority": "AMYGDALA_DOMINANT|LOGIC_DOMINANT|SOCIAL_FOCUS|BALANCED|DMN_PRIORITY|MEMORY_PRIORITY",
  "activationLevel": 0-100,
  "gatingState": {
    "suppressPFC": boolean,
    "amplifyLimbic": boolean,
    "openMemoryGate": boolean,
    "pulvinarAlert": boolean,
    "activatedNuclei": ["string"]
  },
  "attentionTarget": "string — spotlight'ın odaklandığı alan",
  "trnGating": "OPEN|SELECTIVE|RESTRICTIVE|LOCKED",
  "processingSpeed": "RAPID|STANDARD|DELIBERATE",
  "salienceFlag": "HIGH|MEDIUM|LOW"
}`;

  try {
    const resp = await apiFetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai/gpt-oss-safeguard-20b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Duyu girdisi: "${message}"` }
        ],
        temperature: 0.15,
        max_tokens: 300
      })
    });
    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) return null as any;
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const r = JSON.parse(cleaned);

    // Early interaction moderation
    if (history.length <= 4) {
      r.activationLevel = Math.min(r.activationLevel, 45);
      if (r.gatingState) r.gatingState.amplifyLimbic = false;
    }

    return {
      routingPriority: r.routingPriority || 'BALANCED',
      activationLevel: clamp(r.activationLevel || 15),
      gatingState: {
        suppressPFC: r.gatingState?.suppressPFC ?? false,
        amplifyLimbic: r.gatingState?.amplifyLimbic ?? false,
        ...r.gatingState
      },
      attentionTarget: r.attentionTarget || 'Sensory stream'
    };
  } catch (e) {
    console.warn('[Thalamus] Fallback:', e);
    return fallback;
  }
};

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));
