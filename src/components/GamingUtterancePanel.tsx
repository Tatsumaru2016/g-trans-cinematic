/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClipboardCheck, Languages, Loader2, X } from 'lucide-react';
import { useLocale } from '../context/LocaleContext';

export type GamingUtteranceStatus = 'idle' | 'translating' | 'copied' | 'at-input';

interface GamingUtterancePanelProps {
  open: boolean;
  targetLanguage: string;
  inputValue: string;
  onInputChange: (value: string) => void;
  onClose: () => void;
  status: GamingUtteranceStatus;
  copiedSlot?: React.ReactNode;
}

export const GamingClipboardCard: React.FC<{ text: string; className?: string }> = ({
  text,
  className = '',
}) => {
  const { t } = useLocale();

  return (
    <motion.div
      layoutId="gaming-clipboard-card"
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className={`pointer-events-none rounded-lg border border-emerald-500/30 bg-emerald-950/90 px-3 py-2 shadow-lg shadow-emerald-950/30 ${className}`}
    >
      <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
        <ClipboardCheck className="w-3 h-3" />
        {t('utterance.copiedToClipboard')}
      </p>
      <p className="text-xs text-zinc-200 font-sans leading-relaxed">{text}</p>
    </motion.div>
  );
};

export const GamingUtterancePanel: React.FC<GamingUtterancePanelProps> = ({
  open,
  targetLanguage,
  inputValue,
  onInputChange,
  onClose,
  status,
  copiedSlot,
}) => {
  const { t } = useLocale();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="overflow-hidden"
        >
          <div className="mt-2 rounded-xl border border-violet-500/30 bg-zinc-950/90 shadow-lg shadow-violet-950/40">
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Languages className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-violet-300">
                  {t('utterance.panelTitle', { language: targetLanguage })}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={t('utterance.closePanel')}
                className="text-zinc-500 hover:text-zinc-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3 space-y-2">
              <div className="relative">
                <textarea
                  value={inputValue}
                  rows={2}
                  readOnly
                  className="w-full resize-none bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-sans leading-relaxed focus:outline-none cursor-default"
                />
                {status === 'translating' && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-zinc-950/60">
                    <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                  </div>
                )}
              </div>

              {copiedSlot}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
