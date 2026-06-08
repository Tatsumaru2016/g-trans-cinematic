/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useLocale } from '../context/LocaleContext';

export const LanguageSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { locale, setLocale, supportedLocales, t } = useLocale();

  return (
    <select
      className={`bg-zinc-900/60 border border-zinc-800 text-zinc-400 font-mono text-[10px] uppercase tracking-wide px-2 py-1.5 rounded-lg cursor-pointer hover:text-cyan-400 hover:border-cyan-500/30 transition-all ${className}`}
      value={locale}
      aria-label={t('common.language')}
      onChange={(e) => setLocale(e.target.value as typeof locale)}
    >
      {supportedLocales.map((item) => (
        <option key={item.code} value={item.code}>
          {item.label}
        </option>
      ))}
    </select>
  );
};
