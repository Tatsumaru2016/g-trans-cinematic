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
  /** Root frequencies in Hz */
  tones: number[];
  wave: OscillatorType | OscillatorType[];
  /** Optional per-tone detune in cents */
  detunes?: number[];
  filterHz: number;
  filterQ?: number;
  lfoRate: number;
  lfoDepth: number;
  /** Per-scene BGM bus level (0–1) */
  level: number;
  /** Optional brown-noise bed (underwater, room tone, machinery) */
  noise?: number;
  noiseFilterHz?: number;
  /** Slow amplitude pulse on master bed */
  pulseRate?: number;
  pulseDepth?: number;
}

/** Scene 01–09 — each bed matches the story setting */
const SCENE_AMBIENT: Record<SceneType, SceneAmbientProfile> = {
  // Scene 01 — deep ocean pressure, sub-bass drift
  ocean: {
    tones: [36.7, 46.2, 58.3, 73.4, 92.5],
    wave: 'sine',
    filterHz: 340,
    filterQ: 0.5,
    lfoRate: 0.035,
    lfoDepth: 0.2,
    level: 0.5,
    noise: 0.16,
    noiseFilterHz: 260,
  },
  // Scene 02 — forest air, open natural intervals
  barrier: {
    tones: [98, 123.5, 146.8, 196, 246.9, 293.7],
    wave: 'triangle',
    detunes: [0, 4, -3, 6, -5, 2],
    filterHz: 1600,
    lfoRate: 0.055,
    lfoDepth: 0.16,
    level: 0.42,
    noise: 0.04,
    noiseFilterHz: 900,
  },
  // Scene 03 — warm domestic room tone
  breakthrough: {
    tones: [110, 146.8, 174.6, 220, 261.6],
    wave: 'sine',
    filterHz: 2400,
    lfoRate: 0.09,
    lfoDepth: 0.1,
    level: 0.4,
    noise: 0.07,
    noiseFilterHz: 1800,
  },
  // Scene 04 — focused office hum, steady pulse
  work: {
    tones: [130.8, 164.8, 196, 246.9],
    wave: 'triangle',
    filterHz: 1700,
    lfoRate: 0.07,
    lfoDepth: 0.07,
    level: 0.38,
    pulseRate: 0.45,
    pulseDepth: 0.12,
    noise: 0.035,
    noiseFilterHz: 1200,
  },
  // Scene 05 — bright playful game shimmer
  gaming: {
    tones: [164.8, 207.2, 246.9, 311.1, 392, 466.2],
    wave: ['triangle', 'square', 'triangle', 'square', 'triangle', 'triangle'],
    detunes: [0, 7, -5, 12, -8, 4],
    filterHz: 3600,
    lfoRate: 0.24,
    lfoDepth: 0.14,
    level: 0.44,
    pulseRate: 1.1,
    pulseDepth: 0.08,
  },
  // Scene 06 — metallic city machinery
  discovery: {
    tones: [155.6, 207.2, 261.6, 311.1, 369.9],
    wave: 'triangle',
    detunes: [0, 13, -17, 21, -9],
    filterHz: 2800,
    filterQ: 1.1,
    lfoRate: 0.17,
    lfoDepth: 0.1,
    level: 0.4,
    noise: 0.1,
    noiseFilterHz: 4800,
    pulseRate: 0.85,
    pulseDepth: 0.06,
  },
  // Scene 07 — vocal warmth (unchanged role, soft human tone)
  voice: {
    tones: [174.6, 220, 261.6, 329.6],
    wave: 'sine',
    filterHz: 2100,
    lfoRate: 0.11,
    lfoDepth: 0.12,
    level: 0.36,
  },
  // Scene 08 — global link, airy distance
  connection: {
    tones: [65.4, 82.4, 98, 130.8, 164.8],
    wave: 'sine',
    filterHz: 1500,
    lfoRate: 0.045,
    lfoDepth: 0.14,
    level: 0.38,
  },
  // Scene 09 — calm luminous resolution
  future: {
    tones: [196, 246.9, 293.7, 349.2, 440],
    wave: 'sine',
    filterHz: 4200,
    filterQ: 0.4,
    lfoRate: 0.022,
    lfoDepth: 0.05,
    level: 0.45,
  },
};

interface AmbientVoice {
  osc: OscillatorNode;
  gain: GainNode;
  lfo: OscillatorNode;
  lfoGain: GainNode;
}

interface AmbientNoiseBed {
  source: AudioBufferSourceNode;
  gain: GainNode;
  filter: BiquadFilterNode;
}

interface AmbientPulse {
  osc: OscillatorNode;
  gain: GainNode;
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
  private ambientNoise: AmbientNoiseBed | null = null;
  private ambientPulse: AmbientPulse | null = null;
  private brownNoiseBuffer: AudioBuffer | null = null;
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
      this.demoGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
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

    if (this.ambientNoise) {
      try {
        this.ambientNoise.source.stop();
      } catch {
        // already stopped
      }
      this.ambientNoise.source.disconnect();
      this.ambientNoise.gain.disconnect();
      this.ambientNoise.filter.disconnect();
      this.ambientNoise = null;
    }

    if (this.ambientPulse) {
      try {
        this.ambientPulse.osc.stop();
      } catch {
        // already stopped
      }
      this.ambientPulse.osc.disconnect();
      this.ambientPulse.gain.disconnect();
      this.ambientPulse = null;
    }
  }

  private getBrownNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    if (this.brownNoiseBuffer) return this.brownNoiseBuffer;

    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.018 * white) / 1.018;
      data[i] = last * 4.2;
    }

    this.brownNoiseBuffer = buffer;
    return buffer;
  }

  private startNoiseBed(profile: SceneAmbientProfile, now: number) {
    if (!this.ctx || !this.bgmGain || !profile.noise) return;
    const buffer = this.getBrownNoiseBuffer();
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    source.buffer = buffer;
    source.loop = true;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(profile.noiseFilterHz ?? profile.filterHz, now);
    filter.Q.setValueAtTime(0.6, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(profile.noise, 0.0001), now + 2.4);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);
    source.start(now);

    this.ambientNoise = { source, gain, filter };
  }

  private startPulseBed(profile: SceneAmbientProfile, now: number) {
    if (!this.ctx || !this.ambientMaster || !profile.pulseRate || !profile.pulseDepth) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(profile.pulseRate, now);
    gain.gain.setValueAtTime(profile.pulseDepth * 0.18, now);
    osc.connect(gain);
    gain.connect(this.ambientMaster.gain);
    osc.start(now);

    this.ambientPulse = { osc, gain };
  }

  private waveForProfile(profile: SceneAmbientProfile, index: number): OscillatorType {
    if (Array.isArray(profile.wave)) {
      return profile.wave[index] ?? profile.wave[0] ?? 'sine';
    }
    return profile.wave;
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
    const toneGain = 0.21 / profile.tones.length;

    this.bgmFilter.frequency.cancelScheduledValues(now);
    this.bgmFilter.frequency.setValueAtTime(profile.filterHz, now);
    if (profile.filterQ !== undefined) {
      this.bgmFilter.Q.setValueAtTime(profile.filterQ, now);
    }

    for (let i = 0; i < profile.tones.length; i++) {
      const freq = profile.tones[i]!;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();

      osc.type = this.waveForProfile(profile, i);
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(profile.detunes?.[i] ?? (i - 1) * 3.5, now);

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

    this.startNoiseBed(profile, now);
    this.startPulseBed(profile, now);

    const targetLevel = profile.level * 0.72;
    this.bgmGain.gain.cancelScheduledValues(now);
    this.bgmGain.gain.setValueAtTime(0.0001, now);
    this.bgmGain.gain.exponentialRampToValueAtTime(Math.max(targetLevel, 0.0001), now + 2.2);

    if (this.ambientMaster) {
      this.ambientMaster.gain.cancelScheduledValues(now);
      this.ambientMaster.gain.setValueAtTime(this.ambientMaster.gain.value, now);
      this.ambientMaster.gain.linearRampToValueAtTime(0.55, now + 1.8);
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
      const oldNoise = this.ambientNoise;
      const oldPulse = this.ambientPulse;
      this.ambientVoices = [];
      this.ambientNoise = null;
      this.ambientPulse = null;
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
        if (oldNoise) {
          try {
            oldNoise.source.stop();
          } catch {
            // ignore
          }
        }
        if (oldPulse) {
          try {
            oldPulse.osc.stop();
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
    this.masterGain.gain.linearRampToValueAtTime(enabled ? 0.22 : 0, now + (enabled ? 1.2 : 0.8));
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
    this.playTone(this.demoGain, { freq: 1400, freqEnd: 920, duration: 0.14, gain: 0.14 });
  }

  /** Short keystroke tick for demo typing (one shot per character) */
  public playDemoType(variant = 0) {
    if (!this.sfxEnabled) return;
    void this.runDemoType(variant);
  }

  private async runDemoType(variant = 0) {
    if (!(await this.ensureDemoAudio()) || !this.demoGain) return;
    const detune = (variant % 5) * 24;
    this.playTone(this.demoGain, {
      freq: 880 + detune,
      freqEnd: 680 + detune * 0.4,
      duration: 0.042,
      gain: 0.05,
      type: 'triangle',
    });
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
      select: { freq: 880, freqEnd: 1240, duration: 0.2, gain: 0.11, type: 'triangle' },
      translate: { freq: 740, freqEnd: 1180, duration: 0.28, gain: 0.12 },
      copy: { freq: 1040, freqEnd: 1480, duration: 0.22, gain: 0.115, type: 'triangle' },
      move: { freq: 1320, freqEnd: 880, duration: 0.32, gain: 0.105 },
      paste: { freq: 940, freqEnd: 1180, duration: 0.18, gain: 0.1 },
      panel: { freq: 660, freqEnd: 1020, duration: 0.24, gain: 0.105, type: 'triangle' },
      message: { freq: 800, freqEnd: 1320, duration: 0.32, gain: 0.115 },
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

        sweepGain.gain.linearRampToValueAtTime(0.12, now + 0.1);
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

        sweepGain.gain.linearRampToValueAtTime(0.05, now + 0.5);
        sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);

        this.filter.frequency.linearRampToValueAtTime(6000, now + 3);

        sweepOsc.start();
        sweepOsc.stop(now + 4);
      } else {
        sweepOsc.type = 'triangle';
        sweepOsc.frequency.setValueAtTime(392, now);
        sweepOsc.frequency.exponentialRampToValueAtTime(523.25, now + 1.2);

        sweepGain.gain.linearRampToValueAtTime(0.038, now + 0.2);
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
    this.playTone(this.masterGain, { freq: 1400, freqEnd: 900, duration: 0.12, gain: 0.05 });
  }
}

export const soundEngine = new CinematicAudioEngine();
