/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useLocale } from '../context/LocaleContext';

interface GTranLogoProps {
  size?: number;
  showLabel?: boolean;
  label?: string;
  sublabel?: string;
  className?: string;
  light?: boolean;
}

export const GTranLogo: React.FC<GTranLogoProps> = ({
  size = 40,
  showLabel = true,
  label = 'G.trans',
  sublabel,
  className = '',
  light = false,
}) => {
  const { t } = useLocale();
  const resolvedSublabel = sublabel ?? t('logo.sublabel');
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/gtran-logo.png"
        alt={label}
        width={size}
        height={size}
        className="object-contain shrink-0 bg-transparent"
        draggable={false}
      />
      {showLabel && (
        <div className="leading-tight">
          <span
            className={`font-display text-lg tracking-wide font-semibold ${
              light ? 'text-black' : 'text-white'
            }`}
          >
            {label}
          </span>
          {resolvedSublabel && (
            <span
              className={`block font-mono text-[10px] tracking-widest uppercase ${
                light ? 'text-cyan-600' : 'text-cyan-400'
              }`}
            >
              {resolvedSublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
