/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type OceanCreatureKind = 'dolphin' | 'whale' | 'jellyfish';

export interface OceanCreature {
  kind: OceanCreatureKind;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  phase: number;
  flip: 1 | -1;
  bornAt: number;
  ttl: number;
  /** Per-instance body scale — smaller when far, larger when near */
  scale: number;
  /** Rare oversized whale — slower, closer, screen-filling silhouette */
  isGiant?: boolean;
  chars: string[];
}

export interface OceanCreatureViewport {
  fov: number;
  screenHalfWidth: number;
  screenHalfHeight: number;
}

const BODY: Record<OceanCreatureKind, [number, number][]> = {
  dolphin: [
    [34, 0],
    [26, -3],
    [26, 3],
    [18, -5],
    [18, 0],
    [18, 5],
    [10, -5],
    [10, 0],
    [10, 5],
    [2, -4],
    [2, 4],
    [-6, -3],
    [-6, 3],
    [-14, -5],
    [-14, 5],
    [-22, -9],
    [-22, 9],
    [6, -9],
  ],
  whale: [
    [52, 0],
    [40, -6],
    [40, 6],
    [28, -10],
    [28, 0],
    [28, 10],
    [14, -11],
    [14, 0],
    [14, 11],
    [0, -9],
    [0, 0],
    [0, 9],
    [-14, -8],
    [-14, 8],
    [-28, -6],
    [-28, 6],
    [-42, -4],
    [-42, 4],
    [-54, -14],
    [-54, 0],
    [-54, 14],
    [22, -14],
  ],
  jellyfish: [
    [-10, -8],
    [-5, -11],
    [0, -12],
    [5, -11],
    [10, -8],
    [-8, -4],
    [0, -5],
    [8, -4],
    [-6, 0],
    [0, -1],
    [6, 0],
    [-4, 6],
    [-4, 18],
    [-1, 5],
    [-1, 20],
    [2, 5],
    [2, 19],
    [5, 6],
    [5, 17],
  ],
};

const KIND_META: Record<
  OceanCreatureKind,
  { speed: number; ttl: number; size: number; alpha: number; wobble: number }
> = {
  dolphin: { speed: 168, ttl: 48, size: 1, alpha: 0.82, wobble: 26 },
  whale: { speed: 34, ttl: 32, size: 1.35, alpha: 0.72, wobble: 7 },
  jellyfish: { speed: 14, ttl: 28, size: 1.1, alpha: 0.68, wobble: 18 },
};

function pickChar(chars: readonly string[], i: number) {
  return chars[i % chars.length] ?? '言';
}

/** Map depth (z) to visual scale — lower z = closer = larger */
function depthScaleFromZ(z: number) {
  const minZ = 32;
  const maxZ = 340;
  const t = Math.min(1, Math.max(0, (z - minZ) / (maxZ - minZ)));
  return 1.55 - t * 1.05;
}

function worldHalfWidthAtDepth(z: number, fov: number, screenHalfWidth: number) {
  const projScale = fov / (z + fov);
  return screenHalfWidth / projScale;
}

function worldHalfHeightAtDepth(z: number, fov: number, screenHalfHeight: number) {
  const projScale = fov / (z + fov);
  return screenHalfHeight / projScale;
}

function spawnMargin(z: number, scale = 1) {
  return (140 + depthScaleFromZ(z) * 120) * (0.9 + Math.min(scale, 3) * 0.22);
}

/** Spawn off one screen edge with velocity toward the opposite edge */
function spawnEdgeCrossing(
  z: number,
  viewport: OceanCreatureViewport,
  speed: number,
  opts: { verticalDrift?: number; allowVertical?: boolean; scale?: number } = {},
) {
  const halfW = worldHalfWidthAtDepth(z, viewport.fov, viewport.screenHalfWidth);
  const halfH = worldHalfHeightAtDepth(z, viewport.fov, viewport.screenHalfHeight);
  const margin = spawnMargin(z, opts.scale ?? 1);
  const verticalDrift = opts.verticalDrift ?? 12;
  const useVertical = opts.allowVertical && Math.random() > 0.72;

  if (useVertical) {
    const fromTop = Math.random() > 0.5;
    const vy = (fromTop ? 1 : -1) * speed * 0.72;
    return {
      x: (Math.random() - 0.5) * halfW * 1.35,
      y: fromTop ? -halfH - margin : halfH + margin,
      vx: (Math.random() - 0.5) * verticalDrift * 0.35,
      vy,
      flip: 1 as const,
    };
  }

  const fromLeft = Math.random() > 0.5;
  const flip = (fromLeft ? 1 : -1) as 1 | -1;
  return {
    x: fromLeft ? -halfW - margin : halfW + margin,
    y: (Math.random() - 0.5) * halfH * 1.55,
    vx: flip * speed,
    vy: (Math.random() - 0.5) * verticalDrift,
    flip,
  };
}

function isPastOppositeEdge(c: OceanCreature, viewport: OceanCreatureViewport) {
  const edgeScale = c.isGiant ? c.scale * 1.15 : c.scale;
  const halfW =
    worldHalfWidthAtDepth(c.z, viewport.fov, viewport.screenHalfWidth) + spawnMargin(c.z, edgeScale) * 0.55;
  const halfH =
    worldHalfHeightAtDepth(c.z, viewport.fov, viewport.screenHalfHeight) + spawnMargin(c.z, edgeScale) * 0.55;

  if (Math.abs(c.vx) >= Math.abs(c.vy)) {
    if (c.vx > 0) return c.x > halfW;
    if (c.vx < 0) return c.x < -halfW;
    return false;
  }

  if (c.vy > 0) return c.y > halfH;
  if (c.vy < 0) return c.y < -halfH;
  return false;
}

export function createOceanCreature(
  kind: OceanCreatureKind,
  glyphPool: readonly string[],
  time: number,
  viewport: OceanCreatureViewport,
  opts: { giant?: boolean } = {},
): OceanCreature {
  const meta = KIND_META[kind];
  const points = BODY[kind];
  const isGiant = kind === 'whale' && opts.giant === true;
  const z = isGiant ? 36 + Math.random() * 48 : 32 + Math.random() * 308;
  const depthScale = depthScaleFromZ(z);
  const jitter = 0.78 + Math.random() * 0.52;
  const scale = isGiant
    ? meta.size * (2.15 + Math.random() * 0.55)
    : meta.size * depthScale * jitter;
  const speedFactor = isGiant ? 0.72 : 0.5 + depthScale * 0.55;
  const chars = points.map((_, i) =>
    pickChar(glyphPool, Math.floor(Math.random() * glyphPool.length) + i),
  );

  if (kind === 'dolphin') {
    const crossing = spawnEdgeCrossing(z, viewport, meta.speed * speedFactor, { verticalDrift: 18 });
    return {
      kind,
      ...crossing,
      z,
      phase: Math.random() * Math.PI * 2,
      bornAt: time,
      ttl: meta.ttl + Math.random() * 18,
      scale,
      chars,
    };
  }

  if (kind === 'jellyfish') {
    const crossing = spawnEdgeCrossing(z, viewport, meta.speed * speedFactor * 0.95, {
      verticalDrift: 22,
      allowVertical: true,
    });
    return {
      kind,
      ...crossing,
      z,
      phase: Math.random() * Math.PI * 2,
      bornAt: time,
      ttl: meta.ttl + Math.random() * 24,
      scale,
      chars,
    };
  }

  const crossing = spawnEdgeCrossing(z, viewport, meta.speed * speedFactor * (isGiant ? 0.62 : 1), {
    verticalDrift: isGiant ? 4 : 6,
    scale,
  });
  return {
    kind: 'whale',
    ...crossing,
    z,
    phase: Math.random() * Math.PI * 2,
    bornAt: time,
    ttl: (isGiant ? meta.ttl * 2.4 : meta.ttl) + Math.random() * (isGiant ? 24 : 10),
    scale,
    isGiant: isGiant || undefined,
    chars,
  };
}

export function pickRandomOceanCreatureKind(): OceanCreatureKind {
  const kinds: OceanCreatureKind[] = ['dolphin', 'whale', 'jellyfish'];
  return kinds[Math.floor(Math.random() * kinds.length)]!;
}

/** ~7% chance to spawn a rare giant whale instead of a random creature */
export function pickOceanCreatureSpawn(): { kind: OceanCreatureKind; giant: boolean } {
  if (Math.random() < 0.07) {
    return { kind: 'whale', giant: true };
  }
  return { kind: pickRandomOceanCreatureKind(), giant: false };
}

function updateDolphin(c: OceanCreature, time: number, dt: number) {
  c.vy += Math.sin(time * 2.4 + c.phase) * KIND_META.dolphin.wobble * dt;
  c.x += c.vx * dt;
  c.y += c.vy * dt;
  c.z += Math.sin(time * 1.1 + c.phase) * 10 * dt;
  c.flip = c.vx >= 0 ? 1 : -1;
}

function updateWhale(c: OceanCreature, time: number, dt: number) {
  const wobble = c.isGiant ? KIND_META.whale.wobble * 0.55 : KIND_META.whale.wobble;
  c.x += c.vx * dt;
  c.y += c.vy * dt + Math.sin(time * 0.55 + c.phase) * wobble * dt;
  c.z += Math.sin(time * 0.35 + c.phase) * (c.isGiant ? 2.5 : 4) * dt;
  c.flip = c.vx >= 0 ? 1 : -1;
}

function updateJellyfish(c: OceanCreature, time: number, dt: number) {
  const floatX = Math.sin(time * 0.32 + c.phase) * 9;
  const floatY = Math.cos(time * 0.26 + c.phase * 1.4) * 12;

  c.x += (c.vx + floatX) * dt;
  c.y += (c.vy + floatY) * dt;
  c.z += Math.sin(time * 0.48 + c.phase) * 9 * dt;
}

export function updateOceanCreatures(
  creatures: OceanCreature[],
  time: number,
  dt: number,
  viewport: OceanCreatureViewport,
) {
  for (let i = creatures.length - 1; i >= 0; i--) {
    const c = creatures[i]!;
    const age = time - c.bornAt;

    switch (c.kind) {
      case 'dolphin':
        updateDolphin(c, time, dt);
        break;
      case 'whale':
        updateWhale(c, time, dt);
        break;
      case 'jellyfish':
        updateJellyfish(c, time, dt);
        break;
    }

    if (isPastOppositeEdge(c, viewport) || age > c.ttl) {
      creatures.splice(i, 1);
    }
  }
}

export function drawOceanCreatures(
  ctx: CanvasRenderingContext2D,
  creatures: OceanCreature[],
  time: number,
  opts: {
    fov: number;
    cx: number;
    cy: number;
    parallaxX: number;
    parallaxY: number;
    width: number;
    height: number;
    glyphPool: readonly string[];
  },
) {
  const { fov, cx, cy, parallaxX, parallaxY, width, height } = opts;
  const colors = ['#E0F2FE', '#BAE6FD', '#7DD3FC', '#38BDF8', '#0EA5E9'];
  const sorted = [...creatures].sort((a, b) => b.z - a.z);

  sorted.forEach((creature) => {
    const meta = KIND_META[creature.kind];
    const body = BODY[creature.kind];
    const depthScale = depthScaleFromZ(creature.z);
    const isGiantWhale = creature.kind === 'whale' && creature.isGiant;
    const tailWave =
      creature.kind === 'jellyfish'
        ? Math.sin(time * 1.2 + creature.phase) * 7 * creature.scale
        : Math.sin(time * (isGiantWhale ? 2.6 : 4.2) + creature.phase) * 10 * creature.scale;
    const bellPulse =
      creature.kind === 'jellyfish' ? Math.sin(time * 1.8 + creature.phase) * 5 * creature.scale : 0;
    const leanY =
      creature.kind === 'dolphin' ? Math.max(-1, Math.min(1, creature.vy / 55)) * 6 * creature.scale : 0;

    body.forEach(([lx, ly], i) => {
      const localX = lx * creature.scale * creature.flip;
      let localY = ly * creature.scale + leanY;

      if (creature.kind === 'jellyfish') {
        if (ly < 0) localY += bellPulse;
        else localY += tailWave * (0.35 + (i / body.length) * 0.65);
      } else if (lx < 0) {
        localY += tailWave * (Math.min(1, Math.abs(lx) / 24) * 0.85);
      }

      const wx = creature.x + localX;
      const wy = creature.y + localY;
      const wz = creature.z + Math.sin(time * 1.1 + i * 0.4 + creature.phase) * 6 * creature.scale;
      const projZ = wz + fov;
      if (projZ <= 12) return;

      const projScale = Math.min(
        isGiantWhale ? 3.6 : creature.scale > 1.2 ? 2.8 : 2.2,
        fov / projZ,
      );
      const screenX = cx + (wx + parallaxX) * projScale;
      const screenY = cy + (wy + parallaxY) * projScale;

      if (screenX < -280 || screenX > width + 280 || screenY < -280 || screenY > height + 280) {
        return;
      }

      const baseGlyph = isGiantWhale ? 12 : creature.kind === 'whale' ? 10 : 9;
      const size = Math.max(5, baseGlyph * projScale * creature.scale * 0.92);
      const alpha =
        meta.alpha *
        (0.38 + depthScale * 0.58) *
        (0.82 + creature.scale * 0.12) *
        (isGiantWhale ? 0.94 : 1);

      const palette = isGiantWhale
        ? ['#0C4A6E', '#075985', '#0369A1', '#0284C7', '#0EA5E9']
        : colors;
      ctx.fillStyle = palette[i % palette.length] ?? '#38BDF8';
      ctx.globalAlpha = Math.min(1, alpha);
      ctx.font = `400 ${size}px var(--font-display)`;
      ctx.fillText(creature.chars[i] ?? pickChar(opts.glyphPool, i), screenX, screenY);
    });
  });

  ctx.globalAlpha = 1;
}
