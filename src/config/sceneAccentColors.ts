/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SceneType } from '../types';

export interface SceneAccentTheme {
  text: string;
  textSoft: string;
  titleAccent: string;
  bodyCopy?: string;
  border: string;
  borderActive: string;
  borderSubtle: string;
  borderStrong: string;
  bg: string;
  bgSoft: string;
  bgStrong: string;
  shadow: string;
  decoration: string;
  hoverBg: string;
  hoverShadow: string;
  badgePill: string;
  badgePillCompact: string;
  signCardActive: string;
  routeBtnActive: string;
  panelBorder: string;
  latencyBadge: string;
  docPanelActive: string;
  docPanelHover: string;
  docTypeBadge: string;
  hex: string;
  particleColors: string[];
}

/** One distinct accent hue per scene — no repeats across the film. */
export const SCENE_ACCENT: Record<SceneType, SceneAccentTheme> = {
  ocean: {
    text: 'text-sky-300',
    textSoft: 'text-sky-200',
    titleAccent: 'text-sky-300',
    border: 'border-sky-400/30',
    borderActive: 'border-sky-300',
    borderSubtle: 'border-sky-400/20',
    borderStrong: 'border-sky-700/30',
    bg: 'bg-sky-950/20',
    bgSoft: 'bg-sky-950/10',
    bgStrong: 'bg-sky-950/40',
    shadow: 'shadow-sky-400/10',
    decoration: 'decoration-sky-300',
    hoverBg: 'hover:bg-sky-300',
    hoverShadow: 'hover:shadow-sky-300/20',
    badgePill:
      'px-3 py-1 mb-6 text-[10px] font-mono tracking-[0.25em] text-sky-200 border border-sky-400/30 rounded-full bg-sky-950/20 uppercase',
    badgePillCompact:
      'px-3 py-1 mb-4 text-[10px] font-mono tracking-[0.25em] text-sky-200 border border-sky-400/30 rounded-full bg-sky-950/20 uppercase inline-block',
    signCardActive: 'border-sky-300 bg-sky-950/20 scale-102 shadow-lg shadow-sky-400/10',
    routeBtnActive: 'border-sky-300 bg-sky-950/20 text-white',
    panelBorder: 'border-sky-400/20',
    latencyBadge: 'bg-sky-950/40 text-sky-300 border border-sky-700/30',
    docPanelActive: 'border-sky-400/30',
    docPanelHover: 'hover:border-sky-400/20',
    docTypeBadge: 'bg-sky-950/40 border border-sky-700/30 text-sky-300',
    hex: '#7dd3fc',
    particleColors: ['#E0F2FE', '#BAE6FD', '#7DD3FC', '#38BDF8', '#0EA5E9'],
  },
  barrier: {
    text: 'text-orange-400',
    textSoft: 'text-orange-300',
    titleAccent: 'text-orange-400 line-through',
    bodyCopy: 'text-orange-200/85 font-light leading-relaxed',
    border: 'border-orange-500/30',
    borderActive: 'border-orange-400',
    borderSubtle: 'border-orange-500/20',
    borderStrong: 'border-orange-800/30',
    bg: 'bg-orange-950/20',
    bgSoft: 'bg-orange-950/10',
    bgStrong: 'bg-orange-950/40',
    shadow: 'shadow-orange-500/10',
    decoration: 'decoration-orange-400',
    hoverBg: 'hover:bg-orange-400',
    hoverShadow: 'hover:shadow-orange-400/20',
    badgePill:
      'px-3 py-1 mb-6 text-[10px] font-mono tracking-[0.25em] text-orange-300 border border-orange-500/30 rounded-full bg-orange-950/20 uppercase',
    badgePillCompact:
      'px-3 py-1 mb-4 text-[10px] font-mono tracking-[0.25em] text-orange-300 border border-orange-500/30 rounded-full bg-orange-950/20 uppercase inline-block',
    signCardActive: 'border-orange-400 bg-orange-950/20 scale-102 shadow-lg shadow-orange-500/10',
    routeBtnActive: 'border-orange-400 bg-orange-950/20 text-white',
    panelBorder: 'border-orange-500/20',
    latencyBadge: 'bg-orange-950/40 text-orange-400 border border-orange-800/30',
    docPanelActive: 'border-orange-500/30',
    docPanelHover: 'hover:border-orange-500/20',
    docTypeBadge: 'bg-orange-950/40 border border-orange-800/30 text-orange-400',
    hex: '#f97316',
    particleColors: ['#FFEDD5', '#FED7AA', '#FB923C', '#F97316', '#EA580C'],
  },
  breakthrough: {
    text: 'text-blue-400',
    textSoft: 'text-blue-300',
    titleAccent: 'text-blue-400',
    border: 'border-blue-500/30',
    borderActive: 'border-blue-400',
    borderSubtle: 'border-blue-500/20',
    borderStrong: 'border-blue-800/30',
    bg: 'bg-blue-950/20',
    bgSoft: 'bg-blue-950/10',
    bgStrong: 'bg-blue-950/40',
    shadow: 'shadow-blue-500/10',
    decoration: 'decoration-blue-400',
    hoverBg: 'hover:bg-blue-400',
    hoverShadow: 'hover:shadow-blue-400/20',
    badgePill:
      'px-3 py-1 mb-6 text-[10px] font-mono tracking-[0.25em] text-blue-300 border border-blue-500/30 rounded-full bg-blue-950/20',
    badgePillCompact:
      'px-3 py-1 mb-4 text-[10px] font-mono tracking-[0.25em] text-blue-300 border border-blue-500/30 rounded-full bg-blue-950/20 inline-block',
    signCardActive: 'border-blue-400 bg-blue-950/20 scale-102 shadow-lg shadow-blue-500/10',
    routeBtnActive: 'border-blue-400 bg-blue-950/20 text-white',
    panelBorder: 'border-blue-500/20',
    latencyBadge: 'bg-blue-950/40 text-blue-400 border border-blue-800/30',
    docPanelActive: 'border-blue-500/30',
    docPanelHover: 'hover:border-blue-500/20',
    docTypeBadge: 'bg-blue-950/40 border border-blue-800/30 text-blue-400',
    hex: '#3b82f6',
    particleColors: ['#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB'],
  },
  work: {
    text: 'text-emerald-400',
    textSoft: 'text-emerald-300',
    titleAccent: 'text-emerald-400',
    border: 'border-emerald-500/30',
    borderActive: 'border-emerald-400',
    borderSubtle: 'border-emerald-500/20',
    borderStrong: 'border-emerald-800/30',
    bg: 'bg-emerald-950/20',
    bgSoft: 'bg-emerald-950/10',
    bgStrong: 'bg-emerald-950/40',
    shadow: 'shadow-emerald-500/10',
    decoration: 'decoration-emerald-400',
    hoverBg: 'hover:bg-emerald-400',
    hoverShadow: 'hover:shadow-emerald-400/20',
    badgePill:
      'px-3 py-1 mb-4 text-[10px] font-mono tracking-[0.25em] text-emerald-300 border border-emerald-500/30 rounded-full bg-emerald-950/20 uppercase',
    badgePillCompact:
      'px-3 py-1 mb-4 text-[10px] font-mono tracking-[0.25em] text-emerald-300 border border-emerald-500/30 rounded-full bg-emerald-950/20 uppercase inline-block',
    signCardActive: 'border-emerald-400 bg-emerald-950/20 scale-102 shadow-lg shadow-emerald-500/10',
    routeBtnActive: 'border-emerald-400 bg-emerald-950/20 text-white',
    panelBorder: 'border-emerald-500/20',
    latencyBadge: 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/30',
    docPanelActive: 'border-emerald-500/30',
    docPanelHover: 'hover:border-emerald-500/20',
    docTypeBadge: 'bg-emerald-950/40 border border-emerald-800/30 text-emerald-400',
    hex: '#34d399',
    particleColors: ['#A7F3D0', '#6EE7B7', '#34D399', '#10B981', '#059669'],
  },
  gaming: {
    text: 'text-violet-400',
    textSoft: 'text-violet-300',
    titleAccent: 'text-violet-400',
    border: 'border-violet-500/30',
    borderActive: 'border-violet-400',
    borderSubtle: 'border-violet-500/20',
    borderStrong: 'border-violet-800/30',
    bg: 'bg-violet-950/20',
    bgSoft: 'bg-violet-950/10',
    bgStrong: 'bg-violet-950/40',
    shadow: 'shadow-violet-500/10',
    decoration: 'decoration-violet-400',
    hoverBg: 'hover:bg-violet-400',
    hoverShadow: 'hover:shadow-violet-400/20',
    badgePill:
      'px-3 py-1 mb-4 text-[10px] font-mono tracking-[0.25em] text-violet-300 border border-violet-500/30 rounded-full bg-violet-950/20 uppercase inline-block',
    badgePillCompact:
      'px-3 py-1 mb-4 text-[10px] font-mono tracking-[0.25em] text-violet-300 border border-violet-500/30 rounded-full bg-violet-950/20 uppercase inline-block',
    signCardActive: 'border-violet-400 bg-violet-950/20 scale-102 shadow-lg shadow-violet-500/10',
    routeBtnActive: 'border-violet-400 bg-violet-950/20 text-white',
    panelBorder: 'border-violet-500/20',
    latencyBadge: 'bg-violet-950/40 text-violet-400 border border-violet-800/30',
    docPanelActive: 'border-violet-500/30',
    docPanelHover: 'hover:border-violet-500/20',
    docTypeBadge: 'bg-violet-950/40 border border-violet-800/30 text-violet-400',
    hex: '#a78bfa',
    particleColors: ['#DDD6FE', '#C4B5FD', '#A78BFA', '#8B5CF6', '#7C3AED'],
  },
  discovery: {
    text: 'text-yellow-400',
    textSoft: 'text-yellow-300',
    titleAccent: 'text-yellow-400',
    bodyCopy: 'text-yellow-200/85 font-light leading-relaxed',
    border: 'border-yellow-400/30',
    borderActive: 'border-yellow-400',
    borderSubtle: 'border-yellow-400/20',
    borderStrong: 'border-yellow-700/30',
    bg: 'bg-yellow-950/20',
    bgSoft: 'bg-yellow-950/10',
    bgStrong: 'bg-yellow-950/40',
    shadow: 'shadow-yellow-400/10',
    decoration: 'decoration-yellow-400',
    hoverBg: 'hover:bg-yellow-400',
    hoverShadow: 'hover:shadow-yellow-400/20',
    badgePill:
      'px-3 py-1 mb-4 text-[10px] font-mono tracking-[0.25em] text-yellow-300 border border-yellow-400/30 rounded-full bg-yellow-950/20 uppercase inline-block',
    badgePillCompact:
      'px-3 py-1 mb-4 text-[10px] font-mono tracking-[0.25em] text-yellow-300 border border-yellow-400/30 rounded-full bg-yellow-950/20 uppercase inline-block',
    signCardActive: 'border-yellow-400 bg-yellow-950/20 scale-102 shadow-lg shadow-yellow-400/10',
    routeBtnActive: 'border-yellow-400 bg-yellow-950/20 text-white',
    panelBorder: 'border-yellow-400/20',
    latencyBadge: 'bg-yellow-950/40 text-yellow-400 border border-yellow-700/30',
    docPanelActive: 'border-yellow-400/30',
    docPanelHover: 'hover:border-yellow-400/20',
    docTypeBadge: 'bg-yellow-950/40 border border-yellow-700/30 text-yellow-400',
    hex: '#facc15',
    particleColors: ['#FEFCE8', '#FEF9C3', '#FEF08A', '#FACC15', '#EAB308'],
  },
  voice: {
    text: 'text-sky-300',
    textSoft: 'text-sky-200',
    titleAccent: 'text-sky-300 font-extrabold',
    border: 'border-sky-400/30',
    borderActive: 'border-sky-300',
    borderSubtle: 'border-sky-400/20',
    borderStrong: 'border-sky-700/30',
    bg: 'bg-sky-950/20',
    bgSoft: 'bg-sky-950/10',
    bgStrong: 'bg-sky-950/40',
    shadow: 'shadow-sky-400/10',
    decoration: 'decoration-sky-300',
    hoverBg: 'hover:bg-sky-300',
    hoverShadow: 'hover:shadow-sky-300/20',
    badgePill:
      'px-3 py-1 mb-6 text-[10px] font-mono tracking-[0.25em] text-sky-200 border border-sky-400/30 rounded-full bg-sky-950/20 uppercase',
    badgePillCompact:
      'px-3 py-1 mb-4 text-[10px] font-mono tracking-[0.25em] text-sky-200 border border-sky-400/30 rounded-full bg-sky-950/20 uppercase inline-block',
    signCardActive: 'border-sky-300 bg-sky-950/20 scale-102 shadow-lg shadow-sky-400/10',
    routeBtnActive: 'border-sky-300 bg-sky-950/20 text-white',
    panelBorder: 'border-sky-400/20',
    latencyBadge: 'bg-sky-950/40 text-sky-300 border border-sky-700/30',
    docPanelActive: 'border-sky-400/30',
    docPanelHover: 'hover:border-sky-400/20',
    docTypeBadge: 'bg-sky-950/40 border border-sky-700/30 text-sky-300',
    hex: '#7dd3fc',
    particleColors: ['#E0F2FE', '#BAE6FD', '#7DD3FC', '#38BDF8', '#0EA5E9'],
  },
  connection: {
    text: 'text-indigo-400',
    textSoft: 'text-indigo-300',
    titleAccent: 'text-indigo-400',
    border: 'border-indigo-500/30',
    borderActive: 'border-indigo-400',
    borderSubtle: 'border-indigo-500/20',
    borderStrong: 'border-indigo-800/30',
    bg: 'bg-indigo-950/20',
    bgSoft: 'bg-indigo-950/10',
    bgStrong: 'bg-indigo-950/40',
    shadow: 'shadow-indigo-500/10',
    decoration: 'decoration-indigo-400',
    hoverBg: 'hover:bg-indigo-400',
    hoverShadow: 'hover:shadow-indigo-400/20',
    badgePill:
      'px-3 py-1 mb-4 text-[10px] font-mono tracking-[0.25em] text-indigo-300 border border-indigo-500/30 rounded-full bg-indigo-950/20 uppercase inline-block',
    badgePillCompact:
      'px-3 py-1 mb-4 text-[10px] font-mono tracking-[0.25em] text-indigo-300 border border-indigo-500/30 rounded-full bg-indigo-950/20 uppercase inline-block',
    signCardActive: 'border-indigo-400 bg-indigo-950/20 scale-102 shadow-lg shadow-indigo-500/10',
    routeBtnActive: 'border-indigo-400 bg-indigo-950/20 text-white',
    panelBorder: 'border-indigo-500/20',
    latencyBadge: 'bg-indigo-950/40 text-indigo-400 border border-indigo-800/30',
    docPanelActive: 'border-indigo-500/30',
    docPanelHover: 'hover:border-indigo-500/20',
    docTypeBadge: 'bg-indigo-950/40 border border-indigo-800/30 text-indigo-400',
    hex: '#818cf8',
    particleColors: ['#C7D2FE', '#A5B4FC', '#818CF8', '#6366F1', '#4F46E5'],
  },
  future: {
    text: 'text-blue-600',
    textSoft: 'text-blue-500',
    titleAccent: 'text-blue-700 underline decoration-blue-500 decoration-2',
    border: 'border-blue-400/40',
    borderActive: 'border-blue-500',
    borderSubtle: 'border-blue-400/25',
    borderStrong: 'border-blue-700/30',
    bg: 'bg-blue-50/80',
    bgSoft: 'bg-blue-50/60',
    bgStrong: 'bg-blue-100/80',
    shadow: 'shadow-blue-500/10',
    decoration: 'decoration-blue-500',
    hoverBg: 'hover:bg-blue-600',
    hoverShadow: 'hover:shadow-blue-500/20',
    badgePill:
      'px-3 py-1 mb-6 text-[10px] font-mono tracking-[0.25em] text-blue-600 border border-blue-300/50 rounded-full bg-blue-50/80 uppercase',
    badgePillCompact:
      'px-3 py-1 mb-4 text-[10px] font-mono tracking-[0.25em] text-blue-600 border border-blue-300/50 rounded-full bg-blue-50/80 uppercase inline-block',
    signCardActive: 'border-blue-500 bg-blue-50/90 scale-102 shadow-lg shadow-blue-500/10',
    routeBtnActive: 'border-blue-500 bg-blue-50/90 text-zinc-900',
    panelBorder: 'border-blue-400/25',
    latencyBadge: 'bg-blue-50/90 text-blue-700 border border-blue-300/50',
    docPanelActive: 'border-blue-400/35',
    docPanelHover: 'hover:border-blue-400/25',
    docTypeBadge: 'bg-blue-50/90 border border-blue-300/50 text-blue-700',
    hex: '#2563eb',
    particleColors: ['#EF4444', '#3B82F6', '#FACC15', '#22C55E', '#A855F7', '#38BDF8'],
  },
};

export function getSceneAccent(scene: SceneType): SceneAccentTheme {
  return SCENE_ACCENT[scene];
}
