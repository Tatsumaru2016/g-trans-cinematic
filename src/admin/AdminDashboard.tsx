/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  Archive,
  Download,
  Eye,
  Film,
  History,
  RotateCcw,
  Save,
  Settings2,
  Trash2,
  Upload,
} from 'lucide-react';
import { SCENE_ORDER } from '../config/defaultCinematicConfig';
import { CONTENT_LOCALES, type ContentLocale, type DiscoverySignCopy, type SceneCopy } from '../config/localeContent';
import { useCinematicConfig } from '../context/CinematicConfigContext';
import { GTranLogo } from '../components/GTranLogo';
import { LanguageSelector } from '../components/LanguageSelector';
import type { SceneType } from '../types';
import {
  createBackup,
  downloadConfigBackup,
  formatBackupDate,
  loadBackupHistory,
  removeBackup,
  saveProjectConfigBackup,
  type BackupEntry,
} from '../lib/backup';
import { useLocale } from '../context/LocaleContext';
import type { FinalCta } from '../config/defaultCinematicConfig';

type EditLocale = 'en' | ContentLocale;

const EDIT_LOCALE_TABS: { code: EditLocale; label: string }[] = [
  { code: 'en', label: 'English' },
  ...CONTENT_LOCALES,
];

function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="mt-1 w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500 resize-y"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500"
        />
      )}
    </label>
  );
}

export default function AdminDashboard() {
  const {
    config,
    updateScene,
    updateConfig,
    updateLocaleScene,
    updateLocaleFinalCta,
    updateLocaleDiscoverySigns,
    resetConfig,
    exportConfig,
    importConfig,
  } = useCinematicConfig();
  const { t } = useLocale();
  const [activeScene, setActiveScene] = useState<SceneType>('ocean');
  const [activeEditLocale, setActiveEditLocale] = useState<EditLocale>('en');
  const [toast, setToast] = useState('');
  const [backups, setBackups] = useState<BackupEntry[]>(() => loadBackupHistory());
  const fileRef = useRef<HTMLInputElement>(null);

  const baseScene = config.scenes[activeScene];
  const localeScene =
    activeEditLocale === 'en'
      ? baseScene
      : config.locales[activeEditLocale].scenes[activeScene];
  const localeFinalCta =
    activeEditLocale === 'en'
      ? config.finalCta
      : config.locales[activeEditLocale].finalCta;

  const localeDiscoverySigns: DiscoverySignCopy[] =
    activeEditLocale === 'en'
      ? config.discoverySigns.map(({ id, label, translation }) => ({ id, label, translation }))
      : config.locales[activeEditLocale].discoverySigns;

  const updateSceneCopy = (patch: Partial<SceneCopy>) => {
    if (activeEditLocale === 'en') {
      updateScene(activeScene, patch);
      return;
    }
    updateLocaleScene(activeEditLocale, activeScene, patch);
  };

  const updateFinalCtaCopy = (patch: Partial<FinalCta>) => {
    if (activeEditLocale === 'en') {
      updateConfig({ finalCta: { ...config.finalCta, ...patch } });
      return;
    }
    updateLocaleFinalCta(activeEditLocale, patch);
  };

  const updateDiscoverySignsCopy = (signs: DiscoverySignCopy[]) => {
    if (activeEditLocale === 'en') {
      updateConfig({
        discoverySigns: config.discoverySigns.map((sign) => {
          const copy = signs.find((item) => item.id === sign.id);
          return copy ? { ...sign, label: copy.label, translation: copy.translation } : sign;
        }),
      });
      return;
    }
    updateLocaleDiscoverySigns(activeEditLocale, signs);
  };

  const getSceneNavTitle = (id: SceneType) =>
    activeEditLocale === 'en'
      ? config.scenes[id].navTitle
      : config.locales[activeEditLocale].scenes[id].navTitle;

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleBackup = async () => {
    createBackup(config);
    downloadConfigBackup(config);
    const disk = await saveProjectConfigBackup(config);
    setBackups(loadBackupHistory());
    notify(disk.ok ? t('admin.backedUpDisk') : t('admin.backedUp'));
  };

  const handleRestoreBackup = (entry: BackupEntry) => {
    if (!confirm(`${formatBackupDate(entry.createdAt)} のバックアップを復元しますか？`)) return;
    const ok = importConfig(JSON.stringify(entry.config));
    notify(ok ? 'バックアップから復元しました' : '復元に失敗しました');
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importConfig(String(reader.result));
      notify(ok ? '設定をインポートしました' : 'インポートに失敗しました');
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <GTranLogo size={44} showLabel={false} />
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight">{t('admin.title')}</h1>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                Scene & Content Control
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <LanguageSelector />
            <a
              href="#/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-zinc-950 text-xs font-bold uppercase tracking-wide hover:bg-cyan-400 transition-colors"
            >
              <Eye className="w-4 h-4" />
              {t('admin.preview')}
            </a>
            <button
              onClick={handleBackup}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-cyan-500/30 bg-cyan-950/30 text-xs font-mono text-cyan-300 hover:bg-cyan-950/50"
            >
              <Archive className="w-3.5 h-3.5" />
              {t('admin.backup')}
            </button>
            <button
              onClick={() => {
                const blob = new Blob([exportConfig()], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'gtrans-cinematic-config.json';
                a.click();
                URL.revokeObjectURL(url);
                notify('設定をエクスポートしました');
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-700 text-xs font-mono text-zinc-300 hover:border-cyan-500/40"
            >
              <Download className="w-3.5 h-3.5" />
              {t('admin.exportJson')}
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-700 text-xs font-mono text-zinc-300 hover:border-cyan-500/40"
            >
              <Upload className="w-3.5 h-3.5" />
              {t('admin.importJson')}
            </button>
            <button
              onClick={() => {
                if (confirm('すべての設定を初期値に戻しますか？\n（現在の設定は自動バックアップされます）')) {
                  createBackup(config);
                  void saveProjectConfigBackup(config);
                  setBackups(loadBackupHistory());
                  resetConfig();
                  notify('初期設定にリセットしました（直前の設定は履歴に保存済み）');
                }
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-700 text-xs font-mono text-zinc-400 hover:text-rose-400 hover:border-rose-500/30"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImport(file);
                e.target.value = '';
              }}
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Scene list */}
        <aside className="lg:col-span-4 xl:col-span-3">
          <div className="glass-panel rounded-2xl p-4 border border-zinc-800">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-800">
              <Film className="w-4 h-4 text-cyan-400" />
              <span className="font-display text-sm font-semibold">シーン一覧</span>
            </div>
            <div className="flex flex-col gap-1">
              {SCENE_ORDER.map((id) => {
                const s = config.scenes[id];
                const isActive = id === activeScene;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveScene(id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between gap-2 ${
                      isActive
                        ? 'bg-cyan-950/40 border border-cyan-500/30 text-white'
                        : 'text-zinc-400 hover:bg-zinc-900/60 border border-transparent'
                    }`}
                  >
                    <span className="truncate">
                      <span className="font-mono text-[10px] text-cyan-400 mr-2">{s.number}</span>
                      {getSceneNavTitle(id)}
                    </span>
                    <span
                      className={`shrink-0 w-2 h-2 rounded-full ${s.enabled ? 'bg-emerald-400' : 'bg-zinc-600'}`}
                      title={s.enabled ? '有効' : '無効'}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Global defaults */}
          <div className="glass-panel rounded-2xl p-4 border border-zinc-800 mt-4">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-800">
              <Settings2 className="w-4 h-4 text-violet-400" />
              <span className="font-display text-sm font-semibold">デフォルト設定</span>
            </div>
            <div className="space-y-3 text-sm">
              <label className="flex items-center justify-between">
                <span className="text-zinc-400 text-xs">パーティクル数</span>
                <select
                  value={config.defaults.particleCount}
                  onChange={(e) =>
                    updateConfig({
                      defaults: { ...config.defaults, particleCount: Number(e.target.value) },
                    })
                  }
                  className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs"
                >
                  <option value={400}>400</option>
                  <option value={750}>750</option>
                  <option value={1200}>1200</option>
                </select>
              </label>
              {(['interactiveMode', 'showDeveloperPanel'] as const).map((key) => (
                <label key={key} className="flex items-center justify-between">
                  <span className="text-zinc-400 text-xs">
                    {key === 'interactiveMode' ? 'インタラクティブ' : 'Lab パネル表示'}
                  </span>
                  <input
                    type="checkbox"
                    checked={config.defaults[key]}
                    onChange={(e) =>
                      updateConfig({
                        defaults: { ...config.defaults, [key]: e.target.checked },
                      })
                    }
                    className="accent-cyan-400"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-4 border border-zinc-800 mt-4">
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                <span className="font-display text-sm font-semibold">バックアップ履歴</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">最大 10 件</span>
            </div>
            {backups.length === 0 ? (
              <p className="text-xs text-zinc-500 leading-relaxed">
                履歴はありません。「バックアップ」で JSON ファイルの保存と履歴登録を行います。
              </p>
            ) : (
              <ul className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                {backups.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800"
                  >
                    <span className="text-[11px] font-mono text-zinc-400 truncate">
                      {formatBackupDate(entry.createdAt)}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRestoreBackup(entry)}
                        className="px-2 py-1 text-[10px] font-mono uppercase rounded border border-zinc-700 text-zinc-300 hover:border-cyan-500/40 hover:text-cyan-300"
                      >
                        復元
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadConfigBackup(entry.config, `restore-${entry.id.slice(0, 8)}.json`)}
                        className="p-1 rounded border border-zinc-700 text-zinc-400 hover:text-zinc-200"
                        title="JSON をダウンロード"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('このバックアップ履歴を削除しますか？')) {
                            setBackups(removeBackup(entry.id));
                            notify('履歴を削除しました');
                          }
                        }}
                        className="p-1 rounded border border-zinc-700 text-zinc-500 hover:text-rose-400 hover:border-rose-500/30"
                        title="履歴から削除"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Scene editor */}
        <main className="lg:col-span-8 xl:col-span-9 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-zinc-800">
            <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-zinc-800">
              {EDIT_LOCALE_TABS.map(({ code, label }) => {
                const isActive = activeEditLocale === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setActiveEditLocale(code)}
                    className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                      isActive
                        ? 'bg-cyan-950/50 border border-cyan-500/40 text-cyan-300'
                        : 'border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest">
                  Scene {baseScene.number}
                </span>
                <h2 className="font-display text-2xl font-bold mt-1">{localeScene.navTitle}</h2>
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-400">
                <input
                  type="checkbox"
                  checked={baseScene.enabled}
                  onChange={(e) => updateScene(activeScene, { enabled: e.target.checked })}
                  className="accent-cyan-400"
                />
                シーンを有効化
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="ナビタイトル" value={localeScene.navTitle} onChange={(v) => updateSceneCopy({ navTitle: v })} />
              <Field label="Lab ラベル" value={localeScene.labLabel} onChange={(v) => updateSceneCopy({ labLabel: v })} />
              <Field label="バッジ" value={localeScene.badge} onChange={(v) => updateSceneCopy({ badge: v })} />
              <Field label="CTA ボタン" value={localeScene.ctaLabel ?? ''} onChange={(v) => updateSceneCopy({ ctaLabel: v })} />
              <Field label="タイトル" value={localeScene.title} onChange={(v) => updateSceneCopy({ title: v })} />
              <Field label="アクセント" value={localeScene.titleAccent ?? ''} onChange={(v) => updateSceneCopy({ titleAccent: v })} />
            </div>
            <div className="mt-4">
              <Field label="本文" value={localeScene.body} onChange={(v) => updateSceneCopy({ body: v })} multiline />
            </div>
          </div>

          {/* Final CTA (scene 09 related) */}
          {activeScene === 'future' && (
            <div className="glass-panel rounded-2xl p-6 border border-zinc-800">
              <h3 className="font-display text-lg font-semibold mb-4">
                最終 CTA
                <span className="ml-2 text-xs font-mono text-zinc-500 uppercase">
                  {EDIT_LOCALE_TABS.find((tab) => tab.code === activeEditLocale)?.label}
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="タグライン"
                  value={localeFinalCta.tagline}
                  onChange={(v) => updateFinalCtaCopy({ tagline: v })}
                />
                <Field
                  label="タイトル"
                  value={localeFinalCta.title}
                  onChange={(v) => updateFinalCtaCopy({ title: v })}
                />
                <Field
                  label="ダウンロードボタン"
                  value={localeFinalCta.downloadLabel}
                  onChange={(v) => updateFinalCtaCopy({ downloadLabel: v })}
                />
                <Field
                  label="リプレイボタン"
                  value={localeFinalCta.replayLabel}
                  onChange={(v) => updateFinalCtaCopy({ replayLabel: v })}
                />
              </div>
              <div className="mt-4">
                <Field
                  label="説明文"
                  value={localeFinalCta.description}
                  onChange={(v) => updateFinalCtaCopy({ description: v })}
                  multiline
                />
              </div>
            </div>
          )}

          {/* Interactive content editors */}
          {activeScene === 'work' && (
            <ContentListEditor
              title="ビジネス文書"
              items={config.workDocs}
              onChange={(workDocs) => updateConfig({ workDocs })}
              fields={['sender', 'original', 'translated']}
            />
          )}
          {activeScene === 'gaming' && (
            <>
              <div className="glass-panel rounded-2xl p-6 border border-zinc-800">
                <h3 className="font-display text-lg font-semibold mb-4">発言翻訳デモ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="翻訳先言語"
                    value={config.gamingUtterance.targetLanguage}
                    onChange={(v) =>
                      updateConfig({ gamingUtterance: { ...config.gamingUtterance, targetLanguage: v } })
                    }
                  />
                  <Field
                    label="サンプル入力"
                    value={config.gamingUtterance.sampleInput}
                    onChange={(v) =>
                      updateConfig({ gamingUtterance: { ...config.gamingUtterance, sampleInput: v } })
                    }
                    multiline
                  />
                </div>
                <div className="mt-4">
                  <Field
                    label="翻訳結果（クリップボード）"
                    value={config.gamingUtterance.sampleTranslated}
                    onChange={(v) =>
                      updateConfig({ gamingUtterance: { ...config.gamingUtterance, sampleTranslated: v } })
                    }
                    multiline
                  />
                </div>
              </div>
              <ContentListEditor
                title="ゲームチャット"
                items={config.chatMessages}
                onChange={(chatMessages) => updateConfig({ chatMessages })}
                fields={['username', 'lang', 'original', 'translated']}
              />
            </>
          )}
          {activeScene === 'discovery' && (
            <ContentListEditor
              title="街の看板"
              items={localeDiscoverySigns}
              onChange={(items) => updateDiscoverySignsCopy(items)}
              fields={['label', 'translation']}
            />
          )}
          {activeScene === 'connection' && (
            <ContentListEditor
              title="グローバル接続"
              items={config.globalPings}
              onChange={(globalPings) => updateConfig({ globalPings })}
              fields={['from', 'to', 'message', 'speed']}
            />
          )}

          <p className="text-[10px] font-mono text-zinc-600 flex items-center gap-2">
            <Save className="w-3 h-3" />
            変更は自動保存されます（localStorage）
          </p>
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900 border border-cyan-500/30 text-sm px-4 py-2 rounded-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}

function ContentListEditor<T extends object>({
  title,
  items,
  onChange,
  fields,
}: {
  title: string;
  items: T[];
  onChange: (items: T[]) => void;
  fields: (keyof T & string)[];
}) {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-zinc-800">
      <h3 className="font-display text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={String((item as Record<string, unknown>).id ?? idx)} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-2">
            {fields.map((fieldName) => (
              <div key={fieldName}>
                <Field
                  label={fieldName}
                  value={String((item as Record<string, unknown>)[fieldName] ?? '')}
                  onChange={(v) => {
                    const next = [...items];
                    next[idx] = { ...next[idx], [fieldName]: v };
                    onChange(next);
                  }}
                  multiline={fieldName === 'original' || fieldName === 'translated' || fieldName === 'message'}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
