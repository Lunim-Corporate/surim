// Speech Manager Singleton
// Provides centralized control over speech synthesis with proper cleanup

class SpeechManager {
  private static instance: SpeechManager;
  private utterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;
  private isInitialized = false;

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.isInitialized = true;
      
      // Handle page unload
      window.addEventListener('beforeunload', () => {
        this.cancel();
      });
    }
  }

  static getInstance(): SpeechManager {
    if (!SpeechManager.instance) {
      SpeechManager.instance = new SpeechManager();
    }
    return SpeechManager.instance;
  }

  async speak(
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      volume?: number;
      voice?: SpeechSynthesisVoice;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: Error) => void;
    }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isInitialized || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        const error = new Error('Speech synthesis not supported');
        options?.onError?.(error);
        reject(error);
        return;
      }

      // Cancel any ongoing speech
      this.cancel();

      try {
        this.utterance = new SpeechSynthesisUtterance(text);
        this.utterance.rate = options?.rate || 0.95;
        this.utterance.pitch = options?.pitch || 1.0;
        this.utterance.volume = options?.volume || 1.0;

        if (options?.voice) {
          this.utterance.voice = options.voice;
        }

        this.utterance.onstart = () => {
          this.isSpeaking = true;
          options?.onStart?.();
        };

        this.utterance.onend = () => {
          this.isSpeaking = false;
          this.utterance = null;
          options?.onEnd?.();
          resolve();
        };

        this.utterance.onerror = (event) => {
          this.isSpeaking = false;
          this.utterance = null;
          
          const error = new Error(`Speech error: ${event.error}`);
          options?.onError?.(error);
          
          // Don't reject on interrupted errors - they're expected during cleanup
          if (event.error === 'interrupted') {
            console.log('[SpeechManager] Speech interrupted (expected)');
            resolve();
          } else {
            reject(error);
          }
        };

        window.speechSynthesis.speak(this.utterance);
      } catch (error) {
        this.isSpeaking = false;
        this.utterance = null;
        const err = error as Error;
        options?.onError?.(err);
        reject(err);
      }
    });
  }

  cancel(): void {
    if (!this.isInitialized || typeof window === 'undefined') return;

    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      this.isSpeaking = false;
      this.utterance = null;
    } catch (error) {
      console.warn('[SpeechManager] Error during cancel:', error);
    }
  }

  pause(): void {
    if (!this.isInitialized || !this.isSpeaking || typeof window === 'undefined') return;

    try {
      window.speechSynthesis.pause();
    } catch (error) {
      console.warn('[SpeechManager] Error during pause:', error);
    }
  }

  resume(): void {
    if (!this.isInitialized || typeof window === 'undefined') return;

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (error) {
      console.warn('[SpeechManager] Error during resume:', error);
    }
  }

  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  getVoices(): SpeechSynthesisVoice[] {
    if (!this.isInitialized || typeof window === 'undefined') return [];
    
    try {
      return window.speechSynthesis.getVoices();
    } catch (error) {
      console.warn('[SpeechManager] Error getting voices:', error);
      return [];
    }
  }

  isSupported(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const speechManager = SpeechManager.getInstance();
