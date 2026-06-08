/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ChatMessage, DiscoverySign, SceneType, WorkDoc } from '../types';
import type { ContentLocale, LocaleBundle } from './localeContent';
import shippedRaw from './shippedCinematicConfig.json';

export type { ContentLocale, LocaleBundle, SceneCopy } from './localeContent';
export { CONTENT_LOCALES } from './localeContent';

export interface SceneContent {
  enabled: boolean;
  number: string;
  navTitle: string;
  labLabel: string;
  badge: string;
  title: string;
  titleAccent?: string;
  body: string;
  ctaLabel?: string;
}

export interface GlobalPing {
  from: string;
  to: string;
  message: string;
  speed: string;
}

export interface FinalCta {
  tagline: string;
  title: string;
  description: string;
  downloadLabel: string;
  replayLabel: string;
}

export interface GamingUtteranceDemo {
  targetLanguage: string;
  sampleInput: string;
  sampleTranslated: string;
}

export interface CinematicDefaults {
  particleCount: number;
  bgmActive: boolean;
  sfxActive: boolean;
  interactiveMode: boolean;
  showDeveloperPanel: boolean;
}

export interface CinematicConfig {
  version: number;
  scenes: Record<SceneType, SceneContent>;
  locales: Record<ContentLocale, LocaleBundle>;
  workDocs: WorkDoc[];
  chatMessages: ChatMessage[];
  discoverySigns: DiscoverySign[];
  globalPings: GlobalPing[];
  finalCta: FinalCta;
  gamingUtterance: GamingUtteranceDemo;
  defaults: CinematicDefaults;
}

export const SCENE_ORDER: SceneType[] = [
  'ocean',
  'barrier',
  'breakthrough',
  'work',
  'gaming',
  'discovery',
  'voice',
  'connection',
  'future',
];

function normalizeDefaults(
  defaults?: Partial<CinematicDefaults> & { audioActive?: boolean },
): CinematicDefaults {
  const { audioActive: _legacy, ...rest } = defaults ?? {};
  return {
    particleCount: 750,
    bgmActive: false,
    sfxActive: true,
    interactiveMode: true,
    showDeveloperPanel: false,
    ...rest,
  };
}

const shipped = shippedRaw as CinematicConfig;

export const defaultCinematicConfig: CinematicConfig = {
  ...shipped,
  version: 2,
  defaults: normalizeDefaults(shipped.defaults),
};
