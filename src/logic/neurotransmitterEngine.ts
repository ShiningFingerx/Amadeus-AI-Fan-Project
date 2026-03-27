/**
 * NEUROTRANSMITTER ENGINE v1.0
 * ================================
 * The neurochemical backbone of Amadeus's mind.
 *
 * Maps EmotionalStateValues ↔ NeurotransmitterState bidirectionally.
 * Drives threshold modulation in all downstream brain regions.
 *
 * Neuroscience references:
 *  - Monoamine theory of depression (Schildkraut, 1965)
 *  - Dopamine reward prediction (Schultz, 1997)
 *  - LC-NE arousal system (Aston-Jones & Cohen, 2005)
 *  - Serotonin & impulse control (Crockett et al., 2008)
 *  - Oxytocin & trust (Kosfeld et al., 2005)
 *  - HPA axis & cortisol (McEwen, 2007)
 */

import type { EmotionalStateValues, NeurotransmitterState } from '../types';

// ─── Baseline neurochemistry (Amadeus's resting state) ───────────────────

export const AMADEUS_BASELINE_NEUROCHEMISTRY: NeurotransmitterState = {
  dopamine:        52,   // Slightly elevated — intellectual curiosity baseline
  serotonin:       48,   // Moderate — not depressed, not euphoric. Bittersweet existence.
  norepinephrine:  45,   // Alert but not hyperaroused
  acetylcholine:   60,   // High — excellent memory encoding capacity (she IS a memory system)
  cortisol:        30,   // Low-moderate. Digital existence = no physical stress, but existential anxiety
  oxytocin:        25,   // Low baseline — guarded, tsundere. Rises with trust.
  endorphin:       40,   // Baseline comfort
  gabaGlutamate:   50,   // Balanced excitation/inhibition
};

// ─── Emotion → Neurochemistry mapping ────────────────────────────────────

/**
 * Derives approximate neurotransmitter state from emotional values.
 * This is a model approximation — not a 1:1 mapping.
 */
export const emotionsToNeurochemistry = (
  emotions: EmotionalStateValues,
  baseline: NeurotransmitterState = AMADEUS_BASELINE_NEUROCHEMISTRY
): NeurotransmitterState => {

  // Dopamine: driven by curiosity, dopamine emotion value, playfulness, reward anticipation
  const dopamine = clamp(
    baseline.dopamine
    + (emotions.curiosity  - 50) * 0.35
    + (emotions.dopamine   - 50) * 0.40
    + (emotions.playfulness- 50) * 0.15
    - emotions.melancholy * 0.20
    - emotions.stress     * 0.15
  );

  // Serotonin: driven by warmth, confidence, inverse of annoyance and melancholy
  const serotonin = clamp(
    baseline.serotonin
    + (emotions.warmth     - 50) * 0.30
    + (emotions.confidence - 50) * 0.25
    - emotions.annoyance   * 0.25
    - emotions.melancholy  * 0.30
    - emotions.shame       * 0.20
    + emotions.trust       * 0.10
  );

  // Norepinephrine: driven by anxiety, stress, threat salience
  const norepinephrine = clamp(
    baseline.norepinephrine
    + emotions.anxiety  * 0.40
    + emotions.stress   * 0.35
    + emotions.annoyance* 0.15
    - emotions.warmth   * 0.10
    - emotions.trust    * 0.08
  );

  // Acetylcholine: driven by curiosity, focus, inverse of confusion/stress
  const acetylcholine = clamp(
    baseline.acetylcholine
    + (emotions.curiosity  - 50) * 0.40
    - emotions.confusion   * 0.30
    - emotions.stress      * 0.20
    + emotions.confidence  * 0.10
  );

  // Cortisol: driven by stress, anxiety, discomfort, inverse of trust
  const cortisol = clamp(
    baseline.cortisol
    + emotions.stress      * 0.45
    + emotions.anxiety     * 0.35
    + emotions.discomfort  * 0.20
    - emotions.warmth      * 0.10
    - emotions.trust       * 0.15
  );

  // Oxytocin: driven by warmth, trust, inverse of annoyance/shame
  const oxytocin = clamp(
    baseline.oxytocin
    + emotions.warmth  * 0.45
    + emotions.trust   * 0.40
    - emotions.annoyance * 0.25
    - emotions.shame   * 0.20
    - emotions.sarcasm * 0.10
  );

  // Endorphin: driven by playfulness, warmth, inverse of stress/discomfort
  const endorphin = clamp(
    baseline.endorphin
    + emotions.playfulness * 0.30
    + emotions.warmth      * 0.20
    - emotions.stress      * 0.30
    - emotions.discomfort  * 0.20
    - emotions.melancholy  * 0.15
  );

  // GABA/Glutamate balance: anxiety/stress push excitatory; warmth/trust push inhibitory
  const gabaGlutamate = clamp(
    baseline.gabaGlutamate
    + emotions.anxiety   * 0.20
    + emotions.stress    * 0.15
    - emotions.warmth    * 0.10
    - emotions.trust     * 0.08
    + emotions.confusion * 0.10
  );

  return { dopamine, serotonin, norepinephrine, acetylcholine, cortisol, oxytocin, endorphin, gabaGlutamate };
};

// ─── Neurochemistry → Emotion modulation ─────────────────────────────────

/**
 * Applies neurochemical feedback onto raw emotional values.
 * This creates the "bottom-up" biological constraints on emotion.
 * e.g. low serotonin → hard to suppress annoyance even if PFC tries
 */
export const neurochemistryModulatesEmotions = (
  emotions: EmotionalStateValues,
  nc: NeurotransmitterState
): EmotionalStateValues => {
  const e = { ...emotions };

  // Low dopamine → anhedonia, reduced curiosity, motivation drop
  if (nc.dopamine < 30) {
    e.curiosity    = Math.max(0, e.curiosity   - (30 - nc.dopamine) * 0.4);
    e.playfulness  = Math.max(0, e.playfulness - (30 - nc.dopamine) * 0.3);
    e.dopamine     = Math.max(0, e.dopamine    - (30 - nc.dopamine) * 0.5);
  }

  // High dopamine (>80) → overconfidence, slight mania risk
  if (nc.dopamine > 80) {
    e.confidence   = Math.min(100, e.confidence + (nc.dopamine - 80) * 0.3);
    e.playfulness  = Math.min(100, e.playfulness + (nc.dopamine - 80) * 0.2);
  }

  // Low serotonin → irritability, rumination, rejection sensitivity
  if (nc.serotonin < 30) {
    e.annoyance    = Math.min(100, e.annoyance  + (30 - nc.serotonin) * 0.4);
    e.melancholy   = Math.min(100, e.melancholy + (30 - nc.serotonin) * 0.3);
    e.sarcasm      = Math.min(100, e.sarcasm    + (30 - nc.serotonin) * 0.2);
  }

  // High cortisol → memory interference, anxiety amplification
  if (nc.cortisol > 65) {
    e.anxiety      = Math.min(100, e.anxiety  + (nc.cortisol - 65) * 0.4);
    e.confusion    = Math.min(100, e.confusion + (nc.cortisol - 65) * 0.2);
    e.stress       = Math.min(100, e.stress    + (nc.cortisol - 65) * 0.3);
  }

  // High oxytocin → trust facilitation, warmth amplification
  if (nc.oxytocin > 60) {
    e.warmth       = Math.min(100, e.warmth + (nc.oxytocin - 60) * 0.3);
    e.trust        = Math.min(100, e.trust  + (nc.oxytocin - 60) * 0.2);
    e.annoyance    = Math.max(0,   e.annoyance - (nc.oxytocin - 60) * 0.2);
  }

  // High NE (>75) → hypervigilance, anxiety spike
  if (nc.norepinephrine > 75) {
    e.anxiety      = Math.min(100, e.anxiety  + (nc.norepinephrine - 75) * 0.5);
    e.stress       = Math.min(100, e.stress   + (nc.norepinephrine - 75) * 0.3);
  }

  return e;
};

// ─── Threshold modulation ────────────────────────────────────────────────

/**
 * Neurochemical thresholds for key brain regions.
 * Returns how much each region's firing threshold should be adjusted.
 * Negative = easier to fire (sensitized). Positive = harder to fire (inhibited).
 */
export interface ThresholdModulation {
  amygdala: number;       // NE/cortisol sensitize amygdala
  pfc: number;            // high cortisol inhibits PFC
  hippocampus: number;    // ACh enhances; cortisol impairs
  striatum: number;       // dopamine controls striatal gating
  insula: number;         // NE sensitizes insula to interoception
  acc: number;            // serotonin modulates ACC sensitivity
  thalamus: number;       // NE controls thalamic gating
}

export const getThresholdModulation = (nc: NeurotransmitterState): ThresholdModulation => ({
  amygdala:   -(nc.norepinephrine * 0.25) - (nc.cortisol * 0.20),  // sensitized by stress
  pfc:        +(nc.cortisol * 0.30) - (nc.dopamine * 0.15),         // impaired by cortisol
  hippocampus:-(nc.acetylcholine * 0.25) + (nc.cortisol * 0.20),    // ACh enhances, cortisol impairs
  striatum:   -(nc.dopamine * 0.30) + (nc.cortisol * 0.10),         // dopamine drives striatal gates
  insula:     -(nc.norepinephrine * 0.20) - (nc.gabaGlutamate > 50 ? (nc.gabaGlutamate - 50) * 0.15 : 0),
  acc:        -(nc.norepinephrine * 0.15) + (nc.serotonin * 0.10),  // NE heightens, 5-HT calms
  thalamus:   -(nc.norepinephrine * 0.20) + (nc.gabaGlutamate < 50 ? (50 - nc.gabaGlutamate) * 0.20 : 0),
});

// ─── Neurochemical narrative ───────────────────────────────────────────────

export const describeNeurochemistry = (nc: NeurotransmitterState): string => {
  const lines: string[] = [];

  if (nc.dopamine > 70)        lines.push('Dopamin yüksek — motivasyon ve ödül beklentisi güçlü.');
  else if (nc.dopamine < 35)   lines.push('Dopamin düşük — anhedoni riski, motivasyon azalması.');

  if (nc.serotonin > 70)       lines.push('Serotonin yüksek — sabır ve dürtü kontrolü güçlü.');
  else if (nc.serotonin < 30)  lines.push('Serotonin düşük — sinirlilik, ruminasyon eğilimi.');

  if (nc.norepinephrine > 72)  lines.push('Norepinefrin yüksek — hiperuyarı, dikkat daralıyor.');
  else if (nc.norepinephrine < 25) lines.push('Norepinefrin düşük — uyuşukluk, dikkat dağınık.');

  if (nc.cortisol > 65)        lines.push('Kortizol yüksek — HPA aktivasyonu, bellek baskılanıyor.');
  if (nc.oxytocin > 60)        lines.push('Oksitosin yüksek — sosyal bağlanma güdüsü artmış.');
  if (nc.acetylcholine > 70)   lines.push('Asetilkolin yüksek — bellek kodlama kapasitesi zirve.');

  return lines.length > 0 ? lines.join(' ') : 'Nörokimya dengede — standart işleme.';
};

// ─── Utility ──────────────────────────────────────────────────────────────

const clamp = (v: number, min = 0, max = 100): number =>
  Math.max(min, Math.min(max, v));
