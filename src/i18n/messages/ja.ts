/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { defaultLocaleTranslations, sceneCopyToMessages } from '../../config/defaultLocaleTranslations';
import type { MessageCatalog } from '../types';

const localeBundle = defaultLocaleTranslations.ja;

export const ja: MessageCatalog = {
  meta: {
    title: 'G.trans | シネマティック体験',
    description: 'G.trans シネマティック体験 — シームレスなグローバルコミュニケーション',
  },
  common: {
    manage: '管理',
    closeLab: 'Labを閉じる',
    cinematicLab: 'Cinematic Lab',
    soundOn: 'サウンド: ON',
    soundOff: 'サウンド: OFF',
    bgmOn: 'BGM: ON',
    bgmOff: 'BGM: OFF',
    sfxOn: '効果音: ON',
    sfxOff: '効果音: OFF',
    prev: '← 前へ',
    next: '次へ →',
    goToScene: 'シーン {n} へ',
    scrollHint: 'スクロールまたは「次へ」で進む',
    sceneLabel: 'シーン {n}',
    latency: 'レイテンシ: 4ms',
    downloadAlert:
      'G.trans クライアントのダウンロードありがとうございます。セットアップパッケージ（72.4MB）を開始します。',
    language: '言語',
  },
  logo: {
    sublabel: 'Translation tool',
  },
  loading: {
    title: 'G.trans',
    status: 'シネマティック体験を準備しています…',
    progressLabel: 'Loading',
  },
  toolbar: {
    sectionLabel: 'G.trans ツールバー',
    clickToDemo: 'Click to Demo',
    rangeTranslation: '範囲翻訳',
    utteranceTranslation: '発言翻訳',
  },
  utterance: {
    panelTitle: '発言翻訳 → {language}',
    placeholder: '伝えたい内容を入力...',
    copiedToClipboard: 'クリップボードにコピーしました',
    clickToSend: 'Click to Send',
    sendMessage: 'メッセージを送信',
    closePanel: '発言パネルを閉じる',
  },
  gaming: {
    tacticalSync: 'Tactical Translation Sync',
    realtimeSpeed: 'REALTIME CLIENT SPEED: 0.003s',
    chatPlaceholder: 'メッセージを入力（日本語、英語、韓国語、スペイン語...）',
    liveServer: 'Live Server Lobby // Raid Room B',
    online: '98,241 ONLINE',
    playerUsername: 'You_The_Player',
  },
  voice: {
    listening: '音声周波数を解析中...',
    processing: '音声ベクトルを復号・翻訳中...',
    doneQuote:
      '「こんにちは、世界の友よ。摩擦なく、共に美しいものを創りましょう。」',
    reset: 'シミュレーションをリセット',
    offline: '音声シミュレーター オフライン',
  },
  discovery: {
    hoverHint: '各機能をクリックしてください。',
  },
  connection: {
    syncActive: 'GLOBAL SYNC ACTIVE',
  },
  finalCta: { ...localeBundle.finalCta },
  lab: {
    title: 'Cinematic Lab',
    liveGpu: 'LIVE GPU',
    storyChapters: 'ストーリーチャプター',
    particleDensity: 'パーティクル密度',
    interactiveOrbit: 'インタラクティブ軌道',
    bgm: 'BGM',
    bgmHint: 'シーン別アンビエント',
    sfx: '効果音',
    sfxHint: 'UI・デモ・遷移音',
    audioEngine: 'オーディオエンジン',
    audioHint: '自動合成サウンドウェーブ',
  },
  admin: {
    title: 'シネマティック管理',
    backToFilm: 'フィルムに戻る',
    save: '保存',
    backup: 'バックアップ',
    restore: '復元',
    exportJson: 'JSONエクスポート',
    importJson: 'JSONインポート',
    resetDefaults: '初期値に戻す',
    sceneEditor: 'シーン編集',
    preview: 'プレビュー',
    saved: '設定を保存しました',
    backedUp: 'バックアップを作成しました',
    backedUpDisk: 'バックアップを保存しました（ダウンロード + backups/ フォルダ）',
    restored: 'バックアップを復元しました',
    imported: '設定をインポートしました',
    resetDone: '初期値に戻しました',
  },
  scenes: sceneCopyToMessages(localeBundle.scenes),
};
