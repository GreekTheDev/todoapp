import React, { useState, useEffect } from 'react';
import './App.css';
import './styles/global.css';
import Sidebar from './components/Sidebar/Sidebar';
import TaskList from './components/TaskList/TaskList';
import { TaskProvider } from './context/TaskContext';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth <= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // Ładowanie ustawień aplikacji przy starcie
  useEffect(() => {
    const loadAppSettings = () => {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        // Zastosuj czcionkę
        if (settings.font) {
          document.documentElement.style.setProperty('--font-family', settings.font);
        }
        
        // Zastosuj motyw kolorystyczny
        if (settings.accentColor) {
          const colorThemes = [
            { id: 'blue', primary: '#4a6fa5', secondary: '#6fb3b8' },
            { id: 'green', primary: '#2a9d8f', secondary: '#57cc99' },
            { id: 'purple', primary: '#8338ec', secondary: '#c77dff' },
            { id: 'red', primary: '#e63946', secondary: '#ff758f' },
            { id: 'orange', primary: '#fb8500', secondary: '#ffb703' },
            { id: 'gray', primary: '#7d7d7d', secondary: '#b0b0b0' },
            { id: 'pink', primary: '#ff69b4', secondary: '#ffb6c1' },
            { id: 'gold', primary: '#ffd700', secondary: '#ffdf00' }
          ];
          
          const selectedTheme = colorThemes.find(theme => theme.id === settings.accentColor);
          if (selectedTheme) {
            document.documentElement.style.setProperty('--primary-color', selectedTheme.primary);
            document.documentElement.style.setProperty('--secondary-color', selectedTheme.secondary);
          }
        }
      }
    };
    
    loadAppSettings();
  }, []);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <ThemeProvider>
      <UserProvider>
        <LanguageProvider>
          <TaskProvider>
            <div className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
              <Sidebar 
                isCollapsed={isSidebarCollapsed} 
                setIsCollapsed={setIsSidebarCollapsed} 
                isMobile={isMobile}
              />
              <main className="content">
                <TaskList />
              </main>
            </div>
          </TaskProvider>
        </LanguageProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
