/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SceneType } from '../types';

export type DemoStepSound =
  | 'select'
  | 'translate'
  | 'copy'
  | 'move'
  | 'paste'
  | 'panel'
  | 'message';

interface SceneAmbientProfile {
  /** Root frequencies in Hz — gentle healing pads */
  tones: number[];
  wave: OscillatorType;
  filterHz: number;
  lfoRate: number;
  lfoDepth: number;
  /** Per-scene BGM bus level (0–1) */
  level: number;
}

const SCENE_AMBIENT: Record<SceneType, SceneAmbientProfile> = {
  ocean: {
    tones: [55, 82.5, 110, 165],
    wave: 'sine',
    filterHz: 720,
    lfoRate: 0.07,
    lfoDepth: 0.12,
    level: 0.42,
  },
  barrier: {
    tones: [65.41, 77.78, 98, 130.81],
    wave: 'triangle',
    filterHz: 980,
    lfoRate: 0.09,
    lfoDepth: 0.1,
    level: 0.36,
  },
  breakthrough: {
    tones: [98, 123.47, 146.83, 196],
    wave: 'sine',
    filterHz: 1800,
    lfoRate: 0.11,
    lfoDepth: 0.14,
    level: 0.4,
  },
  work: {
    tones: [130.81, 164.81, 196, 246.94],
    wave: 'triangle',
    filterHz: 1400,
    lfoRate: 0.05,
    lfoDepth: 0.08,
    level: 0.34,
  },
  gaming: {
    tones: [110, 138.59, 164.81, 220],
    wave: 'sine',
    filterHz: 1600,
    lfoRate: 0.18,
    lfoDepth: 0.09,
    level: 0.33,
  },
  discovery: {
    tones: [220, 277.18, 329.63, 440],
    wave: 'sine',
    filterHz: 2200,
    lfoRate: 0.06,
    lfoDepth: 0.11,
    level: 0.35,
  },
  voice: {
    tones: [130.81, 196, 261.63, 329.63],
    wave: 'triangle',
    filterHz: 1500,
    lfoRate: 0.14,
    lfoDepth: 0.13,
    level: 0.37,
  },
  connection: {
    tones: [55, 69.3, 82.41, 110, 138.59],
    wave: 'sine',
    filterHz: 1200,
    lfoRate: 0.04,
    lfoDepth: 0.1,
    level: 0.38,
  },
  future: {
    tones: [261.63, 329.63, 392, 523.25],
    wave: 'sine',
    filterHz: 2800,
    lfoRate: 0.03,
    lfoDepth: 0.09,
    level: 0.36,
  },
};

interface AmbientVoice {
  osc: OscillatorNode;
  gain: GainNode;
  lfo: OscillatorNode;
  lfoGain: GainNode;
}

class CinematicAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private demoGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private bgmGain: GainNode | null = null;
  private bgmFilter: BiquadFilterNode | null = null;
  private ambientMaster: GainNode | null = null;
  private ambientVoices: AmbientVoice[] = [];
  private currentAmbientScene: SceneType | null = null;
  private ambientSwapTimer: number | null = null;
  private bgmEnabled = false;
  private sfxEnabled = false;
  private demoAudioReady: Promise<boolean> | null = null;

  constructor() {
    // Lazy initialize to bypass browser autoplay policies
  }

  private initContext() {
    if (this.ctx) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.demoGain = this.ctx.createGain();
      this.demoGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      this.demoGain.connect(this.ctx.destination);

      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(2400, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(1.2, this.ctx.currentTime);
      this.filter.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.bgmFilter = this.ctx.createBiquadFilter();
      this.bgmFilter.type = 'lowpass';
      this.bgmFilter.frequency.setValueAtTime(2400, this.ctx.currentTime);
      this.bgmFilter.Q.setValueAtTime(0.7, this.ctx.currentTime);
      this.ambientMaster = this.ctx.createGain();
      this.ambientMaster.gain.setValueAtTime(0, this.ctx.currentTime);
      this.bgmGain.connect(this.bgmFilter);
      this.bgmFilter.connect(this.ambientMaster);
      this.ambientMaster.connect(this.ctx.destination);
    } catch (e) {
      console.warn('Web Audio API not supported in this browser context:', e);
    }
  }

  /** Resume demo audio context — must complete before tones are scheduled */
  public async primeDemoAudio(): Promise<boolean> {
    if (this.demoAudioReady) {
      return this.demoAudioReady;
    }

    this.demoAudioReady = (async () => {
      this.initContext();
      if (!this.ctx || !this.demoGain) return false;

      if (this.ctx.state === 'suspended') {
        try {
          await this.ctx.resume();
        } catch {
          return false;
        }
      }

      return this.ctx.state === 'running';
    })();

    const ready = await this.demoAudioReady;
    if (!ready) {
      this.demoAudioReady = null;
    }
    return ready;
  }

  private async ensureDemoAudio(): Promise<boolean> {
    if (this.ctx?.state === 'running' && this.demoGain) {
      return true;
    }
    this.demoAudioReady = null;
    return this.primeDemoAudio();
  }

  /** Resume audio context for ambient BGM — call after user gesture */
  public async primeAmbientAudio(): Promise<boolean> {
    return this.ensureAmbientAudio();
  }

  private async ensureAmbientAudio(): Promise<boolean> {
    this.initContext();
    if (!this.ctx || !this.bgmGain) return false;
    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch {
        return false;
      }
    }
    return this.ctx.state === 'running';
  }

  private playTone(
    output: GainNode,
    options: {
      freq: number;
      freqEnd?: number;
      duration?: number;
      gain?: number;
      type?: OscillatorType;
    },
  ) {
    if (!this.ctx) return;
    const { freq, freqEnd = freq, duration = 0.14, gain = 0.02, type = 'sine' } = options;
    const now = this.ctx.currentTime + 0.005;

    try {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (freqEnd !== freq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 40), now + duration);
      }

      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0001), now + 0.012);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gainNode);
      gainNode.connect(output);

      osc.start(now);
      osc.stop(now + duration + 0.04);
    } catch {
      // Safely ignore web audio failure
    }
  }

  private disposeAmbientVoices() {
    for (const voice of this.ambientVoices) {
      try {
        voice.osc.stop();
        voice.lfo.stop();
      } catch {
        // already stopped
      }
      voice.osc.disconnect();
      voice.gain.disconnect();
      voice.lfo.disconnect();
      voice.lfoGain.disconnect();
    }
    this.ambientVoices = [];
  }

  private clearAmbientSwapTimer() {
    if (this.ambientSwapTimer !== null) {
      window.clearTimeout(this.ambientSwapTimer);
      this.ambientSwapTimer = null;
    }
  }

  private stopSceneAmbient(fadeSec = 0.8) {
    this.clearAmbientSwapTimer();
    if (!this.ctx || !this.bgmGain) {
      this.disposeAmbientVoices();
      this.currentAmbientScene = null;
      return;
    }

    const now = this.ctx.currentTime;
    this.bgmGain.gain.cancelScheduledValues(now);
    this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, now);
    this.bgmGain.gain.linearRampToValueAtTime(0, now + fadeSec);

    if (this.ambientMaster) {
      this.ambientMaster.gain.cancelScheduledValues(now);
      this.ambientMaster.gain.setValueAtTime(this.ambientMaster.gain.value, now);
      this.ambientMaster.gain.linearRampToValueAtTime(0, now + fadeSec);
    }

    this.ambientSwapTimer = window.setTimeout(() => {
      this.disposeAmbientVoices();
      this.currentAmbientScene = null;
      this.ambientSwapTimer = null;
    }, fadeSec * 1000 + 60);
  }

  private startSceneAmbientVoices(scene: SceneType) {
    if (!this.ctx || !this.bgmGain || !this.bgmFilter) return;

    const profile = SCENE_AMBIENT[scene];
    const now = this.ctx.currentTime;
    const toneGain = 0.11 / profile.tones.length;

    this.bgmFilter.frequency.cancelScheduledValues(now);
    this.bgmFilter.frequency.setValueAtTime(profile.filterHz, now);

    for (let i = 0; i < profile.tones.length; i++) {
      const freq = profile.tones[i];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();

      osc.type = profile.wave;
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime((i - 1) * 3.5, now);

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(profile.lfoRate * (1 + i * 0.08), now);
      lfoGain.gain.setValueAtTime(toneGain * profile.lfoDepth, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(Math.max(toneGain, 0.0001), now + 1.8);

      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      osc.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(now);
      lfo.start(now);

      this.ambientVoices.push({ osc, gain, lfo, lfoGain });
    }

    const targetLevel = profile.level * 0.38;
    this.bgmGain.gain.cancelScheduledValues(now);
    this.bgmGain.gain.setValueAtTime(0.0001, now);
    this.bgmGain.gain.exponentialRampToValueAtTime(Math.max(targetLevel, 0.0001), now + 2.2);

    if (this.ambientMaster) {
      this.ambientMaster.gain.cancelScheduledValues(now);
      this.ambientMaster.gain.setValueAtTime(this.ambientMaster.gain.value, now);
      this.ambientMaster.gain.linearRampToValueAtTime(0.28, now + 1.8);
    }

    this.currentAmbientScene = scene;
  }

  /** Per-scene healing ambient bed — crossfades on scene change */
  public setSceneAmbient(scene: SceneType) {
    if (!this.bgmEnabled) return;
    void this.runSetSceneAmbient(scene);
  }

  private async runSetSceneAmbient(scene: SceneType) {
    if (!(await this.ensureAmbientAudio())) return;
    if (this.currentAmbientScene === scene && this.ambientVoices.length > 0) return;

    this.clearAmbientSwapTimer();

    if (this.ambientVoices.length > 0) {
      const fadeOut = 0.75;
      if (this.ctx && this.bgmGain) {
        const now = this.ctx.currentTime;
        this.bgmGain.gain.cancelScheduledValues(now);
        this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, now);
        this.bgmGain.gain.linearRampToValueAtTime(0, now + fadeOut);
      }

      const oldVoices = this.ambientVoices;
      this.ambientVoices = [];
      this.currentAmbientScene = null;

      this.ambientSwapTimer = window.setTimeout(() => {
        for (const voice of oldVoices) {
          try {
            voice.osc.stop();
            voice.lfo.stop();
          } catch {
            // ignore
          }
        }
        this.startSceneAmbientVoices(scene);
        this.ambientSwapTimer = null;
      }, fadeOut * 1000 + 40);
      return;
    }

    this.startSceneAmbientVoices(scene);
  }

  private applySfxMasterGain(enabled: boolean) {
    if (!this.masterGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(enabled ? 0.08 : 0, now + (enabled ? 1.2 : 0.8));
  }

  public getBgmActiveState(): boolean {
    return this.bgmEnabled;
  }

  public getSfxActiveState(): boolean {
    return this.sfxEnabled;
  }

  public setBgmEnabled(enabled: boolean, scene?: SceneType): boolean {
    this.bgmEnabled = enabled;
    if (enabled) {
      this.initContext();
      if (this.ctx?.state === 'suspended') {
        void this.ctx.resume();
      }
      if (scene) {
        void this.runSetSceneAmbient(scene);
      }
    } else {
      this.stopSceneAmbient(0.9);
    }
    return this.bgmEnabled;
  }

  public setSfxEnabled(enabled: boolean): boolean {
    this.sfxEnabled = enabled;
    this.initContext();
    if (enabled && this.ctx?.state === 'suspended') {
      void this.ctx.resume();
    }
    this.applySfxMasterGain(enabled);
    return this.sfxEnabled;
  }

  public toggleBgm(scene?: SceneType): boolean {
    return this.setBgmEnabled(!this.bgmEnabled, scene);
  }

  public toggleSfx(): boolean {
    return this.setSfxEnabled(!this.sfxEnabled);
  }

  /** @deprecated Use toggleBgm / toggleSfx */
  public toggle(forceState?: boolean): boolean {
    const next = forceState !== undefined ? forceState : !(this.bgmEnabled && this.sfxEnabled);
    this.setBgmEnabled(next, this.currentAmbientScene ?? undefined);
    this.setSfxEnabled(next);
    return next;
  }

  /** @deprecated Use getBgmActiveState / getSfxActiveState */
  public getActiveState(): boolean {
    return this.bgmEnabled || this.sfxEnabled;
  }

  /** Demo UI clicks — range / utterance / send */
  public playDemoClick() {
    void this.runDemoClick();
  }

  private async runDemoClick() {
    if (!this.sfxEnabled) return;
    if (!(await this.ensureDemoAudio()) || !this.demoGain) return;
    this.playTone(this.demoGain, { freq: 1400, freqEnd: 920, duration: 0.14, gain: 0.07 });
  }

  /** Demo animation milestones */
  public playDemoStep(step: DemoStepSound) {
    void this.runDemoStep(step);
  }

  private async runDemoStep(step: DemoStepSound) {
    if (!this.sfxEnabled) return;
    if (!(await this.ensureDemoAudio()) || !this.demoGain) return;

    const tones: Record<
      DemoStepSound,
      { freq: number; freqEnd: number; duration: number; gain: number; type?: OscillatorType }
    > = {
      select: { freq: 880, freqEnd: 1240, duration: 0.2, gain: 0.055, type: 'triangle' },
      translate: { freq: 740, freqEnd: 1180, duration: 0.28, gain: 0.06 },
      copy: { freq: 1040, freqEnd: 1480, duration: 0.22, gain: 0.058, type: 'triangle' },
      move: { freq: 1320, freqEnd: 880, duration: 0.32, gain: 0.052 },
      paste: { freq: 940, freqEnd: 1180, duration: 0.18, gain: 0.05 },
      panel: { freq: 660, freqEnd: 1020, duration: 0.24, gain: 0.052, type: 'triangle' },
      message: { freq: 800, freqEnd: 1320, duration: 0.32, gain: 0.058 },
    };

    this.playTone(this.demoGain, tones[step]);
  }

  // Soft accent when moving between story segments
  public transitionSweep(scene: SceneType) {
    if (!this.ctx || !this.sfxEnabled || !this.filter) return;

    const now = this.ctx.currentTime;

    try {
      const sweepOsc = this.ctx.createOscillator();
      const sweepGain = this.ctx.createGain();

      sweepGain.gain.setValueAtTime(0, now);
      sweepGain.connect(this.filter);

      sweepOsc.connect(sweepGain);

      if (scene === 'breakthrough') {
        sweepOsc.type = 'sine';
        sweepOsc.frequency.setValueAtTime(440, now);
        sweepOsc.frequency.exponentialRampToValueAtTime(880, now + 1.5);

        sweepGain.gain.linearRampToValueAtTime(0.06, now + 0.1);
        sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

        this.filter.frequency.setValueAtTime(1200, now);
        this.filter.frequency.exponentialRampToValueAtTime(3600, now + 0.4);
        this.filter.frequency.exponentialRampToValueAtTime(1800, now + 2.8);

        sweepOsc.start();
        sweepOsc.stop(now + 3);
      } else if (scene === 'future') {
        sweepOsc.type = 'sine';
        sweepOsc.frequency.setValueAtTime(659.25, now);
        sweepOsc.frequency.exponentialRampToValueAtTime(1046.5, now + 2);

        sweepGain.gain.linearRampToValueAtTime(0.025, now + 0.5);
        sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);

        this.filter.frequency.linearRampToValueAtTime(6000, now + 3);

        sweepOsc.start();
        sweepOsc.stop(now + 4);
      } else {
        sweepOsc.type = 'triangle';
        sweepOsc.frequency.setValueAtTime(392, now);
        sweepOsc.frequency.exponentialRampToValueAtTime(523.25, now + 1.2);

        sweepGain.gain.linearRampToValueAtTime(0.018, now + 0.2);
        sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

        this.filter.frequency.linearRampToValueAtTime(1600, now + 0.5);
        this.filter.frequency.linearRampToValueAtTime(1300, now + 1.6);

        sweepOsc.start();
        sweepOsc.stop(now + 1.5);
      }
    } catch {
      // Safely ignore web audio failure
    }
  }

  // Soft high-tech ping sound when clicking general interactives
  public playClick() {
    if (!this.ctx || !this.sfxEnabled || !this.masterGain) return;
    this.playTone(this.masterGain, { freq: 1400, freqEnd: 900, duration: 0.12, gain: 0.02 });
  }
}

export const soundEngine = new CinematicAudioEngine();
