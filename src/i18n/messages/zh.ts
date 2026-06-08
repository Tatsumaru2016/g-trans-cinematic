/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { defaultLocaleTranslations, sceneCopyToMessages } from '../../config/defaultLocaleTranslations';
import type { MessageCatalog } from '../types';

const localeBundle = defaultLocaleTranslations.zh;

export const zh: MessageCatalog = {
  meta: {
    title: 'G.trans | 电影式体验',
    description: 'G.trans 电影式体验 — 无缝全球沟通',
  },
  common: {
    manage: '管理',
    closeLab: '关闭 Lab',
    cinematicLab: 'Cinematic Lab',
    soundOn: '声音: 开',
    soundOff: '声音: 关',
    bgmOn: 'BGM: 开',
    bgmOff: 'BGM: 关',
    sfxOn: '音效: 开',
    sfxOff: '音效: 关',
    prev: '← 上一页',
    next: '下一页 →',
    goToScene: '前往场景 {n}',
    scrollHint: '滚动或点击下一页继续',
    sceneLabel: '场景 {n}',
    latency: '延迟: 4ms',
    downloadAlert: '感谢下载 G.trans 客户端！正在启动安装包（72.4MB）。',
    language: '语言',
  },
  logo: {
    sublabel: 'Translation tool',
  },
  toolbar: {
    sectionLabel: 'G.trans 工具栏',
    clickToDemo: 'Click to Demo',
    rangeTranslation: '范围翻译',
    utteranceTranslation: '发言翻译',
  },
  utterance: {
    panelTitle: '发言翻译 → {language}',
    placeholder: '输入想说的话...',
    copiedToClipboard: '已复制到剪贴板',
    clickToSend: 'Click to Send',
    sendMessage: '发送消息',
    closePanel: '关闭发言面板',
  },
  gaming: {
    tacticalSync: 'Tactical Translation Sync',
    realtimeSpeed: 'REALTIME CLIENT SPEED: 0.003s',
    chatPlaceholder: '输入消息（英语、日语、韩语、西班牙语...）',
    liveServer: 'Live Server Lobby // Raid Room B',
    online: '98,241 ONLINE',
    playerUsername: 'You_The_Player',
  },
  voice: {
    listening: '正在分析语音频率...',
    processing: '正在解密语音向量并翻译...',
    doneQuote: '「你好，世界各地的朋友，让我们无摩擦地一起创造美好。」',
    reset: '重置模拟',
    offline: '语音模拟器离线',
  },
  discovery: {
    hoverHint: '悬停看板以翻译',
  },
  connection: {
    syncActive: 'GLOBAL SYNC ACTIVE',
  },
  finalCta: { ...localeBundle.finalCta },
  lab: {
    title: 'Cinematic Lab',
    liveGpu: 'LIVE GPU',
    storyChapters: '故事章节',
    particleDensity: '粒子密度',
    interactiveOrbit: '交互轨道',
    bgm: 'BGM',
    bgmHint: '分场景环境音',
    sfx: '音效',
    sfxHint: 'UI、演示与转场音',
    audioEngine: '音频引擎',
    audioHint: '自动合成声波',
  },
  admin: {
    title: '电影式管理',
    backToFilm: '返回影片',
    save: '保存',
    backup: '备份',
    restore: '恢复',
    exportJson: '导出 JSON',
    importJson: '导入 JSON',
    resetDefaults: '恢复默认',
    sceneEditor: '场景编辑',
    preview: '预览',
    saved: '设置已保存',
    backedUp: '已创建备份',
    backedUpDisk: '已保存备份（下载 + backups/ 文件夹）',
    restored: '备份已恢复',
    imported: '配置已导入',
    resetDone: '已恢复默认设置',
  },
  scenes: sceneCopyToMessages(localeBundle.scenes),
};
