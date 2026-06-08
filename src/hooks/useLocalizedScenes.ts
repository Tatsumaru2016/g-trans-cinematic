/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { SCENE_ORDER } from '../config/defaultCinematicConfig';
import type { ContentLocale } from '../config/localeContent';
import { applyDiscoverySignCopies } from '../config/localeContent';
import { useCinematicConfig } from '../context/CinematicConfigContext';
import { useLocale } from '../context/LocaleContext';
import type { SceneType } from '../types';
import type { SceneContent } from '../config/defaultCinematicConfig';

function mergeSceneContent(base: SceneContent, copy: {
  navTitle: string;
  labLabel: string;
  badge: string;
  title: string;
  titleAccent?: string;
  body: string;
  ctaLabel?: string;
}): SceneContent {
  return {
    ...base,
    navTitle: copy.navTitle,
    labLabel: copy.labLabel,
    badge: copy.badge,
    title: copy.title,
    titleAccent: copy.titleAccent || undefined,
    body: copy.body,
    ctaLabel: copy.ctaLabel || undefined,
  };
}

export function useLocalizedScenes() {
  const { locale } = useLocale();
  const { config } = useCinematicConfig();

  const scenes = useMemo(() => {
    if (locale === 'en') {
      return config.scenes;
    }

    const bundle = config.locales[locale as ContentLocale];
    const result = {} as Record<SceneType, SceneContent>;
    for (const id of SCENE_ORDER) {
      result[id] = mergeSceneContent(config.scenes[id], bundle.scenes[id]);
    }
    return result;
  }, [locale, config.scenes, config.locales]);

  const finalCta = useMemo(() => {
    if (locale === 'en') {
      return config.finalCta;
    }
    return config.locales[locale as ContentLocale].finalCta;
  }, [locale, config.finalCta, config.locales]);

  const discoverySigns = useMemo(() => {
    if (locale === 'en') {
      return config.discoverySigns;
    }
    return applyDiscoverySignCopies(
      config.discoverySigns,
      config.locales[locale as ContentLocale].discoverySigns,
    );
  }, [locale, config.discoverySigns, config.locales]);

  return { scenes, finalCta, discoverySigns };
}
