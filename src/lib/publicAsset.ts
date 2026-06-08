/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Resolve a file from /public for dev and GitHub Pages subpath deploys. */
export function publicAsset(path: string): string {
  const normalized = path.replace(/^\//, '');
  return `${import.meta.env.BASE_URL}${normalized}`;
}
