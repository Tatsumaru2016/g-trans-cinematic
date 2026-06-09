/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { defaultCinematicConfig } from '../../config/defaultCinematicConfig';
import type { MessageCatalog } from '../types';
import { finalCtaFromConfig, scenesFromConfig } from '../scenesFromConfig';

export const en: MessageCatalog = {
  meta: {
    title: 'G.trans | Cinematic Experience',
    description: 'G.trans cinematic experience — seamless global communication',
  },
  common: {
    manage: 'Manage',
    closeLab: 'Close Lab',
    cinematicLab: 'Cinematic Lab',
    soundOn: 'SOUND: ON',
    soundOff: 'SOUND: OFF',
    bgmOn: 'BGM: ON',
    bgmOff: 'BGM: OFF',
    sfxOn: 'SFX: ON',
    sfxOff: 'SFX: OFF',
    prev: '← PREV',
    next: 'NEXT →',
    goToScene: 'Go to scene {n}',
    scrollHint: 'Scroll Down or Click Next To Navigate',
    sceneLabel: 'SCENE {n}',
    latency: 'LATENCY: 4ms',
    downloadAlert:
      'Thank you for downloading G.trans Client! The cinematic setup package (72.4MB) is initiating.',
    language: 'Language',
  },
  logo: {
    sublabel: 'Translation tool',
  },
  loading: {
    title: 'G.trans',
    status: 'Preparing cinematic experience…',
    progressLabel: 'Loading',
  },
  toolbar: {
    sectionLabel: 'G.trans Toolbar',
    clickToDemo: 'Click to Demo',
    rangeTranslation: 'Range translation',
    utteranceTranslation: 'Utterance translation',
  },
  utterance: {
    panelTitle: 'Utterance Translation → {language}',
    placeholder: 'Type what you want to say...',
    copiedToClipboard: 'Copied to clipboard',
    clickToSend: 'Click to Send',
    sendMessage: 'Send message',
    closePanel: 'Close utterance panel',
  },
  gaming: {
    tacticalSync: 'Tactical Translation Sync',
    realtimeSpeed: 'REALTIME CLIENT SPEED: 0.003s',
    chatPlaceholder: 'Type a message (English, Japanese, Korean, Spanish...)',
    liveServer: 'Live Server Lobby // Raid Room B',
    online: '98,241 ONLINE',
    playerUsername: 'You_The_Player',
  },
  voice: {
    listening: 'Listening to vocal frequencies...',
    processing: 'Decrypting vocal vectors & translating...',
    doneQuote:
      '"Hello my global friends, let us create beautiful things together without friction."',
    reset: 'Reset Simulation',
    offline: 'Voice Simulator Offline',
  },
  discovery: {
    hoverHint: 'Click on each function.',
  },
  connection: {
    syncActive: 'GLOBAL SYNC ACTIVE',
  },
  finalCta: finalCtaFromConfig(defaultCinematicConfig.finalCta),
  lab: {
    title: 'Cinematic Lab',
    liveGpu: 'LIVE GPU',
    storyChapters: 'Story Chapters',
    particleDensity: 'Particle Density',
    interactiveOrbit: 'Interactive Orbit',
    bgm: 'BGM',
    bgmHint: 'Per-scene ambient bed',
    sfx: 'Sound Effects',
    sfxHint: 'UI, demo, and transition sounds',
    audioEngine: 'Audio Engine',
    audioHint: 'Auto-synthesized sound waves',
  },
  admin: {
    title: 'Cinematic Admin',
    backToFilm: 'Back to Film',
    save: 'Save',
    backup: 'Backup',
    restore: 'Restore',
    exportJson: 'Export JSON',
    importJson: 'Import JSON',
    resetDefaults: 'Reset Defaults',
    sceneEditor: 'Scene Editor',
    preview: 'Preview',
    saved: 'Settings saved',
    backedUp: 'Backup created',
    backedUpDisk: 'Backup saved (downloads + backups/ folder)',
    restored: 'Backup restored',
    imported: 'Config imported',
    resetDone: 'Reset to defaults',
  },
  scenes: scenesFromConfig(defaultCinematicConfig.scenes),
};
