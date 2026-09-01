import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../i18n/translations/en';
import { ar } from '../i18n/translations/ar';
import { api } from '../services/api';

const translations = { en, ar };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // Read saved language from localStorage or default to 'en'
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('restaurantos_language') || 'en';
  });

  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const isRTL = direction === 'rtl';

  // Synchronize document attributes on language change
  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
    localStorage.setItem('restaurantos_language', language);
  }, [language, direction]);

  // Language setter with optional backend synchronization
  const setLanguage = async (newLang, staffId = null) => {
    if (!['en', 'ar'].includes(newLang)) return;
    setLanguageState(newLang);
    localStorage.setItem('restaurantos_language', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;

    // Persist to backend staff profile if staff ID is provided
    if (staffId) {
      try {
        await api.updateStaffLanguage(staffId, newLang);
      } catch (err) {
        console.error('Failed to sync language with staff profile:', err);
      }
    }
  };

  // Translation lookup function supporting nested keys (e.g. t('nav.pos_terminal'))
  const t = (path, params = {}) => {
    if (!path) return '';
    const keys = path.split('.');
    let current = translations[language];

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback to English
        let fallback = translations.en;
        for (const fbKey of keys) {
          if (fallback && fallback[fbKey] !== undefined) {
            fallback = fallback[fbKey];
          } else {
            fallback = null;
            break;
          }
        }
        current = fallback || path;
        break;
      }
    }

    if (typeof current === 'string') {
      let result = current;
      Object.keys(params).forEach(pKey => {
        result = result.replace(new RegExp(`{{${pKey}}}`, 'g'), params[pKey]);
      });
      return result;
    }

    return current || path;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, isRTL, setLanguage, t }}>
      <div dir={direction} className={isRTL ? 'font-arabic' : 'font-sans'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
