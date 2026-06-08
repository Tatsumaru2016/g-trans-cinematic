/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { CinematicConfig } from '../config/defaultCinematicConfig';
import type { MessageCatalog } from './types';
import type { SceneType } from '../types';
import { SCENE_ORDER } from '../config/defaultCinematicConfig';

export function scenesFromConfig(
  scenes: CinematicConfig['scenes'],
): MessageCatalog['scenes'] {
  const result = {} as MessageCatalog['scenes'];
  for (const id of SCENE_ORDER) {
    const scene = scenes[id];
    result[id as SceneType] = {
      navTitle: scene.navTitle,
      labLabel: scene.labLabel,
      badge: scene.badge,
      title: scene.title,
      titleAccent: scene.titleAccent ?? '',
      body: scene.body,
      ctaLabel: scene.ctaLabel ?? '',
    };
  }
  return result;
}

export function finalCtaFromConfig(finalCta: CinematicConfig['finalCta']): MessageCatalog['finalCta'] {
  return { ...finalCta };
}
