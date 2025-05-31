import React, { createContext, useState, useEffect, useContext } from 'react';
import { translations } from '../translations';

// Tworzenie kontekstu
export const LanguageContext = createContext();

// Hook do łatwego dostępu do tłumaczeń
export const useTranslation = () => {
  const { language, t } = useContext(LanguageContext);
  return { language, t };
};

export const LanguageProvider = ({ children }) => {
  // Domyślny język to polski
  const [language, setLanguage] = useState('pl');
  
  // Ładowanie zapisanego języka
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.language) {
        setLanguage(settings.language);
      }
    }
  }, []);
  
  // Funkcja do zmiany języka
  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    
    // Aktualizacja ustawień w localStorage
    const savedSettings = localStorage.getItem('appSettings');
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    settings.language = newLanguage;
    localStorage.setItem('appSettings', JSON.stringify(settings));
  };
  
  // Funkcja do pobierania tłumaczeń
  const t = (key) => {
    // Jeśli klucz nie istnieje w wybranym języku, użyj polskiego jako fallback
    return translations[language]?.[key] || translations.pl[key] || key;
  };
  
  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};