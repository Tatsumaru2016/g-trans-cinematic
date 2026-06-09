/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

const MULTILINGUAL_CHARS = [
  '意', '味', '言', '葉', '絆', '繋', '越', '境', '解',
  '超', '消', '融', '通', '創', '新', '道',
  '뜻', '말', '한', '글', '연', '결', '소', '통',
  'Ω', 'Ψ', 'Φ', 'Д', 'Я', 'A', 'Z', '∞', '✦', '★',
];

const LOADING_COLORS = ['#C7D2FE', '#A5B4FC', '#67E8F9', '#22D3EE', '#818CF8', '#E0E7FF'];

const ARM_COUNT = 6;
const GLYPHS_PER_ARM = 18;
const DENSITY_RAMP_SEC = 2.1;
const SPIRAL_OUTER_RATIO = 0.88;

type SpiralGlyph = {
  char: string;
  size: number;
  baseAngle: number;
  phaseOffset: number;
  speed: number;
  spiralTurns: number;
  unlockAt: number;
  color: string;
};

function randomGlyphBaseSize() {
  const roll = Math.random();
  if (roll < 0.42) return 8 + Math.random() * 2.5;
  if (roll < 0.8) return 11 + Math.random() * 3;
  return 14 + Math.random() * 4;
}

function createSpiralGlyphs(): SpiralGlyph[] {
  const glyphs: SpiralGlyph[] = [];

  for (let i = 0; i < ARM_COUNT * GLYPHS_PER_ARM; i++) {
    const arm = i % ARM_COUNT;
    const slot = Math.floor(i / ARM_COUNT);
    const slotT = slot / GLYPHS_PER_ARM;
    glyphs.push({
      char: MULTILINGUAL_CHARS[i % MULTILINGUAL_CHARS.length] ?? '言',
      size: randomGlyphBaseSize(),
      baseAngle: (arm / ARM_COUNT) * Math.PI * 2 + (slot * 0.091) % 0.42,
      phaseOffset: slotT * 0.45 + arm * 0.028,
      speed: 0.062 + (arm % 3) * 0.011,
      spiralTurns: 1.75 + (arm % 2) * 0.45,
      unlockAt: slotT * DENSITY_RAMP_SEC * 0.78 + arm * 0.08,
      color: LOADING_COLORS[i % LOADING_COLORS.length] ?? '#67E8F9',
    });
  }

  return glyphs.sort((a, b) => a.unlockAt - b.unlockAt);
}

interface LoadingGlyphCanvasProps {
  className?: string;
}

/** G.trans globe — glyphs spiral outward from the center */
export const LoadingGlyphCanvas: React.FC<LoadingGlyphCanvasProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glyphsRef = useRef<SpiralGlyph[]>([]);
  const timeRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    glyphsRef.current = createSpiralGlyphs();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', onResize);

    const fov = 430;

    const render = () => {
      timeRef.current += 0.016;
      const time = timeRef.current;
      const centerX = width / 2;
      const centerY = height / 2;
      const maxSpread = Math.min(width, height) * 0.5;
      const outerRadius = maxSpread * SPIRAL_OUTER_RATIO;
      const logoClearPx = 52;
      const densityRamp = Math.min(1, time / DENSITY_RAMP_SEC);
      const densityEase = densityRamp * densityRamp * (3 - 2 * densityRamp);
      const globalDensity = 0.32 + densityEase * 0.68;

      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, width, height);

      const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) * 0.55);
      glow.addColorStop(0, `rgba(0, 229, 255, ${0.08 + densityEase * 0.12})`);
      glow.addColorStop(0.18, `rgba(59, 130, 246, ${0.04 + densityEase * 0.07})`);
      glow.addColorStop(0.42, 'rgba(139, 92, 246, 0.04)');
      glow.addColorStop(1, 'rgba(3, 7, 18, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      const projected: Array<{
        screenX: number;
        screenY: number;
        size: number;
        alpha: number;
        char: string;
        color: string;
        z: number;
      }> = [];

      glyphsRef.current.forEach((g) => {
        if (time < g.unlockAt) return;

        const localTime = time - g.unlockAt;
        const spawnFade = Math.min(1, localTime / 0.55);
        const travel = (localTime * g.speed + g.phaseOffset) % 1;

        const drawAt = (t: number, head: boolean) => {
          const eased = t * t * (3 - 2 * t);
          const radius = 8 + eased * outerRadius;
          const theta = g.baseAngle + eased * g.spiralTurns * Math.PI * 2;
          const x = Math.cos(theta) * radius;
          const y = Math.sin(theta) * radius * 0.84;
          const z = -220 + eased * eased * 520;

          const projZ = z + fov;
          if (projZ <= 14) return;

          const scale = Math.min(2.1, fov / projZ);
          const screenX = centerX + x * scale;
          const screenY = centerY + y * scale;

          if (screenX < -180 || screenX > width + 180 || screenY < -180 || screenY > height + 180) {
            return;
          }

          const centerDist = Math.hypot(screenX - centerX, screenY - centerY);
          if (head && centerDist < logoClearPx && t < 0.26) return;

          const emergeFade = t < 0.14 ? Math.max(0, (t - 0.04) / 0.1) : 1;
          const edgeFade = t > 0.84 ? Math.max(0, 1 - (t - 0.84) / 0.16) : 1;
          const behindBoost = Math.min(1, Math.max(0, (z + 80) / 260));
          const alpha =
            emergeFade * edgeFade * spawnFade * globalDensity * (0.16 + behindBoost * 0.52) * (0.55 + scale * 0.26);
          if (alpha < 0.03) return;

          const size = Math.max(1, g.size * scale * (0.82 + eased * 0.28));
          if (size < 0.7) return;

          projected.push({
            screenX,
            screenY,
            size: head ? size : size * 0.72,
            alpha: head ? alpha : alpha * 0.34,
            char: g.char,
            color: g.color,
            z,
          });
        };

        drawAt(Math.max(0, travel - 0.042), false);
        drawAt(Math.max(0, travel - 0.02), false);
        drawAt(travel, true);
      });

      projected.sort((a, b) => a.z - b.z);

      projected.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.font = `300 ${p.size}px var(--font-display)`;
        ctx.fillText(p.char, p.screenX, p.screenY);
      });

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', onResize);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <canvas ref={canvasRef} className={`block h-full w-full ${className}`} aria-hidden="true" />
  );
};
