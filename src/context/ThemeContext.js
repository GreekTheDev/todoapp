import React, { createContext, useState, useEffect, useMemo } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [font, setFont] = useState('Poppins');
  const [accentColor, setAccentColor] = useState('blue');

  // Predefiniowane motywy kolorystyczne - używamy useMemo, aby uniknąć tworzenia nowej tablicy przy każdym renderowaniu
  const colorThemes = useMemo(() => [
    { id: 'blue', primary: '#4a6fa5', secondary: '#6fb3b8' },
    { id: 'green', primary: '#2a9d8f', secondary: '#57cc99' },
    { id: 'purple', primary: '#8338ec', secondary: '#c77dff' },
    { id: 'red', primary: '#e63946', secondary: '#ff758f' },
    { id: 'orange', primary: '#fb8500', secondary: '#ffb703' }
  ], []);

  useEffect(() => {
    // Ładowanie motywu
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Ładowanie ustawień
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      
      // Ustawienie czcionki
      if (settings.font) {
        setFont(settings.font);
        document.documentElement.style.setProperty('--font-family', settings.font);
      }
      
      // Ustawienie koloru akcentującego
      if (settings.accentColor) {
        setAccentColor(settings.accentColor);
        const selectedTheme = colorThemes.find(theme => theme.id === settings.accentColor);
        if (selectedTheme) {
          document.documentElement.style.setProperty('--primary-color', selectedTheme.primary);
          document.documentElement.style.setProperty('--secondary-color', selectedTheme.secondary);
        }
      }
    }
  }, [colorThemes]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  const changeFont = (newFont) => {
    setFont(newFont);
    document.documentElement.style.setProperty('--font-family', newFont);
    
    // Aktualizacja ustawień w localStorage
    const savedSettings = localStorage.getItem('appSettings');
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    settings.font = newFont;
    localStorage.setItem('appSettings', JSON.stringify(settings));
  };

  const changeAccentColor = (newColor) => {
    setAccentColor(newColor);
    const selectedTheme = colorThemes.find(theme => theme.id === newColor);
    if (selectedTheme) {
      document.documentElement.style.setProperty('--primary-color', selectedTheme.primary);
      document.documentElement.style.setProperty('--secondary-color', selectedTheme.secondary);
    }
    
    // Aktualizacja ustawień w localStorage
    const savedSettings = localStorage.getItem('appSettings');
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    settings.accentColor = newColor;
    localStorage.setItem('appSettings', JSON.stringify(settings));
  };

  return (
    <ThemeContext.Provider value={{ 
      darkMode, 
      toggleTheme, 
      font, 
      changeFont, 
      accentColor, 
      changeAccentColor,
      colorThemes
    }}>
      {children}
    </ThemeContext.Provider>
  );
};