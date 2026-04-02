import { useState, useCallback, useEffect, useRef } from 'react';

interface UseSpeechSynthesisOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
}

// Decide once (at build time) whether to use OpenAI TTS instead of browser TTS
const USE_OPENAI_TTS =
  typeof process !== 'undefined' &&
  (process.env.NEXT_PUBLIC_USE_OPENAI_TTS === 'true' ||
    process.env.USE_OPENAI_TTS === 'true' ||
    process.env.USE_OPENAI_TTS === '1');

export function useSpeechSynthesis(options: UseSpeechSynthesisOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isMountedRef = useRef(true);
  const isCleaningUpRef = useRef(false);
  const preferredVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    isMountedRef.current = true;

    const hasSpeechSynthesis =
      typeof window !== 'undefined' && 'speechSynthesis' in window;

    // TTS is considered "supported" if we have either browser TTS or OpenAI TTS enabled
    setIsSupported(hasSpeechSynthesis || USE_OPENAI_TTS);

    if (hasSpeechSynthesis) {
      const loadVoices = () => {
        if (!isMountedRef.current) return;
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);

        // Choose a stable, high-quality default voice once
        if (!preferredVoiceRef.current && availableVoices.length > 0) {
          const preferenceOrder: RegExp[] = [
            /Google UK English Female/i,
            /Google US English/i,
            /Google.*English/i,
            /Samantha/i,
            /Karen/i,
          ];

          const byName =
            availableVoices.find((v) =>
              preferenceOrder.some((pattern) => pattern.test(v.name))
            ) ?? null;

          const byLang =
            byName ||
            availableVoices.find((v) => v.lang?.toLowerCase().startsWith('en')) ||
            availableVoices[0];

          preferredVoiceRef.current = byLang || null;
        }
      };

      loadVoices();
      
      // Handle voices loaded event
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }

      return () => {
        isMountedRef.current = false;

        // Cancel any ongoing speech on unmount
        if (window.speechSynthesis && utteranceRef.current) {
          isCleaningUpRef.current = true;
          try {
            window.speechSynthesis.cancel();
          } catch (error) {
            console.warn('Error canceling speech on unmount:', error);
          }
        }
        
        if (window.speechSynthesis) {
          window.speechSynthesis.onvoiceschanged = null;
        }
      };
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!isMountedRef.current) {
        return;
      }

      // OpenAI TTS path (server-side generation + HTMLAudio playback)
      if (USE_OPENAI_TTS) {
        if (isSpeaking) {
          console.log('[Speech] Prevented duplicate - already speaking (OpenAI TTS)');
          return;
        }

        const run = async () => {
          try {
            setIsSpeaking(true);
            options.onStart?.();

            // Stop any existing audio
            if (audioRef.current) {
              try {
                audioRef.current.pause();
              } catch {
                // ignore
              }
              audioRef.current = null;
            }

            const response = await fetch('/api/luna/tts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text }),
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(
                `TTS request failed: ${response.status} ${response.statusText} - ${errorText}`
              );
            }

            const blob = await response.blob();
            if (!isMountedRef.current) return;

            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audioRef.current = audio;

            audio.onended = () => {
              URL.revokeObjectURL(url);
              if (!isMountedRef.current) return;
              setIsSpeaking(false);
              audioRef.current = null;
              options.onEnd?.();
            };

            audio.onerror = () => {
              URL.revokeObjectURL(url);
              if (!isMountedRef.current) return;
              setIsSpeaking(false);
              audioRef.current = null;
              const error = new Error('Failed to play TTS audio');
              console.error('[Speech] Failed to play TTS audio');
              options.onError?.(error);
            };

            try {
              await audio.play();
            } catch (error) {
              URL.revokeObjectURL(url);
              if (!isMountedRef.current) return;
              setIsSpeaking(false);
              audioRef.current = null;
              console.error('[Speech] Audio play error:', error);
              options.onError?.(error as Error);
            }
          } catch (error) {
            if (!isMountedRef.current) return;
            setIsSpeaking(false);
            console.error('[Speech] OpenAI TTS error:', error);
            options.onError?.(
              error instanceof Error
                ? error
                : new Error('OpenAI TTS error (unknown)')
            );
          }
        };

        void run();
        return;
      }

      // Browser speech synthesis path
      if (!isSupported) {
        console.warn('Speech synthesis not available');
        return;
      }

      // Prevent duplicate speech
      if (isSpeaking && utteranceRef.current) {
        console.log('[Speech] Prevented duplicate - already speaking');
        return;
      }

      try {
        // Cancel any ongoing speech before starting new one
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          
          // Small delay to ensure cancellation completes
          setTimeout(() => {
            if (!isMountedRef.current || isCleaningUpRef.current) return;
            
            const utterance = new SpeechSynthesisUtterance(text);
            utteranceRef.current = utterance;

            // Configure utterance
            utterance.rate = options.rate ?? 0.95;
            utterance.pitch = options.pitch ?? 1.0;
            utterance.volume = options.volume ?? 1.0;

            // Select voice: prefer caller-provided voice, otherwise our preferred cached voice
            if (options.voice) {
              utterance.voice = options.voice;
            } else if (preferredVoiceRef.current) {
              utterance.voice = preferredVoiceRef.current;
            } else if (voices.length > 0) {
              const fallback =
                voices.find((v) => v.lang?.toLowerCase().startsWith('en')) ||
                voices[0];
              if (fallback) {
                utterance.voice = fallback;
              }
            }

            // Event handlers
            utterance.onstart = () => {
              if (!isMountedRef.current) return;
              setIsSpeaking(true);
              options.onStart?.();
            };

            utterance.onend = () => {
              if (!isMountedRef.current) return;
              setIsSpeaking(false);
              utteranceRef.current = null;
              options.onEnd?.();
            };

            utterance.onerror = (event) => {
              if (!isMountedRef.current || isCleaningUpRef.current) {
                // Ignore errors during cleanup or after unmount
                console.log('[Speech] Ignoring error during cleanup:', event.error);
                return;
              }
              
              setIsSpeaking(false);
              utteranceRef.current = null;
              
              // Handle specific error types
              let errorMessage = 'Speech synthesis error';
              switch (event.error) {
                case 'interrupted':
                  // Don't report interrupted as error if we're cleaning up
                  if (isCleaningUpRef.current) {
                    console.log('[Speech] Speech interrupted during cleanup (expected)');
                    return;
                  }
                  errorMessage = 'Speech was interrupted';
                  break;
                case 'audio-busy':
                  errorMessage = 'Audio device is busy';
                  break;
                case 'audio-hardware':
                  errorMessage = 'Audio hardware error';
                  break;
                case 'network':
                  errorMessage = 'Network error occurred';
                  break;
                case 'synthesis-unavailable':
                  errorMessage = 'Speech synthesis unavailable';
                  break;
                case 'synthesis-failed':
                  errorMessage = 'Speech synthesis failed';
                  break;
                case 'language-unavailable':
                  errorMessage = 'Language unavailable';
                  break;
                case 'voice-unavailable':
                  errorMessage = 'Voice unavailable';
                  break;
                case 'text-too-long':
                  errorMessage = 'Text too long for synthesis';
                  break;
                default:
                  errorMessage = `Speech synthesis error: ${event.error}`;
              }
              
              const error = new Error(errorMessage);
              console.error('[Speech]', errorMessage);
              options.onError?.(error);
            };

            // Speak with error handling
            try {
              window.speechSynthesis.speak(utterance);
            } catch (error) {
              console.error('[Speech] Failed to speak:', error);
              setIsSpeaking(false);
              utteranceRef.current = null;
              options.onError?.(error as Error);
            }
          }, 50); // Small delay to prevent interruption errors
        }
      } catch (error) {
        console.error('[Speech] Error in speak function:', error);
        setIsSpeaking(false);
        utteranceRef.current = null;
        options.onError?.(error as Error);
      }
    },
    [isSupported, voices, options, isSpeaking]
  );

  const cancel = useCallback(() => {
    if (!isMountedRef.current) return;

    if (USE_OPENAI_TTS) {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      } catch (error) {
        console.warn('[Speech] Error during OpenAI TTS cancel:', error);
      } finally {
        setIsSpeaking(false);
      }
      return;
    }

    if (!isSupported || typeof window === 'undefined') return;

    isCleaningUpRef.current = true;

    try {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      utteranceRef.current = null;
    } catch (error) {
      console.warn('[Speech] Error during cancel:', error);
    } finally {
      // Reset cleanup flag after a delay
      setTimeout(() => {
        isCleaningUpRef.current = false;
      }, 100);
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported && typeof window !== 'undefined') {
      try {
        window.speechSynthesis.pause();
      } catch (error) {
        console.warn('[Speech] Error during pause:', error);
      }
    }
  }, [isSupported]);

  const resume = useCallback(() => {
    if (isSupported && typeof window !== 'undefined') {
      try {
        window.speechSynthesis.resume();
      } catch (error) {
        console.warn('[Speech] Error during resume:', error);
      }
    }
  }, [isSupported]);

  return {
    speak,
    cancel,
    pause,
    resume,
    isSpeaking,
    isSupported,
    voices,
  };
}
