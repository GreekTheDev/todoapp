import React, { useContext, useState } from 'react';
import { TaskContext, PROJECT_COLORS } from '../../context/TaskContext';
import { ThemeContext } from '../../context/ThemeContext';
import { UserContext } from '../../context/UserContext';
import { LanguageContext } from '../../context/LanguageContext';
import Button from '../UI/Button';
import DeleteProjectModal from './DeleteProjectModal';
import ProfileModal from '../Profile/ProfileModal';
import SettingsModal from '../Settings/SettingsModal';
import { FiUser, FiSettings, FiMoon, FiSun, FiPlus, FiChevronLeft, FiMenu } from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobile }) => {
  const { 
    projects, 
    activeProject, 
    setActiveProject, 
    addProject, 
    deleteProject,
    tasks
  } = useContext(TaskContext);
  
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const { isAuthenticated } = useContext(UserContext);
  const { t } = useContext(LanguageContext);
  
  const [newProjectName, setNewProjectName] = useState('');
  const [showAddProject, setShowAddProject] = useState(false);
  const [projectColor, setProjectColor] = useState(PROJECT_COLORS[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [animateAddButton, setAnimateAddButton] = useState(false);
  const [wasAutoExpanded, setWasAutoExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Flaga do śledzenia, czy użytkownik ręcznie zwinął sidebar

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    
    // Jeśli sidebar jest zwijany, ukryj formularz dodawania projektu
    if (!isCollapsed) {
      setShowAddProject(false);
      setShowColorPicker(false);
    }
  };
  
  // Funkcja do obsługi kliknięcia w logo na desktopie
  const handleLogoClick = () => {
    if (isCollapsed && !isMobile) {
      toggleSidebar();
    }
  };
  
  // Usunięto efekt automatycznego pokazywania formularza po rozwinięciu sidebara
  
  // Efekt do obsługi klawisza Escape
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showAddProject) {
        setShowAddProject(false);
        setShowColorPicker(false);
        
        // Jeśli panel został automatycznie rozwinięty, zwiń go z powrotem
        if (wasAutoExpanded) {
          setTimeout(() => {
            setIsCollapsed(true);
            setWasAutoExpanded(false);
          }, 300);
        }
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showAddProject, wasAutoExpanded, setIsCollapsed]);

  const handleAddProject = (e) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      // Ograniczenie długości tytułu projektu do 20 znaków
      const trimmedName = newProjectName.trim().slice(0, 20);
      addProject(trimmedName, null, 'color', projectColor);
      setNewProjectName('');
      setShowAddProject(false);
      setShowColorPicker(false);
      setWasAutoExpanded(false); // Resetuj flagę po dodaniu projektu
      // Resetuj wartości do domyślnych
      setProjectColor(PROJECT_COLORS[0]);
    }
  };
  
  const handleColorClick = () => {
    setShowColorPicker(!showColorPicker);
  };
  
  const handleColorSelect = (color) => {
    setProjectColor(color);
    setShowColorPicker(false);
  };

  const handleDeleteProject = (e, projectId) => {
    e.stopPropagation();
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setProjectToDelete(project);
      setShowDeleteModal(true);
    }
  };
  
  const confirmDeleteProject = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };
  
  // Funkcja zliczająca zadania w projekcie
  const countTasksInProject = (projectId) => {
    if (projectId === 'all') {
      return tasks.length;
    } else if (projectId === 'completed') {
      return tasks.filter(task => task.completed).length;
    } else {
      return tasks.filter(task => task.projectId === projectId).length;
    }
  };

  // Sprawdź, czy istnieje projekt "ukończone zadania", jeśli nie - dodaj go
  React.useEffect(() => {
    const completedProject = projects.find(p => p.id === 'completed');
    if (!completedProject) {
      addProject(t('taskCompleted'), 'completed', 'color', '#06D6A0');
    }
  }, [projects, addProject, t]);

  return (
    <>
      {/* Modal potwierdzenia usunięcia projektu */}
      <DeleteProjectModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteProject}
        projectName={projectToDelete?.name || ''}
      />
      
      {/* Modal profilu użytkownika */}
      <ProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
      
      {/* Modal ustawień */}
      <SettingsModal 
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
      
      {isMobile && (
        <button 
          className="sidebar-toggle mobile-toggle mobile-hamburger"
          onClick={toggleSidebar}
          aria-label={isCollapsed ? t("expand") : t("collapse")}
        >
          {isCollapsed ? <FiMenu /> : <FiChevronLeft />}
        </button>
      )}
      {isMobile && !isCollapsed && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="app-branding">
          <img 
            src="https://s3.us-east-1.amazonaws.com/files-greekthedev.click/dodotodo-images/DoDoToDo+Logo.png" 
            alt="Logo aplikacji DoDoToDo" 
            className={`app-logo ${isCollapsed && !isMobile ? 'clickable' : ''}`}
            width="40"
            height="40"
            loading="eager"
            onClick={handleLogoClick}
            style={{ cursor: isCollapsed && !isMobile ? 'pointer' : 'default' }}
          />
          <h1 className="app-title">DoDoToDo</h1>
        </div>
        
        {!isMobile && !isCollapsed && (
          <button 
            className="sidebar-toggle desktop-toggle"
            onClick={toggleSidebar}
            aria-label={t("collapse")}
          >
            <FiChevronLeft />
          </button>
        )}
      </div>

      
      
      <nav className="sidebar-nav">
        {/* Domyślne sekcje */}
        <ul className="sidebar-list default-sections">
          {projects
            .filter(project => project.id === 'inbox' || project.id === 'all')
            .map(project => (
              <li 
                key={project.id}
                className={`sidebar-item ${activeProject === project.id ? 'active' : ''}`}
                onClick={() => setActiveProject(project.id)}
              >
                <span 
                  className="sidebar-item-color" 
                  style={{ backgroundColor: project.color || PROJECT_COLORS[0] }}
                ></span>
                <span className="sidebar-item-name">{project.name}</span>
                <span className="sidebar-item-count">{countTasksInProject(project.id)}</span>
              </li>
            ))
          }
        </ul>

        <hr className="sidebar-divider" />

        {/* Projekty użytkownika */}
        <div className="sidebar-section projects-section">
          <div className="sidebar-section-header">
            <h2 className="sidebar-section-title">{t('projects')}</h2>
            <Button 
              variant="text" 
              size="small"
              className={`add-project-icon-button ${animateAddButton ? 'animate-pulse' : ''}`}
              onClick={() => {
                // Rozwiń sidebar jeśli jest zwinięty
                if (isCollapsed) {
                  setIsCollapsed(false);
                  setWasAutoExpanded(true); // Zapamiętaj, że panel został automatycznie rozwinięty
                  // Animuj przycisk dodawania projektu
                  setTimeout(() => {
                    setAnimateAddButton(true);
                    setTimeout(() => setAnimateAddButton(false), 600);
                    // Opóźnij pokazanie formularza, aby sidebar zdążył się rozwinąć
                    setShowAddProject(true);
                  }, 300);
                } else {
                  setWasAutoExpanded(false); // Panel był już rozwinięty
                  // Animuj przycisk dodawania projektu
                  setAnimateAddButton(true);
                  setTimeout(() => setAnimateAddButton(false), 600);
                  setShowAddProject(true);
                }
              }}
              aria-label={t('addProject')}
            >
              <FiPlus />
            </Button>
          </div>
          
          {showAddProject && (
            <form className="add-project-form" onSubmit={handleAddProject}>
              <div className="project-form-container">
                <div 
                  className="project-color-preview-container"
                  onClick={handleColorClick}
                >
                  <span 
                    className="project-color-preview" 
                    style={{ backgroundColor: projectColor }}
                  ></span>
                </div>
                
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder={t('projectName')}
                  maxLength={20}
                  autoFocus
                  className="project-name-input"
                />
              </div>
              
              {showColorPicker && (
                <div className="color-picker">
                  {PROJECT_COLORS.map((color, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`color-option ${projectColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorSelect(color)}
                      aria-label={`Kolor ${index + 1}`}
                    />
                  ))}
                </div>
              )}
              
              <div className="add-project-actions">
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="small"
                  disabled={!newProjectName.trim()}
                >
                  {t('addProjectButton')}
                </Button>
                <Button 
                  type="button" 
                  variant="text" 
                  size="small"
                  onClick={() => {
                    setShowAddProject(false);
                    // Jeśli panel został automatycznie rozwinięty, zwiń go z powrotem po anulowaniu
                    if (wasAutoExpanded) {
                      setTimeout(() => {
                        setIsCollapsed(true);
                        setWasAutoExpanded(false);
                      }, 300); // Opóźnienie, aby formularz zdążył się schować
                    }
                  }}
                >
                  {t('cancelButton')}
                </Button>
                
              </div>
            </form>
          )}
          
          <div className="projects-list-container">
            <ul className="sidebar-list projects-list">
              {projects
                .filter(project => project.id !== 'inbox' && project.id !== 'all' && project.id !== 'completed')
                .map(project => (
                  <li 
                    key={project.id}
                    className={`sidebar-item ${activeProject === project.id ? 'active' : ''}`}
                    onClick={() => setActiveProject(project.id)}
                  >
                    <span 
                      className="sidebar-item-color" 
                      style={{ backgroundColor: project.color || PROJECT_COLORS[0] }}
                    ></span>
                    <span className="sidebar-item-name">{project.name}</span>
                    <div className="sidebar-item-actions">
                      <span className="sidebar-item-count">{countTasksInProject(project.id)}</span>
                      <button 
                        className="sidebar-item-delete"
                        onClick={(e) => handleDeleteProject(e, project.id)}
                        aria-label={t('deleteProject')}
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))
              }
            </ul>
          </div>
        </div>
        
        
{/* Ukończone zadania */}
        <ul className="sidebar-list align-bottom">
          {projects
            .filter(project => project.id === 'completed')
            .map(project => (
              <li 
                key={project.id}
                className={`sidebar-item ${activeProject === project.id ? 'active' : ''}`}
                onClick={() => setActiveProject(project.id)}
              >
                <span 
                  className="sidebar-item-color" 
                  style={{ backgroundColor: project.color || PROJECT_COLORS[0] }}
                ></span>
                <span className="sidebar-item-name">{project.name}</span>
                <span className="sidebar-item-count">{countTasksInProject(project.id)}</span>
              </li>
            ))
          }
        </ul>

        
        
        


      
        
        <hr className="sidebar-divider" />
        
        <div className="sidebar-footer">
          <Button 
            variant="icon" 
            size="small"
            className="sidebar-footer-button"
            onClick={() => setShowProfileModal(true)}
            aria-label={t('profile')}
          >
            <FiUser />
            {isAuthenticated && <span className="profile-indicator"></span>}
          </Button>
          
          <Button 
            variant="icon" 
            size="small"
            className="sidebar-footer-button"
            onClick={toggleTheme}
            aria-label={darkMode ? t('lightMode') : t('darkMode')}
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </Button>
          
          <Button 
            variant="icon" 
            size="small"
            className="sidebar-footer-button"
            onClick={() => setShowSettingsModal(true)}
            aria-label={t('settings')}
          >
            <FiSettings />
          </Button>
        </div>
      </nav>
      </aside>
    </>
  );
};

export default Sidebar;