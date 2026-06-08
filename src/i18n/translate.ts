/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { MessageCatalog } from './types';

export function translate(
  messages: MessageCatalog,
  key: string,
  params?: Record<string, string | number>,
): string {
  const parts = key.split('.');
  let current: unknown = messages;

  for (const part of parts) {
    if (!current || typeof current !== 'object' || !(part in current)) {
      return key;
    }
    current = (current as Record<string, unknown>)[part];
  }

  if (typeof current !== 'string') {
    return key;
  }

  if (!params) {
    return current;
  }

  return Object.entries(params).reduce(
    (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
    current,
  );
}
