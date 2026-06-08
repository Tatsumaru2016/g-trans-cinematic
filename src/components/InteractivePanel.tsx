/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Settings, Volume2, VolumeX, Sliders, ChevronRight, X, Music2
} from 'lucide-react';
import { SceneType } from '../types';
import { useCinematicConfig } from '../context/CinematicConfigContext';
import { useLocale } from '../context/LocaleContext';
import { useLocalizedScenes } from '../hooks/useLocalizedScenes';
import { soundEngine } from './AudioEngine';

interface InteractivePanelProps {
  currentScene: SceneType;
  onSceneChange: (scene: SceneType) => void;
  bgmActive: boolean;
  sfxActive: boolean;
  onToggleBgm: () => void;
  onToggleSfx: () => void;
  particleCount: number;
  onParticleCountChange: (count: number) => void;
  interactiveMode: boolean;
  onToggleInteractiveMode: () => void;
  onClose?: () => void;
}

export const InteractivePanel: React.FC<InteractivePanelProps> = ({
  currentScene,
  onSceneChange,
  bgmActive,
  sfxActive,
  onToggleBgm,
  onToggleSfx,
  particleCount,
  onParticleCountChange,
  interactiveMode,
  onToggleInteractiveMode,
  onClose,
}) => {
  const { config, enabledScenes } = useCinematicConfig();
  const { t } = useLocale();
  const { scenes: localizedScenes } = useLocalizedScenes();
  const scenesList = enabledScenes.map((id) => ({
    id,
    label: localizedScenes[id].labLabel,
    num: config.scenes[id].number,
  }));

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 w-full h-full max-h-[inherit] overflow-y-auto pointer-events-auto flex flex-col gap-4 text-left border-white/10 max-w-sm scrollbar-none">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-1 shrink-0">
        <div className="flex items-center space-x-2 min-w-0">
          <Settings className="w-4 h-4 text-cyan-400 rotate-45 animate-spin-slow shrink-0" />
          <span className="font-display text-sm font-bold tracking-tight text-white uppercase truncate">{t('lab.title')}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[9px] font-mono bg-cyan-950/40 text-cyan-400 border border-cyan-800/30 px-1.5 py-0.5 rounded-md">{t('lab.liveGpu')}</span>
          {onClose && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              aria-label={t('common.closeLab')}
              className="p-1 rounded-md border border-zinc-800 text-zinc-500 hover:text-zinc-200 hover:border-zinc-700 xl:hidden"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Chapter shortcuts */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{t('lab.storyChapters')}</span>
        <div className="grid grid-cols-1 gap-1 max-h-[140px] overflow-y-auto pr-1 scrollbar-none">
          {scenesList.map((sc) => {
            const isCurrent = sc.id === currentScene;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  soundEngine.playClick();
                  onSceneChange(sc.id);
                }}
                className={`w-full py-1.5 px-3 rounded-lg text-xs font-sans text-left transition-all duration-200 flex items-center justify-between ${
                  isCurrent 
                  ? 'bg-gradient-to-r from-cyan-950/60 to-violet-950/20 text-white border border-cyan-500/20 font-medium translate-x-1' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className={`font-mono text-[9px] ${isCurrent ? 'text-cyan-400' : 'text-zinc-600'}`}>{sc.num}</span>
                  <span className="truncate">{sc.label}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isCurrent ? 'text-cyan-400 rotate-90' : 'text-zinc-600'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Physics variables sliders */}
      <div className="flex flex-col gap-3 pt-2 border-t border-zinc-800">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center space-x-1">
          <Sliders className="w-3.5 h-3.5 text-zinc-500" />
          <span>Rendering Variables</span>
        </span>

        {/* Adjust Particle Density */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-zinc-400">{t('lab.particleDensity')}</span>
            <span className="text-cyan-400 font-bold">{particleCount} Glyphs</span>
          </div>
          <div className="flex gap-2">
            {[400, 750, 1200].map((count) => (
              <button
                key={count}
                onClick={() => {
                  soundEngine.playClick();
                  onParticleCountChange(count);
                }}
                className={`py-1 px-2.5 rounded-lg text-[10px] font-mono uppercase flex-1 transition-all border ${
                  particleCount === count 
                  ? 'border-cyan-400 bg-cyan-950/20 text-cyan-300 font-bold' 
                  : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {count === 400 ? 'ECO' : count === 750 ? 'STD' : 'PRO'}
              </button>
            ))}
          </div>
        </div>

        {/* Toggle Interactive Parallax */}
        <div className="flex justify-between items-center bg-zinc-900/30 p-2.5 rounded-xl border border-zinc-900">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-zinc-200">{t('lab.interactiveOrbit')}</span>
            <span className="text-[9px] font-mono text-zinc-500">Parallax perspective tracking</span>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleInteractiveMode();
            }}
            className={`w-10 h-6 rounded-full p-1 transition-all flex items-center ${interactiveMode ? 'bg-cyan-500 justify-end' : 'bg-zinc-800 justify-start'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-all`} />
          </button>
        </div>

        {/* BGM */}
        <div className="flex justify-between items-center bg-zinc-900/30 p-2.5 rounded-xl border border-zinc-900">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-zinc-200">{t('lab.bgm')}</span>
            <span className="text-[9px] font-mono text-zinc-500">{t('lab.bgmHint')}</span>
          </div>
          <button
            onClick={() => {
              onToggleBgm();
            }}
            className={`p-2 rounded-xl transition-all border ${bgmActive ? 'bg-violet-950/30 border-violet-500/30 text-violet-400' : 'bg-zinc-850 border-zinc-800 text-zinc-600'}`}
          >
            {bgmActive ? <Music2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* SFX */}
        <div className="flex justify-between items-center bg-zinc-900/30 p-2.5 rounded-xl border border-zinc-900">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-zinc-200">{t('lab.sfx')}</span>
            <span className="text-[9px] font-mono text-zinc-500">{t('lab.sfxHint')}</span>
          </div>
          <button
            onClick={() => {
              if (sfxActive) soundEngine.playClick();
              onToggleSfx();
            }}
            className={`p-2 rounded-xl transition-all border ${sfxActive ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-400' : 'bg-zinc-850 border-zinc-800 text-zinc-600'}`}
          >
            {sfxActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
