/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SceneType } from '../types';
import type { FinalCta } from './defaultCinematicConfig';

export type ContentLocale = 'ja' | 'ko' | 'zh';

export interface DiscoverySignCopy {
  id: string;
  label: string;
  translation: string;
}

export interface SceneCopy {
  navTitle: string;
  labLabel: string;
  badge: string;
  title: string;
  titleAccent?: string;
  body: string;
  ctaLabel?: string;
}

export interface LocaleBundle {
  scenes: Record<SceneType, SceneCopy>;
  finalCta: FinalCta;
  discoverySigns: DiscoverySignCopy[];
}

export const CONTENT_LOCALES: { code: ContentLocale; label: string }[] = [
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'zh', label: '中文' },
];
