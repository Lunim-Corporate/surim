'use client';

import { motion } from 'framer-motion';
import { Mic, MicOff, Keyboard, Lock, Shield } from 'lucide-react';
import { InteractionMode, PrivacyMode } from '../types';

interface VoiceControlsProps {
  interactionMode: InteractionMode;
  privacyMode: PrivacyMode;
  isListening: boolean;
  isSpeaking: boolean;
  privacyLocked?: boolean;
  onModeChange: (mode: InteractionMode) => void;
  onPrivacyChange: (mode: PrivacyMode) => void;
  onMicClick: () => void;
  disabled?: boolean;
}

export function VoiceControls({
  interactionMode,
  privacyMode,
  isListening,
  isSpeaking,
  privacyLocked = false,
  onModeChange,
  onPrivacyChange,
  onMicClick,
  disabled = false,
}: VoiceControlsProps) {
  const privacyDisabled = disabled || privacyLocked;

  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl border border-zinc-800/70 bg-gradient-to-b from-zinc-900/60 via-black/70 to-black/90 px-5 py-4 shadow-[0_18px_45px_rgba(0,0,0,0.85)] backdrop-blur-md flex flex-col items-center gap-6">
      {/* Privacy Toggle (hidden once locked and summarized in header) */}
      {!privacyLocked && (
        <div className="inline-flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-gray-400">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
              <Shield size={12} />
            </span>
            <span>Privacy</span>
          </div>
          <div
            className={`inline-flex items-center justify-center gap-1 rounded-2xl border px-1 py-1 backdrop-blur shadow-[0_10px_40px_rgba(0,0,0,0.85)] ${
              privacyLocked
                ? 'border-zinc-800/80 bg-zinc-900/70 opacity-60 cursor-not-allowed'
                : 'border-zinc-700/80 bg-zinc-950/80'
            }`}
          >
            <button
              onClick={() => onPrivacyChange('on-the-record')}
              className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-1.5 text-sm font-medium transition-all ${
                privacyMode === 'on-the-record'
                  ? 'bg-white text-black shadow-lg shadow-white/40'
                  : 'text-gray-200/80 hover:bg-white/5'
              }`}
              disabled={privacyDisabled}
            >
              <span className="inline-flex w-4 h-4 items-center justify-center rounded-full bg-emerald-400/20 mr-1">
                <Lock size={10} className="text-emerald-300" />
              </span>
              On the record
            </button>
            <button
              onClick={() => onPrivacyChange('confidential')}
              className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-1.5 text-sm font-medium transition-all ${
                privacyMode === 'confidential'
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-400/40'
                  : 'text-gray-200/80 hover:bg-white/5'
              }`}
              disabled={privacyDisabled}
            >
              <span className="inline-flex w-4 h-4 items-center justify-center rounded-full bg-black/20 mr-1">
                <Shield
                  size={10}
                  className={privacyMode === 'confidential' ? 'text-black' : 'text-cyan-300'}
                />
              </span>
              Confidential
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1 text-center max-w-sm">
            On the record sessions help us learn from anonymised patterns. Confidential keeps this chat just between you and Luna.
          </p>
        </div>
      )}

      {/* Microphone + keyboard controls in voice mode */}
      {interactionMode === 'voice' && (
        <div className="flex flex-col items-center gap-2">
          {isListening && (
            <p className="text-sm text-gray-300/90">
              Click the mic to stop speaking
            </p>
          )}
          {!isListening && isSpeaking && (
            <p className="text-sm text-gray-300/90">
              Luna is speaking…
            </p>
          )}
          <div className="flex justify-center gap-4 items-center">
            <motion.button
              onClick={onMicClick}
              disabled={disabled || isSpeaking}
              className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.75)]'
                  : 'bg-white/95 hover:bg-gray-100 shadow-[0_14px_40px_rgba(0,0,0,0.65)]'
              } ${disabled || isSpeaking ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              whileTap={!disabled && !isSpeaking ? { scale: 0.95 } : {}}
              whileHover={!disabled && !isSpeaking ? { scale: 1.05 } : {}}
            >
              {/* Pulsing ring when listening */}
              {isListening && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-red-400"
                  initial={{ scale: 1, opacity: 0.7 }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 0, 0.7],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
              )}

              {isListening ? (
                <MicOff className="relative z-10 text-white" size={24} />
              ) : (
                <Mic className="relative z-10 text-black" size={24} />
              )}
            </motion.button>

            {/* Keyboard icon to switch to text mode */}
            <button
              type="button"
              onClick={() => onModeChange('text')}
              disabled={disabled}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-gray-200 hover:border-zinc-500 hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Switch to text mode"
            >
              <Keyboard size={16} />
              <span>Use keyboard</span>
            </button>
          </div>
        </div>
      )}

      {/* Status text */}
      <div className="text-center text-sm text-gray-300/80">
        {isListening && 'Listening...'}
        {!isListening && !isSpeaking && interactionMode === 'voice' && 'Click the mic to start speaking'}
        {!isListening && !isSpeaking && interactionMode === 'text' && null}
      </div>
    </div>
  );
}
