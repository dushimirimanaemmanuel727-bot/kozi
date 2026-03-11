'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Lang, t } from '@/lib/i18n';

interface LanguageContextType {
  language: Lang;
  setLanguage: (lang: Lang) => void;
  translate: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'kazi-home-language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Lang>(() => {
    // Initialize with saved language or browser language
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Lang;
      if (savedLanguage && ['en', 'rw', 'fr'].includes(savedLanguage)) {
        return savedLanguage;
      }
      const browserLang = navigator.language.split('-')[0] as Lang;
      if (['en', 'rw', 'fr'].includes(browserLang)) {
        return browserLang;
      }
    }
    return 'en';
  });

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Lang;
      if (savedLanguage && ['en', 'rw', 'fr'].includes(savedLanguage) && savedLanguage !== language) {
        setLanguageState(savedLanguage);
      }
    }
  }, [language]);

  const setLanguage = (lang: Lang) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  const translate = (key: string) => {
    return t(key, language);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
