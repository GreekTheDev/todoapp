import { useState, useEffect } from 'react';
import { Project } from '../types/types';
import '../styles/Sidebar.css';

interface SidebarProps {
  projects: Project[];
  activeProject: string;
  setActiveProject: (projectId: string) => void;
  addProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  toggleSettings: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Sidebar = ({ 
  projects, 
  activeProject, 
  setActiveProject, 
  addProject, 
  deleteProject,
  toggleSettings,
  darkMode,
  toggleDarkMode
}: SidebarProps) => {
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Sprawdzanie, czy urządzenie jest mobilne
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Sprawdź przy pierwszym renderowaniu
    checkIfMobile();
    
    // Nasłuchuj na zmiany rozmiaru okna
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      const newProject: Project = {
        id: Date.now().toString(),
        name: newProjectName,
        color: getRandomColor(),
      };
      addProject(newProject);
      setNewProjectName('');
      setIsAddingProject(false);
    }
  };

  const getRandomColor = () => {
    const colors = [
      '#246fe0', // niebieski
      '#eb8909', // pomarańczowy
      '#a970ff', // fioletowy
      '#25b84c', // zielony
      '#e44747', // czerwony
      '#f9a825', // żółty
      '#16a5a5', // turkusowy
      '#9e9e9e', // szary
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Funkcja do zamykania menu po kliknięciu w projekt
  const handleProjectClick = (projectId: string) => {
    setActiveProject(projectId);
    setIsMobileMenuOpen(false);
  };

  // Obsługa kliknięcia poza menu, aby je zamknąć
  const handleBackdropClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Przycisk menu mobilnego - widoczny tylko na urządzeniach mobilnych */}
      {isMobile && (
        <button 
          className="mobile-menu-toggle" 
          onClick={toggleMobileMenu} 
          aria-label="Menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      )}
      
      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo">
          <h1>ToDo App</h1>
          
          {/* Przycisk zwijania/rozwijania sidebara - widoczny tylko na desktopie */}
          {!isMobile && (
            <button 
              className="sidebar-toggle" 
              onClick={toggleSidebar} 
              aria-label={isSidebarCollapsed ? "Rozwiń menu" : "Zwiń menu"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isSidebarCollapsed ? (
                  // Ikona rozwijania (strzałka w prawo)
                  <>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </>
                ) : (
                  // Ikona zwijania (strzałka w lewo)
                  <>
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </>
                )}
              </svg>
            </button>
          )}
        </div>
        
        <div className="sidebar-header">
          <h2>Projekty</h2>
        </div>
        
        <nav className="sidebar-nav">
          <ul className="project-list">
            {projects.map(project => (
              <li 
                key={project.id}
                className={`project-item ${activeProject === project.id ? 'active' : ''}`}
                onClick={() => handleProjectClick(project.id)}
              >
                <div className="project-color" style={{ backgroundColor: project.color }}></div>
                <span className="project-name">{project.name}</span>
                {project.id !== 'inbox' && project.id !== 'completed' && (
                  <button 
                    className="project-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(project.id);
                    }}
                    aria-label="Usuń projekt"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          {isAddingProject ? (
            <div className="add-project-form">
              <input
                type="text"
                placeholder="Nazwa projektu"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                autoFocus
              />
              <div className="add-project-actions">
                <button 
                  className="add-project-button"
                  onClick={handleAddProject}
                >
                  Dodaj
                </button>
                <button 
                  className="cancel-button"
                  onClick={() => {
                    setIsAddingProject(false);
                    setNewProjectName('');
                  }}
                >
                  Anuluj
                </button>
              </div>
            </div>
          ) : (
            <button 
              className="add-project-trigger"
              onClick={() => setIsAddingProject(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Dodaj projekt
            </button>
          )}
          
          <div className="sidebar-user-actions">
            <button className="sidebar-action-button" aria-label="Profil użytkownika">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Profil</span>
            </button>
            
            <button 
              className="sidebar-action-button" 
              onClick={toggleDarkMode} 
              aria-label={darkMode ? "Tryb jasny" : "Tryb ciemny"}
            >
              {darkMode ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                  <span>Tryb jasny</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                  <span>Tryb ciemny</span>
                </>
              )}
            </button>
            
            <button 
              className="sidebar-action-button" 
              onClick={toggleSettings}
              aria-label="Ustawienia"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              <span>Ustawienia</span>
            </button>
          </div>
        </div>
      </aside>
      
      {/* Backdrop do zamykania menu po kliknięciu poza nim */}
      <div 
        className={`sidebar-backdrop ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={handleBackdropClick}
      ></div>
    </>
  );
};

export default Sidebar;