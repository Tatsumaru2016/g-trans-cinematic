/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SceneType } from '../types';

export type AppLocale = 'ja' | 'en' | 'ko' | 'zh';

export interface SceneMessages {
  navTitle: string;
  labLabel: string;
  badge: string;
  title: string;
  titleAccent: string;
  body: string;
  ctaLabel: string;
}

export interface MessageCatalog {
  meta: {
    title: string;
    description: string;
  };
  common: {
    manage: string;
    closeLab: string;
    cinematicLab: string;
    soundOn: string;
    soundOff: string;
    bgmOn: string;
    bgmOff: string;
    sfxOn: string;
    sfxOff: string;
    prev: string;
    next: string;
    goToScene: string;
    scrollHint: string;
    sceneLabel: string;
    latency: string;
    downloadAlert: string;
    language: string;
  };
  logo: {
    sublabel: string;
  };
  loading: {
    title: string;
    status: string;
    progressLabel: string;
  };
  toolbar: {
    sectionLabel: string;
    clickToDemo: string;
    rangeTranslation: string;
    utteranceTranslation: string;
  };
  utterance: {
    panelTitle: string;
    placeholder: string;
    copiedToClipboard: string;
    clickToSend: string;
    sendMessage: string;
    closePanel: string;
  };
  gaming: {
    tacticalSync: string;
    realtimeSpeed: string;
    chatPlaceholder: string;
    liveServer: string;
    online: string;
    playerUsername: string;
  };
  voice: {
    listening: string;
    processing: string;
    doneQuote: string;
    reset: string;
    offline: string;
  };
  discovery: {
    hoverHint: string;
  };
  connection: {
    syncActive: string;
  };
  finalCta: {
    tagline: string;
    title: string;
    description: string;
    downloadLabel: string;
    replayLabel: string;
  };
  lab: {
    title: string;
    liveGpu: string;
    storyChapters: string;
    particleDensity: string;
    interactiveOrbit: string;
    bgm: string;
    bgmHint: string;
    sfx: string;
    sfxHint: string;
    audioEngine: string;
    audioHint: string;
  };
  admin: {
    title: string;
    backToFilm: string;
    save: string;
    backup: string;
    restore: string;
    exportJson: string;
    importJson: string;
    resetDefaults: string;
    sceneEditor: string;
    preview: string;
    saved: string;
    backedUp: string;
    backedUpDisk: string;
    restored: string;
    imported: string;
    resetDone: string;
  };
  scenes: Record<SceneType, SceneMessages>;
}

export const SUPPORTED_LOCALES: { code: AppLocale; label: string }[] = [
  { code: 'ja', label: '日本語' },
  { code: 'en', label: 'English' },
  { code: 'ko', label: '한국어' },
  { code: 'zh', label: '中文' },
];

export const LOCALE_STORAGE_KEY = 'gtrans-cinematic-locale';

export function isAppLocale(value: string): value is AppLocale {
  return value === 'ja' || value === 'en' || value === 'ko' || value === 'zh';
}
