'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { LunaState } from '../types';
import lunaImage from '@/assets/luna.png';

interface LunaPortraitProps {
  state: LunaState;
  isListening: boolean;
  isSpeaking: boolean;
}

export function LunaPortrait({ state, isListening, isSpeaking }: LunaPortraitProps) {
  const getGlowIntensity = () => {
    if (isListening) return 1.5;
    if (isSpeaking) return 1.3;
    if (state === 'thinking') return 1.2;
    return 1;
  };

  const glowIntensity = getGlowIntensity();

  return (
    <div className="relative flex items-center justify-center w-32 h-32 md:w-40 md:h-40">
      {/* Outer glow ring - pulsing */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5 * glowIntensity, 0.7 * glowIntensity, 0.5 * glowIntensity],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Listening ring animation */}
      {isListening && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-white"
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}

      {/* Main Luna circle with image */}
      <motion.div
        className="relative w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #e5e5e5 100%)',
          boxShadow: `0 0 ${30 * glowIntensity}px rgba(255, 255, 255, ${0.4 * glowIntensity})`,
        }}
        animate={{
          boxShadow: [
            `0 0 ${30 * glowIntensity}px rgba(255, 255, 255, ${0.4 * glowIntensity})`,
            `0 0 ${40 * glowIntensity}px rgba(255, 255, 255, ${0.5 * glowIntensity})`,
            `0 0 ${30 * glowIntensity}px rgba(255, 255, 255, ${0.4 * glowIntensity})`,
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Luna Image */}
        <motion.div
          className="relative z-10 w-full h-full"
          animate={isSpeaking ? {
            scale: [1, 1.05, 1],
          } : {}}
          transition={{
            duration: 0.5,
            repeat: isSpeaking ? Infinity : 0,
            ease: 'easeInOut',
          }}
        >
          <Image
            src={lunaImage}
            alt="Luna AI Assistant"
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      </motion.div>

      {/* Speaking wave indicator */}
      {isSpeaking && (
        <div className="absolute -bottom-8 flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 bg-white rounded-full"
              animate={{
                height: ['8px', '16px', '8px'],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
