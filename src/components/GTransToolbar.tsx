/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import { useLocale } from '../context/LocaleContext';
import { publicAsset } from '../lib/publicAsset';

/** Measured from gtran-toolbar.png (290×36) */
const TOOLBAR = { width: 290, height: 36 };

const FRAME = {
  width: 37,
  height: 32,
  top: (2 / TOOLBAR.height) * 100,
  heightPct: (32 / TOOLBAR.height) * 100,
  widthPct: (37 / TOOLBAR.width) * 100,
};

function iconLayout(centerPx: number, hintLeftPx: number) {
  const centerX = (centerPx / TOOLBAR.width) * 100;
  return {
    centerX,
    hintFrame: {
      left: (hintLeftPx / TOOLBAR.width) * 100,
      top: FRAME.top,
      width: FRAME.widthPct,
      height: FRAME.heightPct,
    },
    hit: {
      left: ((centerPx - 22) / TOOLBAR.width) * 100,
      width: (44 / TOOLBAR.width) * 100,
      top: 0,
      height: 100,
    },
  };
}

/** Range icon — corner brackets at x:45 */
const RANGE = iconLayout(45, 28);

/** Speech / utterance icon — bubble at x:~190 */
const SPEECH = iconLayout(190, 171.5);

export type GTransToolbarVariant = 'range' | 'speech';

interface GTransToolbarProps {
  variant?: GTransToolbarVariant;
  onAction: () => void;
  actionActive?: boolean;
  disabled?: boolean;
  showHint?: boolean;
  showSectionLabel?: boolean;
}

export const GTransToolbar: React.FC<GTransToolbarProps> = ({
  variant = 'range',
  onAction,
  actionActive = false,
  disabled = false,
  showHint = false,
  showSectionLabel = true,
}) => {
  const { t } = useLocale();
  const layout = variant === 'speech' ? SPEECH : RANGE;
  const actionLabel =
    variant === 'speech' ? t('toolbar.utteranceTranslation') : t('toolbar.rangeTranslation');

  return (
    <div className="w-full max-w-lg">
      {showSectionLabel && (
        <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">
          {t('toolbar.sectionLabel')}
        </p>
      )}
      <div className="w-[290px] max-w-full">
        <div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: `${TOOLBAR.width} / ${TOOLBAR.height}` }}
        >
          <img
            src={publicAsset('gtran-toolbar.png')}
            alt="G.trans toolbar"
            width={290}
            height={36}
            className="absolute inset-0 h-full w-full block select-none"
            draggable={false}
          />
          {showHint && (
            <div
              aria-hidden
              className="absolute box-border border-2 border-cyan-400/70 rounded-[2px] pointer-events-none"
              style={{
                left: `${layout.hintFrame.left}%`,
                width: `${layout.hintFrame.width}%`,
                top: `${layout.hintFrame.top}%`,
                height: `${layout.hintFrame.height}%`,
              }}
            />
          )}
          {actionActive && (
            <div
              aria-hidden
              className="absolute box-border border-2 border-red-500 rounded-[2px] pointer-events-none"
              style={{
                left: `${layout.hintFrame.left}%`,
                width: `${layout.hintFrame.width}%`,
                top: `${layout.hintFrame.top}%`,
                height: `${layout.hintFrame.height}%`,
              }}
            />
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={onAction}
            aria-label={actionLabel}
            aria-pressed={actionActive}
            className={`absolute box-border rounded-[2px] transition-colors cursor-pointer ${
              actionActive ? '' : 'hover:bg-black/[0.04] active:bg-black/[0.08]'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{
              left: `${layout.hit.left}%`,
              width: `${layout.hit.width}%`,
              top: `${layout.hit.top}%`,
              height: `${layout.hit.height}%`,
            }}
          />
        </div>
        {showHint && (
          <div className="relative mt-1.5 min-h-6">
            <div
              className="absolute pointer-events-none flex items-center gap-1.5"
              style={{
                left: `calc(${layout.centerX}% + 2px)`,
                transform: 'translateX(-10px)',
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-cyan-400"
                >
                  <ArrowUp className="w-5 h-5 stroke-[2.5]" />
                </motion.div>
              </motion.div>
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] font-mono text-cyan-400 tracking-wide whitespace-nowrap"
              >
                {t('toolbar.clickToDemo')}
              </motion.span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
