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

const GLOBE_R = 26;
const GLOBE_CX = 32;
const GLOBE_CY = 32;

function WireframeGlobeMark({ light }: { light: boolean }) {
  const uid = React.useId().replace(/:/g, '');
  const scanGradId = `gtran-scan-${uid}`;
  const stroke = light ? '#0284c7' : '#22d3ee';
  const strokeSoft = light ? 'rgba(2, 132, 199, 0.38)' : 'rgba(34, 211, 238, 0.34)';
  const scanBright = light ? '#38bdf8' : '#00e5ff';
  const scanCore = light ? '#e0f2fe' : '#ffffff';

  const latitudes = [-0.78, -0.52, -0.26, 0, 0.26, 0.52, 0.78].map((t) => {
    const y = t * GLOBE_R;
    const ringR = Math.sqrt(Math.max(0, GLOBE_R * GLOBE_R - y * y));
    return {
      y,
      ringR,
      ry: Math.max(1.6, ringR * 0.16),
      opacity: 0.28 + (1 - Math.abs(t)) * 0.42,
    };
  });

  const meridians = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI;
    const rx = Math.abs(Math.cos(angle)) * GLOBE_R;
    return {
      rx,
      opacity: 0.32 + Math.abs(Math.cos(angle)) * 0.48,
    };
  });

  return (
    <svg
      viewBox="0 0 64 64"
      className="h-full w-full"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <linearGradient id={scanGradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={scanBright} stopOpacity="0" />
          <stop offset="45%" stopColor={scanBright} stopOpacity="0.55" />
          <stop offset="72%" stopColor={scanCore} stopOpacity="1" />
          <stop offset="100%" stopColor={scanBright} stopOpacity="0" />
        </linearGradient>
      </defs>

      <g>
        <circle
          cx={GLOBE_CX}
          cy={GLOBE_CY}
          r={GLOBE_R}
          fill="none"
          stroke={strokeSoft}
          strokeWidth={0.85}
          opacity={0.55}
        />
        <circle
          cx={GLOBE_CX}
          cy={GLOBE_CY}
          r={GLOBE_R}
          fill="none"
          stroke={`url(#${scanGradId})`}
          strokeWidth={1.35}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="14 86"
          className="gtran-logo-scan-sweep"
        />
        <circle
          cx={GLOBE_CX}
          cy={GLOBE_CY}
          r={GLOBE_R}
          fill="none"
          stroke={scanCore}
          strokeWidth={0.65}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="4 96"
          opacity={0.85}
          className="gtran-logo-scan-sweep gtran-logo-scan-sweep-trail"
        />
        {latitudes.map((lat) => (
          <ellipse
            key={`lat-${lat.y}`}
            cx={GLOBE_CX}
            cy={GLOBE_CY + lat.y}
            rx={lat.ringR}
            ry={lat.ry}
            fill="none"
            stroke={lat.y === 0 ? stroke : strokeSoft}
            strokeWidth={lat.y === 0 ? 0.75 : 0.55}
            opacity={lat.opacity}
          />
        ))}
        {meridians.map((meridian, i) => (
          <ellipse
            key={`mer-${i}`}
            cx={GLOBE_CX}
            cy={GLOBE_CY}
            rx={meridian.rx}
            ry={GLOBE_R}
            fill="none"
            stroke={strokeSoft}
            strokeWidth={0.55}
            opacity={meridian.opacity}
          />
        ))}
      </g>
    </svg>
  );
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
      <div
        className="relative shrink-0"
        style={{ width: size, height: size }}
        aria-label={label}
        role="img"
      >
        <div className="absolute inset-0">
          <WireframeGlobeMark light={light} />
        </div>
        <span
          className={`gtran-logo-g absolute inset-0 flex items-center justify-center font-display font-bold leading-none pointer-events-none ${
            light ? 'gtran-logo-g-light text-blue-700' : 'gtran-logo-g-dark text-white'
          }`}
          style={{ fontSize: size * 0.4 }}
          aria-hidden="true"
        >
          G
        </span>
      </div>
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
