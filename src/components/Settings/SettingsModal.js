import React, { useState, useContext, useEffect } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { UserContext } from '../../context/UserContext';
import { LanguageContext } from '../../context/LanguageContext';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import { FiMonitor, FiGlobe, FiCheck } from 'react-icons/fi';
import { languages } from '../../translations';
import './SettingsModal.css';

const SettingsModal = ({ isOpen, onClose }) => {
  const { darkMode, toggleTheme, font, changeFont, accentColor, changeAccentColor } = useContext(ThemeContext);
  const { user, isAuthenticated, updateUserData } = useContext(UserContext);
  const { language, changeLanguage, t } = useContext(LanguageContext);
  
  // Stan dla aktywnej zakładki
  const [activeTab, setActiveTab] = useState('appearance');
  
  // Stany dla ustawień
  const [settings, setSettings] = useState({
    // Wygląd
    font: font || 'Poppins',
    accentColor: accentColor || 'blue',
    
    // Język
    language: language || 'pl'
  });
  
  // Predefiniowane motywy kolorystyczne
  const colorThemes = [
    { id: 'blue', primary: '#4a6fa5', secondary: '#6fb3b8' },
    { id: 'green', primary: '#2a9d8f', secondary: '#57cc99' },
    { id: 'purple', primary: '#8338ec', secondary: '#c77dff' },
    { id: 'red', primary: '#e63946', secondary: '#ff758f' },
    { id: 'orange', primary: '#fb8500', secondary: '#ffb703' }
  ];
  
  // Dostępne czcionki
  const fonts = [
    { id: 'Poppins', name: 'Poppins' },
    { id: 'Roboto', name: 'Roboto' },
    { id: 'Oswald', name: 'Oswald' },
    { id: 'Montserrat', name: 'Montserrat' },
    { id: 'Open Sans', name: 'Open Sans' },
    { id: 'Lato', name: 'Lato' },
    { id: 'Raleway', name: 'Raleway' },
    { id: 'Nunito', name: 'Nunito' },
    { id: 'Playfair Display', name: 'Playfair Display' },
    { id: 'Source Sans Pro', name: 'Source Sans Pro' }
  ];
  
  // Ładowanie zapisanych ustawień
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    // Jeśli użytkownik jest zalogowany, pobierz jego ustawienia
    if (isAuthenticated && user && user.settings) {
      setSettings(prev => ({
        ...prev,
        ...user.settings
      }));
    }
  }, [isAuthenticated, user]);
  
  // Ustawienia są stosowane natychmiast przy zmianie
  
  // Zapisywanie ustawień
  const saveSettings = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    // Jeśli użytkownik jest zalogowany, zapisz ustawienia w jego profilu
    if (isAuthenticated) {
      updateUserData({ settings });
    }
  };
  
  // Obsługa zmiany ustawień
  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    
    // Zastosuj zmiany natychmiast
    if (setting === 'font') {
      changeFont(value);
    } else if (setting === 'accentColor') {
      changeAccentColor(value);
    } else if (setting === 'language') {
      changeLanguage(value);
    }
  };
  
  // Obsługa zamknięcia modalu
  const handleClose = () => {
    saveSettings();
    onClose();
  };
  
  // Renderowanie zakładki wyglądu
  const renderAppearanceTab = () => (
    <div className="settings-tab-content">
      <div className="settings-section">
        <h3 className="settings-section-title">{t('colorTheme')}</h3>
        <div className="settings-option">
          <label>{t('darkMode')}</label>
          <div className="toggle-switch">
            <input 
              type="checkbox" 
              id="dark-mode-toggle" 
              checked={darkMode} 
              onChange={toggleTheme} 
            />
            <label htmlFor="dark-mode-toggle"></label>
          </div>
        </div>
        
        <div className="settings-option">
          <label>{t('colorTheme')}</label>
          <div className="color-themes-container">
            {colorThemes.map(theme => (
              <button
                key={theme.id}
                className={`color-theme-option ${settings.accentColor === theme.id ? 'selected' : ''}`}
                style={{ backgroundColor: theme.primary }}
                onClick={() => handleSettingChange('accentColor', theme.id)}
                aria-label={`${t('colorTheme')} ${t(theme.id)}`}
                title={t(theme.id)}
              />
            ))}
          </div>
        </div>
        
        <div className="settings-option">
          <label htmlFor="font-family">{t('font')}</label>
          <select 
            id="font-family" 
            value={settings.font} 
            onChange={(e) => handleSettingChange('font', e.target.value)}
            className="font-select"
          >
            {fonts.map(font => (
              <option 
                key={font.id} 
                value={font.id} 
                style={{ fontFamily: font.id }}
                className="font-option"
              >
                {font.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
  
  // Renderowanie zakładki języka
  const renderLanguageTab = () => (
    <div className="settings-tab-content">
      <div className="settings-section">
        <h3 className="settings-section-title">{t('language')}</h3>
        
        <div className="settings-option">
          <label htmlFor="language">{t('appLanguage')}</label>
          <select 
            id="language" 
            value={settings.language} 
            onChange={(e) => handleSettingChange('language', e.target.value)}
            className="language-select"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        
        <p className="settings-description">
          {t('languageDescription')}
        </p>
      </div>
    </div>
  );
  
  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="settings-modal">
      <div className="settings-container">
        <div className="settings-sidebar">
          <button 
            className={`settings-tab ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            <FiMonitor className="settings-tab-icon" />
            <span className="settings-tab-text">{t('appearance')}</span>
          </button>
          
          <button 
            className={`settings-tab ${activeTab === 'language' ? 'active' : ''}`}
            onClick={() => setActiveTab('language')}
          >
            <FiGlobe className="settings-tab-icon" />
            <span className="settings-tab-text">{t('language')}</span>
          </button>
        </div>
        
        <div className="settings-content">
          <h2 className="settings-title">
            {activeTab === 'appearance' && t('appearance')}
            {activeTab === 'language' && t('languageSettings')}
          </h2>
          
          {activeTab === 'appearance' && renderAppearanceTab()}
          {activeTab === 'language' && renderLanguageTab()}
          
          <div className="settings-actions">
            <Button variant="primary" onClick={handleClose}>
              <FiCheck className="button-icon" />
              {t('saveSettings')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;