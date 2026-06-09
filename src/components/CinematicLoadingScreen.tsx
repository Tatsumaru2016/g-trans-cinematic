/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { GTranLogo } from './GTranLogo';
import { LoadingGlyphCanvas } from './LoadingGlyphCanvas';
import { useLocale } from '../context/LocaleContext';

interface CinematicLoadingScreenProps {
  progress: number;
}

export const CinematicLoadingScreen: React.FC<CinematicLoadingScreenProps> = ({ progress }) => {
  const { t } = useLocale();
  const pct = Math.round(progress);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[10000] overflow-hidden text-white"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={t('loading.status')}
    >
      <LoadingGlyphCanvas className="absolute inset-0" />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 46%, rgba(3, 7, 18, 0.02) 0%, rgba(3, 7, 18, 0.35) 38%, rgba(3, 7, 18, 0.78) 100%)',
        }}
      />
      <div className="noise-overlay" aria-hidden="true" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="cinematic-loading-logo-ring mb-8 flex items-center justify-center">
          <GTranLogo size={76} showLabel={false} />
        </div>

        <p className="font-display text-lg font-semibold tracking-wide text-white/95">
          {t('loading.title')}
        </p>
        <p className="mt-2 max-w-xs font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-400/80">
          {t('loading.status')}
        </p>

        <div className="mt-10 w-[min(18rem,calc(100vw-3rem))]">
          <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500">
            <span>{t('loading.progressLabel')}</span>
            <span className="text-cyan-400/90">{pct}%</span>
          </div>
          <div className="cinematic-loading-track h-[3px] overflow-hidden rounded-full bg-zinc-900/90">
            <div
              className="cinematic-loading-bar relative h-full rounded-full"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
