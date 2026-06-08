/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { SCENE_ACCENT } from '../config/sceneAccentColors';
import {
  createOceanCreature,
  drawOceanCreatures,
  pickOceanCreatureSpawn,
  updateOceanCreatures,
  type OceanCreature,
} from './oceanSeaCreatures';
import { SceneType, Particle3D } from '../types';

interface BackgroundCanvasProps {
  currentScene: SceneType;
  audioActive: boolean;
  interactiveMode: boolean; // Allow user to manually rotate / modify the scene speeds
  particleCount: number;
}

// Multilingual characters representing diverse world cultures
const MULTILINGUAL_CHARS = [
  // Japanese
  '意', '味', '言', '葉', '絆', '繋', '越', '境', '解',
  // Chinese
  '超', '越', '消', '除', '融', '通', '創', '新', '道',
  // Korean
  '뜻', '말', '한', '글', '연', '결', '소', '통', '세',
  // Arabic
  'ف', 'ه', 'م', 'ت', 'ق', 'ر', 'ي', 'ب', 'ح',
  // Sanskrit / Devanagari
  'ज्ञ', 'ा', 'न', 'श', 'ब्', 'द', 'म', 'ै', 'त्',
  // Greek / Cyrillic / Romance
  'Ω', 'Ψ', 'Φ', 'Д', 'Я', 'Ж', 'É', 'Ñ', 'Ç', 'ß',
  // English words and symbols
  'A', 'Z', 'Ω', '∞', '✦', '❖', '★', '⚡'
];

// Meaningful English and core translation words
const WORLD_WORDS = [
  'MEANING', 'INVISIBLE', 'UNDERSTAND', 'CONNECTION', 'UNITY',
  'BRIDGES', 'BEYOND', 'FREEDOM', 'CULTURE', 'EMPATHY', 'G.TRANS'
];

/** Random small / medium / large base glyph size for 3D depth variety */
function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function randomGlyphBaseSize() {
  const roll = Math.random();
  if (roll < 0.34) return 7 + Math.random() * 2.5;
  if (roll < 0.68) return 11 + Math.random() * 4;
  return 17 + Math.random() * 6;
}

/** Scene 06 — seamless depth loop for infinite warp tunnel */
const DISCOVERY_DEPTH_MIN = -1100;
const DISCOVERY_DEPTH_SPAN = 3900;
const DISCOVERY_WARP_SPEED = 0.42;
const DISCOVERY_PARTICLE_SPEED = 1.5;

function wrapDiscoveryZ(z: number) {
  const min = DISCOVERY_DEPTH_MIN;
  const span = DISCOVERY_DEPTH_SPAN;
  return min + ((((z - min) % span) + span) % span);
}

/** Far = wide spread, near = toward center — base cap only; per-particle lane breaks rings */
function discoveryConvergeRadius(depthT: number, maxSpread = 960) {
  const t = Math.max(0, Math.min(1, depthT));
  return 12 + Math.pow(t, 1.22) * maxSpread;
}

function discoveryDepthT(z: number) {
  return (z - DISCOVERY_DEPTH_MIN) / DISCOVERY_DEPTH_SPAN;
}

function discoveryScatterAngle(seed: number) {
  return (seed * 2.3999632297) % (Math.PI * 2);
}

/** Fade in at outer respawn, fade out at center vanish */
function discoveryGlyphVisibility(depthT: number) {
  const centerFade = depthT < 0.11 ? depthT / 0.11 : 1;
  const edgeFade = depthT > 0.9 ? Math.min(1, (1 - depthT) / 0.1) : 1;
  return centerFade * edgeFade;
}

function discoveryGlyphWarpBoost(depthT: number) {
  return Math.sin(Math.max(0, Math.min(1, depthT)) * Math.PI);
}

function placeDiscoveryTunnelXY(
  angle: number,
  z: number,
  scatter = 0,
  yScale = 1,
  radiusLane = 0.5,
) {
  const depthT = discoveryDepthT(z);
  const maxSpread = discoveryConvergeRadius(depthT);
  const lane = 0.08 + (radiusLane % 1) * 1.02;
  const laneR = maxSpread * lane;
  const wobble =
    Math.sin(angle * 2.9 + scatter * 11.7 + depthT * 6.3) * maxSpread * 0.18 +
    Math.cos(angle * 5.1 + scatter * 4.3) * maxSpread * 0.1 * depthT;
  const r = Math.max(5, laneR + wobble);
  const ax = angle + scatter * 2.2 + Math.sin(scatter * 14.2) * 0.48;
  const drift = Math.cos(ax * 3.8 + depthT * 4.5) * maxSpread * 0.07 * depthT;
  return {
    x: Math.cos(ax) * r + Math.sin(ax) * drift,
    y: Math.sin(ax) * r * yScale + Math.cos(ax) * drift,
    depthT,
  };
}

/** Glyph warp burst from screen center — repeated characters, no streak lines */
function drawDiscoveryGlyphWarp(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  time: number,
  width: number,
  height: number,
  chars: readonly string[],
) {
  const maxR = Math.hypot(width, height) * 0.72;

  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.14);
  glow.addColorStop(0, 'rgba(255, 248, 220, 0.06)');
  glow.addColorStop(0.6, 'rgba(250, 204, 21, 0.015)');
  glow.addColorStop(1, 'rgba(250, 204, 21, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  const warpCount = 54;
  for (let i = 0; i < warpCount; i++) {
    const seed = i * 2.718281828 + (i * i * 0.019) + 0.31;
    const baseAngle = discoveryScatterAngle(seed * 1.37);
    const angle = baseAngle + Math.sin(time * 0.55 + seed * 2.1) * 0.42;
    const radiusLane = 0.1 + ((seed * 19.7) % 1) * 0.98;
    const phase = (time * (0.28 + (seed % 1) * 0.2) + seed * 0.091) % 1;
    const flyT = phase * phase;
    const headR = (4 + (1 - flyT) * maxR * 0.82) * radiusLane;
    const char = chars[i % chars.length] ?? '言';
    const trailSteps = 3;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const lateral = Math.sin(time * 0.8 + seed * 3.3) * headR * 0.11 * (1 - flyT);
    const spawnFade = phase < 0.07 ? phase / 0.07 : 1;
    const vanishFade = phase > 0.84 ? Math.max(0, 1 - (phase - 0.84) / 0.16) : 1;
    const visibility = spawnFade * vanishFade * (1 - phase * 0.12);

    for (let s = 0; s < trailSteps; s++) {
      const t = s / trailSteps;
      const r = headR * (1 + t * 0.28);
      const alpha = visibility * (1 - t * 0.72) * 0.28;
      if (alpha < 0.02) continue;

      const fontSize = 4 + (1 - t) * (1 - flyT) * 15;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = i % 4 === 0 ? '#FFFFFF' : i % 4 === 1 ? '#FACC15' : '#FDE68A';
      ctx.font = `300 ${fontSize}px var(--font-display)`;
      ctx.fillText(char, cx + cosA * r - sinA * lateral, cy + sinA * r + cosA * lateral);
    }
  }
}

function drawDiscoveryGlyphTrail(
  ctx: CanvasRenderingContext2D,
  char: string,
  screenX: number,
  screenY: number,
  warpCx: number,
  warpCy: number,
  size: number,
  alpha: number,
  warpBoost: number,
  color: string,
) {
  const dx = screenX - warpCx;
  const dy = screenY - warpCy;
  const dist = Math.hypot(dx, dy) || 1;
  const nx = dx / dist;
  const ny = dy / dist;
  const trailLen = Math.min(180, (8 + warpBoost * 150) * (0.28 + size * 0.06));
  const steps = Math.max(2, Math.floor(2 + warpBoost * 5));

  for (let s = 0; s < steps; s++) {
    const t = s / steps;
    const fade = (1 - t) * warpBoost;
    const gx = screenX - nx * trailLen * t * 0.88;
    const gy = screenY - ny * trailLen * t * 0.88;
    const gSize = Math.max(3, size * (0.32 + t * 0.68));

    ctx.fillStyle = color;
    ctx.globalAlpha = alpha * fade * 0.72;
    ctx.font = `300 ${gSize}px var(--font-display)`;
    ctx.fillText(char, gx, gy);
  }

  ctx.fillStyle = color;
  ctx.globalAlpha = alpha * (0.4 + warpBoost * 0.55);
  ctx.font = `300 ${Math.max(4, size * (0.5 + warpBoost * 0.5))}px var(--font-display)`;
  ctx.fillText(char, screenX, screenY);
}

function createDiscoveryBuildings() {
  const buildings = [];
  const count = 22;
  for (let i = 0; i < count; i++) {
    const angle = discoveryScatterAngle(i * 1.91 + 0.33);
    const z = DISCOVERY_DEPTH_MIN + ((i * 0.482) % 1) * DISCOVERY_DEPTH_SPAN;
    const scatter = (i * 53) % 100 / 100;
    const radiusLane = ((i * 41 + 11) % 100) / 100;
    const { x, y } = placeDiscoveryTunnelXY(angle, z, scatter, 0.82, radiusLane);
    const lane = i % 8;
    buildings.push({
      x,
      y,
      z,
      angle,
      scatter,
      w: 80 + (lane % 3) * 38 + (i % 5) * 12,
      h: 280 + (lane % 4) * 90 + (i % 7) * 28,
      d: 100 + (lane % 3) * 45,
      labels: ['標識', '地図', 'メニュー', '方向', 'CAFE', 'MUSEUM', 'STATION', 'EXIT'],
    });
  }
  return buildings;
}

function initDiscoveryWarpParticles(particles: Particle3D[]) {
  particles.forEach((p, idx) => {
    const angle = discoveryScatterAngle(idx * 1.07 + 0.19);
    const scatter = ((idx * 73) % 100) / 100;
    const radiusLane = ((idx * 41 + 7) % 100) / 100;
    const z =
      DISCOVERY_DEPTH_MIN +
      (((idx * 0.6180339887) % 1) * 0.9 + (idx % 17) * 0.005) * DISCOVERY_DEPTH_SPAN;
    const { x, y, depthT } = placeDiscoveryTunnelXY(angle, z, scatter, 0.88, radiusLane);

    p.x = x;
    p.y = y;
    p.z = z;
    p.tx = x;
    p.ty = y;
    p.tz = z;
    p.phase = angle;
    p.noiseX = scatter * 97;
    p.noiseY = ((idx * 41 + 7) % 100);
    p.word = undefined;
    p.char = MULTILINGUAL_CHARS[idx % MULTILINGUAL_CHARS.length] ?? '言';
    p.tAlpha = (0.14 + depthT * 0.36) * discoveryGlyphVisibility(depthT);
  });
}

// Final scene — red, blue, yellow, green, purple, sky (水色)
const FUTURE_PARTICLE_COLORS = [
  '#EF4444',
  '#3B82F6',
  '#FACC15',
  '#22C55E',
  '#A855F7',
  '#38BDF8',
];

export const BackgroundCanvas: React.FC<BackgroundCanvasProps> = ({
  currentScene,
  audioActive,
  interactiveMode,
  particleCount = 500
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const particlesRef = useRef<Particle3D[]>([]);
  const animationFrameId = useRef<number | null>(null);
  
  // Interaction states for parallax and rotations
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const sceneTimeRef = useRef<number>(0);
  const rotationRef = useRef({ x: 0, y: 0, z: 0 });
  const prevSceneRef = useRef<SceneType>(currentScene);
  const oceanCreaturesRef = useRef<OceanCreature[]>([]);
  const nextOceanSpawnRef = useRef<number>(0);

  // Floating city buildings matrix for Scene 06 (Discovery)
  const cityBuildings = useRef<
    Array<{
      x: number;
      y: number;
      z: number;
      angle: number;
      scatter: number;
      w: number;
      h: number;
      d: number;
      labels: string[];
    }>
  >([]);

  useEffect(() => {
    cityBuildings.current = createDiscoveryBuildings();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseRef.current.targetX = (e.clientX / innerWidth - 0.5) * 2;
      mouseRef.current.targetY = (e.clientY / innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Initialize particles list
  const initializeParticles = (count: number) => {
    const particles: Particle3D[] = [];
    
    for (let i = 0; i < count; i++) {
      const isWord = Math.random() > 0.85;
      const word = isWord ? WORLD_WORDS[Math.floor(Math.random() * WORLD_WORDS.length)] : undefined;
      const char = MULTILINGUAL_CHARS[Math.floor(Math.random() * MULTILINGUAL_CHARS.length)];
      
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 1500;
      const z = Math.random() * 2000 - 1000;

      // Color scheme selection
      // Whites, Accent blues, Cyans, Violets
      const colorVal = Math.random();
      let color = '#FFFFFF';
      if (colorVal > 0.8) color = '#3B82F6'; // Accent Blue
      else if (colorVal > 0.5) color = '#00E5FF'; // Accent Cyan
      else if (colorVal > 0.3) color = '#8B5CF6'; // Highlight Violet

      particles.push({
        x, y, z,
        tx: x, ty: y, tz: z,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        vz: (Math.random() - 0.5) * 2,
        size: isWord ? 11 + Math.random() * 5 : randomGlyphBaseSize(),
        char,
        word,
        alpha: 0,
        tAlpha: 0.15 + Math.random() * 0.75,
        color,
        speed: 0.01 + Math.random() * 0.04,
        phase: Math.random() * Math.PI * 2,
        noiseX: Math.random() * 100,
        noiseY: Math.random() * 100,
        pulseSpeed: 0.005 + Math.random() * 0.015
      });
    }
    
    particlesRef.current = particles;
  };

  // Re-init variables if count changes
  useEffect(() => {
    initializeParticles(particleCount);
  }, [particleCount]);

  // Leaving the final scene / entering ocean: reset particle state for clean 3D layout
  useEffect(() => {
    if (prevSceneRef.current === 'future' && currentScene !== 'future') {
      initializeParticles(particleCount);
      sceneTimeRef.current = 0;
    } else if (currentScene === 'ocean' && prevSceneRef.current !== 'ocean') {
      initializeParticles(particleCount);
      oceanCreaturesRef.current = [];
      nextOceanSpawnRef.current = 0;
      sceneTimeRef.current = 0;
    } else if (currentScene === 'breakthrough' && prevSceneRef.current !== 'breakthrough') {
      initializeParticles(particleCount);
      sceneTimeRef.current = 0;
    } else if (currentScene === 'future' && prevSceneRef.current !== 'future') {
      initializeParticles(particleCount);
      sceneTimeRef.current = 0;
    } else if (currentScene === 'discovery' && prevSceneRef.current !== 'discovery') {
      initializeParticles(particleCount);
      initDiscoveryWarpParticles(particlesRef.current);
      cityBuildings.current = createDiscoveryBuildings();
      sceneTimeRef.current = 0;
    }
    prevSceneRef.current = currentScene;
  }, [currentScene, particleCount]);

  // Main Render and Calculation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Handle Resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        width = canvas.width = entry.contentRect.width;
        height = canvas.height = entry.contentRect.height;
      }
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // 3D Perspective Projection Utility
    const fov = 400; // Camera perspective value
    const cx = width / 2;
    const cy = height / 2;

    const render = () => {
      sceneTimeRef.current += 0.016;
      const time = sceneTimeRef.current;

      // Smooth mouse interpolation for parallax
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      const mouseParallaxX = mouseRef.current.x * (interactiveMode ? 180 : 60);
      const mouseParallaxY = mouseRef.current.y * (interactiveMode ? 180 : 60);
      const sceneParallaxX = mouseParallaxX;
      const sceneParallaxY = mouseParallaxY;

      // 1. CLEAR & FILL BACKGROUND
      if (currentScene === 'future') {
        ctx.fillStyle = '#FAFBFD';
        ctx.fillRect(0, 0, width, height);
      } else if (currentScene === 'ocean') {
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#010810');
        grad.addColorStop(0.35, '#031525');
        grad.addColorStop(0.72, '#052a42');
        grad.addColorStop(1, '#063550');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, width, height);
      }

      // Define global rotation matrices for camera
      let rotX = mouseRef.current.y * 0.15;
      let rotY = mouseRef.current.x * 0.15;
      
      if (currentScene === 'connection') {
        // Continuous rotation for world globe
        rotY += time * 0.15;
        rotX += Math.sin(time * 0.15) * 0.05;
      } else if (currentScene === 'voice') {
        rotY += Math.sin(time * 0.3) * 0.12;
        rotX += Math.cos(time * 0.2) * 0.12;
      } else if (currentScene === 'ocean') {
        rotY += Math.sin(time * 0.06) * 0.06;
        rotX += Math.sin(time * 0.09) * 0.04;
      } else if (currentScene === 'gaming') {
        rotY += time * 0.25;
      } else if (currentScene === 'future') {
        rotY += time * 0.04;
        rotX += Math.sin(time * 0.08) * 0.025;
      }

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      // Enable bloom effect via compositing for high glow intensity
      ctx.globalCompositeOperation =
        currentScene === 'future' || currentScene === 'ocean' ? 'source-over' : 'screen';

      const particles = particlesRef.current;
      const maxCount = particles.length;

      // 2. SCENE PREPARATION / UPDATE TARGET POSITIONS
      particles.forEach((p, idx) => {
        p.phase += p.pulseSpeed;
        const drift = Math.sin(p.phase) * 8;

        switch (currentScene) {
          case 'ocean': {
            // Flat drifting sea — even spread, stay away from camera clip plane
            const layers = 5;
            const layer = idx % layers;
            const slot = Math.floor(idx / layers);
            const slotsTotal = Math.max(1, Math.ceil(maxCount / layers));
            const u = slot / slotsTotal;
            const v = (slot * 0.6180339887 + layer * 0.173) % 1;

            const flow = time * (10 + layer * 2);
            p.tx = (u - 0.5) * 3000 + flow;
            p.tx = ((p.tx + 1500) % 3000) - 1500;
            p.ty = (v - 0.5) * 1600 + Math.sin(time * 0.55 + u * 11 + p.noiseY) * 18;
            p.tz = 40 + layer * 55 + v * 22;

            p.tAlpha = 0.28 + layer * 0.06 + Math.sin(p.phase + u * 6) * 0.1;

            const oceanColors = ['#E0F2FE', '#BAE6FD', '#7DD3FC', '#38BDF8', '#0EA5E9'];
            p.color = oceanColors[layer] ?? '#38BDF8';

            p.x = p.tx;
            p.y = p.ty;
            p.z = p.tz;
            break;
          }

          case 'barrier': {
            // Morph into a colossal central flat wall with vibrating strings grid
            const cols = 28;
            const col = idx % cols;
            const row = Math.floor(idx / cols);
            const wallWidth = Math.min(width - 80, 950);
            const wallHeight = Math.min(height - 80, 500);

            // Matrix structure column coordinates
            p.tx = (col - cols / 2) * (wallWidth / cols) + Math.sin(time * 1.5 + idx) * 6;
            p.ty = (row - (maxCount / cols) / 2) * (wallHeight / (maxCount / cols)) + Math.cos(time * 2 + idx) * 6;
            p.tz = -100 + Math.sin(time * 3 + idx) * 20; // Sizzling voltage vibration
            
            // Wall colors - high energy green-cyan matrix glow
            p.tAlpha = 0.5 + Math.sin(p.phase + idx * 0.1) * 0.45;
            break;
          }

          case 'breakthrough': {
            const upperHalf = idx % 2 === 0;
            const slot = Math.floor(idx / 2);
            const slotsPerBand = Math.max(1, Math.ceil(maxCount / 2));
            const bandSlot = (slot % slotsPerBand) / slotsPerBand;
            const cycle = 3200;
            const offset = (slot * 211 + p.noiseX * 12) % cycle;
            const flowSpeed = upperHalf ? 172 : 225;
            const flowT = ((time * flowSpeed + offset) % cycle) / cycle;
            const flow = easeInOutQuad(flowT) * cycle;

            if (upperHalf) {
              p.tx = flow - cycle * 0.55;
              p.ty = -270 + bandSlot * 210 + Math.sin(time * 0.85 + p.phase) * 12;
            } else {
              p.tx = cycle * 0.55 - flow;
              p.ty = 70 + bandSlot * 210 + Math.cos(time * 0.78 + p.phase) * 12;
            }

            p.tz = (idx % 12) * 82 - 410 + Math.sin(time * 0.6 + p.phase) * 20;
            p.tAlpha = 0.58 + Math.sin(p.phase + idx * 0.06) * 0.32;
            break;
          }

          case 'work': {
            // Neat floating grid structures modeling document blocks
            const blockIdx = idx % 4; // Four major document zones
            const itemsPerBlock = maxCount / 4;
            const inBlockIdx = idx % itemsPerBlock;

            const blockX = ((blockIdx % 2) - 0.5) * 550;
            const blockY = (Math.floor(blockIdx / 2) - 0.5) * 350;

            const gridCols = 10;
            const c = inBlockIdx % gridCols;
            const r = Math.floor(inBlockIdx / gridCols);

            p.tx = blockX + (c - gridCols / 2) * 22;
            p.ty = blockY + (r - (itemsPerBlock / gridCols) / 2) * 18 + drift * 0.3;
            p.tz = -200 + blockIdx * 100;
            p.tAlpha = 0.55 + Math.sin(time + idx) * 0.25;
            break;
          }

          case 'gaming': {
            // Fast-moving orbits swirling on a double energetic cone structure
            const theta = (idx * 0.08) + time * 1.5;
            const radius = 180 + Math.sin(idx * 0.1) * 90 + drift;
            
            p.tx = radius * Math.cos(theta);
            p.ty = radius * Math.sin(theta);
            p.tz = (idx % 12) * 120 - 650;
            p.tAlpha = 0.75;
            break;
          }

          case 'discovery': {
            p.z -= DISCOVERY_PARTICLE_SPEED;
            p.z = wrapDiscoveryZ(p.z);
            p.tz = p.z;

            const scatter = (p.noiseX % 97) / 97;
            const radiusLane = (p.noiseY % 100) / 100;
            const { x, y, depthT } = placeDiscoveryTunnelXY(p.phase, p.z, scatter, 0.88, radiusLane);
            p.tx = x;
            p.ty = y;
            p.tAlpha = (0.14 + depthT * 0.36) * discoveryGlyphVisibility(depthT);
            break;
          }

          case 'voice': {
            // Deep high-density pulsating sound wave sphere
            const lat = Math.acos(2 * (idx / maxCount) - 1);
            const lon = Math.sqrt(maxCount * Math.PI) * lat;
            
            // Wave fluctuation based on oscillator frequencies
            const soundPulse = 180 + (Math.sin(lat * 8 + time * 8.5) * (audioActive ? 42 : 18));
            p.tx = soundPulse * Math.sin(lat) * Math.cos(lon + time * 0.5);
            p.ty = soundPulse * Math.sin(lat) * Math.sin(lon + time * 0.5) + Math.cos(time * 3 + idx) * 5;
            p.tz = soundPulse * Math.cos(lat);
            
            p.tAlpha = 0.8;
            break;
          }

          case 'connection': {
            // Perfect 3D geographic sphere rotation simulating rotating Earth
            const lat = ((idx % 22) - 11) * (Math.PI / 12);
            const lon = ((Math.floor(idx / 22) % 44)) * (Math.PI / 22) + time * 0.15;
            const rSph = 220;

            p.tx = rSph * Math.cos(lat) * Math.sin(lon);
            p.ty = rSph * Math.sin(lat);
            p.tz = rSph * Math.cos(lat) * Math.cos(lon);
            p.tAlpha = Math.max(0.12, (p.tz + rSph) / (rSph * 2)); // Dynamic glow backing (rim illumination)
            break;
          }

          case 'future': {
            const colorIdx = idx % FUTURE_PARTICLE_COLORS.length;
            const ringRadius = 300;
            const ringTilt = 0.58;
            const ringSpin = time * 0.62;
            const angle = (idx / maxCount) * Math.PI * 2 + ringSpin;
            const thickness = ((idx % 5) - 2) * 5;

            p.tx = Math.cos(angle) * (ringRadius + thickness);
            p.ty = Math.sin(angle) * (ringRadius + thickness) * Math.cos(ringTilt);
            p.tz = Math.sin(angle) * (ringRadius + thickness) * Math.sin(ringTilt) - 100;

            p.tAlpha = 0.62 + (colorIdx % 3) * 0.06;
            p.color = FUTURE_PARTICLE_COLORS[colorIdx];
            break;
          }
        }

        if (currentScene !== 'ocean' && currentScene !== 'future') {
          const palette = SCENE_ACCENT[currentScene].particleColors;
          p.color = palette[idx % palette.length];
        }

        // LERP Position for ultimate smooth organic animation paths (object morphing!)
        const lerpSpeed =
          currentScene === 'breakthrough'
            ? 0.35
            : currentScene === 'barrier'
              ? 0.06
              : currentScene === 'future'
                ? 0.14
                : currentScene === 'discovery'
                  ? 0.42
                  : p.speed;
        if (currentScene === 'discovery') {
          p.x = p.tx;
          p.y = p.ty;
        } else if (currentScene === 'breakthrough') {
          p.x += (p.tx - p.x) * 0.5;
          p.y += (p.ty - p.y) * 0.24;
          p.z += (p.tz - p.z) * 0.24;
        } else if (currentScene !== 'ocean') {
          p.x += (p.tx - p.x) * lerpSpeed;
          p.y += (p.ty - p.y) * lerpSpeed;
          p.z += (p.tz - p.z) * lerpSpeed;
        }
        p.alpha += (p.tAlpha - p.alpha) * (currentScene === 'ocean' ? 0.2 : currentScene === 'future' ? 0.12 : 0.08);
      });

      if (currentScene === 'ocean') {
        const dt = 0.016;
        const creatures = oceanCreaturesRef.current;
        const oceanViewport = {
          fov,
          screenHalfWidth: width * 0.5,
          screenHalfHeight: height * 0.5,
        };

        updateOceanCreatures(creatures, time, dt, oceanViewport);

        if (nextOceanSpawnRef.current === 0) {
          nextOceanSpawnRef.current = time + 1.2 + Math.random() * 2.5;
        }

        if (time >= nextOceanSpawnRef.current && creatures.length < 3) {
          const spawn = pickOceanCreatureSpawn();
          creatures.push(
            createOceanCreature(
              spawn.kind,
              MULTILINGUAL_CHARS,
              time,
              oceanViewport,
              { rare: spawn.rare },
            ),
          );
          nextOceanSpawnRef.current = time + 4 + Math.random() * 7;
        }
      } else if (oceanCreaturesRef.current.length > 0) {
        oceanCreaturesRef.current = [];
        nextOceanSpawnRef.current = 0;
      }

      const discoveryRenderFov =
        currentScene === 'discovery' ? fov + Math.sin(time * 0.045) * 140 : fov;

      // Draw 3D Wireframe outline city for Discovery (Scene 06)
      if (currentScene === 'discovery') {
        const warpCx = cx + mouseParallaxX * 0.05;
        const warpCy = cy + mouseParallaxY * 0.05;

        drawDiscoveryGlyphWarp(ctx, warpCx, warpCy, time, width, height, MULTILINGUAL_CHARS);

        cityBuildings.current.forEach((b, bi) => {
          if (bi % 4 !== 0) return;

          b.z -= DISCOVERY_WARP_SPEED;
          b.z = wrapDiscoveryZ(b.z);

          const { x, y } = placeDiscoveryTunnelXY(
            b.angle,
            b.z,
            b.scatter,
            0.82,
            ((bi * 41 + 11) % 100) / 100,
          );
          b.x = x;
          b.y = y;

          const projZ = b.z + discoveryRenderFov;
          if (projZ > 30 && projZ < discoveryRenderFov + DISCOVERY_DEPTH_SPAN * 0.55) {
            const scale = discoveryRenderFov / projZ;
            const screenX = warpCx + b.x * scale;
            const screenY = warpCy + b.y * scale;
            const depthT = discoveryDepthT(b.z);

            if (b.z < 820 && b.z > 80) {
              ctx.font = `300 ${Math.max(8, 10 * scale)}px var(--font-mono)`;
              ctx.fillStyle = `rgba(255, 255, 255, ${0.08 + depthT * 0.12})`;
              ctx.globalAlpha = 0.35 + depthT * 0.25;
              ctx.fillText(b.labels[bi % b.labels.length] ?? 'EXIT', screenX, screenY);
              ctx.globalAlpha = 1;
            }
          }
        });
      }

      // Draw planetary constellation lines for Global Connection (Scene 08)
      if (currentScene === 'connection') {
        const linesToDraw = 45;
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.14)';
        ctx.lineWidth = 0.8;
        
        for (let k = 0; k < linesToDraw; k++) {
          const pA = particles[Math.floor((k * 11) % maxCount)];
          const pB = particles[Math.floor((k * 31 + 45) % maxCount)];
          
          if (pA && pB) {
            // Check if coordinates projects to camera visual zones
            const projZA = pA.z + fov;
            const projZB = pB.z + fov;

            if (projZA > 35 && projZB > 35) {
              const scaleA = fov / projZA;
              const scaleB = fov / projZB;
              
              const screenXA = cx + (pA.x + mouseParallaxX) * scaleA;
              const screenYA = cy + (pA.y + mouseParallaxY) * scaleA;
              const screenXB = cx + (pB.x + mouseParallaxX) * scaleB;
              const screenYB = cy + (pB.y + mouseParallaxY) * scaleB;

              // Compute distance. Only connect dots if they are facing the front-globe quadrant (z > -100)
              if (pA.z > -100 && pB.z > -100) {
                ctx.beginPath();
                ctx.moveTo(screenXA, screenYA);
                ctx.quadraticCurveTo((screenXA + screenXB)/2, (screenYA + screenYB)/2 - 35, screenXB, screenYB); // Glowing arcs
                ctx.stroke();
              }
            }
          }
        }
      }

      // 4. DRAW ELEMENT PARTICLES
      const renderFov = discoveryRenderFov;
      const warpCx = cx + sceneParallaxX * 0.05;
      const warpCy = cy + sceneParallaxY * 0.05;

      particles.forEach((p, idx) => {
        const projZ = p.z + renderFov;
        if (projZ <= 10) return; // behind the camera clip

        if (currentScene === 'discovery' && idx % 2 !== 0) return;

        const scale = Math.min(currentScene === 'ocean' ? 2.2 : Infinity, renderFov / projZ);
        const screenX =
          currentScene === 'discovery'
            ? warpCx + p.x * scale
            : cx + (p.x + sceneParallaxX) * scale;
        const screenY =
          currentScene === 'discovery'
            ? warpCy + p.y * scale
            : cy + (p.y + sceneParallaxY) * scale;

        // Skip items outside the viewpoint box
        if (screenX < -200 || screenX > width + 200 || screenY < -200 || screenY > height + 200) {
          return;
        }

        // Apply optical Depth of Field (DoF): particles far away or extremely close are blurred or smaller.
        const depthBoost =
          currentScene === 'ocean' ? 0.72 + Math.min(1.1, (p.z - 30) / 230) * 0.5 : 1;
        const size = Math.max(1, p.size * scale * 0.95 * depthBoost);
        if (size < 0.8) return;

        // Establish the color
        ctx.fillStyle = p.color;
        
        // Render characters
        ctx.globalAlpha = p.alpha;

        if (currentScene === 'discovery') {
          const depthT = discoveryDepthT(p.z);
          const warpBoost = discoveryGlyphWarpBoost(depthT);
          drawDiscoveryGlyphTrail(
            ctx,
            p.char,
            screenX,
            screenY,
            warpCx,
            warpCy,
            size,
            p.alpha,
            warpBoost,
            p.color,
          );
        } else if (p.word && currentScene !== 'barrier' && currentScene !== 'future' && currentScene !== 'ocean') {
          // Render elegant full words for conceptual visual elements (Work, Connection, etc.)
          ctx.font = `600 ${size * 0.9}px var(--font-sans)`;
          ctx.fillText(p.word, screenX, screenY);
        } else {
          ctx.font = `300 ${size}px var(--font-display)`;
          ctx.fillText(p.char, screenX, screenY);
        }

        // Draw lightning-fast micro glow lines on active scenes behind fast paths
        if (currentScene === 'gaming' && idx % 10 === 0) {
          ctx.beginPath();
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = p.alpha * 0.28;
          ctx.lineWidth = 1.2;
          ctx.moveTo(screenX, screenY);
          // Draw trailing speed line
          ctx.lineTo(screenX - (p.tx - p.x)*0.35, screenY - (p.ty - p.y)*0.35);
          ctx.stroke();
        }
      });

      if (currentScene === 'ocean') {
        drawOceanCreatures(ctx, oceanCreaturesRef.current, time, {
          fov,
          cx,
          cy,
          parallaxX: sceneParallaxX,
          parallaxY: sceneParallaxY,
          width,
          height,
          glyphPool: MULTILINGUAL_CHARS,
        });
      }

      // Restore alpha and frame operations
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';

      animationFrameId.current = requestAnimationFrame(render);
    };

    // Begin looping
    render();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      resizeObserver.disconnect();
    };
  }, [currentScene, audioActive, interactiveMode, particleCount]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full bg-transparent overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full" id="immersive-webgl-canvas" />
    </div>
  );
};
