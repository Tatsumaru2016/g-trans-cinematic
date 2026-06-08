/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { AppLocale } from '../types';
import { en } from './en';
import { ja } from './ja';
import { ko } from './ko';
import { zh } from './zh';

export const messages: Record<AppLocale, typeof en> = {
  en,
  ja,
  ko,
  zh,
};
