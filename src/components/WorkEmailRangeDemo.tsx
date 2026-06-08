/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export type WorkRangeDemoPhase = 'idle' | 'selecting' | 'overlay';

interface WorkEmailRangeDemoProps {
  original: string;
  translated: string;
  phase: WorkRangeDemoPhase;
  onCloseOverlay?: () => void;
}

export const WorkEmailRangeDemo: React.FC<WorkEmailRangeDemoProps> = ({
  original,
  translated,
  phase,
  onCloseOverlay,
}) => {
  const active = phase !== 'idle';

  return (
    <div className="relative inline-block max-w-full align-top text-sm leading-relaxed">
      <p
        className={`relative z-[1] font-sans leading-relaxed px-1 py-1 m-0 select-none transition-colors duration-300 ${
          phase === 'idle' ? 'text-zinc-400 italic' : 'text-zinc-100'
        }`}
      >
        {original}
      </p>

      <AnimatePresence>
        {active && (
          <motion.div
            key="range-box"
            initial={{ scaleX: 0, scaleY: 0, opacity: 0.85 }}
            animate={{ scaleX: 1, scaleY: 1, opacity: 1 }}
            exit={{ scaleX: 0, scaleY: 0, opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
            className={`absolute top-0 left-0 right-0 z-10 box-border border-2 border-red-500 rounded-[2px] pointer-events-none origin-top-left ${
              phase === 'overlay' ? '-bottom-[1lh]' : 'bottom-0'
            }`}
          >
            <AnimatePresence>
              {phase === 'overlay' && (
                <motion.div
                  key="translation-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="absolute inset-0 overflow-visible pointer-events-none"
                >
                  <div className="absolute inset-0 box-border rounded-[1px] bg-white/80 backdrop-blur-[2px] overflow-hidden pointer-events-auto">
                    <p className="font-sans leading-relaxed text-zinc-900 font-medium px-1 py-1 m-0 overflow-hidden">
                      {translated}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseOverlay?.();
                    }}
                    aria-label="Close translation overlay"
                    className="absolute top-1.5 -right-[23px] z-20 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-zinc-200/95 text-zinc-600 hover:bg-zinc-300 hover:text-zinc-900 transition-colors shadow-sm pointer-events-auto"
                  >
                    <X className="h-3 w-3 stroke-[2.5]" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
