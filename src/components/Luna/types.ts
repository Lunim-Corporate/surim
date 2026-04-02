// Luna AI Assistant Types

export type LunaState = 
  | 'idle' 
  | 'landing' 
  | 'listening' 
  | 'thinking' 
  | 'clarify' 
  | 'answering' 
  | 'plan-ready' 
  | 'error';

export type PrivacyMode = 'on-the-record' | 'confidential';

export type InteractionMode = 'voice' | 'text';

export interface LunaConversationDecision {
  readinessScore: number;
  clarityScore: number;
  confidence: number;
  recommendedAction: 'ask_more' | 'generate_plan' | 'handoff';
  shouldNudgeHuman: boolean;
  nudgeMessage?: string;
  rationale?: string;
  suggestedFollowUpAngle?: string;
}

export interface LunaClarify {
  understanding: string;
  questions: string[];
  questionIntro?: string;
  decision?: LunaConversationDecision;
}

export interface LunaNextStep {
  title: string;
  description: string;
  action?: string;
}

export interface LunaPlan {
  summary: string;
  keyInsights: string[];
  nextSteps: LunaNextStep[];
  estimatedScope: string;
  calendlyPurpose: string;
  tags: string[];
}

export interface LunaMessage {
  id: string;
  role: 'user' | 'luna';
  content: string;
  timestamp: Date;
}

export interface LunaSession {
  id: string;
  privacyMode: PrivacyMode;
  messages: LunaMessage[];
  clarify?: LunaClarify;
  plan?: LunaPlan;
  createdAt: Date;
}

export interface LunaContextState {
  state: LunaState;
  session: LunaSession | null;
  interactionMode: InteractionMode;
  isListening: boolean;
  isSpeaking: boolean;
  caption: string;
  error: string | null;
}

export type LunaAction =
  | { type: 'SET_STATE'; payload: LunaState }
  | { type: 'START_SESSION'; payload: PrivacyMode }
  | { type: 'END_SESSION' }
  | { type: 'ADD_MESSAGE'; payload: { role: 'user' | 'luna'; content: string } }
  | { type: 'SET_CLARIFY'; payload: LunaClarify }
  | { type: 'SET_PLAN'; payload: LunaPlan }
  | { type: 'SET_MODE'; payload: InteractionMode }
  | { type: 'SET_LISTENING'; payload: boolean }
  | { type: 'SET_SPEAKING'; payload: boolean }
  | { type: 'SET_CAPTION'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null };
