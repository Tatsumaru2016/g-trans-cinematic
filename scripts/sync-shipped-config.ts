/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Writes Admin localStorage config to shippedCinematicConfig.json for production deploy.
 * Usage: tsx scripts/sync-shipped-config.ts [source.json]
 * Default source: backups/.latest-custom.json
 */

import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const sourceArg = process.argv[2];
const sourcePath = sourceArg
  ? join(root, sourceArg)
  : join(root, 'backups', '.latest-custom.json');
const targetPath = join(root, 'src', 'config', 'shippedCinematicConfig.json');

if (!existsSync(sourcePath)) {
  console.error(`Source not found: ${sourcePath}`);
  console.error('Edit in Admin with dev server running, click Backup, then re-run.');
  process.exit(1);
}

const raw = readFileSync(sourcePath, 'utf8');
const parsed = JSON.parse(raw) as Record<string, unknown>;

if (!parsed.scenes || !parsed.version) {
  console.error('Invalid cinematic config JSON');
  process.exit(1);
}

const defaults = (parsed.defaults ?? {}) as Record<string, unknown>;
parsed.defaults = {
  particleCount: 750,
  interactiveMode: true,
  showDeveloperPanel: false,
  bgmActive: false,
  sfxActive: true,
  ...defaults,
};
delete (parsed.defaults as Record<string, unknown>).audioActive;

writeFileSync(targetPath, JSON.stringify(parsed, null, 2), 'utf8');
console.log(`Shipped config updated: src/config/shippedCinematicConfig.json`);
