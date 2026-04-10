'use client';

import { useReducer, useCallback, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion, LayoutGroup } from 'framer-motion';
import {
  X,
  Download,
  Play,
  Settings,
  RotateCcw,
  Volume2,
  MessageSquare,
  Mic,
} from 'lucide-react';
import Image from 'next/image';
import lunaImage from '@/assets/luna.png';
import { lunaReducer, initialLunaState } from './lunaReducer';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { LunaPortrait } from './components/LunaPortrait';
import { VoiceControls } from './components/VoiceControls';
import { SpeechErrorBoundary } from './components/SpeechErrorBoundary';
import { PrivacyMode, InteractionMode, LunaConversationDecision } from './types';
import { lunaAnalytics } from './utils/analytics';
import { generatePlanPDF, downloadPDF } from './utils/pdf';
import { speechManager } from './utils/speechManager';
import { lunaProcessingPhrases } from './components/lunaProcessingPhrases';

interface LunaPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

function LunaPortalContent({ isOpen, onClose }: LunaPortalProps) {
  const [state, dispatch] = useReducer(lunaReducer, initialLunaState);
  const [textInput, setTextInput] = useState('');
  const [ttsRate, setTtsRate] = useState(0.95);
  const [processingPhrase, setProcessingPhrase] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [pendingPrivacyMode, setPendingPrivacyMode] = useState<PrivacyMode>('on-the-record');
  const [pendingInteractionMode, setPendingInteractionMode] =
    useState<InteractionMode>('voice');
  const [showTranscript, setShowTranscript] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const [reduceMotionManual, setReduceMotionManual] = useState(false);
  const reduceMotion = prefersReducedMotion || reduceMotionManual;
  const wasOpenRef = useRef(isOpen);

  //Refs to control processing phrases without triggering re-renders
  const isSpeakingProcessingPhraseRef = useRef(false);
  const isIntentionallyCancelingRef = useRef(false);


  // Speech synthesis for Luna's voice
  // Ref to track if speech is in progress to prevent duplicates
  const speechQueueRef = useRef<string | null>(null);

  // Refs to access latest state in callbacks without triggering re-renders
  const stateRef = useRef(state);
  const listeningCallbacksRef = useRef<{
    start: (() => void) | null;
    stop: (() => void) | null;
    isListening: boolean;
  }>({ start: null, stop: null, isListening: false });

  // Refs for speak and cancel functions to avoid dependency issues
  const speakRef = useRef<((text: string) => void) | null>(null);
  const cancelSpeechRef = useRef<(() => void) | null>(null);
  
  // Update refs when state changes
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Detect when the portal is closed to end the analytics session
  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      console.log('[Luna] Portal closed, ending analytics session');
      lunaAnalytics.endSession();
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  // Auto-hide confetti after a short duration
  useEffect(() => {
    if (!showConfetti) return;
    const timeout = setTimeout(
      () => setShowConfetti(false),
      reduceMotion ? 500 : 1500
    );
    return () => clearTimeout(timeout);
  }, [showConfetti, reduceMotion]);
  
  const { speak: speakRaw, cancel: cancelSpeech, isSpeaking } = useSpeechSynthesis({
    onStart: () => {
      console.log('[Luna] Speech started');
      dispatch({ type: 'SET_SPEAKING', payload: true });
      // Stop listening when Luna starts speaking
      if (listeningCallbacksRef.current.isListening && listeningCallbacksRef.current.stop) {
        console.log('[Luna] Stopping listening because Luna is speaking');
        listeningCallbacksRef.current.stop();
      }
    },
    onEnd: () => {
      console.log('[Luna] Speech ended');
      dispatch({ type: 'SET_SPEAKING', payload: false });
      speechQueueRef.current = null;

      const wasProcessingPhrase = isSpeakingProcessingPhraseRef.current;
      isSpeakingProcessingPhraseRef.current = false;

      // Auto-enable microphone after Luna finishes speaking (only in voice mode, not during processing phrases or thinking)
      if (!wasProcessingPhrase) {
        setTimeout(() => {
          const currentState = stateRef.current;
          if (currentState.interactionMode === 'voice' &&
              currentState.session &&
              !listeningCallbacksRef.current.isListening &&
              currentState.state !== 'plan-ready' &&
              currentState.state !== 'thinking' &&
              listeningCallbacksRef.current.start) {
            console.log('[Luna] Auto-starting listening after speech ended');
            listeningCallbacksRef.current.start();
          }
        }, 500);
      }
    },
    onError: (error) => {
      // Don't show error if we intentionally canceled for processing phrase transition
      if (isIntentionallyCancelingRef.current) {
        console.log('[Luna] Intentionally canceled processing phrase speech');
        isIntentionallyCancelingRef.current = false;
        speechQueueRef.current = null;
        isSpeakingProcessingPhraseRef.current = false;
        return;
      }

      // Don't show "interrupted" errors to the user - they're normal when canceling speech
      if (error.message.includes('interrupted')) {
        console.log('[Luna] Speech was interrupted (expected during transitions)');
        speechQueueRef.current = null;
        isSpeakingProcessingPhraseRef.current = false;
        return;
      }

      console.error('Speech synthesis error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      speechQueueRef.current = null;
      isSpeakingProcessingPhraseRef.current = false;
    },
    rate: ttsRate,
  });
  
  // Wrap speak function to prevent duplicates
  const speak = useCallback(
    (text: string) => {
      if (isSpeaking) {
        console.log('[Luna] Prevented speech - already speaking');
        return;
      }
      if (speechQueueRef.current === text) {
        console.log('[Luna] Prevented duplicate speech request:', text.substring(0, 50));
        return;
      }
      console.log('[Luna] Speaking:', text.substring(0, 100));
      speechQueueRef.current = text;
      void speakRaw(text);
    },
    [speakRaw, isSpeaking]
  );

  // Update speak and cancel refs
  useEffect(() => {
    speakRef.current = speak;
    cancelSpeechRef.current = cancelSpeech;
  }, [speak, cancelSpeech]);

  // Helper: speak and wait until speech completes before continuing
  const speakAndWait = useCallback(
    async (text: string) => {
      // Cancel any ongoing processing phrase speech
      if (isSpeakingProcessingPhraseRef.current && stateRef.current.isSpeaking) {
        isIntentionallyCancelingRef.current = true;
        cancelSpeech();
        // Small delay to ensure cancellation completes
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      isSpeakingProcessingPhraseRef.current = false;

      speak(text);
      // Poll isSpeaking flag until speech actually starts and then finishes
      await new Promise<void>((resolve) => {
        let hasStarted = false;
        const check = () => {
          const current = stateRef.current;
          if (current.isSpeaking) {
            hasStarted = true;
          }
          if (hasStarted && !current.isSpeaking) {
            resolve();
            return;
          }
          setTimeout(check, 60);
        };
        check();
      });
    },
    [speak, cancelSpeech]
  );

  // Speech recognition for user input
  const processedInputRef = useRef<Set<string>>(new Set());
  const ignoreVoiceResultsRef = useRef(false);
  
  const { startListening, stopListening, isListening, resetTranscript } = 
    useSpeechRecognition({
      onResult: (text, isFinal) => {
        // If we've switched away from voice mode and decided to ignore any
        // leftover mic results, drop them immediately.
        if (ignoreVoiceResultsRef.current) {
          return;
        }

        dispatch({ type: 'SET_CAPTION', payload: text });
        if (isFinal && text.trim()) {
          // Extra safety: if mode is no longer voice, ignore any final voice result
          const currentMode = stateRef.current.interactionMode;
          if (currentMode !== 'voice') {
            console.log('[Luna] Ignoring voice result because mode is now text');
            return;
          }

          // Prevent processing the same input multiple times
          const inputKey = text.trim().toLowerCase();
          if (!processedInputRef.current.has(inputKey)) {
            processedInputRef.current.add(inputKey);
            console.log('[Luna] Processing user input:', text.substring(0, 50));
            handleUserInput(text);
            
            // Clear processed inputs after a delay
            setTimeout(() => {
              processedInputRef.current.delete(inputKey);
            }, 10000);
          } else {
            console.log('[Luna] Skipped duplicate input:', text.substring(0, 50));
          }
        }
      },
      onError: (error) => {
        console.error('Speech recognition error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Could not hear you. Please try again.' });
      },
    });

  //Handle processing phrase - show one random phrase per thinking phase
  const startProcessingPhrases = useCallback(() => {
    // Pick one random phrase
    const randomPhrase = lunaProcessingPhrases[Math.floor(Math.random() * lunaProcessingPhrases.length)];
    setProcessingPhrase(randomPhrase);

    // In voice mode, speak the phrase once
    if (stateRef.current.interactionMode === 'voice' && !stateRef.current.isSpeaking && speakRef.current) {
      isSpeakingProcessingPhraseRef.current = true;
      speakRef.current(randomPhrase);
    }
  }, []);

  const stopProcessingPhrases = useCallback(() => {
    // Cancel speech if we're currently speaking a processing phrase in voice mode
    if (isSpeakingProcessingPhraseRef.current && stateRef.current.isSpeaking && cancelSpeechRef.current) {
      isIntentionallyCancelingRef.current = true;
      cancelSpeechRef.current();
    }

    isSpeakingProcessingPhraseRef.current = false;
    setProcessingPhrase(null);
  }, []);

  // Update listening callbacks ref
  useEffect(() => {
    listeningCallbacksRef.current = {
      start: startListening,
      stop: stopListening,
      isListening,
    };
  }, [startListening, stopListening, isListening]);
  
  // Sync listening state
  useEffect(() => {
    dispatch({ type: 'SET_LISTENING', payload: isListening });
  }, [isListening]);

  // Sync speaking state
  useEffect(() => {
    dispatch({ type: 'SET_SPEAKING', payload: isSpeaking });
  }, [isSpeaking]);

  // Start and stop phrase cycling based on Luna's thinking state
  useEffect(() => {
    if (state.state === "thinking") {
      // Stop listening when entering thinking state
      if (listeningCallbacksRef.current.isListening && listeningCallbacksRef.current.stop) {
        console.log('[Luna] Stopping listening because entering thinking state');
        listeningCallbacksRef.current.stop();
      }
      startProcessingPhrases();
    } else {
      stopProcessingPhrases();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.state]);

  
  // Cleanup on unmount and route changes
  useEffect(() => {
    // Handle route changes in Next.js
    const handleRouteChange = () => {
      console.log('[Luna] Route change detected, cleaning up speech');
      cancelSpeech();
      speechManager.cancel();
    };

    // Listen for Next.js route changes
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleRouteChange);
      // For Next.js app router
      window.addEventListener('popstate', handleRouteChange);
    }

    return () => {
      console.log('[Luna] Component unmounting, cleaning up');
      cancelSpeech();
      speechManager.cancel();
      if (isListening) {
        stopListening();
      }
      // End analytics session
      lunaAnalytics.endSession();
      
      // Remove event listeners
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', handleRouteChange);
        window.removeEventListener('popstate', handleRouteChange);
      }
    };
  }, [cancelSpeech, isListening, stopListening]);

  // Initialize session with greeting
  const startSession = useCallback(async (privacyMode?: PrivacyMode) => {
    const mode = privacyMode ?? pendingPrivacyMode;
    const interactionMode = pendingInteractionMode;
    console.log('[Luna] Starting session with privacy mode:', mode, 'interaction mode:', interactionMode);
    
    dispatch({ type: 'START_SESSION', payload: mode });
    // Apply the pre-selected interaction mode when starting
    dispatch({ type: 'SET_MODE', payload: interactionMode });
    
    // Start analytics tracking
    const sessionId = `session-${Date.now()}`;
    lunaAnalytics.startSession(sessionId, mode);
    
    const greeting = "Hi! I'm Luna, your guide at Surim Studio. Tell me about your project and I'll help you find the perfect next steps.";
    
    // In voice mode, speak first, then show the message; in text mode, show immediately.
    if (interactionMode === 'voice') {
      await speakAndWait(greeting);
    }

    dispatch({ type: 'ADD_MESSAGE', payload: { role: 'luna', content: greeting } });
    lunaAnalytics.trackMessage('luna', greeting);
  }, [speakAndWait, pendingPrivacyMode, pendingInteractionMode]);

  // Handle user input from voice or text
  const handleUserInput = useCallback(async (input: string) => {
    if (!input.trim() || !state.session) return;

    // Compute updated conversation and turn count up front so the latest
    // user message is always included in planning decisions.
    const updatedConversation = [
      ...state.session.messages.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: input },
    ];
    const previousUserMessages = state.session.messages.filter((m) => m.role === 'user').length;
    const currentUserTurn = previousUserMessages + 1;
    const MAX_USER_TURNS = 6;
    const MIN_USER_TURNS_FOR_PLAN = 3;
    const normalizedInput = input.toLowerCase();
    const confusionKeywords = [
      'not sure',
      "don't know",
      'dont know',
      'confused',
      'unsure',
      'no idea',
      "haven't decided",
      'havent decided',
      'still figuring',
      'figure it out',
      'figure out',
      'need clarity',
      'not clear',
      'help me decide',
      'help me figure',
      'overwhelmed',
    ];
    const seemsConfused =
      currentUserTurn >= 4 &&
      confusionKeywords.some((keyword) => normalizedInput.includes(keyword));

    // If a plan is already present, avoid looping endlessly. Gently
    // redirect the user toward speaking with Surim for deeper clarity.
    if (state.session.plan) {
      const closingMessage =
        "I've already shared a tailored plan based on what you've told me so far. For anything more nuanced or if you still have doubts, the best next step is to talk with the Surim team directly so we can look at your situation in detail together.";

      const currentMode = stateRef.current.interactionMode;
      if (currentMode === 'voice') {
        await speakAndWait(closingMessage);
      }

      dispatch({ type: 'ADD_MESSAGE', payload: { role: 'luna', content: closingMessage } });
      lunaAnalytics.trackMessage('luna', closingMessage);
      return;
    }

    dispatch({ type: 'ADD_MESSAGE', payload: { role: 'user', content: input } });
    dispatch({ type: 'SET_STATE', payload: 'thinking' });
    dispatch({ type: 'SET_CAPTION', payload: '' });
    resetTranscript();
    
    // Track user message
    lunaAnalytics.trackMessage('user', input);

    try {
      const reachedTurnLimit = currentUserTurn >= MAX_USER_TURNS;
      const shouldForcePlan = reachedTurnLimit || seemsConfused;

      let clarifyData: {
        understanding: string;
        questions: string[];
        questionIntro?: string;
        decision?: LunaConversationDecision;
      } | null = null;

      if (!shouldForcePlan) {
        const response = await fetch('/api/luna/clarify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversation: updatedConversation,
            privacyMode: state.session.privacyMode,
            metadata: {
              userMessageCount: currentUserTurn,
              totalMessages: updatedConversation.length,
              minTurnsForPlan: MIN_USER_TURNS_FOR_PLAN,
              maxTurns: MAX_USER_TURNS,
              detectedConfusion: seemsConfused,
            },
          }),
        });
        const { data } = await response.json();
        clarifyData = data;
        dispatch({ type: 'SET_CLARIFY', payload: data });
      }

      const decision = clarifyData?.decision;
      const readinessScore = decision?.readinessScore ?? 0;
      const clarityScore = decision?.clarityScore ?? 0;
      const recommendedAction = decision?.recommendedAction ?? 'ask_more';
      const shouldNudgeHuman = decision?.shouldNudgeHuman ?? false;
      const meetsSoftPlanThreshold =
        currentUserTurn >= MIN_USER_TURNS_FOR_PLAN &&
        readinessScore >= 0.65 &&
        clarityScore >= 0.5;
      const shouldGeneratePlan =
        shouldForcePlan ||
        recommendedAction === 'generate_plan' ||
        recommendedAction === 'handoff' ||
        meetsSoftPlanThreshold;

      if (!shouldGeneratePlan && recommendedAction === 'ask_more') {
        const nextQuestion =
          clarifyData?.questions?.[0] ??
          (decision?.suggestedFollowUpAngle && decision.suggestedFollowUpAngle.length > 0
            ? `Could you share a bit more about ${decision.suggestedFollowUpAngle}?`
            : "Before I map out your plan, is there anything about success metrics or timing you'd like me to know?");
        const intro =
          clarifyData?.questionIntro && clarifyData.questionIntro.trim().length > 0
            ? clarifyData.questionIntro.trim()
            : 'Got it. One more thing:';
        const questionMessage = `${intro} ${nextQuestion}`.trim();

        const currentMode = stateRef.current.interactionMode;
        console.log('[Luna] Clarify question, mode:', currentMode);
        if (currentMode === 'voice') {
          await speakAndWait(questionMessage);
        }

        dispatch({ type: 'ADD_MESSAGE', payload: { role: 'luna', content: questionMessage } });
        dispatch({ type: 'SET_STATE', payload: 'clarify' });
        lunaAnalytics.trackMessage('luna', questionMessage);
        lunaAnalytics.trackClarifyPhase(currentUserTurn);
        return;
      }

      // Phase 2: Generate plan
      dispatch({ type: 'SET_STATE', payload: 'thinking' });
      const response = await fetch('/api/luna/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: updatedConversation,
          privacyMode: state.session.privacyMode,
        }),
      });

      const { data } = await response.json();

      let intro: string;
      if (recommendedAction === 'handoff' || shouldNudgeHuman) {
        intro =
          decision?.nudgeMessage ??
          "It sounds like the best way to get complete clarity is to talk with someone from Surim directly. I'll outline a plan now so you can step into that conversation with confidence.";
      } else if (seemsConfused) {
        intro =
          "It sounds like there are still a few open questions about the right next move. Let me pull everything together into a clear plan, and a Surim teammate can help you get full clarity on the details.";
      } else if (reachedTurnLimit) {
        intro =
          "We've covered quite a bit already. Let me summarise what you've shared into a plan, and if you'd like more nuance afterwards a Surim team member can dive deeper with you.";
      } else if (recommendedAction === 'generate_plan') {
        intro =
          decision?.rationale ??
          "Based on everything you've shared, it sounds like we're ready to move forward with a concrete plan.";
      } else {
        intro = "Great! Based on what you've shared, here is a plan that could work well.";
      }

      const planMessage = `${intro} ${data.summary}`;

      const currentMode = stateRef.current.interactionMode;
      console.log('[Luna] Plan message, mode:', currentMode);
      if (currentMode === 'voice') {
        await speakAndWait(planMessage);
      }

      dispatch({ type: 'ADD_MESSAGE', payload: { role: 'luna', content: planMessage } });
      lunaAnalytics.trackMessage('luna', planMessage);
      lunaAnalytics.trackPlanGenerated({
        summary: data.summary,
        nextStepsCount: data.nextSteps.length,
        estimatedScope: data.estimatedScope,
        tags: data.tags,
      });

      dispatch({ type: 'SET_PLAN', payload: data });
      lunaAnalytics.updateMetrics({ planSummary: data.summary });

      const activeSession = state.session;
      if (activeSession?.privacyMode === 'on-the-record') {
        const conversationForPersistence = [
          ...updatedConversation,
          { role: 'luna' as const, content: planMessage },
        ];

        const persistConversation = async () => {
          try {
            const response = await fetch('/api/luna/conversation', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId: activeSession.id,
                privacyMode: activeSession.privacyMode,
                interactionMode: state.interactionMode,
                messages: conversationForPersistence,
                plan: data,
              }),
            });

            if (!response.ok) {
              const errorBody = await response.json().catch(() => ({}));
              console.error(
                '[Luna] Failed to persist conversation:',
                response.status,
                errorBody?.error
              );
            }
          } catch (error) {
            console.error('[Luna] Conversation persistence error:', error);
          }
        };

        void persistConversation();
      }
    } catch (error) {
      console.error('Error processing input:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Something went wrong. Please try again.' });
    }
  }, [state, speakAndWait, resetTranscript]);

  // Handle microphone click
  const handleMicClick = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      // Don't allow starting mic during thinking state
      if (state.state === 'thinking') {
        console.log('[Luna] Cannot start mic during thinking state');
        return;
      }
      startListening();
    }
  }, [isListening, startListening, stopListening, state.state]);

  // Handle text input submit
  const handleTextSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      handleUserInput(textInput);
      setTextInput('');
    }
  }, [textInput, handleUserInput]);

  // Handle mode changes
  const handleModeChange = useCallback((mode: 'voice' | 'text') => {
    dispatch({ type: 'SET_MODE', payload: mode });
    lunaAnalytics.trackModeChange(mode);
    if (mode === 'text') {
      // When switching to text, stop any live mic session and ignore all
      // pending voice recognition results from that session.
      if (isListening) {
        stopListening();
      }
      resetTranscript();
      processedInputRef.current.clear();
      ignoreVoiceResultsRef.current = true;
    } else {
      // When switching back to voice, allow voice results again
      ignoreVoiceResultsRef.current = false;
    }
    if (isSpeaking) {
      cancelSpeech();
    }
  }, [isListening, isSpeaking, stopListening, resetTranscript, cancelSpeech]);

  const handlePrivacyChange = useCallback(
    (mode: PrivacyMode) => {
      // Before a session starts, update the pending selection only.
      if (!state.session) {
        setPendingPrivacyMode(mode);
      }
      // Once a conversation is active, privacy is locked for this session.
    },
    [state.session]
  );

  // Reset chat: end current session and analytics, keep portal open
  const handleResetChat = useCallback(() => {
    // End current analytics session if any
    lunaAnalytics.endSession();
    // Clear Luna state back to idle (no session/messages)
    dispatch({ type: 'END_SESSION' });
  }, []);

  // Read summary aloud
  const handleReadSummary = useCallback(() => {
    if (state.session?.plan) {
      const fullSummary = `${state.session.plan.summary} Here are your next steps: ${
        state.session.plan.nextSteps.map((step, i) => 
          `${i + 1}. ${step.title}: ${step.description}`
        ).join(' ')
      }`;
      speak(fullSummary);
      lunaAnalytics.trackSummaryRead();
    }
  }, [state.session?.plan, speak]);

  // Download PDF
  const handleDownloadPDF = useCallback(async () => {
    if (!state.session?.plan) return;
    
    try {
      dispatch({ type: 'SET_STATE', payload: 'thinking' });
      
      const blob = await generatePlanPDF(
        state.session.plan,
        state.session.privacyMode
      );
      
      downloadPDF(blob);
      lunaAnalytics.trackPDFDownload();
      
      dispatch({ type: 'SET_STATE', payload: 'plan-ready' });
      setShowConfetti(true);
    } catch (error) {
      console.error('PDF generation error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to generate PDF. Please try again.' });
    }
  }, [state.session]);


  if (!isOpen) return null;

  const lunaBusy = state.state === 'thinking' || state.isSpeaking;

  return (
    <SpeechErrorBoundary>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.1 : 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center md:items-start bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto"
          onClick={onClose}
        >
          <LayoutGroup>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{
                type: "spring",
                damping: reduceMotion ? 40 : 25,
                stiffness: reduceMotion ? 200 : 300,
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-black border border-zinc-800/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-0 my-6 sm:my-8 max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-4rem)]"
              style={{
                boxShadow:
                  "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)",
              }}
            >
              {/* Confetti on PDF ready (disabled in reduced-motion) */}
              {showConfetti && !reduceMotion && (
                <div className="pointer-events-none absolute inset-0 flex justify-center items-start">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                      key={i}
                      className="text-yellow-200"
                      initial={{ y: 0, opacity: 0, x: (i - 2.5) * 24 }}
                      animate={{ y: 80, opacity: [0, 1, 0] }}
                      transition={{
                        duration: 1.2,
                        delay: i * 0.05,
                        ease: "easeOut",
                      }}
                    >
                      ✦
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Header - thin, controls + compact selections */}
              <div className="relative flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 bg-gradient-to-r from-zinc-900 via-black to-zinc-900">
                {/* Compact summary of mode + privacy once session started (shares layout with intro selector) */}
                <div className="flex items-center gap-3 max-w-[65%]">
                  {state.session && (
                    <motion.div
                      layoutId="interaction-mode-pill"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: reduceMotion ? 0.1 : 0.25 }}
                      className="inline-flex items-center gap-2 rounded-full border border-zinc-700/70 bg-zinc-900/80 px-3 py-1.5 text-xs sm:text-sm text-gray-200/90"
                    >
                      <span className="inline-flex items-center gap-1">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300">
                          {state.interactionMode === "voice" ? (
                            <Volume2 size={13} />
                          ) : (
                            <MessageSquare size={13} />
                          )}
                        </span>
                        <span className="capitalize">
                          {state.interactionMode === "voice" ? "Voice" : "Text"}
                        </span>
                      </span>
                      <span className="h-4 w-px bg-zinc-700/80" />
                      <span className="flex items-center gap-1 text-gray-300">
                        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                        <span>
                          {state.session.privacyMode === "on-the-record"
                            ? "On the record"
                            : "Confidential"}
                        </span>
                      </span>
                    </motion.div>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Transcript toggle (voice mode only) */}
                  {state.session && state.interactionMode === "voice" && (
                    <button
                      type="button"
                      onClick={() => setShowTranscript((prev) => !prev)}
                      className="inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full border border-zinc-700/80 text-xs sm:text-sm font-medium text-gray-300 hover:bg-zinc-900/80 transition-colors"
                      aria-label={
                        showTranscript
                          ? "Hide text transcript"
                          : "Show text transcript"
                      }
                    >
                      <span className="hidden sm:inline">
                        {showTranscript ? "Hide text" : "Show text"}
                      </span>
                      <span className="sm:hidden">
                        {showTranscript ? "TXT–" : "TXT+"}
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleResetChat}
                    className="inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full border border-zinc-700/80 text-sm font-medium text-gray-300 hover:bg-zinc-900/80 transition-colors"
                    aria-label="Reset chat"
                  >
                    <RotateCcw size={14} className="text-gray-400" />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen((open) => !open)}
                    className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 group"
                    aria-label="Open Luna settings"
                  >
                    <Settings
                      size={18}
                      className="text-gray-400 group-hover:text-white transition-colors"
                    />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 group"
                    aria-label="Close"
                  >
                    <X
                      size={20}
                      className="text-gray-400 group-hover:text-white transition-colors"
                    />
                  </button>
                </div>

                {/* Settings panel */}
                {isSettingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: reduceMotion ? 0.1 : 0.2 }}
                    className="absolute right-4 top-16 w-72 rounded-2xl border border-zinc-800 bg-black/95 shadow-xl p-4 space-y-4 z-20"
                  >
                    <h3 className="text-sm font-semibold text-white">
                      Luna Settings
                    </h3>
                    <div className="space-y-3 text-sm text-gray-300">
                      {/* Speech speed */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span>Speech speed</span>
                          <span className="tabular-nums">
                            {ttsRate.toFixed(2)}x
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0.75}
                          max={1.25}
                          step={0.05}
                          value={ttsRate}
                          onChange={(e) => setTtsRate(Number(e.target.value))}
                          className="w-full accent-white"
                          aria-label="Adjust Luna speech speed"
                        />
                      </div>

                      {/* Reduced motion */}
                      <button
                        type="button"
                        onClick={() =>
                          setReduceMotionManual((current) => !current)
                        }
                        className="mt-1 inline-flex items-center justify-between w-full px-3 py-2 rounded-xl border border-zinc-700 text-sm text-gray-200 hover:bg-zinc-800/70 transition-colors"
                        aria-pressed={reduceMotion}
                      >
                        <span className="flex flex-col text-left">
                          <span className="font-medium">Reduced motion</span>
                          <span className="text-sm text-gray-400">
                            {prefersReducedMotion
                              ? "Following system preference"
                              : "Limit animations in Luna"}
                          </span>
                        </span>
                        <span
                          className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-sm ${
                            reduceMotion
                              ? "bg-emerald-400 text-black"
                              : "bg-zinc-700 text-gray-300"
                          }`}
                        >
                          {reduceMotion ? "On" : "Off"}
                        </span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Main Content with subtle gradient background */}
              <div className="flex-1 bg-gradient-to-b from-zinc-950 to-black flex flex-col min-h-0">
                {/* Conversation area like a chat screen */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  {/* Luna Portrait pinned at top */}
                  <div className="flex flex-col items-center mb-6 gap-6">
                    <LunaPortrait
                      state={state.state}
                      isListening={state.isListening}
                      isSpeaking={state.isSpeaking}
                    />
                    <p className="text-lg font-semibold text-white text-center px-4">
                      {state.interactionMode === "voice" && processingPhrase
                        ? processingPhrase
                        : state.state === "thinking"
                          ? "Luna is consulting the oracle…"
                          : "Luna"}
                    </p>
                  </div>

                  {/* Session not started - intro bubble & privacy selection */}
                  {!state.session && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="max-w-xl mx-auto space-y-4"
                    >
                      <div className="flex justify-center">
                        <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900/80 px-4 py-1 text-sm text-gray-400 border border-zinc-800/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Start a conversation with Luna</span>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800/80 px-5 py-4 text-sm text-gray-300 shadow-[0_10px_35px_rgba(0,0,0,0.75)]">
                          <p className="font-semibold text-white mb-2">
                            How would you like this chat to be handled?
                          </p>
                          <p className="text-sm text-gray-400">
                            You can choose to keep this session private, or
                            allow us to use anonymised insights to improve Luna.
                          </p>
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                setPendingPrivacyMode("on-the-record")
                              }
                              className={`group flex items-start gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] ${
                                pendingPrivacyMode === "on-the-record"
                                  ? "bg-white text-black"
                                  : "bg-zinc-900/80 text-white border border-zinc-700"
                              }`}
                            >
                              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              </span>
                              <span>
                                <span className="block text-sm font-semibold">
                                  On the record
                                </span>
                                <span
                                  className={`block text-sm ${
                                    pendingPrivacyMode === "on-the-record"
                                      ? "text-gray-700"
                                      : "text-gray-400"
                                  }`}
                                >
                                  Save anonymised notes so we can learn from
                                  patterns.
                                </span>
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setPendingPrivacyMode("confidential")
                              }
                              className={`group flex items-start gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] ${
                                pendingPrivacyMode === "confidential"
                                  ? "bg-white text-black"
                                  : "bg-zinc-900/80 text-white border border-zinc-700"
                              }`}
                            >
                              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800">
                                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                              </span>
                              <span>
                                <span className="block text-sm font-semibold">
                                  Confidential
                                </span>
                                <span
                                  className={`block text-sm ${
                                    pendingPrivacyMode === "confidential"
                                      ? "text-gray-700"
                                      : "text-gray-400"
                                  }`}
                                >
                                  Keep this conversation just between you and
                                  Luna.
                                </span>
                              </span>
                            </button>
                          </div>

                          {/* Pre-select interaction mode (voice / text) */}
                          <div className="mt-4 flex justify-center">
                            <motion.div
                              layoutId="interaction-mode-pill"
                              className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900/80 px-1 py-1 shadow-[0_10px_30px_rgba(0,0,0,0.7)]"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setPendingInteractionMode("voice")
                                }
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                                  pendingInteractionMode === "voice"
                                    ? "bg-white text-black shadow-md shadow-white/30"
                                    : "text-gray-300 hover:bg-white/5"
                                }`}
                              >
                                <span className="inline-flex items-center gap-1.5">
                                  <Volume2 size={14} />
                                  <span>Voice</span>
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setPendingInteractionMode("text")
                                }
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                                  pendingInteractionMode === "text"
                                    ? "bg-white text-black shadow-md shadow-white/30"
                                    : "text-gray-300 hover:bg-white/5"
                                }`}
                              >
                                <span className="inline-flex items-center gap-1.5">
                                  <MessageSquare size={14} />
                                  <span>Text</span>
                                </span>
                              </button>
                            </motion.div>
                          </div>

                          <div className="mt-5 flex justify-center">
                            <button
                              type="button"
                              onClick={() => startSession()}
                              className="inline-flex items-center justify-center gap-2 max-w-xs bg-gradient-to-r from-[#BBFEFF] to-cyan-500 text-black px-8 py-4 rounded-[0.3rem] text-sm font-semibold hover:from-[#a0f5f7] hover:to-cyan-400 transition-colors duration-300 shadow-lg no-underline"
                            >
                              <span>Consult Luna</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Active conversation thread (user + Luna messages, typing, errors) */}
                  {state.session &&
                    (state.interactionMode === "text" || showTranscript) && (
                      <div className="max-w-2xl mx-auto space-y-3">
                        {state.session.messages.map((message) => {
                          const isUser = message.role === "user";
                          const timeLabel = (() => {
                            try {
                              const date =
                                typeof message.timestamp === "string"
                                  ? new Date(message.timestamp)
                                  : message.timestamp;
                              return date.toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                              });
                            } catch {
                              return "";
                            }
                          })();

                          return (
                            <div
                              key={message.id}
                              className={`flex w-full ${
                                isUser ? "justify-end" : "justify-start"
                              }`}
                            >
                              {!isUser && (
                                <div className="mr-2 mt-5 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden">
                                  <Image
                                    src={lunaImage}
                                    alt="Luna"
                                    width={24}
                                    height={24}
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex flex-col items-end gap-1 max-w-[80%]">
                                <motion.div
                                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  transition={{
                                    duration: reduceMotion ? 0.12 : 0.22,
                                  }}
                                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md ${
                                    isUser
                                      ? "bg-cyan-500 text-black rounded-br-sm"
                                      : "bg-zinc-900/95 text-gray-100 border border-zinc-800 rounded-bl-sm"
                                  }`}
                                >
                                  {message.content}
                                </motion.div>
                                <div
                                  className={`flex items-center gap-2 text-sm text-gray-500 ${
                                    isUser
                                      ? "justify-end pr-1"
                                      : "justify-start pl-1"
                                  }`}
                                >
                                  <span className="uppercase tracking-[0.08em]">
                                    {isUser ? "You" : "Luna"}
                                  </span>
                                  {timeLabel && (
                                    <span className="text-gray-600/80">
                                      {timeLabel}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Speaking indicator (not shown during thinking in text mode since phrase is in conversation) */}
                        {((state.state === "thinking" && state.interactionMode === "voice") || state.isSpeaking) && (
                          <div className="flex justify-start mt-2">
                            <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden">
                              <Image
                                src={lunaImage}
                                alt="Luna"
                                width={24}
                                height={24}
                                className="object-cover"
                              />
                            </div>

                            {/* Thinking → show processing phrase | Speaking → typing dots */}
                            {state.state === "thinking" && processingPhrase ? (
                              <motion.div
                                key={processingPhrase}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: reduceMotion ? 0 : 0.25,
                                }}
                                className="max-w-[75%] rounded-2xl bg-zinc-900/90 border border-zinc-800 px-3 py-2 text-sm text-gray-200"
                              >
                                {processingPhrase}
                              </motion.div>
                            ) : (
                              <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: reduceMotion ? 0.1 : 0.2,
                                }}
                                className="inline-flex items-center gap-1 rounded-2xl bg-zinc-900/90 border border-zinc-800 px-3 py-2"
                              >
                                {[0, 1, 2].map((i) => (
                                  <motion.span
                                    key={i}
                                    className="h-2 w-2 rounded-full bg-gray-400"
                                    animate={{
                                      opacity: [0.3, 1, 0.3],
                                      y: [0, -2, 0],
                                    }}
                                    transition={{
                                      duration: 0.9,
                                      repeat: Infinity,
                                      delay: i * 0.15,
                                      ease: "easeInOut",
                                    }}
                                  />
                                ))}
                              </motion.div>
                            )}
                          </div>
                        )}

                        {/* Live caption as typing preview (user speech only) */}
                        {state.caption && state.isListening && (
                          <div className="flex justify-start mt-1">
                            <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden">
                              <Image
                                src={lunaImage}
                                alt="Luna"
                                width={24}
                                height={24}
                                className="object-cover"
                              />
                            </div>
                            <motion.div
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: reduceMotion ? 0.12 : 0.2,
                              }}
                              className="max-w-[70%] rounded-2xl bg-zinc-900/80 border border-zinc-800 px-4 py-2 text-sm text-gray-300"
                            >
                              {state.caption}
                            </motion.div>
                          </div>
                        )}

                        {/* Error bubble */}
                        {state.error && (
                          <div className="flex justify-center mt-2">
                            <div className="max-w-sm rounded-xl bg-red-950/90 border border-red-800 px-4 py-2 text-sm text-red-200">
                              {state.error}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  {/* Plan summary as final system bubble with actions */}
                  {state.session?.plan && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: reduceMotion ? 0.14 : 0.24 }}
                      className="max-w-2xl mx-auto mt-4 rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-zinc-800/70 px-5 py-4 shadow-lg"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-7 w-7 rounded-full overflow-hidden border border-white/10">
                          <Image
                            src={lunaImage}
                            alt="Luna"
                            width={28}
                            height={28}
                            className="object-cover"
                          />
                        </div>
                        <p className="text-sm font-semibold text-gray-300">
                          Luna&apos;s plan summary
                        </p>
                      </div>
                      <p className="text-sm text-gray-200 mb-3">
                        {state.session.plan.summary}
                      </p>
                      <div className="grid gap-2 mb-3">
                        {state.session.plan.nextSteps.map((step, index) => (
                          <div
                            key={index}
                            className="rounded-xl bg-zinc-950/80 border border-zinc-800 px-3 py-2.5"
                          >
                            <p className="text-sm font-semibold text-gray-100">
                              {index + 1}. {step.title}
                            </p>
                            <p className="text-sm text-gray-400 mt-0.5">
                              {step.description}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={handleReadSummary}
                          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black shadow-md hover:shadow-lg hover:bg-gray-100 transition-all"
                        >
                          <Play size={14} />
                          <span>Read summary</span>
                        </button>
                        <button
                          onClick={handleDownloadPDF}
                          className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-sm font-medium text-gray-100 hover:border-zinc-500 hover:bg-zinc-800 transition-all"
                        >
                          <Download size={14} />
                          <span>Download PDF</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Controls + input docked at bottom */}
                <div className="border-t border-zinc-900/80 bg-black/70 px-6 py-4 space-y-4">
                  {state.session?.plan ? (
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={handleResetChat}
                        className="inline-flex items-center justify-center gap-2 max-w-xs bg-gradient-to-r from-[#BBFEFF] to-cyan-500 text-black px-8 py-4 rounded-[0.3rem] text-sm font-semibold hover:from-[#a0f5f7] hover:to-cyan-400 transition-colors duration-300 shadow-lg no-underline"
                      >
                        Start again
                      </button>
                    </div>
                  ) : (
                    <>
                      {state.session && state.interactionMode === "voice" && (
                        <VoiceControls
                          interactionMode={state.interactionMode}
                          privacyMode={state.session.privacyMode}
                          isListening={state.isListening}
                          isSpeaking={state.isSpeaking}
                          privacyLocked={true}
                          onModeChange={handleModeChange}
                          onPrivacyChange={handlePrivacyChange}
                          onMicClick={handleMicClick}
                          disabled={lunaBusy}
                        />
                      )}

                      {state.interactionMode === "text" && (
                        <form
                          onSubmit={handleTextSubmit}
                          className="flex gap-2 items-center"
                        >
                          <input
                            type="text"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder={
                              state.session
                                ? "Type your message..."
                                : "Choose a privacy mode above to start"
                            }
                            className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/70 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={lunaBusy || !state.session}
                          />
                          {/* Mic icon inline with input to switch back to voice mode */}
                          <button
                            type="button"
                            onClick={() => {
                              handleModeChange("voice");
                              handleMicClick();
                            }}
                            disabled={lunaBusy || !state.session}
                            className="inline-flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-gray-200 hover:border-zinc-500 hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Switch to voice mode"
                          >
                            <Mic size={16} />
                          </button>
                          <button
                            type="submit"
                            disabled={
                              !textInput.trim() ||
                              lunaBusy ||
                              !state.session
                            }
                            className="rounded-2xl bg-white px-5 py-2 text-sm font-semibold text-black shadow-md hover:bg-gray-200 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                          >
                            Send
                          </button>
                        </form>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </LayoutGroup>
        </motion.div>
      </AnimatePresence>
    </SpeechErrorBoundary>
  );
}

// Export wrapped component
export function LunaPortal(props: LunaPortalProps) {
  return <LunaPortalContent {...props} />;
}
