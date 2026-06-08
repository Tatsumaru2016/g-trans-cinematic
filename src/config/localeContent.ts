/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { DiscoverySign, SceneType } from '../types';
import { defaultLocaleTranslations, sceneCopyToMessages } from './defaultLocaleTranslations';
import {
  CONTENT_LOCALES,
  type ContentLocale,
  type DiscoverySignCopy,
  type LocaleBundle,
  type SceneCopy,
} from './localeContentTypes';
import { SCENE_ORDER } from './defaultCinematicConfig';

export type { ContentLocale, DiscoverySignCopy, LocaleBundle, SceneCopy } from './localeContentTypes';
export { CONTENT_LOCALES } from './localeContentTypes';

function mergeDiscoverySignCopiesList(
  defaults: LocaleBundle['discoverySigns'],
  patch?: LocaleBundle['discoverySigns'],
): LocaleBundle['discoverySigns'] {
  if (!patch) return structuredClone(defaults);
  return defaults.map((sign) => {
    const updated = patch.find((item) => item.id === sign.id);
    return updated ? { ...sign, ...updated } : sign;
  });
}

export function mergeLocaleBundle(defaults: LocaleBundle, patch?: Partial<LocaleBundle>): LocaleBundle {
  if (!patch) return structuredClone(defaults);

  const scenes = {} as Record<SceneType, SceneCopy>;
  for (const id of SCENE_ORDER) {
    scenes[id] = {
      ...defaults.scenes[id],
      ...patch.scenes?.[id],
    };
  }

  return {
    scenes,
    finalCta: { ...defaults.finalCta, ...patch.finalCta },
    discoverySigns: mergeDiscoverySignCopiesList(defaults.discoverySigns, patch?.discoverySigns),
  };
}

export const defaultLocaleBundles: Record<ContentLocale, LocaleBundle> = structuredClone(
  defaultLocaleTranslations,
);

export function applyDiscoverySignCopies(
  base: DiscoverySign[],
  copies: DiscoverySignCopy[],
): DiscoverySign[] {
  return base.map((sign) => {
    const copy = copies.find((item) => item.id === sign.id);
    if (!copy) return sign;
    return { ...sign, label: copy.label, translation: copy.translation };
  });
}

export { sceneCopyToMessages };
