/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  type AppLocale,
  isAppLocale,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  type MessageCatalog,
} from '../i18n/types';
import { messages } from '../i18n/messages';
import { translate } from '../i18n/translate';

function detectLocale(): AppLocale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && isAppLocale(stored)) {
      return stored;
    }
  } catch {
    // ignore
  }

  const nav = navigator.language.toLowerCase();
  if (nav.startsWith('ja')) return 'ja';
  if (nav.startsWith('ko')) return 'ko';
  if (nav.startsWith('zh')) return 'zh';
  return 'en';
}

interface LocaleContextValue {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  catalog: MessageCatalog;
  supportedLocales: typeof SUPPORTED_LOCALES;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(() => detectLocale());

  const setLocale = useCallback((next: AppLocale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const catalog = messages[locale];

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(catalog, key, params),
    [catalog],
  );

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = catalog.meta.title;

    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', catalog.meta.description);
    }
  }, [locale, catalog.meta.title, catalog.meta.description]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      catalog,
      supportedLocales: SUPPORTED_LOCALES,
    }),
    [locale, setLocale, t, catalog],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return ctx;
}
