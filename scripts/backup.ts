/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { defaultCinematicConfig } from '../src/config/defaultCinematicConfig.ts';
import {
  LATEST_CUSTOM_BACKUP,
  formatBackupFilename,
  formatCustomBackupFilename,
} from '../src/lib/backup.ts';

const backupsDir = join(process.cwd(), 'backups');
mkdirSync(backupsDir, { recursive: true });

const filename = formatBackupFilename();
const filepath = join(backupsDir, filename);

writeFileSync(filepath, JSON.stringify(defaultCinematicConfig, null, 2), 'utf8');
console.log(`Default backup saved: backups/${filename}`);

const fromArg = process.argv.find((arg) => arg.startsWith('--from='))?.slice('--from='.length);
const latestCustomPath = join(backupsDir, LATEST_CUSTOM_BACKUP);

if (fromArg) {
  const sourcePath = join(process.cwd(), fromArg);
  const customFilename = formatCustomBackupFilename();
  writeFileSync(join(backupsDir, customFilename), readFileSync(sourcePath, 'utf8'), 'utf8');
  console.log(`Custom backup saved: backups/${customFilename}`);
} else if (existsSync(latestCustomPath)) {
  const customFilename = formatCustomBackupFilename();
  copyFileSync(latestCustomPath, join(backupsDir, customFilename));
  console.log(`Custom backup saved: backups/${customFilename}`);
} else {
  console.log('No custom snapshot yet — edit in Admin (dev server) or run: npm run backup -- --from=path/to/export.json');
}
