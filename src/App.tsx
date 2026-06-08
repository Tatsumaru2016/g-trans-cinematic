/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Languages, Volume2, Globe, ArrowRight, Check,
  Download, Laptop, Smartphone, Info, Share2, HelpCircle, Activity
} from 'lucide-react';
import { SceneType } from './types';
import { BackgroundCanvas } from './components/BackgroundCanvas';
import { SceneOverlays } from './components/SceneOverlays';
import { InteractivePanel } from './components/InteractivePanel';
import { GTranLogo } from './components/GTranLogo';
import { LanguageSelector } from './components/LanguageSelector';
import { soundEngine } from './components/AudioEngine';
import { useCinematicConfig } from './context/CinematicConfigContext';
import { useLocale } from './context/LocaleContext';
import { useLocalizedScenes } from './hooks/useLocalizedScenes';
import { getSceneAccent } from './config/sceneAccentColors';

export default function App() {
  const { config, enabledScenes } = useCinematicConfig();
  const { t } = useLocale();
  const { scenes: localizedScenes, finalCta } = useLocalizedScenes();
  const scenesArray = enabledScenes;

  const [currentScene, setCurrentScene] = useState<SceneType>('ocean');
  const [bgmActive, setBgmActive] = useState<boolean>(config.defaults.bgmActive);
  const [sfxActive, setSfxActive] = useState<boolean>(config.defaults.sfxActive);
  const [particleCount, setParticleCount] = useState<number>(config.defaults.particleCount);
  const [interactiveMode, setInteractiveMode] = useState<boolean>(config.defaults.interactiveMode);
  const [showDeveloperPanel, setShowDeveloperPanel] = useState<boolean>(config.defaults.showDeveloperPanel);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  const touchStartY = useRef<number | null>(null);
  const isTransitioning = useRef<boolean>(false);

  useEffect(() => {
    if (!scenesArray.includes(currentScene) && scenesArray.length > 0) {
      setCurrentScene(scenesArray[0]);
    }
  }, [scenesArray, currentScene]);

  useEffect(() => {
    soundEngine.setBgmEnabled(config.defaults.bgmActive, currentScene);
    soundEngine.setSfxEnabled(config.defaults.sfxActive);
  }, []);

  useEffect(() => {
    const unlockAudio = () => {
      void soundEngine.primeDemoAudio();
      void soundEngine.primeAmbientAudio();
    };
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    return () => window.removeEventListener('pointerdown', unlockAudio);
  }, []);

  const handleSceneChange = (scene: SceneType) => {
    setCurrentScene(scene);
    if (soundEngine.getSfxActiveState()) {
      soundEngine.transitionSweep(scene);
    }
    if (soundEngine.getBgmActiveState()) {
      soundEngine.setSceneAmbient(scene);
    }
  };

  const handleToggleBgm = () => {
    const on = soundEngine.toggleBgm(currentScene);
    setBgmActive(on);
    if (on) {
      void soundEngine.primeAmbientAudio();
    }
  };

  const handleToggleSfx = () => {
    const on = soundEngine.toggleSfx();
    setSfxActive(on);
    if (on) {
      void soundEngine.primeDemoAudio();
    }
  };

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null || isTransitioning.current) return;
    const touchEndY = e.touches[0].clientY;
    const deltaY = touchStartY.current - touchEndY;

    if (Math.abs(deltaY) > 55) {
      isTransitioning.current = true;
      const currentIdx = scenesArray.indexOf(currentScene);
      
      if (deltaY > 0 && currentIdx < scenesArray.length - 1) {
        // Swipe up -> Next
        handleSceneChange(scenesArray[currentIdx + 1]);
      } else if (deltaY < 0 && currentIdx > 0) {
        // Swipe down -> Prev
        handleSceneChange(scenesArray[currentIdx - 1]);
      }

      setTimeout(() => {
        isTransitioning.current = false;
      }, 1000);
      touchStartY.current = null;
    }
  };

  // Keyboard navigation & scroll wheel integration
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const idx = scenesArray.indexOf(currentScene);
      if ((e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') && idx < scenesArray.length - 1) {
        handleSceneChange(scenesArray[idx + 1]);
      } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowUp') && idx > 0) {
        handleSceneChange(scenesArray[idx - 1]);
      }
    };

    let wheelDebounceTimeout: any = null;
    const handleWheel = (e: WheelEvent) => {
      if (isTransitioning.current) return;
      
      // Filter out micro scrolls
      if (Math.abs(e.deltaY) < 12) return;

      isTransitioning.current = true;
      const idx = scenesArray.indexOf(currentScene);

      if (e.deltaY > 0 && idx < scenesArray.length - 1) {
        handleSceneChange(scenesArray[idx + 1]);
      } else if (e.deltaY < 0 && idx > 0) {
        handleSceneChange(scenesArray[idx - 1]);
      }

      // Cool-down to let state animations finish cleanly
      setTimeout(() => {
        isTransitioning.current = false;
      }, 1200);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [currentScene, scenesArray]);

  useEffect(() => {
    const idx = scenesArray.indexOf(currentScene);
    const progress = scenesArray.length > 1 ? (idx / (scenesArray.length - 1)) * 100 : 0;
    setScrollProgress(progress);
  }, [currentScene, scenesArray]);

  // Audio start trigger sweep helper
  const handleFlashExplosion = () => {
    if (soundEngine.getSfxActiveState()) {
      soundEngine.transitionSweep('breakthrough');
    }
  };

  const sceneAccent = getSceneAccent(currentScene);

  return (
    <div 
      className={`min-h-screen w-screen relative overflow-hidden flex flex-col justify-between transition-colors duration-1000 select-none ${
        currentScene === 'future' ? 'bg-[#FAFBFD] text-zinc-950' : 'bg-[#050505] text-white'
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      {/* Dynamic Ambient Film Grain overlay for organic portfolio texture */}
      <div className="noise-overlay" />

      {/* CORE CANVAS COMPONENT (Fully responsive WebGL simulation) */}
      <BackgroundCanvas 
        currentScene={currentScene} 
        audioActive={bgmActive || sfxActive} 
        interactiveMode={interactiveMode}
        particleCount={particleCount}
      />

      {/* LEFT NAVIGATION / PAGINATION DOTS */}
      <div className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-4 z-40">
        <div className="h-28 w-[1px] bg-zinc-800/80 relative overflow-hidden mb-3">
          <div 
            className="absolute top-0 w-full scene-progress-bar"
            style={{ height: `${scrollProgress}%`, backgroundColor: sceneAccent.hex }}
          />
        </div>
        
        {scenesArray.map((scene, idx) => {
          const isActive = scene === currentScene;
          const dotAccent = getSceneAccent(scene);
          return (
            <div key={scene} className="group relative flex items-center">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  handleSceneChange(scene);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 relative z-10 ${
                  isActive 
                  ? 'scale-[1.5]' 
                  : 'bg-zinc-700 hover:bg-zinc-400'
                }`}
                style={isActive ? { backgroundColor: dotAccent.hex } : undefined}
                aria-label={t('common.goToScene', { n: idx + 1 })}
              />
              
              {/* Floating label on hover */}
              <span className="absolute left-6 font-mono text-[9px] tracking-wider text-nowrap opacity-0 group-hover:opacity-100 transition-all bg-black/70 px-2 py-1 rounded text-zinc-300 pointer-events-none uppercase">
                {idx + 1}. {localizedScenes[scene].navTitle}
              </span>
            </div>
          );
        })}
      </div>

      {/* CORE CINEMATIC TEXT & GLASS OVERLAYS */}
      <SceneOverlays 
        currentScene={currentScene} 
        onSceneChange={handleSceneChange}
        onExplodeTrigger={handleFlashExplosion}
        onVoiceRippleTrigger={handleFlashExplosion}
      />

      {/* Cinematic Lab panel — responsive: overlay on narrow viewports, corner panel on xl+ */}
      <AnimatePresence>
        {showDeveloperPanel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed z-50 pointer-events-none left-3 right-3 bottom-[4.75rem] max-h-[min(65vh,26rem)] overflow-hidden sm:left-auto sm:right-4 sm:bottom-auto sm:top-20 sm:w-[min(calc(100vw-2rem),20rem)] sm:max-h-[calc(100vh-6rem)] xl:absolute xl:right-6 xl:top-24 xl:left-auto xl:bottom-auto xl:w-auto xl:max-h-[calc(100vh-7rem)]"
          >
            <InteractivePanel
              currentScene={currentScene}
              onSceneChange={handleSceneChange}
              bgmActive={bgmActive}
              sfxActive={sfxActive}
              onToggleBgm={handleToggleBgm}
              onToggleSfx={handleToggleSfx}
              particleCount={particleCount}
              onParticleCountChange={setParticleCount}
              interactiveMode={interactiveMode}
              onToggleInteractiveMode={() => setInteractiveMode(!interactiveMode)}
              onClose={() => setShowDeveloperPanel(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom-right controls */}
      <div className="absolute right-3 bottom-3 sm:right-6 sm:bottom-6 z-50 pointer-events-auto flex flex-wrap items-center justify-end gap-2 max-w-[calc(100vw-1.5rem)]">
        <LanguageSelector />
        <a
          href="#/admin"
          className="px-3 py-1.5 rounded-lg border border-zinc-800 text-[10px] font-mono uppercase tracking-wide text-zinc-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
        >
          {t('common.manage')}
        </a>
        <button
          onClick={() => {
            soundEngine.playClick();
            setShowDeveloperPanel(!showDeveloperPanel);
          }}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-[10px] font-mono uppercase tracking-wide transition-all ${
            showDeveloperPanel 
            ? 'bg-cyan-950/40 border-cyan-500/20 text-cyan-400' 
            : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>{showDeveloperPanel ? t('common.closeLab') : t('common.cinematicLab')}</span>
        </button>

        <button
          onClick={handleToggleBgm}
          className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono uppercase transition-all ${
            bgmActive
              ? 'bg-violet-950/40 border-violet-500/20 text-violet-400'
              : 'bg-zinc-905/60 border-zinc-800 text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {bgmActive ? t('common.bgmOn') : t('common.bgmOff')}
        </button>

        <button
          onClick={handleToggleSfx}
          className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono uppercase transition-all ${
            sfxActive
              ? 'bg-cyan-950/40 border-cyan-500/20 text-cyan-400'
              : 'bg-zinc-905/60 border-zinc-800 text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {sfxActive ? t('common.sfxOn') : t('common.sfxOff')}
        </button>
      </div>

      {/* STATIC INLINE FINAL CTA FOOTER OVERLAY (REVEALS GRACEFULLY ON SCENE 9 / FUTURE) */}
      <AnimatePresence>
        {currentScene === 'future' && (
          <motion.div
            id="final-cta-section"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ delay: 0.8, duration: 1.0 }}
            className="absolute bottom-16 left-6 right-6 md:left-24 md:right-24 z-50 flex flex-col md:flex-row justify-between items-center py-6 px-8 rounded-3xl glass-panel-light border-black/10 text-zinc-900 gap-6 pointer-events-auto max-w-7xl mx-auto"
          >
            <div className="text-left flex items-start gap-4">
              <GTranLogo size={52} showLabel={false} className="shrink-0 hidden sm:flex" />
              <div>
              <span className={`font-mono text-[9px] uppercase tracking-[0.25em] block mb-1 ${getSceneAccent('future').textSoft}`}>{finalCta.tagline}</span>
              <h2 className="font-display text-2xl md:text-3xl font-black tracking-tight text-black uppercase flex items-center gap-3">
                <GTranLogo size={36} showLabel={false} className="sm:hidden shrink-0" />
                {finalCta.title}
              </h2>
              <p className="font-sans text-xs text-zinc-500 font-medium leading-relaxed">
                {finalCta.description}
              </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button 
                onClick={() => {
                  soundEngine.playClick();
                  alert(t('common.downloadAlert'));
                }}
                className="w-full sm:w-auto px-6 py-3.5 bg-zinc-950 text-white hover:bg-zinc-800 rounded-xl font-display text-xs font-bold tracking-wider transition-all uppercase flex items-center justify-center space-x-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{finalCta.downloadLabel}</span>
              </button>

              <button 
                onClick={() => {
                  soundEngine.playClick();
                  handleSceneChange(scenesArray[0] ?? 'ocean');
                }}
                className="w-full sm:w-auto px-6 py-3.5 bg-transparent border border-zinc-300 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl font-display text-xs font-bold tracking-wider transition-all uppercase flex items-center justify-center space-x-2"
              >
                <span>{finalCta.replayLabel}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
