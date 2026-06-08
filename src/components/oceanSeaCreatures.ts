/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type OceanCreatureKind = 'dolphin' | 'whale' | 'squid' | 'octopus';

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
  /** Rare variant — pink dolphin or giant white whale */
  isRare?: boolean;
  /** Glyph anchor points — body layout (mantle + tentacles for cephalopods) */
  points: [number, number][];
  /** Per-glyph size tier (small / medium / large) for depth */
  glyphScales: number[];
  chars: string[];
}

export interface OceanCreatureViewport {
  fov: number;
  screenHalfWidth: number;
  screenHalfHeight: number;
}

const BODY: Record<'dolphin' | 'whale', [number, number][]> = {
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
};

const KIND_META: Record<
  OceanCreatureKind,
  { speed: number; ttl: number; size: number; alpha: number; wobble: number }
> = {
  dolphin: { speed: 168, ttl: 48, size: 1, alpha: 0.82, wobble: 26 },
  whale: { speed: 34, ttl: 32, size: 1.35, alpha: 0.72, wobble: 2 },
  squid: { speed: 42, ttl: 36, size: 1.05, alpha: 0.78, wobble: 16 },
  octopus: { speed: 24, ttl: 40, size: 1.1, alpha: 0.8, wobble: 12 },
};

const DEFAULT_COLORS = ['#E0F2FE', '#BAE6FD', '#7DD3FC', '#38BDF8', '#0EA5E9'];
const SQUID_COLORS = ['#FFFFFF', '#F8FAFC', '#F1F5F9', '#E2E8F0', '#CBD5E1', '#94A3B8'];
const OCTOPUS_COLORS = ['#FEF2F2', '#FEE2E2', '#FECACA', '#FCA5A5', '#F87171', '#EF4444', '#DC2626'];
const RARE_DOLPHIN_COLORS = ['#FDF2F8', '#FCE7F3', '#FBCFE8', '#F9A8D4', '#F472B6', '#EC4899'];
const RARE_WHALE_COLORS = ['#FFFFFF', '#F8FAFC', '#F1F5F9', '#E2E8F0', '#CBD5E1', '#94A3B8'];

function pickChar(chars: readonly string[], i: number) {
  return chars[i % chars.length] ?? '言';
}

/** Squid — sharp △ mantle at +x, tentacles trail at −x */
const SQUID_HEAD: [number, number][] = [
  [36, 0],
  [28, -8],
  [18, -14],
  [8, -15],
  [-2, -12],
  [-8, -8],
  [-8, 8],
  [-2, 12],
  [8, 15],
  [18, 14],
  [28, 8],
  [24, -5],
  [24, 5],
  [14, -9],
  [14, 9],
  [4, -8],
  [4, 8],
  [20, 0],
  [10, 0],
  [0, 0],
];

const SQUID_TENTACLES: [number, number][] = [
  [-8, -3],
  [-22, -6],
  [-36, -8],
  [-50, -7],
  [-64, -5],
  [-78, -4],
  [-92, -3],
  [-8, 3],
  [-22, 7],
  [-36, 10],
  [-50, 9],
  [-64, 8],
  [-78, 7],
  [-92, 6],
  [-6, -9],
  [-20, -14],
  [-34, -16],
  [-48, -17],
  [-62, -16],
  [-76, -14],
  [-6, 9],
  [-20, 14],
  [-34, 16],
  [-48, 17],
  [-62, 16],
  [-76, 14],
  [-4, -12],
  [-18, -18],
  [-32, -20],
  [-46, -19],
  [-60, -17],
  [-4, 12],
  [-18, 18],
  [-32, 20],
  [-46, 19],
  [-60, 17],
];

function buildOctopusHeadRing(): [number, number][] {
  const pts: [number, number][] = [];
  const cx = -1;
  const cy = 0;
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * 14, cy + Math.sin(a) * 14]);
  }
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * 8, cy + Math.sin(a) * 8]);
  }
  pts.push([5, -4], [5, 4], [2, -2], [2, 2], [cx, cy]);
  return pts;
}

const OCTOPUS_TENTACLES: [number, number][] = [
  [-8, -13],
  [-20, -17],
  [-32, -15],
  [-44, -13],
  [-56, -11],
  [-68, -9],
  [-8, -7],
  [-22, -9],
  [-36, -7],
  [-48, -5],
  [-60, -3],
  [-72, -1],
  [-8, 0],
  [-24, 2],
  [-38, 4],
  [-52, 5],
  [-66, 6],
  [-8, 7],
  [-22, 10],
  [-36, 12],
  [-48, 13],
  [-60, 14],
  [-72, 15],
  [-8, 13],
  [-20, 18],
  [-32, 16],
  [-44, 14],
  [-56, 12],
  [-68, 10],
  [-6, -15],
  [-18, -21],
  [-30, -19],
  [-42, -17],
  [-54, -15],
  [-66, -13],
  [-6, 15],
  [-18, 21],
  [-30, 19],
  [-42, 17],
  [-54, 15],
  [-66, 13],
];

function addInteriorPoints(
  points: [number, number][],
  scale: number,
  inside: (x: number, y: number) => boolean,
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number },
) {
  const spacing = Math.max(3, Math.round(8.5 - scale * 2.3));
  for (let x = bounds.xMin; x <= bounds.xMax; x += spacing) {
    for (let y = bounds.yMin; y <= bounds.yMax; y += spacing) {
      if (!inside(x, y)) continue;
      const crowded = points.some(([px, py]) => Math.hypot(px - x, py - y) < spacing * 0.65);
      if (!crowded) points.push([x, y]);
    }
  }
}

function isInsideSquidMantle(x: number, y: number) {
  if (x > 36 || x < -8) return false;
  const t = (36 - x) / 44;
  return Math.abs(y) <= 15 * t;
}

function isSquidHead(lx: number, ly: number) {
  return isInsideSquidMantle(lx, ly);
}

function buildSquidBody(scale: number): [number, number][] {
  const points: [number, number][] = [...SQUID_HEAD, ...SQUID_TENTACLES];
  addInteriorPoints(points, scale, isInsideSquidMantle, { xMin: -8, xMax: 36, yMin: -16, yMax: 16 });
  return points;
}

function isInsideOctopusHead(x: number, y: number) {
  const dx = x + 1;
  const dy = y;
  return dx * dx + dy * dy <= 196;
}

function isOctopusTentacle(lx: number, ly: number) {
  return !isInsideOctopusHead(lx, ly) && lx < 2;
}

function buildOctopusBody(scale: number): [number, number][] {
  const points: [number, number][] = [...buildOctopusHeadRing(), ...OCTOPUS_TENTACLES];
  addInteriorPoints(points, scale, isInsideOctopusHead, { xMin: -15, xMax: 8, yMin: -15, yMax: 15 });
  return points;
}

function bodyPointsFor(kind: OceanCreatureKind, scale: number): [number, number][] {
  if (kind === 'squid') return buildSquidBody(scale);
  if (kind === 'octopus') return buildOctopusBody(scale);
  return BODY[kind];
}

function assignGlyphChars(points: [number, number][], glyphPool: readonly string[]) {
  return points.map((_, i) =>
    pickChar(glyphPool, Math.floor(Math.random() * glyphPool.length) + i),
  );
}

function randomGlyphSizeTier() {
  const roll = Math.random();
  if (roll < 0.34) return 0.7 + Math.random() * 0.12;
  if (roll < 0.68) return 0.92 + Math.random() * 0.14;
  return 1.12 + Math.random() * 0.24;
}

function assignGlyphScales(count: number) {
  return Array.from({ length: count }, () => randomGlyphSizeTier());
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
  const isGiantWhale = c.kind === 'whale' && c.isRare;
  const isCephalopod = c.kind === 'squid' || c.kind === 'octopus';
  const edgeScale = isGiantWhale ? c.scale * 1.15 : isCephalopod ? c.scale * 1.38 : c.scale;
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
  opts: { rare?: boolean } = {},
): OceanCreature {
  const meta = KIND_META[kind];
  const isRareWhale = kind === 'whale' && opts.rare === true;
  const isRareDolphin = kind === 'dolphin' && opts.rare === true;
  const z = isRareWhale ? 36 + Math.random() * 48 : 32 + Math.random() * 308;
  const depthScale = depthScaleFromZ(z);
  const jitter = 0.78 + Math.random() * 0.52;
  const scale = isRareWhale
    ? meta.size * (2.15 + Math.random() * 0.55)
    : meta.size * depthScale * jitter;
  const speedFactor = isRareWhale ? 0.72 : 0.5 + depthScale * 0.55;
  const points = bodyPointsFor(kind, scale);
  const chars = assignGlyphChars(points, glyphPool);
  const glyphScales = assignGlyphScales(points.length);

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
      isRare: isRareDolphin || undefined,
      points,
      glyphScales,
      chars,
    };
  }

  if (kind === 'squid' || kind === 'octopus') {
    const crossing = spawnEdgeCrossing(z, viewport, meta.speed * speedFactor, {
      verticalDrift: kind === 'octopus' ? 12 : 7,
      scale: scale * 1.28,
    });
    return {
      kind,
      ...crossing,
      z,
      phase: Math.random() * Math.PI * 2,
      bornAt: time,
      ttl: meta.ttl + Math.random() * 16,
      scale,
      points,
      glyphScales,
      chars,
    };
  }

  const crossing = spawnEdgeCrossing(z, viewport, meta.speed * speedFactor * (isRareWhale ? 0.62 : 1), {
    verticalDrift: isRareWhale ? 2 : 3,
    scale,
  });
  return {
    kind: 'whale',
    ...crossing,
    z,
    phase: Math.random() * Math.PI * 2,
    bornAt: time,
    ttl: (isRareWhale ? meta.ttl * 2.4 : meta.ttl) + Math.random() * (isRareWhale ? 24 : 10),
    scale,
    isRare: isRareWhale || undefined,
    points,
    glyphScales,
    chars,
  };
}

export function pickRandomOceanCreatureKind(): OceanCreatureKind {
  const kinds: OceanCreatureKind[] = ['dolphin', 'whale', 'squid', 'octopus'];
  return kinds[Math.floor(Math.random() * kinds.length)]!;
}

/** ~7% pink dolphin, ~3% giant white whale (whale rarer), otherwise random creature */
export function pickOceanCreatureSpawn(): { kind: OceanCreatureKind; rare: boolean } {
  const roll = Math.random();
  if (roll < 0.07) {
    return { kind: 'dolphin', rare: true };
  }
  if (roll < 0.1) {
    return { kind: 'whale', rare: true };
  }
  return { kind: pickRandomOceanCreatureKind(), rare: false };
}

function updateDolphin(c: OceanCreature, time: number, dt: number) {
  c.vy += Math.sin(time * 2.4 + c.phase) * KIND_META.dolphin.wobble * dt;
  c.x += c.vx * dt;
  c.y += c.vy * dt;
  c.z += Math.sin(time * 1.1 + c.phase) * 10 * dt;
  c.flip = c.vx >= 0 ? 1 : -1;
}

function updateWhale(c: OceanCreature, time: number, dt: number) {
  const glideY = Math.sin(time * 0.32 + c.phase) * KIND_META.whale.wobble;
  c.x += c.vx * dt;
  c.y += (c.vy + glideY) * dt;
  c.vy *= 0.992;
  c.z += Math.sin(time * 0.18 + c.phase) * (c.isRare ? 0.6 : 1) * dt;
  c.flip = c.vx >= 0 ? 1 : -1;
}

function updateSquid(c: OceanCreature, time: number, dt: number) {
  const jet = Math.max(0, Math.sin(time * 3.4 + c.phase));
  c.x += c.vx * (1 + jet * 0.42) * dt;
  c.y += c.vy * dt + Math.sin(time * 1.35 + c.phase) * KIND_META.squid.wobble * dt;
  c.z += Math.sin(time * 0.75 + c.phase) * 5 * dt;
  c.flip = c.vx >= 0 ? 1 : -1;
}

function updateOctopus(c: OceanCreature, time: number, dt: number) {
  c.x += c.vx * dt;
  c.y += c.vy * dt + Math.sin(time * 0.95 + c.phase) * KIND_META.octopus.wobble * dt;
  c.vy += Math.sin(time * 0.55 + c.phase * 1.4) * 3 * dt;
  c.vy *= 0.985;
  c.z += Math.sin(time * 0.5 + c.phase) * 4 * dt;
  c.flip = c.vx >= 0 ? 1 : -1;
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
      case 'squid':
        updateSquid(c, time, dt);
        break;
      case 'octopus':
        updateOctopus(c, time, dt);
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
  const sorted = [...creatures].sort((a, b) => b.z - a.z);

  sorted.forEach((creature) => {
    const meta = KIND_META[creature.kind];
    const body = creature.points;
    const depthScale = depthScaleFromZ(creature.z);
    const isRareWhale = creature.kind === 'whale' && creature.isRare;
    const isRareDolphin = creature.kind === 'dolphin' && creature.isRare;
    const isWhale = creature.kind === 'whale';
    const isSquid = creature.kind === 'squid';
    const isOctopus = creature.kind === 'octopus';
    const tailWave = isWhale
      ? Math.sin(time * 1.05 + creature.phase) * (isRareWhale ? 2.5 : 3.5) * creature.scale
      : Math.sin(time * 4.2 + creature.phase) * 10 * creature.scale;
    const tentacleWave = Math.sin(time * 2.6 + creature.phase) * 9 * creature.scale;
    const leanY =
      creature.kind === 'dolphin' ? Math.max(-1, Math.min(1, creature.vy / 55)) * 6 * creature.scale : 0;

    body.forEach(([lx, ly], i) => {
      const localX = lx * creature.scale * creature.flip;
      let localY = ly * creature.scale + leanY;

      if (isSquid && !isSquidHead(lx, ly)) {
        const tentacleFactor = Math.min(1, (-8 - lx) / 84);
        localY += tentacleWave * tentacleFactor * Math.sin(i * 0.7 + time * 0.4);
      } else if (isOctopus && isOctopusTentacle(lx, ly)) {
        const tentacleFactor = Math.min(1, (2 - lx) / 64 + Math.abs(ly) / 26);
        localY += tentacleWave * tentacleFactor * Math.sin(i * 0.55 + time * 0.35);
      } else if (lx < 0 && !isWhale) {
        localY += tailWave * (Math.min(1, Math.abs(lx) / 24) * 0.85);
      } else if (isWhale && lx < 0) {
        localY += tailWave * (Math.min(1, Math.abs(lx) / 32) * 0.55);
      }

      const wx = creature.x + localX;
      const wy = creature.y + localY;
      const depthWobble = isWhale ? 1.4 : 6;
      const wz = creature.z + Math.sin(time * (isWhale ? 0.7 : 1.1) + i * 0.4 + creature.phase) * depthWobble * creature.scale;
      const projZ = wz + fov;
      if (projZ <= 12) return;

      const projScale = Math.min(
        isRareWhale ? 3.6 : creature.scale > 1.2 ? 2.8 : 2.2,
        fov / projZ,
      );
      const screenX = cx + (wx + parallaxX) * projScale;
      const screenY = cy + (wy + parallaxY) * projScale;

      if (screenX < -280 || screenX > width + 280 || screenY < -280 || screenY > height + 280) {
        return;
      }

      const glyphScale = (creature.glyphScales[i] ?? 1) * (isSquid && isSquidHead(lx, ly) ? 1.12 : isOctopus && isInsideOctopusHead(lx, ly) ? 1.14 : 1);
      const baseGlyph = isRareWhale ? 12 : creature.kind === 'whale' ? 10 : isSquid || isOctopus ? 8.5 : 9;
      const size = Math.max(5, baseGlyph * projScale * creature.scale * glyphScale * 0.92);
      const alpha =
        meta.alpha *
        (0.38 + depthScale * 0.58) *
        (0.82 + creature.scale * 0.12) *
        (isRareWhale ? 0.96 : isRareDolphin ? 0.98 : 1);

      const palette = isRareWhale
        ? RARE_WHALE_COLORS
        : isRareDolphin
          ? RARE_DOLPHIN_COLORS
          : isSquid
            ? SQUID_COLORS
            : isOctopus
              ? OCTOPUS_COLORS
              : DEFAULT_COLORS;
      ctx.fillStyle = palette[i % palette.length] ?? '#38BDF8';
      ctx.globalAlpha = Math.min(1, alpha);
      ctx.font = `400 ${size}px var(--font-display)`;
      ctx.fillText(creature.chars[i] ?? pickChar(opts.glyphPool, i), screenX, screenY);
    });
  });

  ctx.globalAlpha = 1;
}
