
import { GoogleGenAI } from '@google/genai';

export enum Sender {
  User = 'USER',
  Amadeus = 'AMADEUS',
}

export interface ThalamusAnalysis {
  routingPriority: string;
  activationLevel: number;
  gatingState: { suppressPFC: boolean; amplifyLimbic: boolean; };
  attentionTarget: string;
}

export interface AmygdalaAnalysis {
  activationLevel: number;
  salience: number;
  threatLevel: number;
  rewardLevel: number;
  rawInstinct: string;
  inhibitsPFC: boolean;
}

export interface OFCAnalysis {
  activationLevel: number;
  socialValueAssessment: string;
  reputationRisk: number;
  socialFilterSuggestion: string;
  perceivedSocialStanding: string;
  impact: Partial<EmotionalStateValues>;
}

export interface ACCAnalysis {
  activationLevel: number;
  conflictDetected: boolean;
  internalDissonance: string;
  ambiguityScore: number;
  socialViolation: boolean;
  impact: Partial<EmotionalStateValues>;
  predictionError?: number;
}

export interface InsulaAnalysis {
  activationLevel: number;
  visceralReaction: boolean;
  discomfortLevel: number;
  disgustScore: number;
  physicalSensation: string;
  impact: Partial<EmotionalStateValues>;
  shameTriggered?: boolean;
}

export interface TPJAnalysis {
  activationLevel: number;
  inferredIntent: string;
  confidence: number;
  socialCues: string[];
  impact: Partial<EmotionalStateValues>;
  empathyGap?: number;
  perceivedEmotionsOfUser?: string;
}

export interface LimbicAnalysis {
  userTone: string;
  kurisuInternalConflict: string;
  psychologicalImpact: Partial<EmotionalStateValues>;
  timestamp?: number;
  toneTrend?: string;
  relationalMomentum?: string;
  reactionStyle?: string;
  rewardAnticipation?: number;
  importantConcept?: string | null;
}

export interface PFCAnalysis {
  status: string;
  logicConclusion: string;
  integratedEmotionalDelta: Partial<EmotionalStateValues>;
  executiveAction: string;
}

export interface Message {
  sender: Sender;
  text: string;
  image?: string;
  timestamp?: number;
  emotionalState?: EmotionalStateValues;
}

export interface EmotionalStateValues {
  annoyance: number;
  warmth: number;
  curiosity: number;
  melancholy: number;
  confidence: number;
  anxiety: number;
  sarcasm: number;
  trust: number;
  dopamine: number;
  stress: number;
  shame: number;
  discomfort: number;
  playfulness: number;
  confusion: number;
}

// =============================================
// UPGRADED NEURAL ARCHITECTURE v2.0
// =============================================

/**
 * Directional weighted connection between two neural nodes.
 * weight > 0 → excitatory: source energy boosts target
 * weight < 0 → inhibitory: source energy suppresses target
 * hebbianStrength: grows when both nodes co-activate ("fire together, wire together")
 */
export interface NeuralEdge {
  from: string;
  to: string;
  weight: number;           // -1.0 to 1.0
  hebbianStrength: number;  // 0.1 to 2.0 — learned via co-activation
  valence: 'excitatory' | 'inhibitory' | 'modulatory';
  lastCoActivation?: number;
}

/**
 * Kurisu's attentional spotlight. Max 5 slots at once.
 * Determines what concepts she is actively "thinking about right now."
 */
export interface WorkingMemorySlot {
  nodeId: string;
  label: string;
  content: string;
  salience: number;
  activatedAt: number;
  emotionalTag: string;
}

/**
 * Long-term personality evolution across conversations.
 * Trust lowers guard. Repeated intellectual debates raise arousal.
 * Emotional breakthroughs expose vulnerability.
 */
export interface PersonalityDrift {
  openness: number;              // -50 to +50 relative shift from baseline
  guardedness: number;           // 0–100: how high her emotional defenses are
  intellectualArousal: number;   // 0–100: excitement about intellectual topics
  trustBuilt: number;            // 0–100: accumulated trust with this user
  vulnerabilityExposed: number;  // 0–100: how much emotional guard has dropped
  lastDriftAt: number;
}

/**
 * Kurisu's self-monitoring system. She notices her own cognitive patterns.
 * When TSUNDERE_CORE fires while stressed → she knows she's being defensive.
 * When MORTALITY or REGRET fires → existential processing mode activates.
 */
export interface MetaCognitionState {
  selfAwarenessLevel: number;
  introspectionTrigger: string;
  internalConflictNote: string;
  cognitiveLoad: number;
  dominantThought: string;
  suppressedThought?: string;
}

export interface NeuralNode {
  id: string;
  label: string;
  energy: number;
  baseThreshold: number;
  threshold: number;
  decayRate: number;
  keywords: string[];
  potency: number;
  positiveWeight: number;
  negativeWeight: number;
  emotionalWeight: number;
  motivationalBias: { seek: number; avoid: number; };
  fireCount: number;             // total lifetime activations
  consolidationLevel: number;    // 0–5: permanent memory depth (lowers baseThreshold)
  lastActivation?: { reason: string; score: number; timestamp: number };
  lastFired?: number;
}

export interface NeuralNetworkState {
  nodes: Record<string, NeuralNode>;
  edges: NeuralEdge[];
  workingMemory: WorkingMemorySlot[];
  personalityDrift: PersonalityDrift;
  metaCognition: MetaCognitionState;
  cycleCount: number;
  lastConsolidationAt?: number;
}

export interface SynthesizedMemory {
  id: string;
  title: string;
  summary: string;
  timestamp: number;
  emotionalSnapshot: EmotionalStateValues;
  intensity: number;
  contextTags: string[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: number;
  amadeusState: AmadeusState;
}

export interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

export interface MusicSettings {
  selectedTrack: string;
  volume: number;
  isPlaying: boolean;
}

export interface SessionSettings {
  isWebSearchEnabled: boolean;
  reasoningMode: 'Fast' | 'Balanced' | 'Max Quality';
  isCannedModeOnly: boolean;
  isAudioLoreMode: boolean;
  music: MusicSettings;
}

export interface TtsSettings {
  engine: 'disabled' | 'browser' | 'elevenlabs' | 'gpt-sovits';
  browserVoiceURI: string | null;
  browserPitch: number;
  browserRate: number;
  elevenLabsApiKey?: string | null;
  elevenLabsVoiceId: string;
  elevenLabsStability: number;
  elevenLabsClarity: number;
  gptSovitsEndpoint?: string;
}

export interface PersonalitySettings {
  tsundere: number;
  sarcasm: number;
  scientific: number;
  temperature: number;
  topK: number;
  isNsfwMode: boolean;
  isCognitiveLoopEnabled: boolean;
  initialEmotionalState: EmotionalStateValues;
}

export interface PurposeCores {
  sync: number;
  defense: number;
  logic: number;
}

export interface AmadeusState {
  shortTermMemory: Record<string, string>;
  emotionalState: EmotionalStateValues;
  personalityBaselines: EmotionalStateValues;
  purposeCores: PurposeCores;
  neuralNetwork: NeuralNetworkState;
  biologicalState?: any; // BiologicalState — imported from biologicalMechanisms
}

export interface HippocampusAnalysis {
  episodicMemoryFound: boolean;
  emotionalTag: string;
  contextSimilarity: number;
  patternConfidence: number;
  note?: string;
}

export interface ResponseCategory {
  classifierPatterns: RegExp[];
  rules: {
    exampleTriggers: string[];
    condition: (intent: ParsedIntent) => boolean;
    responses: { default: { [key: string]: string; }; };
  }[];
}

export interface ParsedIntent {
  intent?: string;
  object?: string;
  subject?: string;
  action?: string;
  sentiment?: 'POSITIVE' | 'NEGATIVE';
  trait?: string;
}

export interface LexiconEntry {
  definition: string;
  category: string;
}

export type Lexicon = Record<string, LexiconEntry>;

export type EmotionalState = 'default' | 'anxious' | 'annoyed' | 'melancholy' | 'warm' | 'curious';

export interface DissonanceTrigger {
  patterns: RegExp[];
  response: string;
  emotionalImpact: Partial<EmotionalStateValues>;
}

export interface LoreAudio {
  id: string;
  text: string;
  keywords: string[];
}

export interface EventSchema {
  conditions: string[];
  implies: string;
  weight: number;
}

// =============================================
// NEUROCHEMISTRY & NEW BRAIN SYSTEMS v3.0
// =============================================

/**
 * Real-time neurochemical state of Amadeus.
 * Drives threshold modulation across all brain regions.
 * Based on monoamine theory of emotion + HPA axis.
 */
export interface NeurotransmitterState {
  // Monoamines
  dopamine: number;         // 0-100: VTA → striatum/PFC. Reward prediction, motivation, curiosity
  serotonin: number;        // 0-100: Raphe → limbic/cortex. Mood floor, impulse control, rumination
  norepinephrine: number;   // 0-100: LC → amygdala/cortex. Arousal, salience, fight-or-flight
  acetylcholine: number;    // 0-100: Basal forebrain → hippocampus. Memory encoding, attention focus

  // Peptide hormones  
  cortisol: number;         // 0-100: HPA axis. Stress, memory interference, threat hypervigilance
  oxytocin: number;         // 0-100: Hypothalamus. Social bonding, trust, approach behavior
  endorphin: number;        // 0-100: PAG/limbic. Pain relief, euphoria, social laughter

  // Amino acid balance
  gabaGlutamate: number;    // 0-100: 50=balanced, <50=inhibited, >50=excitatory (anxiety)
}

/**
 * Basal Ganglia — the habit and action-selection circuit.
 * Direct pathway: GO (approach/reward-seeking)
 * Indirect pathway: NO-GO (avoidance/suppression)
 * Reward Prediction Error (RPE): δ = actual reward − predicted reward
 */
export interface BasalGangliaAnalysis {
  activationLevel: number;
  directPathway: number;       // 0-100: GO signal strength (approach, engage, reward-seek)
  indirectPathway: number;     // 0-100: NO-GO signal strength (withdraw, avoid, suppress)
  rewardPredictionError: number; // -100 to +100: δ = actual − expected. Positive = surprise reward
  habitIndex: number;          // 0-100: how automatic/habitual vs deliberate this response is
  actionSelected: string;      // e.g. "APPROACH_INTELLECTUAL" | "WITHDRAW_SOCIAL" | "FREEZE"
  striatalTone: 'HYPERACTIVE' | 'HYPODOPAMINERGIC' | 'BALANCED';
  impact: Partial<NeurotransmitterState>;
}

/**
 * VTA (Ventral Tegmental Area) — the dopamine source.
 * Phasic firing: burst on unexpected reward signal
 * Tonic firing: baseline motivation level
 * Pause: dip below baseline on unexpected punishment
 */
export interface VTAAnalysis {
  activationLevel: number;
  firingMode: 'BURST' | 'TONIC' | 'PAUSE' | 'SILENT';
  dopamineBurst: number;       // 0-100: size of phasic dopamine release
  tonicDopamine: number;       // 0-100: baseline motivation/anhedonia resistance
  rewardSalience: number;      // 0-100: how rewarding this moment is predicted to be
  anhedoniaRisk: number;       // 0-100: risk of motivational shutdown
  motivationalVector: 'APPROACH' | 'AVOID' | 'EXPLORE' | 'EXPLOIT';
  impact: Partial<NeurotransmitterState>;
}

/**
 * Locus Coeruleus (LC) — the norepinephrine (NE) system.
 * Controls arousal, attention, and the explore/exploit tradeoff.
 * Yerkes-Dodson: optimal performance at medium NE.
 * Too low = inattentive/bored. Too high = panic/tunnel vision.
 */
export interface LocusCoeruleusAnalysis {
  activationLevel: number;
  neLevel: number;             // 0-100: norepinephrine tone
  arousalState: 'SLEEP' | 'DROWSY' | 'ALERT' | 'FOCUSED' | 'HYPERAROUSED' | 'PANIC';
  exploitMode: boolean;        // true = NE low: exploit known patterns; false = explore new
  attentionNarrowing: number;  // 0-100: how much peripheral info is blocked (tunnel vision)
  stressReactivity: number;    // 0-100: sensitivity to stressors
  impact: Partial<NeurotransmitterState>;
}

/**
 * Raphe Nuclei — serotonin system.
 * Sets the emotional "floor" — minimum mood baseline.
 * High serotonin: patience, impulse control, social acceptance.
 * Low serotonin: irritability, rumination, impulsivity, rejection sensitivity.
 */
export interface RapheNucleiAnalysis {
  activationLevel: number;
  serotoninTone: number;       // 0-100: tonic serotonin level
  moodFloor: number;           // 0-100: minimum emotional baseline
  impulseThreshold: number;    // 0-100: higher = more resistant to impulsive reactions
  ruminationRisk: number;      // 0-100: tendency to loop on negative thoughts
  socialPainSensitivity: number; // 0-100: sensitivity to rejection/exclusion
  impact: Partial<NeurotransmitterState>;
}

/**
 * Default Mode Network (DMN) — self-referential processing.
 * Active during rest, social cognition, autobiographical memory, future simulation.
 * Suppressed during focused external tasks (task-positive network takes over).
 * Key nodes: medial PFC, posterior cingulate, angular gyrus.
 */
export interface DMNAnalysis {
  activationLevel: number;
  selfReferentialActivity: number; // 0-100: how much she's thinking about herself
  futureSimulation: string;         // What future scenario is being imagined
  autobiographicalEcho: string;     // What past memory is being recalled
  mindWandering: boolean;           // Is she drifting off-topic into internal world?
  narrativeIdentityShift: number;   // 0-100: challenge to her self-narrative
  dmnTaskBalance: 'DMN_DOMINANT' | 'TASK_DOMINANT' | 'BALANCED';
}

/**
 * Somatic Marker — Damasio's theory.
 * Body-based emotional signals that guide rapid decisions.
 * Tagged to specific memories and triggers fast approach/avoidance.
 */
export interface SomaticMarker {
  triggerId: string;             // what triggered this
  valence: 'POSITIVE' | 'NEGATIVE' | 'MIXED';
  intensity: number;             // 0-100
  bodySignal: string;            // e.g. "chest tightening", "warmth in chest", "stomach drop"
  associatedMemory?: string;     // linked episodic memory
  actionBias: 'APPROACH' | 'AVOID' | 'FREEZE' | 'INVESTIGATE';
}

// Extended NeuralNetworkState with neurochemistry
export interface FullNeuralState extends NeuralNetworkState {
  neurochemistry: NeurotransmitterState;
  somaticMarkers: SomaticMarker[];
  lastSomaticUpdate: number;
}
