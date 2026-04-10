'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import lunaImage from '@/assets/luna.png';

interface LunaCaptionProps {
  caption: string;
  role?: 'user' | 'luna';
}

export function LunaCaption({ caption, role = 'luna' }: LunaCaptionProps) {
  if (!caption) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div
          className={`p-4 rounded-lg ${
            role === 'luna'
              ? 'bg-zinc-900 border border-zinc-800/50'
              : 'bg-zinc-800 border border-zinc-700/50'
          }`}
        >
          <div className="flex items-start gap-3">
            {role === 'luna' ? (
              <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border border-white/10">
                <Image
                  src={lunaImage}
                  alt="Luna"
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm bg-white/10 border border-white/20">
                <span className="text-white">👤</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white mb-1">
                {role === 'luna' ? 'Luna' : 'You'}
              </p>
              <p className="text-sm text-gray-300 leading-relaxed">
                {caption}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
