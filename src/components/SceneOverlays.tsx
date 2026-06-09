/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { 
  Building2, Compass, Mic, Globe2, Sparkles, 
  ArrowRight, ArrowUp, RefreshCw, Send, CheckCircle2, Shield, Laptop
} from 'lucide-react';
import { SceneType, ChatMessage } from '../types';
import { useCinematicConfig } from '../context/CinematicConfigContext';
import { useLocale } from '../context/LocaleContext';
import { useLocalizedScenes } from '../hooks/useLocalizedScenes';
import { getSceneAccent, SCENE_ACCENT } from '../config/sceneAccentColors';
import { soundEngine } from './AudioEngine';
import { GTransToolbar } from './GTransToolbar';
import { GTranLogo } from './GTranLogo';
import { GamingUtterancePanel, GamingClipboardCard, type GamingUtteranceStatus } from './GamingUtterancePanel';
import { WorkEmailRangeDemo, type WorkRangeDemoPhase } from './WorkEmailRangeDemo';
import { publicAsset } from '../lib/publicAsset';

const DISCOVERY_FUNCTION_IMAGES = [
  'discovery-function-01.png',
  'discovery-function-02.png',
  'discovery-function-03.png',
  'discovery-function-04.png',
] as const;

interface SceneOverlaysProps {
  currentScene: SceneType;
  onSceneChange: (scene: SceneType) => void;
  onExplodeTrigger?: () => void; // Trigger breakthrough explosion
  onVoiceRippleTrigger?: () => void; // Trigger voice pulse
}

export const SceneOverlays: React.FC<SceneOverlaysProps> = ({
  currentScene,
  onSceneChange,
  onExplodeTrigger,
  onVoiceRippleTrigger
}) => {
  const { config, enabledScenes } = useCinematicConfig();
  const { t } = useLocale();
  const { scenes, discoverySigns } = useLocalizedScenes();
  const workDocs = config.workDocs;
  const globalPings = config.globalPings;

  const [workRangeDemo, setWorkRangeDemo] = useState<WorkRangeDemoPhase>('idle');
  const [activeWorkDemoDocId, setActiveWorkDemoDocId] = useState<string | null>(null);
  const workRangeTimeoutRef = useRef<number | null>(null);
  const demoCancelledRef = useRef(false);

  const WORK_DEMO_TYPES = ['email', 'doc', 'meeting'] as const;
  const SELECTION_DELAY_MS = 1100;
  const DEMO_STEP_INTERVAL_MS = 1400;
  const DEMO_CHAIN_GAP_MS = 60;
  const MEETING_OVERLAY_HOLD_MS = 5000;

  const workDemoSequence = useMemo(
    () =>
      WORK_DEMO_TYPES.map((type) => workDocs.find((d) => d.type === type)).filter(
        (d): d is (typeof workDocs)[number] => Boolean(d),
      ),
    [workDocs],
  );

  const clearWorkRangeTimeout = () => {
    if (workRangeTimeoutRef.current !== null) {
      window.clearTimeout(workRangeTimeoutRef.current);
      workRangeTimeoutRef.current = null;
    }
  };

  const resetWorkRangeDemo = useCallback(() => {
    clearWorkRangeTimeout();
    demoCancelledRef.current = true;
    setActiveWorkDemoDocId(null);
    setWorkRangeDemo('idle');
  }, []);

  const clearActiveWorkDemoOverlay = useCallback(() => {
    setWorkRangeDemo('idle');
    setActiveWorkDemoDocId(null);
  }, []);

  const beginWorkDocDemo = useCallback(
    (docIndex: number) => {
      if (demoCancelledRef.current) return;

      const doc = workDemoSequence[docIndex];
      if (!doc) return;

      setActiveWorkDemoDocId(doc.id);
      setWorkRangeDemo('selecting');
      soundEngine.playDemoStep('select');

      clearWorkRangeTimeout();
      workRangeTimeoutRef.current = window.setTimeout(() => {
        if (demoCancelledRef.current) return;
        workRangeTimeoutRef.current = null;
        setWorkRangeDemo('overlay');
        soundEngine.playDemoStep('translate');

        workRangeTimeoutRef.current = window.setTimeout(() => {
          if (demoCancelledRef.current) return;
          workRangeTimeoutRef.current = null;

          const nextIndex = docIndex + 1;
          if (nextIndex < workDemoSequence.length) {
            clearActiveWorkDemoOverlay();
            clearWorkRangeTimeout();
            workRangeTimeoutRef.current = window.setTimeout(() => {
              if (demoCancelledRef.current) return;
              workRangeTimeoutRef.current = null;
              beginWorkDocDemo(nextIndex);
            }, DEMO_CHAIN_GAP_MS);
          } else {
            workRangeTimeoutRef.current = window.setTimeout(() => {
              if (demoCancelledRef.current) return;
              workRangeTimeoutRef.current = null;
              setActiveWorkDemoDocId(null);
              setWorkRangeDemo('idle');
            }, MEETING_OVERLAY_HOLD_MS);
          }
        }, DEMO_STEP_INTERVAL_MS);
      }, SELECTION_DELAY_MS);
    },
    [workDemoSequence, clearActiveWorkDemoOverlay],
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(config.chatMessages);
  const [newMessageText, setNewMessageText] = useState('');
  const [gamingPanelOpen, setGamingPanelOpen] = useState(false);
  const [gamingInput, setGamingInput] = useState('');
  const [gamingUtteranceStatus, setGamingUtteranceStatus] = useState<GamingUtteranceStatus>('idle');
  const [gamingClipboardAnchor, setGamingClipboardAnchor] = useState<'panel' | 'chat' | null>(null);
  const gamingTranslateTimeoutRef = useRef<number | null>(null);
  const gamingTypingTimeoutRef = useRef<number | null>(null);
  const chatHighlightTimeoutRef = useRef<number | null>(null);
  const chatLogRef = useRef<HTMLDivElement>(null);
  const [highlightedChatMessageId, setHighlightedChatMessageId] = useState<string | null>(null);

  const clearChatHighlight = () => {
    if (chatHighlightTimeoutRef.current !== null) {
      window.clearTimeout(chatHighlightTimeoutRef.current);
      chatHighlightTimeoutRef.current = null;
    }
  };

  const clearGamingTimeouts = () => {
    if (gamingTranslateTimeoutRef.current !== null) {
      window.clearTimeout(gamingTranslateTimeoutRef.current);
      gamingTranslateTimeoutRef.current = null;
    }
    if (gamingTypingTimeoutRef.current !== null) {
      window.clearTimeout(gamingTypingTimeoutRef.current);
      gamingTypingTimeoutRef.current = null;
    }
  };

  const startGamingInputTyping = useCallback((fullText: string) => {
    if (gamingTypingTimeoutRef.current !== null) {
      window.clearTimeout(gamingTypingTimeoutRef.current);
      gamingTypingTimeoutRef.current = null;
    }
    setGamingInput('');
    let index = 0;

    const tick = () => {
      index += 1;
      setGamingInput(fullText.slice(0, index));
      soundEngine.playDemoType(index);
      if (index >= fullText.length) {
        gamingTypingTimeoutRef.current = null;
        return;
      }
      gamingTypingTimeoutRef.current = window.setTimeout(tick, 46);
    };

    void soundEngine.primeDemoAudio();
    gamingTypingTimeoutRef.current = window.setTimeout(tick, 280);
  }, []);

  const resetGamingUtteranceUI = useCallback(() => {
    clearGamingTimeouts();
    setGamingPanelOpen(false);
    setGamingInput('');
    setGamingUtteranceStatus('idle');
    setGamingClipboardAnchor(null);
  }, []);

  const endGamingUtteranceDemo = useCallback(() => {
    resetGamingUtteranceUI();
    clearChatHighlight();
    setNewMessageText('');
    setHighlightedChatMessageId(null);
    setChatMessages(config.chatMessages);
  }, [resetGamingUtteranceUI, config.chatMessages]);

  const submitGamingUtterance = useCallback(() => {
    const text = gamingInput.trim();
    if (!text || gamingUtteranceStatus === 'translating' || gamingUtteranceStatus === 'copied' || gamingUtteranceStatus === 'at-input') {
      return;
    }

    soundEngine.playDemoStep('translate');
    setGamingUtteranceStatus('translating');

    const translated = config.gamingUtterance.sampleTranslated;
    const COPIED_HOLD_MS = 2500;

    gamingTranslateTimeoutRef.current = window.setTimeout(() => {
      void navigator.clipboard.writeText(translated).catch(() => undefined);
      setGamingUtteranceStatus('copied');
      setGamingClipboardAnchor('panel');
      soundEngine.playDemoStep('copy');

      gamingTranslateTimeoutRef.current = window.setTimeout(() => {
        setGamingClipboardAnchor('chat');
        setGamingUtteranceStatus('at-input');
        soundEngine.playDemoStep('move');

        gamingTranslateTimeoutRef.current = window.setTimeout(() => {
          setNewMessageText(translated);
          setGamingClipboardAnchor(null);
          soundEngine.playDemoStep('paste');
          gamingTranslateTimeoutRef.current = null;
        }, 900);
      }, COPIED_HOLD_MS);
    }, 900);
  }, [gamingInput, gamingUtteranceStatus, config.gamingUtterance.sampleTranslated]);

  const triggerGamingUtterance = () => {
    if (gamingPanelOpen) {
      void soundEngine.primeDemoAudio().then(() => {
        soundEngine.playDemoClick();
        endGamingUtteranceDemo();
      });
      return;
    }
    endGamingUtteranceDemo();
    void soundEngine.primeDemoAudio().then(() => {
      soundEngine.playDemoClick();
      setGamingPanelOpen(true);
      setGamingUtteranceStatus('idle');
      setGamingClipboardAnchor(null);
      startGamingInputTyping(config.gamingUtterance.sampleInput);
    });
  };

  useEffect(() => {
    if (!gamingPanelOpen) return;
    const t = window.setTimeout(() => {
      soundEngine.playDemoStep('panel');
    }, 150);
    return () => window.clearTimeout(t);
  }, [gamingPanelOpen]);

  const postGamingChatMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      void soundEngine.primeDemoAudio().then(() => {
        soundEngine.playDemoClick();
        const original =
          gamingInput.trim() || config.gamingUtterance.sampleInput;
        const newMsg: ChatMessage = {
          id: Math.random().toString(),
          lang: 'ENG',
          username: t('gaming.playerUsername'),
          original,
          translated: trimmed,
          color: 'text-emerald-400',
          active: true,
        };
        setChatMessages((prev) => [...prev, newMsg]);
        soundEngine.playDemoStep('message');
        setNewMessageText('');
        clearChatHighlight();
        setHighlightedChatMessageId(newMsg.id);
        resetGamingUtteranceUI();
        chatHighlightTimeoutRef.current = window.setTimeout(() => {
          chatHighlightTimeoutRef.current = null;
          endGamingUtteranceDemo();
        }, 3500);
      });
    },
    [
      gamingInput,
      config.gamingUtterance.sampleInput,
      t,
      resetGamingUtteranceUI,
      endGamingUtteranceDemo,
    ],
  );

  const triggerGamingSend = useCallback(() => {
    postGamingChatMessage(newMessageText);
  }, [newMessageText, postGamingChatMessage]);

  const showGamingSendHint =
    gamingUtteranceStatus === 'at-input' && newMessageText.trim().length > 0;

  useEffect(() => {
    const el = chatLogRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [chatMessages.length]);

  useEffect(() => {
    if (!gamingPanelOpen || gamingUtteranceStatus !== 'idle') return;
    const full = config.gamingUtterance.sampleInput.trim();
    if (!full || gamingInput.trim() !== full) return;

    const t = window.setTimeout(() => {
      submitGamingUtterance();
    }, 700);

    return () => window.clearTimeout(t);
  }, [
    gamingPanelOpen,
    gamingUtteranceStatus,
    gamingInput,
    config.gamingUtterance.sampleInput,
    submitGamingUtterance,
  ]);

  const [expandedDiscoverySignIdx, setExpandedDiscoverySignIdx] = useState<number | null>(null);

  useEffect(() => {
    if (currentScene !== 'discovery') {
      setExpandedDiscoverySignIdx(null);
    }
  }, [currentScene]);

  useEffect(() => {
    if (currentScene !== 'work') {
      resetWorkRangeDemo();
    }
    if (currentScene !== 'gaming') {
      endGamingUtteranceDemo();
    }
  }, [currentScene, resetWorkRangeDemo, endGamingUtteranceDemo]);

  useEffect(() => {
    setChatMessages(config.chatMessages);
  }, [config.chatMessages]);

  // --- SCENE 07: VOICE STATE ---
  const [voiceInputSimulating, setVoiceInputSimulating] = useState<boolean>(false);
  const [voiceTranslatedText, setVoiceTranslatedText] = useState<string>('');
  const [voicePhase, setVoicePhase] = useState<'idle' | 'recording' | 'processing' | 'done'>('idle');

  const triggerVoiceSimulation = () => {
    if (voicePhase !== 'idle') return;
    soundEngine.playClick();
    setVoicePhase('recording');
    setVoiceTranslatedText(t('voice.listening'));
    
    // Simulate speech detection
    setTimeout(() => {
      setVoicePhase('processing');
      setVoiceTranslatedText(t('voice.processing'));
      if (onVoiceRippleTrigger) onVoiceRippleTrigger();

      setTimeout(() => {
        setVoicePhase('done');
        setVoiceTranslatedText(t('voice.doneQuote'));
        soundEngine.transitionSweep('voice');
      }, 2000);
    }, 2000);
  };

  const resetVoiceSim = () => {
    setVoicePhase('idle');
    setVoiceTranslatedText('');
  };

  const [activeConnectionNode, setActiveConnectionNode] = useState<number>(0);

  useEffect(() => {
    if (currentScene === 'connection') {
      const interval = setInterval(() => {
        setActiveConnectionNode(prev => (prev + 1) % globalPings.length);
      }, 4500);
      return () => clearInterval(interval);
    }
  }, [currentScene, globalPings.length]);

  const dismissWorkOverlay = () => {
    if (workRangeDemo !== 'overlay') return;
    soundEngine.playDemoClick();
    resetWorkRangeDemo();
  };

  const triggerWorkRangeDemo = () => {
    if (workRangeDemo === 'selecting') return;
    if (activeWorkDemoDocId !== null) {
      resetWorkRangeDemo();
      return;
    }
    demoCancelledRef.current = false;
    void soundEngine.primeDemoAudio().then(() => {
      soundEngine.playDemoClick();
      beginWorkDocDemo(0);
    });
  };

  // Handle playing click sounds
  const handleInteraction = () => {
    soundEngine.playClick();
  };

  const sceneAccent = getSceneAccent(currentScene);

  const topSceneLabel =
    currentScene === 'future'
      ? (() => {
          const parts = scenes.future.badge.split('//');
          const suffix =
            parts.length > 1 ? parts.slice(1).join('//').trim() : scenes.future.navTitle.trim();
          return suffix ? `FINAL SCENE // ${suffix}` : 'FINAL SCENE';
        })()
      : scenes[currentScene].badge;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 select-text flex flex-col justify-between py-16 px-6 md:px-16 lg:px-24">
      
      {/* 1. SCENE HEADER OVERLAY (Fixed Top Indicator) */}
      <div className="w-full flex items-center justify-between pointer-events-auto">
        <GTranLogo size={36} light={currentScene === 'future'} />
        
        {/* Active Scene tracker */}
        <div className="hidden md:flex items-center text-xs font-mono tracking-widest text-zinc-400">
          <span className={`${sceneAccent.text}${currentScene === 'breakthrough' ? ' normal-case' : ' uppercase'}`}>
            {topSceneLabel}
          </span>
        </div>
      </div>

      {/* 2. MAIN CENTER NARRATIVE SCENE OVERLAYS */}
      <div className="w-full h-full flex flex-col justify-center items-center my-auto">
        <AnimatePresence mode="wait">
          
          {/* SCENE 01: THE LANGUAGE OCEAN */}
          {currentScene === 'ocean' && (
            <motion.div
              key="ocean"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-center max-w-4xl px-4 flex flex-col items-center pointer-events-auto"
            >
              <div className={SCENE_ACCENT.ocean.badgePill}>
                {scenes.ocean.badge}
              </div>
              <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
                {scenes.ocean.title}
              </h1>
              <p className="font-sans text-lg md:text-xl text-zinc-400 max-w-xl font-light leading-relaxed">
                {scenes.ocean.body}
              </p>
              
              <div className="mt-12 flex space-x-1 justify-center animate-bounce">
                <span className="text-xs font-mono text-zinc-500 group-hover:text-sky-300">{t('common.scrollHint')}</span>
              </div>
            </motion.div>
          )}

          {/* SCENE 02: THE BARRIER */}
          {currentScene === 'barrier' && (
            <motion.div
              key="barrier"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl px-4 flex flex-col items-center pointer-events-auto"
            >
              <div className={SCENE_ACCENT.barrier.badgePill}>
                {scenes.barrier.badge}
              </div>
              <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
                {scenes.barrier.title}
                {scenes.barrier.titleAccent && (
                  <>
                    <br />
                    <span className={SCENE_ACCENT.barrier.titleAccent}>{scenes.barrier.titleAccent}</span>
                  </>
                )}
              </h1>
              <p className={`font-sans text-lg md:text-xl max-w-xl ${SCENE_ACCENT.barrier.bodyCopy}`}>
                {scenes.barrier.body}
              </p>
              <button
                id="barrier-break-trigger"
                onClick={() => {
                  handleInteraction();
                  if (onExplodeTrigger) onExplodeTrigger();
                  onSceneChange('breakthrough');
                }}
                className={`mt-12 px-6 py-3 bg-white text-zinc-950 ${SCENE_ACCENT.barrier.hoverBg} hover:text-zinc-900 rounded-full font-display text-sm font-semibold tracking-wider transition-all duration-300 pointer-events-auto shadow-lg ${SCENE_ACCENT.barrier.hoverShadow} border border-white flex items-center space-x-2`}
              >
                <span>{scenes.barrier.ctaLabel}</span>
                <Sparkles className="w-4 h-4 ml-1" />
              </button>
            </motion.div>
          )}

          {/* SCENE 03: BREAKTHROUGH */}
          {currentScene === 'breakthrough' && (
            <motion.div
              key="breakthrough"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl px-4 flex flex-col items-center pointer-events-auto"
            >
              <div className={SCENE_ACCENT.breakthrough.badgePill}>
                {scenes.breakthrough.badge}
              </div>
              <h1 className="font-display text-5xl md:text-8xl font-black tracking-tight text-white mb-6 italic">
                {scenes.breakthrough.title}
                {scenes.breakthrough.titleAccent && (
                  <>
                    <br />
                    <span className={SCENE_ACCENT.breakthrough.titleAccent}>{scenes.breakthrough.titleAccent}</span>
                  </>
                )}
              </h1>
              <p className="font-sans text-lg md:text-2xl text-zinc-300 max-w-2xl font-light leading-relaxed">
                {scenes.breakthrough.body}
              </p>
            </motion.div>
          )}

          {/* SCENE 04: WORK — G.trans range translation demo */}
          {currentScene === 'work' && workDemoSequence.length > 0 && (
            <motion.div
              key="work"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pointer-events-auto"
            >
              <div className="lg:col-span-5 text-left flex flex-col items-start">
                <div className={SCENE_ACCENT.work.badgePill}>
                  {scenes.work.badge}
                </div>
                <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
                  {scenes.work.title}
                  {scenes.work.titleAccent && (
                    <>
                      <br />
                      <span className={SCENE_ACCENT.work.titleAccent}>{scenes.work.titleAccent}</span>
                    </>
                  )}
                </h1>
                <p className="font-sans text-base text-zinc-400 font-light leading-relaxed mb-6">
                  {scenes.work.body}
                </p>

                <GTransToolbar
                  onAction={triggerWorkRangeDemo}
                  actionActive={activeWorkDemoDocId !== null}
                  disabled={workRangeDemo === 'selecting'}
                  showHint={activeWorkDemoDocId === null && workRangeDemo === 'idle'}
                />
              </div>

              <div className="lg:col-span-7 flex flex-col gap-4">
                {workDemoSequence.map((doc) => {
                  const isActiveDemo = activeWorkDemoDocId === doc.id;
                  const isEmailIdle = doc.type === 'email' && activeWorkDemoDocId === null;

                  return (
                    <div
                      key={doc.id}
                      className={`glass-panel p-5 rounded-2xl transition-all duration-500 relative ${
                        isActiveDemo || isEmailIdle
                          ? `${SCENE_ACCENT.work.docPanelActive} opacity-100 overflow-visible`
                          : `opacity-70 overflow-hidden ${SCENE_ACCENT.work.docPanelHover}`
                      }`}
                    >
                      <div className="absolute top-0 right-0 p-3 text-[10px] text-zinc-600 font-mono">
                        CONF: {doc.conf}%
                      </div>

                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`p-2 rounded-lg text-xs font-mono uppercase ${SCENE_ACCENT.work.docTypeBadge}`}>
                          {doc.type}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-zinc-200">{doc.sender}</p>
                          <p className="text-[10px] text-zinc-500 font-mono">{doc.time}</p>
                        </div>
                      </div>

                      <div className="relative w-full">
                        {isActiveDemo ? (
                          <WorkEmailRangeDemo
                            original={doc.original}
                            translated={doc.translated}
                            phase={workRangeDemo}
                            onCloseOverlay={dismissWorkOverlay}
                          />
                        ) : (
                          <p className="font-sans text-sm leading-relaxed text-zinc-500 italic m-0">
                            {doc.original}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* SCENE 05: GAMING INSTANT TRANSLATION CHAT WORLD */}
          {currentScene === 'gaming' && (
            <LayoutGroup>
            <motion.div
              key="gaming"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pointer-events-auto"
            >
              <div className="lg:col-span-5 text-left">
                <div className={SCENE_ACCENT.gaming.badgePill}>
                  {scenes.gaming.badge}
                </div>
                <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
                  {scenes.gaming.title}
                  {scenes.gaming.titleAccent && (
                    <>
                      <br />
                      <span className={SCENE_ACCENT.gaming.titleAccent}>{scenes.gaming.titleAccent}</span>
                    </>
                  )}
                </h1>
                <p className="font-sans text-base text-zinc-400 font-light leading-relaxed mb-6">
                  {scenes.gaming.body}
                </p>

                <div className="w-full">
                  <p className="text-xs font-semibold text-zinc-300 font-display mb-1">{t('gaming.tacticalSync')}</p>
                  <p className="text-[10px] font-mono text-zinc-500 mb-4">{t('gaming.realtimeSpeed')}</p>
                  <GTransToolbar
                    variant="speech"
                    onAction={triggerGamingUtterance}
                    actionActive={gamingPanelOpen}
                    showHint={!gamingPanelOpen}
                    showSectionLabel={false}
                  />
                  <GamingUtterancePanel
                    open={gamingPanelOpen}
                    targetLanguage={config.gamingUtterance.targetLanguage}
                    inputValue={gamingInput}
                    onInputChange={setGamingInput}
                    onClose={() => {
                      soundEngine.playDemoClick();
                      endGamingUtteranceDemo();
                    }}
                    status={gamingUtteranceStatus}
                    copiedSlot={
                      gamingClipboardAnchor === 'panel' ? (
                        <GamingClipboardCard text={config.gamingUtterance.sampleTranslated} />
                      ) : null
                    }
                  />
                </div>
              </div>

              {/* MMO Laser Chat Stream */}
              <div className="lg:col-span-7">
                <div className="glass-panel rounded-2xl p-6 border-violet-500/20 bg-zinc-950/50 min-h-[350px] flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="font-mono text-xs text-zinc-400 uppercase">{t('gaming.liveServer')}</span>
                    </div>
                    <span className="text-[10px] font-mono text-violet-400">{t('gaming.online')}</span>
                  </div>

                  {/* Chat logs */}
                  <div
                    ref={chatLogRef}
                    className="flex flex-col gap-4 overflow-y-auto max-h-[220px] pr-2 scrollbar-none"
                  >
                    <AnimatePresence initial={false}>
                    {chatMessages.map((msg) => {
                      const isHighlighted = msg.id === highlightedChatMessageId;
                      return (
                      <motion.div
                        key={msg.id}
                        layout
                        initial={{ opacity: 0, y: 56, scale: 0.94 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -24, scale: 0.96, transition: { duration: 0.5, ease: 'easeIn' } }}
                        transition={{
                          layout: { duration: 0.45, ease: 'easeOut' },
                          opacity: { duration: 0.8, ease: 'easeOut' },
                          y: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
                          scale: { duration: 0.75, ease: 'easeOut' },
                        }}
                        onAnimationComplete={() => {
                          if (msg.id !== chatMessages[chatMessages.length - 1]?.id) return;
                          const el = chatLogRef.current;
                          if (el) el.scrollTop = el.scrollHeight;
                        }}
                        className={`text-left text-xs py-1 ${
                          isHighlighted
                            ? 'rounded-lg border-2 border-emerald-500/50 bg-emerald-950/30 p-3 shadow-lg shadow-emerald-950/20'
                            : 'border-l-2 pl-3 border-zinc-800 hover:border-violet-500/40'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1.5 justify-between">
                          <div className="flex items-center space-x-2">
                            <span className={`font-mono font-bold ${msg.color}`}>{msg.username}</span>
                            <span className="text-[9px] px-1 bg-zinc-800 text-zinc-500 rounded font-mono font-semibold">{msg.lang}</span>
                          </div>
                          <span className="text-[8px] text-zinc-600 font-mono">{t('common.latency')}</span>
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          <p className="text-zinc-500 italic">{msg.original}</p>
                          <p className="text-zinc-300 text-[11px] font-sans font-medium text-violet-300/80 flex items-center">
                            <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0 inline mr-1" />
                            {msg.translated}
                          </p>
                        </div>
                      </motion.div>
                      );
                    })}
                    </AnimatePresence>
                  </div>

                  {/* Message Input Simulator */}
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <div
                      className={`relative flex items-center space-x-2 ${
                        showGamingSendHint ? 'pb-11' : ''
                      }`}
                    >
                    {gamingClipboardAnchor === 'chat' && (
                      <div className="absolute inset-0 z-10 pointer-events-none">
                        <GamingClipboardCard
                          text={config.gamingUtterance.sampleTranslated}
                          className="h-full flex flex-col justify-center"
                        />
                      </div>
                    )}
                    <input 
                      type="text" 
                      value={newMessageText}
                      readOnly
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newMessageText.trim()) {
                          triggerGamingSend();
                        }
                      }}
                      className={`relative z-[1] flex-1 bg-zinc-900 border rounded-lg px-3 py-2 text-xs focus:outline-none text-white font-sans cursor-default ${
                        gamingClipboardAnchor === 'chat'
                          ? 'border-emerald-500/40'
                          : 'border-zinc-800 focus:border-violet-500'
                      }`}
                    />
                    <div className="relative shrink-0 flex flex-col items-center">
                      <motion.button
                        type="button"
                        onClick={triggerGamingSend}
                        disabled={!newMessageText.trim()}
                        aria-label={t('utterance.sendMessage')}
                        animate={
                          showGamingSendHint
                            ? { scale: [1, 0.82, 1] }
                            : { scale: 1 }
                        }
                        transition={
                          showGamingSendHint
                            ? { duration: 1.1, repeat: Infinity, ease: 'easeInOut' }
                            : { duration: 0.15 }
                        }
                        className="relative z-[1] p-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </motion.button>
                      {showGamingSendHint && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 pointer-events-none flex flex-col items-center">
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <motion.div
                              animate={{ y: [0, -5, 0] }}
                              transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                              className="text-violet-400"
                            >
                              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                            </motion.div>
                          </motion.div>
                          <motion.span
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-0.5 text-[10px] font-mono text-violet-400 tracking-wide whitespace-nowrap"
                          >
                            {t('utterance.clickToSend')}
                          </motion.span>
                        </div>
                      )}
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            </LayoutGroup>
          )}

          {/* SCENE 06: DISCOVERY CITY MAPS HOVER */}
          {currentScene === 'discovery' && (
            <motion.div
              key="discovery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pointer-events-auto"
            >
              <div className="lg:col-span-5 text-left">
                <div className={SCENE_ACCENT.discovery.badgePillCompact}>
                  {scenes.discovery.badge}
                </div>
                <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
                  {scenes.discovery.title}
                  {scenes.discovery.titleAccent && (
                    <>
                      <br />
                      <span className={SCENE_ACCENT.discovery.titleAccent}>{scenes.discovery.titleAccent}</span>
                    </>
                  )}
                </h1>
                <p className={`font-sans text-base mb-3 ${SCENE_ACCENT.discovery.bodyCopy}`}>
                  {scenes.discovery.body}
                </p>
                <p className="mb-6 text-xs text-zinc-500 animate-pulse font-sans">
                  {t('discovery.hoverHint')}
                </p>
              </div>

              {/* City Sign interactives */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                {discoverySigns.map((sign, idx) => {
                  const isExpanded = expandedDiscoverySignIdx === idx;
                  return (
                    <div
                      key={sign.id}
                      onMouseLeave={() => setExpandedDiscoverySignIdx(null)}
                      className={`glass-panel rounded-2xl text-left border overflow-hidden transition-colors duration-300 ${
                        isExpanded ? SCENE_ACCENT.discovery.signCardActive : 'border-zinc-800'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setExpandedDiscoverySignIdx(idx);
                          soundEngine.playClick();
                        }}
                        className="w-full p-6 text-left cursor-pointer"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-mono text-[9px] text-zinc-500">
                            Function {idx + 1}
                          </span>
                          <Compass
                            className={`w-4 h-4 ${
                              isExpanded ? `${SCENE_ACCENT.discovery.text} animate-spin` : 'text-zinc-600'
                            }`}
                          />
                        </div>

                        <div className="min-h-[44px]">
                          <p className="text-sm font-semibold text-zinc-300 font-display italic">{sign.label}</p>
                          <p className="mt-2 text-sm font-bold text-white font-sans">{sign.translation}</p>
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            key="preview"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-0">
                              <img
                                src={publicAsset(DISCOVERY_FUNCTION_IMAGES[idx] ?? DISCOVERY_FUNCTION_IMAGES[0])}
                                alt=""
                                draggable={false}
                                className="w-full rounded-xl border border-zinc-800/80 bg-zinc-950 object-cover"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* SCENE 07: VOICE */}
          {currentScene === 'voice' && (
            <motion.div
              key="voice"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-4xl flex flex-col items-center justify-center text-center pointer-events-auto"
            >
              <div className={SCENE_ACCENT.voice.badgePill}>
                {scenes.voice.badge}
              </div>
              
              <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
                {scenes.voice.title}
                {scenes.voice.titleAccent && (
                  <>
                    <br />
                    <span className={SCENE_ACCENT.voice.titleAccent}>{scenes.voice.titleAccent}</span>
                  </>
                )}
              </h1>
              
              <p className="font-sans text-base text-zinc-400 max-w-xl font-light leading-relaxed mb-8">
                {scenes.voice.body}
              </p>

              {/* Sound wave trigger console */}
              <div className={`glass-panel p-6 rounded-3xl w-full max-w-md ${SCENE_ACCENT.voice.panelBorder} flex flex-col items-center border`}>
                
                {/* Visualizer Pulsing indicator */}
                <div className="relative w-28 h-28 flex items-center justify-center mb-6">
                  <div className={`absolute inset-0 rounded-full border ${SCENE_ACCENT.voice.border} opacity-40 ${voicePhase === 'recording' ? 'animate-ping' : ''}`} />
                  <div className={`absolute inset-2 rounded-full border border-sky-300/30 opacity-60 ${voicePhase === 'processing' ? 'animate-spin' : ''}`} />
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center border transition-all ${voicePhase === 'recording' ? `${SCENE_ACCENT.voice.bgStrong} ${SCENE_ACCENT.voice.borderActive}` : `${SCENE_ACCENT.voice.bgStrong} ${SCENE_ACCENT.voice.border} bg-zinc-900`}`}>
                    <Mic className={`w-8 h-8 ${voicePhase === 'recording' ? `${SCENE_ACCENT.voice.text} animate-pulse` : SCENE_ACCENT.voice.text}`} />
                  </div>
                </div>

                <div className="w-full min-h-[50px] mb-4 flex items-center justify-center">
                  <p className="font-mono text-xs text-zinc-300 px-4 py-2 bg-black/40 rounded-xl leading-relaxed max-w-xs uppercase tracking-wide">
                    {voicePhase === 'idle' ? t('voice.offline') : voiceTranslatedText}
                  </p>
                </div>

                <div className="flex space-x-2 w-full">
                  {voicePhase === 'idle' ? (
                    <button
                      id="voice-simulation-button"
                      onClick={triggerVoiceSimulation}
                      className="flex-1 py-3 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-semibold uppercase tracking-wider font-mono transition-all flex items-center justify-center space-x-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{scenes.voice.ctaLabel}</span>
                    </button>
                  ) : (
                    <button
                      onClick={resetVoiceSim}
                      className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold uppercase tracking-wider font-mono transition-all flex items-center justify-center space-x-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reset Sim</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* SCENE 08: GLOBAL CONNECTION INTERACTIVE SPHERES */}
          {currentScene === 'connection' && (
            <motion.div
              key="connection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pointer-events-auto"
            >
              <div className="lg:col-span-5 text-left">
                <div className={SCENE_ACCENT.connection.badgePillCompact}>
                  {scenes.connection.badge}
                </div>
                <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
                  {scenes.connection.title}
                  {scenes.connection.titleAccent && (
                    <>
                      <br />
                      <span className={SCENE_ACCENT.connection.titleAccent}>{scenes.connection.titleAccent}</span>
                    </>
                  )}
                </h1>
                <p className="font-sans text-base text-zinc-400 font-light leading-relaxed mb-6">
                  {scenes.connection.body}
                </p>

                <div className="flex gap-2">
                  {globalPings.map((ping, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveConnectionNode(idx);
                        soundEngine.playClick();
                      }}
                      className={`px-3 py-2 rounded-xl text-[10px] font-mono transition-all uppercase flex-1 border ${activeConnectionNode === idx ? SCENE_ACCENT.connection.routeBtnActive : 'border-zinc-800 text-zinc-500'}`}
                    >
                      Route {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interconnected glowing conversation panels */}
              <div className="lg:col-span-7">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeConnectionNode}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className={`glass-panel p-6 rounded-2xl border ${SCENE_ACCENT.connection.panelBorder} text-left min-h-[220px] flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-800/60">
                        <span className={`font-mono text-xs ${SCENE_ACCENT.connection.text} flex items-center space-x-1.5`}>
                          <Globe2 className="w-4 h-4" />
                          <span>Active Geographic Tunnel</span>
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${SCENE_ACCENT.connection.latencyBadge}`}>
                          LATENCY: {globalPings[activeConnectionNode].speed}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-5 items-center gap-3 mb-4">
                        <div className="col-span-2 text-sm font-semibold text-white truncate">{globalPings[activeConnectionNode].from}</div>
                        <div className="col-span-1 text-center font-mono text-xs text-zinc-500">――►</div>
                        <div className="col-span-2 text-sm font-semibold text-white truncate text-right">{globalPings[activeConnectionNode].to}</div>
                      </div>
                      
                      <p className="font-sans text-sm text-zinc-300 leading-relaxed font-light">
                        "{globalPings[activeConnectionNode].message}"
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 text-[10px] font-mono text-zinc-500 mt-4">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${SCENE_ACCENT.connection.text}`} />
                      <span>SECURE ISO-27001 END-TO-END TRANSLATE NODE</span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* SCENE 09: THE FUTURE */}
          {currentScene === 'future' && (
            <motion.div
              key="future"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="text-center max-w-4xl px-4 flex flex-col items-center pointer-events-auto"
            >
              <div className={SCENE_ACCENT.future.badgePill}>
                {scenes.future.badge}
              </div>
              
              <h1 className="font-display text-4xl md:text-7xl font-light tracking-tight text-zinc-900 mb-6 font-semibold">
                {scenes.future.title}
              </h1>
              
              <p className="font-display text-4xl md:text-7xl font-bold tracking-tight text-zinc-800 mb-8 italic">
                <span className={SCENE_ACCENT.future.titleAccent}>{scenes.future.titleAccent}</span>
              </p>

              <p className="font-sans text-base text-zinc-500 max-w-lg font-light leading-relaxed mb-4">
                {scenes.future.body}
              </p>

              <button
                id="future-cta-trigger"
                onClick={() => {
                  handleInteraction();
                  onSceneChange(enabledScenes[0] ?? 'ocean');
                }}
                className="mt-1 -translate-y-2 px-6 py-3 bg-zinc-950 text-white hover:bg-zinc-800 rounded-full font-display text-sm font-semibold tracking-wider transition-all duration-300"
              >
                {scenes.future.ctaLabel}
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* 3. FOOTER MICRO CONTROL OVERLAYS */}
      <div className="w-full flex items-center justify-end pointer-events-auto text-xs font-mono text-zinc-500">
        {/* Quick action buttons */}
        <div className="flex space-x-6">
          <button 
            onClick={() => {
              handleInteraction();
              const scenes: SceneType[] = ['ocean', 'barrier', 'breakthrough', 'work', 'gaming', 'discovery', 'voice', 'connection', 'future'];
              const idx = scenes.indexOf(currentScene);
              if (idx > 0) {
                onSceneChange(scenes[idx - 1]);
              }
            }}
            className="hover:text-white transition-colors"
          >
            {t('common.prev')}
          </button>
          <button 
            onClick={() => {
              handleInteraction();
              const scenes: SceneType[] = ['ocean', 'barrier', 'breakthrough', 'work', 'gaming', 'discovery', 'voice', 'connection', 'future'];
              const idx = scenes.indexOf(currentScene);
              if (idx < scenes.length - 1) {
                onSceneChange(scenes[idx + 1]);
              }
            }}
            className={`hover:text-white transition-colors ${sceneAccent.text}`}
          >
            {t('common.next')}
          </button>
        </div>
      </div>

    </div>
  );
};
