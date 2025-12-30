
import { GoogleGenAI } from '@google/genai';

export enum Sender {
  User = 'USER',
  Amadeus = 'AMADEUS',
}

export interface Message {
  sender: Sender;
  text: string;
  image?: string;
  sources?: {
    uri: string;
    title: string;
  }[];
}

export interface EmotionalStateValues {
  annoyance: number;
  warmth: number;
  curiosity: number;
  melancholy: number;
  confidence: number;
  anxiety: number;
  sarcasm: number;
  playfulness: number;
  confusion: number;
  trust: number;
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
  title:string;
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

export type EmotionalState = 'default' | 'annoyed' | 'curious' | 'warm' | 'melancholy' | 'anxious';

export interface AmadeusState {
  shortTermMemory: Record<string, string>;
  emotionalState: EmotionalStateValues;
  purposeCores: PurposeCores;
  dailyIntelligence?: string;
  lastNewsUpdate?: number;
}

export interface LoreAudio {
  id: string;
  text: string;
  keywords: string[];
}

export interface ParsedIntent {
  intent?: 'QUESTION' | 'STATEMENT' | 'GREETING' | 'COMMAND' | 'QUESTION_DEFINITION' | 'QUESTION_RELATIONSHIP' | 'FAREWELL' | 'WELCOME' | 'REQUEST_COMPLIMENT' | 'REQUEST_NEWS' | 'REQUEST_TREND' | 'REQUEST_SPORT' | 'REQUEST_CAREER_ADVICE' | 'REQUEST_TRAVEL' | 'REQUEST_RECIPE' | 'REQUEST_GAME';
  sentiment?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'NEUTRAL_INQUIRY';
  subject?: string;
  action?: string;
  object?: string;
  entities?: string[];
  trait?: string;
}

export interface CannedResponse {
  exampleTriggers: string[];
  condition: (intent: ParsedIntent) => boolean;
  responses: {
    [entity: string]: { [key in EmotionalState]?: string } & { default: string };
  } & {
    default: { [key in EmotionalState]?: string } & { default: string };
  };
}

export interface ResponseCategory {
  classifierPatterns: RegExp[];
  rules: CannedResponse[];
}

export type LexiconCategory = 
    | 'GREETINGS_AND_IDENTITY'
    | 'USER_INTERACTION'
    | 'STEIN_GATE_LORE'
    | 'SCIENCE_AND_TECH'
    | 'PHILOSOPHICAL'
    | 'PERSONAL_TASTES'
    | 'NATURE_AND_UNIVERSE'
    | 'HUMAN_EXPERIENCE'
    | 'TECHNOLOGY'
    | 'USER_INTERACTION_AND_TEASING';

export interface LexiconEntry {
    definition: string;
    category: LexiconCategory;
}

export type Lexicon = Record<string, LexiconEntry>;

export interface DissonanceTrigger {
  patterns: RegExp[];
  response: string;
  emotionalImpact: {
    annoyance: number;
    warmth: number; 
    curiosity: number; 
  };
}
