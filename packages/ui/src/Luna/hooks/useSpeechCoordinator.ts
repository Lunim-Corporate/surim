/**
 * Speech Coordinator for Luna Voice Assistant
 *
 * Ensures deterministic, overlap-free speech behavior:
 * - Processing phrase spoken at most once per request
 * - Never speaks two things simultaneously
 * - Waits for processing phrase to finish before speaking response
 * - Skips processing phrase if response arrives quickly
 *
 * Assumptions:
 * - speak() is idempotent when already speaking (handled by useSpeechSynthesis)
 * - isSpeaking accurately reflects current speech state
 * - PROCESSING_DELAY_MS gives fast responses a chance to skip the processing phrase
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { lunaProcessingPhrases } from '../components/lunaProcessingPhrases';

// Delay before speaking processing phrase (allows fast responses to skip it)
const PROCESSING_DELAY_MS = 350;

export type SpeechCoordinatorState =
  | 'IDLE'
  | 'PENDING_PROCESSING'
  | 'SPEAKING_PROCESSING'
  | 'AWAITING_RESPONSE';

export interface UseSpeechCoordinatorOptions {
  speak: (text: string) => void;
  isSpeaking: boolean;
  onProcessingPhraseStart?: (phrase: string) => void;
  onProcessingPhraseEnd?: () => void;
}

export interface SpeechCoordinatorResult {
  /** Current state of the coordinator */
  coordinatorState: SpeechCoordinatorState;
  /** The processing phrase currently being spoken (if any) */
  currentProcessingPhrase: string | null;
  /** Call when user submits a request (starts the processing phrase timer) */
  onRequestStart: () => void;
  /**
   * Call when backend response is ready. Returns a Promise that resolves
   * when it's safe to speak the response (processing phrase done or skipped).
   */
  waitForProcessingComplete: () => Promise<void>;
  /** Call to cancel/reset the coordinator */
  reset: () => void;
  /** Whether a processing phrase was spoken for the current request */
  processingPhraseSpoken: boolean;
}

export function useSpeechCoordinator(
  options: UseSpeechCoordinatorOptions
): SpeechCoordinatorResult {
  const { speak, isSpeaking, onProcessingPhraseStart, onProcessingPhraseEnd } = options;

  const [coordinatorState, setCoordinatorState] = useState<SpeechCoordinatorState>('IDLE');
  const [currentProcessingPhrase, setCurrentProcessingPhrase] = useState<string | null>(null);
  const [processingPhraseSpoken, setProcessingPhraseSpoken] = useState(false);

  // Refs for state that callbacks need to access without stale closures
  const stateRef = useRef<SpeechCoordinatorState>('IDLE');
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedPhraseRef = useRef<string | null>(null);
  const isSpeakingRef = useRef(false);

  // Promise resolver for waitForProcessingComplete
  const processingCompleteResolverRef = useRef<(() => void) | null>(null);

  // Keep refs in sync
  useEffect(() => {
    stateRef.current = coordinatorState;
  }, [coordinatorState]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  // Track speech completion to drive state transitions
  const wasSpeakingRef = useRef(false);

  useEffect(() => {
    const wasSpeak = wasSpeakingRef.current;
    wasSpeakingRef.current = isSpeaking;

    // Detect speech end (was speaking, now not speaking)
    if (wasSpeak && !isSpeaking) {
      handleSpeechCompleted();
    }
  }, [isSpeaking]);

  const handleSpeechCompleted = useCallback(() => {
    const currentState = stateRef.current;

    if (currentState === 'SPEAKING_PROCESSING') {
      onProcessingPhraseEnd?.();

      // Transition to awaiting response
      setCoordinatorState('AWAITING_RESPONSE');
      stateRef.current = 'AWAITING_RESPONSE';

      // If someone is waiting for processing to complete, resolve now
      if (processingCompleteResolverRef.current) {
        processingCompleteResolverRef.current();
        processingCompleteResolverRef.current = null;
      }
    }
  }, [onProcessingPhraseEnd]);

  const onRequestStart = useCallback(() => {
    // Reset state for new request
    setProcessingPhraseSpoken(false);
    setCurrentProcessingPhrase(null);
    processingCompleteResolverRef.current = null;

    // Select a random processing phrase upfront
    const phrase = lunaProcessingPhrases[Math.floor(Math.random() * lunaProcessingPhrases.length)];
    selectedPhraseRef.current = phrase;

    // Transition to pending state
    setCoordinatorState('PENDING_PROCESSING');
    stateRef.current = 'PENDING_PROCESSING';

    // Start delay timer
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
    }

    delayTimerRef.current = setTimeout(() => {
      delayTimerRef.current = null;

      // Only speak processing phrase if still in PENDING_PROCESSING
      if (stateRef.current !== 'PENDING_PROCESSING') {
        return;
      }

      // Speak processing phrase
      const phraseToSpeak = selectedPhraseRef.current!;
      setCoordinatorState('SPEAKING_PROCESSING');
      stateRef.current = 'SPEAKING_PROCESSING';
      setProcessingPhraseSpoken(true);
      setCurrentProcessingPhrase(phraseToSpeak);
      onProcessingPhraseStart?.(phraseToSpeak);
      speak(phraseToSpeak);
    }, PROCESSING_DELAY_MS);
  }, [speak, onProcessingPhraseStart]);

  const waitForProcessingComplete = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      const currentState = stateRef.current;

      // Cancel delay timer - response is ready, no need for processing phrase
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }

      switch (currentState) {
        case 'IDLE':
          // No request in progress, safe to speak immediately
          resolve();
          break;

        case 'PENDING_PROCESSING':
          // Response arrived before processing phrase started - skip it
          setCoordinatorState('IDLE');
          stateRef.current = 'IDLE';
          setCurrentProcessingPhrase(null);
          resolve();
          break;

        case 'SPEAKING_PROCESSING':
          // Processing phrase is playing - wait for it to finish
          processingCompleteResolverRef.current = resolve;
          break;

        case 'AWAITING_RESPONSE':
          // Processing phrase already finished, safe to speak
          setCoordinatorState('IDLE');
          stateRef.current = 'IDLE';
          resolve();
          break;
      }
    });
  }, []);

  const reset = useCallback(() => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
    selectedPhraseRef.current = null;
    processingCompleteResolverRef.current = null;
    setCoordinatorState('IDLE');
    stateRef.current = 'IDLE';
    setProcessingPhraseSpoken(false);
    setCurrentProcessingPhrase(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
      }
    };
  }, []);

  return {
    coordinatorState,
    currentProcessingPhrase,
    onRequestStart,
    waitForProcessingComplete,
    reset,
    processingPhraseSpoken,
  };
}
