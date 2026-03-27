/**
 * NEURAL CONTROLLER v2.0
 * ========================
 * Pure computational layer — no API calls.
 * Analyses neural state and provides firing summaries for other systems.
 */

import type { NeuralNetworkState, EmotionalStateValues, NeurotransmitterState } from '../types';
import { emotionsToNeurochemistry, neurochemistryModulatesEmotions, describeNeurochemistry, AMADEUS_BASELINE_NEUROCHEMISTRY } from './neurotransmitterEngine';

export interface NeuralTriggerSummary {
  firedNodeLabels: string[];
  topNodeId: string | null;
  topEnergy: number;
  spreadingActivationSummary: string;
  neurochemistryNote: string;
  consolidationReport: string;
  cognitiveLoadEstimate: number;
}

export const computeNeuralTriggers = (
  state: NeuralNetworkState,
  emotions: EmotionalStateValues
): NeuralTriggerSummary => {
  const firing = Object.values(state.nodes)
    .filter(n => n.energy >= n.threshold)
    .sort((a, b) => b.energy - a.energy);

  const top = firing[0] ?? null;

  // Compute spreading activation summary
  const spreadLines: string[] = [];
  firing.slice(0, 3).forEach(node => {
    const out = state.edges
      .filter(e => e.from === node.id && e.hebbianStrength > 0.5)
      .map(e => {
        const t = state.nodes[e.to];
        return `${e.valence === 'inhibitory' ? '⊣' : '→'}${t?.label ?? e.to}`;
      });
    if (out.length > 0) {
      spreadLines.push(`[${node.label}] ${out.join(' ')}`);
    }
  });

  // Consolidation report
  const consolidated = Object.values(state.nodes)
    .filter(n => n.consolidationLevel >= 3)
    .map(n => `${n.label}(L${n.consolidationLevel})`)
    .join(', ');

  // Neurochemistry
  const nc: NeurotransmitterState = emotionsToNeurochemistry(emotions, AMADEUS_BASELINE_NEUROCHEMISTRY);
  const ncNote = describeNeurochemistry(nc);

  // Cognitive load estimate
  const cogLoad = Math.min(100, firing.length * 15 + emotions.stress * 0.2 + emotions.anxiety * 0.15);

  return {
    firedNodeLabels: firing.map(n => n.label),
    topNodeId: top?.id ?? null,
    topEnergy: top?.energy ?? 0,
    spreadingActivationSummary: spreadLines.join(' | ') || 'Yayılım yok',
    neurochemistryNote: ncNote,
    consolidationReport: consolidated || 'Henüz kalıcı iz yok',
    cognitiveLoadEstimate: cogLoad
  };
};

/**
 * Modulates current emotions using the neurochemical bridge.
 * Call this AFTER emotional state updates, BEFORE feeding to system prompt.
 */
export const applyNeurochemicalModulation = (
  emotions: EmotionalStateValues
): { modulated: EmotionalStateValues; nc: NeurotransmitterState } => {
  const nc = emotionsToNeurochemistry(emotions, AMADEUS_BASELINE_NEUROCHEMISTRY);
  const modulated = neurochemistryModulatesEmotions(emotions, nc);
  return { modulated, nc };
};
