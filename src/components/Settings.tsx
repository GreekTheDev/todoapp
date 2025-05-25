import { useState } from 'react';
import { AppSettings } from '../types/types';
import '../styles/Settings.css';

interface SettingsProps {
  settings: AppSettings;
  updateSettings: (settings: AppSettings) => void;
  closeSettings: () => void;
}

const Settings = ({ settings, updateSettings, closeSettings }: SettingsProps) => {
  const [language, setLanguage] = useState<'pl' | 'en'>(settings.language);
  const [darkMode, setDarkMode] = useState<boolean>(settings.darkMode);

  const handleSaveSettings = () => {
    updateSettings({
      language,
      darkMode
    });
    closeSettings();
  };

  return (
    <div className="settings-overlay">
      <div className="settings-container">
        <div className="settings-header">
          <h2>Ustawienia</h2>
          <button 
            className="close-settings-button"
            onClick={closeSettings}
            aria-label="Zamknij ustawienia"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="settings-content">
          <div className="settings-section">
            <h3>Język</h3>
            <div className="settings-option">
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value as 'pl' | 'en')}
              >
                <option value="pl">Polski</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
          
          <div className="settings-section">
            <h3>Wygląd</h3>
            <div className="settings-option">
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">Tryb ciemny</span>
              </label>
            </div>
          </div>
          
          <div className="settings-section">
            <h3>O aplikacji</h3>
            <p className="app-info">
              ToDo App v1.0.0<br />
              Prosta aplikacja do zarządzania zadaniami
            </p>
          </div>
        </div>
        
        <div className="settings-footer">
          <button 
            className="save-settings-button"
            onClick={handleSaveSettings}
          >
            Zapisz ustawienia
          </button>
          <button 
            className="cancel-button"
            onClick={closeSettings}
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;