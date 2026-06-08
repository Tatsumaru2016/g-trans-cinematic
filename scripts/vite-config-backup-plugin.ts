/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin, ViteDevServer } from 'vite';
import {
  LATEST_CUSTOM_BACKUP,
  PROJECT_BACKUP_API,
  formatCustomBackupFilename,
} from '../src/lib/backup.ts';

function readJsonBody(req: import('node:http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

export function configBackupPlugin(): Plugin {
  return {
    name: 'gtrans-config-backup',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== PROJECT_BACKUP_API || req.method !== 'POST') {
          next();
          return;
        }

        try {
          const body = await readJsonBody(req);
          JSON.parse(body);

          const backupsDir = join(process.cwd(), 'backups');
          mkdirSync(backupsDir, { recursive: true });

          const filename = formatCustomBackupFilename();
          const filepath = join(backupsDir, filename);
          writeFileSync(filepath, body, 'utf8');
          writeFileSync(join(backupsDir, LATEST_CUSTOM_BACKUP), body, 'utf8');

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true, path: `backups/${filename}` }));
        } catch {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: false }));
        }
      });
    },
  };
}
