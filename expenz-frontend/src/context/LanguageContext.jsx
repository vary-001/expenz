// src/context/LanguageContext.jsx
import React, { createContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();

  const changeLanguage = useCallback((lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('expenz_language', lng);
  }, [i18n]);

  return (
    <LanguageContext.Provider value={{ language: i18n.language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};