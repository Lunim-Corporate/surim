import { LunaContextState, LunaAction, LunaSession } from './types';

export const initialLunaState: LunaContextState = {
  state: 'idle',
  session: null,
  interactionMode: 'voice',
  isListening: false,
  isSpeaking: false,
  caption: '',
  error: null,
};

// Use client-side only ID generation to avoid hydration errors
let idCounter = 0;
function generateId(): string {
  if (typeof window === 'undefined') {
    // Server-side: use counter only
    return `server-${idCounter++}`;
  }
  // Client-side: use timestamp + counter for uniqueness
  return `${Date.now()}-${idCounter++}`;
}

export function lunaReducer(
  state: LunaContextState,
  action: LunaAction
): LunaContextState {
  switch (action.type) {
    case 'SET_STATE':
      return {
        ...state,
        state: action.payload,
        error: null,
      };

    case 'START_SESSION': {
      const newSession: LunaSession = {
        id: generateId(),
        privacyMode: action.payload,
        messages: [],
        createdAt: new Date(),
      };
      return {
        ...state,
        session: newSession,
        state: 'landing',
        error: null,
      };
    }

    case 'END_SESSION':
      return {
        ...state,
        session: null,
        state: 'idle',
        caption: '',
        error: null,
      };

    case 'ADD_MESSAGE': {
      if (!state.session) return state;

      const newMessage = {
        id: generateId(),
        role: action.payload.role,
        content: action.payload.content,
        timestamp: new Date(),
      };

      return {
        ...state,
        session: {
          ...state.session,
          messages: [...state.session.messages, newMessage],
        },
      };
    }

    case 'SET_CLARIFY': {
      if (!state.session) return state;

      return {
        ...state,
        session: {
          ...state.session,
          clarify: action.payload,
        },
        state: 'clarify',
      };
    }

    case 'SET_PLAN': {
      if (!state.session) return state;

      return {
        ...state,
        session: {
          ...state.session,
          plan: action.payload,
        },
        state: 'plan-ready',
      };
    }

    case 'SET_MODE':
      return {
        ...state,
        interactionMode: action.payload,
      };

    case 'SET_LISTENING':
      return {
        ...state,
        isListening: action.payload,
      };

    case 'SET_SPEAKING':
      return {
        ...state,
        isSpeaking: action.payload,
      };

    case 'SET_CAPTION':
      return {
        ...state,
        caption: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        state: action.payload ? 'error' : state.state,
      };

    default:
      return state;
  }
}
