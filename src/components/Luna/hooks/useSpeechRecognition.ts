import { useState, useCallback, useEffect, useRef } from 'react';

interface UseSpeechRecognitionOptions {
  onResult?: (transcript: string, isFinal: boolean) => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
  lang?: string;
}

/**
 * useSpeechRecognition (Whisper-backed)
 *
 * Records audio from the user's microphone, sends it to the
 * `/api/luna/whisper` endpoint, and returns the transcribed text.
 *
 * This replaces the previous Web Speech API implementation so that
 * voice input is consistently routed through OpenAI Whisper and then
 * handled like a normal chat message.
 */
export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const analyserDataRef = useRef<Float32Array | null>(null);
  const silenceMonitorRef = useRef<number | null>(null);
  const silenceTimeoutRef = useRef<number | null>(null);

  const cleanupSilenceDetection = useCallback(() => {
    if (silenceMonitorRef.current !== null) {
      cancelAnimationFrame(silenceMonitorRef.current);
      silenceMonitorRef.current = null;
    }
    if (silenceTimeoutRef.current !== null) {
      window.clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    analyserDataRef.current = null;
    if (audioContextRef.current) {
      const context = audioContextRef.current;
      context
        .close()
        .catch(() => undefined);
      audioContextRef.current = null;
    }
  }, []);

  const startSilenceDetection = useCallback(() => {
    if (!streamRef.current || typeof window === 'undefined') return;
    cleanupSilenceDetection();

    try {
      const audioContext = new window.AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(streamRef.current);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      analyserRef.current = analyser;
      source.connect(analyser);
      analyserDataRef.current = new Float32Array(
        new ArrayBuffer(analyser.fftSize * Float32Array.BYTES_PER_ELEMENT)
      );

      const SILENCE_THRESHOLD = 0.02;
      const SILENCE_DURATION_MS = 4000;

      const checkSilence = () => {
        if (!analyserRef.current || !analyserDataRef.current) return;
        analyserRef.current.getFloatTimeDomainData(
          analyserDataRef.current as unknown as Float32Array<ArrayBuffer>
        );
        let sumSquares = 0;
        for (let i = 0; i < analyserDataRef.current.length; i += 1) {
          const sample = analyserDataRef.current[i];
          sumSquares += sample * sample;
        }
        const rms = Math.sqrt(sumSquares / analyserDataRef.current.length);

        if (rms < SILENCE_THRESHOLD) {
            if (silenceTimeoutRef.current === null) {
              silenceTimeoutRef.current = window.setTimeout(() => {
                silenceTimeoutRef.current = null;
                if (
                  mediaRecorderRef.current &&
                  mediaRecorderRef.current.state === 'recording'
                ) {
                try {
                  mediaRecorderRef.current.stop();
                } catch (error) {
                  console.warn('Error stopping recorder after silence:', error);
                }
              }
            }, SILENCE_DURATION_MS);
          }
        } else if (silenceTimeoutRef.current !== null) {
          window.clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = null;
        }

        silenceMonitorRef.current = window.requestAnimationFrame(checkSilence);
      };

      checkSilence();
    } catch (error) {
      console.warn('Unable to start silence detection:', error);
    }
  }, [cleanupSilenceDetection]);

  useEffect(() => {
    isMountedRef.current = true;

    if (typeof window !== 'undefined') {
      const hasMediaDevices =
        typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
      const hasMediaRecorder = typeof window.MediaRecorder !== 'undefined';
      setIsSupported(hasMediaDevices && hasMediaRecorder);
    }

    return () => {
      isMountedRef.current = false;
      // Cleanup any active recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      cleanupSilenceDetection();
    };
  }, [cleanupSilenceDetection]);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      console.warn('Whisper recording not supported in this browser');
      options.onError?.(new Error('Microphone recording is not supported in this browser.'));
      return;
    }

    if (isListening) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.onstart = () => {
        if (!isMountedRef.current) return;
        setIsListening(true);
        setTranscript('');
        startSilenceDetection();
      };

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        if (!isMountedRef.current) return;
        setIsListening(false);
        options.onError?.(new Error(`Recording error: ${event.error?.name || 'unknown'}`));
      };

      recorder.onstop = async () => {
        cleanupSilenceDetection();
        if (!isMountedRef.current) return;

        setIsListening(false);

        // Stop all tracks so the mic is released
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];

        if (audioBlob.size === 0) {
          options.onEnd?.();
          return;
        }

        try {
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');
          if (options.lang) {
            formData.append('lang', options.lang);
          }

          const response = await fetch('/api/luna/whisper', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Whisper API error: ${response.status} ${response.statusText} - ${errorText}`
            );
          }

          const data = (await response.json()) as { text?: string };
          const text = data.text?.trim();

          if (text && isMountedRef.current) {
            setTranscript(text);
            options.onResult?.(text, true);
          }
        } catch (error) {
          console.error('Failed to transcribe audio with Whisper:', error);
          if (isMountedRef.current) {
            options.onError?.(
              error instanceof Error
                ? error
                : new Error('Failed to transcribe audio with Whisper.')
            );
          }
        } finally {
          if (isMountedRef.current) {
            options.onEnd?.();
          }
        }
      };

      recorder.start();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      if (!isMountedRef.current) return;
      setIsListening(false);
      options.onError?.(
        error instanceof Error
          ? error
          : new Error('Unable to access microphone for recording.')
      );
    }
  }, [isSupported, isListening, options, startSilenceDetection, cleanupSilenceDetection]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.warn('Error stopping recorder:', error);
      }
    } else if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    cleanupSilenceDetection();
  }, [cleanupSilenceDetection]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    startListening,
    stopListening,
    resetTranscript,
    isListening,
    isSupported,
    transcript,
  };
}
