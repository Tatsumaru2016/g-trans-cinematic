/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  CinematicConfig,
  SCENE_ORDER,
  defaultCinematicConfig,
} from '../config/defaultCinematicConfig';
import {
  CONTENT_LOCALES,
  mergeLocaleBundle,
  type ContentLocale,
  type DiscoverySignCopy,
  type SceneCopy,
} from '../config/localeContent';
import { saveProjectConfigBackup } from '../lib/backup';
import type { FinalCta } from '../config/defaultCinematicConfig';
import type { SceneType } from '../types';

const STORAGE_KEY = 'gtrans-cinematic-config';
const PROJECT_BACKUP_DEBOUNCE_MS = 2000;
let projectBackupTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleProjectConfigBackup(config: CinematicConfig) {
  if (projectBackupTimer) clearTimeout(projectBackupTimer);
  projectBackupTimer = setTimeout(() => {
    void saveProjectConfigBackup(config);
  }, PROJECT_BACKUP_DEBOUNCE_MS);
}

function mergeLocales(parsed?: CinematicConfig['locales']): CinematicConfig['locales'] {
  const result = {} as CinematicConfig['locales'];
  for (const { code } of CONTENT_LOCALES) {
    result[code] = mergeLocaleBundle(defaultCinematicConfig.locales[code], parsed?.[code]);
  }
  return result;
}

function mergeDefaults(parsed?: Partial<CinematicConfig['defaults']> & { audioActive?: boolean }): CinematicConfig['defaults'] {
  const { audioActive: _legacy, ...rest } = parsed ?? {};
  return {
    ...defaultCinematicConfig.defaults,
    ...rest,
    bgmActive: rest.bgmActive ?? defaultCinematicConfig.defaults.bgmActive,
    sfxActive: rest.sfxActive ?? defaultCinematicConfig.defaults.sfxActive,
  };
}

function mergeConfig(parsed: Partial<CinematicConfig>): CinematicConfig {
  const useFreshLocales = !parsed.version || parsed.version < 2;

  return {
    ...structuredClone(defaultCinematicConfig),
    ...parsed,
    version: defaultCinematicConfig.version,
    scenes: { ...defaultCinematicConfig.scenes, ...parsed.scenes },
    locales: useFreshLocales
      ? structuredClone(defaultCinematicConfig.locales)
      : mergeLocales(parsed.locales),
    defaults: mergeDefaults(parsed.defaults),
    finalCta: { ...defaultCinematicConfig.finalCta, ...parsed.finalCta },
    gamingUtterance: { ...defaultCinematicConfig.gamingUtterance, ...parsed.gamingUtterance },
  };
}

function loadConfig(): CinematicConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultCinematicConfig);
    const parsed = JSON.parse(raw) as CinematicConfig;
    return mergeConfig(parsed);
  } catch {
    return structuredClone(defaultCinematicConfig);
  }
}

function saveConfig(config: CinematicConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

interface CinematicConfigContextValue {
  config: CinematicConfig;
  enabledScenes: SceneType[];
  updateConfig: (patch: Partial<CinematicConfig>) => void;
  updateScene: (id: SceneType, patch: Partial<CinematicConfig['scenes'][SceneType]>) => void;
  updateLocaleScene: (locale: ContentLocale, id: SceneType, patch: Partial<SceneCopy>) => void;
  updateLocaleFinalCta: (locale: ContentLocale, patch: Partial<FinalCta>) => void;
  updateLocaleDiscoverySigns: (locale: ContentLocale, signs: DiscoverySignCopy[]) => void;
  resetConfig: () => void;
  exportConfig: () => string;
  importConfig: (json: string) => boolean;
}

const CinematicConfigContext = createContext<CinematicConfigContextValue | null>(null);

export function CinematicConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<CinematicConfig>(loadConfig);

  const persist = useCallback((next: CinematicConfig) => {
    setConfig(next);
    saveConfig(next);
    scheduleProjectConfigBackup(next);
  }, []);

  const enabledScenes = useMemo(
    () => SCENE_ORDER.filter((id) => config.scenes[id].enabled),
    [config.scenes],
  );

  const updateConfig = useCallback(
    (patch: Partial<CinematicConfig>) => {
      persist({ ...config, ...patch });
    },
    [config, persist],
  );

  const updateScene = useCallback(
    (id: SceneType, patch: Partial<CinematicConfig['scenes'][SceneType]>) => {
      persist({
        ...config,
        scenes: {
          ...config.scenes,
          [id]: { ...config.scenes[id], ...patch },
        },
      });
    },
    [config, persist],
  );

  const updateLocaleScene = useCallback(
    (locale: ContentLocale, id: SceneType, patch: Partial<SceneCopy>) => {
      persist({
        ...config,
        locales: {
          ...config.locales,
          [locale]: {
            ...config.locales[locale],
            scenes: {
              ...config.locales[locale].scenes,
              [id]: { ...config.locales[locale].scenes[id], ...patch },
            },
          },
        },
      });
    },
    [config, persist],
  );

  const updateLocaleFinalCta = useCallback(
    (locale: ContentLocale, patch: Partial<FinalCta>) => {
      persist({
        ...config,
        locales: {
          ...config.locales,
          [locale]: {
            ...config.locales[locale],
            finalCta: { ...config.locales[locale].finalCta, ...patch },
          },
        },
      });
    },
    [config, persist],
  );

  const updateLocaleDiscoverySigns = useCallback(
    (locale: ContentLocale, signs: DiscoverySignCopy[]) => {
      persist({
        ...config,
        locales: {
          ...config.locales,
          [locale]: {
            ...config.locales[locale],
            discoverySigns: signs,
          },
        },
      });
    },
    [config, persist],
  );

  const resetConfig = useCallback(() => {
    persist(structuredClone(defaultCinematicConfig));
  }, [persist]);

  const exportConfig = useCallback(() => JSON.stringify(config, null, 2), [config]);

  const importConfig = useCallback(
    (json: string) => {
      try {
        const parsed = JSON.parse(json) as CinematicConfig;
        if (!parsed.scenes || !parsed.version) return false;
        persist(mergeConfig(parsed));
        return true;
      } catch {
        return false;
      }
    },
    [persist],
  );

  const value = useMemo(
    () => ({
      config,
      enabledScenes,
      updateConfig,
      updateScene,
      updateLocaleScene,
      updateLocaleFinalCta,
      updateLocaleDiscoverySigns,
      resetConfig,
      exportConfig,
      importConfig,
    }),
    [
      config,
      enabledScenes,
      updateConfig,
      updateScene,
      updateLocaleScene,
      updateLocaleFinalCta,
      updateLocaleDiscoverySigns,
      resetConfig,
      exportConfig,
      importConfig,
    ],
  );

  return (
    <CinematicConfigContext.Provider value={value}>{children}</CinematicConfigContext.Provider>
  );
}

export function useCinematicConfig() {
  const ctx = useContext(CinematicConfigContext);
  if (!ctx) throw new Error('useCinematicConfig must be used within CinematicConfigProvider');
  return ctx;
}
