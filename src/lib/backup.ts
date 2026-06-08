/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { CinematicConfig } from '../config/defaultCinematicConfig';

export const BACKUP_HISTORY_KEY = 'gtrans-cinematic-backups';
export const MAX_BACKUPS = 10;

export interface BackupEntry {
  id: string;
  createdAt: string;
  config: CinematicConfig;
}

export const PROJECT_BACKUP_API = '/api/backup-config';
export const LATEST_CUSTOM_BACKUP = '.latest-custom.json';

export function formatBackupFilename(date = new Date()) {
  return `gtrans-cinematic-${date.toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`;
}

export function formatCustomBackupFilename(date = new Date()) {
  return `gtrans-cinematic-custom-${date.toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`;
}

export async function saveProjectConfigBackup(
  config: CinematicConfig,
  opts: { full?: boolean } = {},
): Promise<{ ok: boolean; path?: string }> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (opts.full) headers['x-backup-mode'] = 'full';

    const res = await fetch(PROJECT_BACKUP_API, {
      method: 'POST',
      headers,
      body: JSON.stringify(config, null, 2),
    });
    if (!res.ok) return { ok: false };
    const data = (await res.json()) as { ok?: boolean; path?: string };
    return { ok: Boolean(data.ok), path: data.path };
  } catch {
    return { ok: false };
  }
}

export function downloadConfigBackup(config: CinematicConfig, filename?: string) {
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename ?? formatBackupFilename();
  a.click();
  URL.revokeObjectURL(url);
}

export function loadBackupHistory(): BackupEntry[] {
  try {
    const raw = localStorage.getItem(BACKUP_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BackupEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistBackupHistory(history: BackupEntry[]) {
  localStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify(history.slice(0, MAX_BACKUPS)));
}

export function createBackup(config: CinematicConfig): BackupEntry {
  const entry: BackupEntry = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    config: structuredClone(config),
  };
  const history = loadBackupHistory();
  history.unshift(entry);
  persistBackupHistory(history);
  return entry;
}

export function removeBackup(id: string): BackupEntry[] {
  const next = loadBackupHistory().filter((b) => b.id !== id);
  persistBackupHistory(next);
  return next;
}

export function formatBackupDate(iso: string) {
  return new Date(iso).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
