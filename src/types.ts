/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SceneType =
  | 'ocean'       // SCENE 01: Language Ocean
  | 'barrier'     // SCENE 02: The Barrier
  | 'breakthrough'// SCENE 03: Breakthrough
  | 'work'        // SCENE 04: Work
  | 'gaming'      // SCENE 05: Gaming
  | 'discovery'   // SCENE 06: Discovery
  | 'voice'       // SCENE 07: Voice
  | 'connection'  // SCENE 08: Global Connection
  | 'future';     // SCENE 09: The Future

export interface SceneConfig {
  id: SceneType;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  headline: string;
}

export interface Particle3D {
  x: number;
  y: number;
  z: number;
  tx: number;
  ty: number;
  tz: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  char: string;
  word?: string;
  alpha: number;
  tAlpha: number;
  color: string;
  speed: number;
  phase: number;
  noiseX: number;
  noiseY: number;
  pulseSpeed: number;
}

export interface ChatMessage {
  id: string;
  lang: string;
  original: string;
  translated: string;
  username: string;
  color: string;
  active: boolean;
}

export interface WorkDoc {
  id: string;
  type: 'doc' | 'email' | 'meeting' | 'slide';
  original: string;
  translated: string;
  conf: number;
  sender: string;
  time: string;
}

export interface DiscoverySign {
  id: string;
  label: string;
  translation: string;
  x: number;
  y: number;
  scale: number;
}
