import React, { useContext, useState } from 'react';
import { TaskContext, PROJECT_COLORS } from '../../context/TaskContext';
import { ThemeContext } from '../../context/ThemeContext';
import Button from '../UI/Button';
import { FiUser, FiSettings, FiMoon, FiSun, FiPlus, FiChevronLeft, FiMenu } from 'react-icons/fi';
import './Sidebar.css';

// Dostępne ikony dla projektów
const PROJECT_ICONS = [
  { value: '/images/icons/folder.svg', label: 'Folder' },
  { value: '/images/icons/briefcase.svg', label: 'Teczka' },
  { value: '/images/icons/calendar.svg', label: 'Kalendarz' },
  { value: '/images/icons/book.svg', label: 'Książka' },
  { value: '/images/icons/star.svg', label: 'Gwiazda' },
  { value: '/images/icons/heart.svg', label: 'Serce' },
  { value: '/images/icons/flag.svg', label: 'Flaga' },
  { value: '/images/icons/target.svg', label: 'Cel' },
  { value: '/images/icons/home.svg', label: 'Dom' },
  { value: '/images/icons/coffee.svg', label: 'Kawa' },
  { value: '/images/icons/code.svg', label: 'Kod' },
  { value: '/images/icons/file-text.svg', label: 'Dokument' },
  { value: '/images/icons/shopping-cart.svg', label: 'Zakupy' },
  { value: '/images/icons/gift.svg', label: 'Prezent' },
  { value: '/images/icons/map.svg', label: 'Mapa' },
  { value: '/images/icons/music.svg', label: 'Muzyka' },
  { value: '/images/icons/film.svg', label: 'Film' },
  { value: '/images/icons/users.svg', label: 'Użytkownicy' },
  { value: '/images/icons/zap.svg', label: 'Błyskawica' },
  { value: '/images/icons/award.svg', label: 'Nagroda' },
  { value: '/images/icons/bookmark.svg', label: 'Zakładka' }
];

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobile }) => {
  const { 
    projects, 
    activeProject, 
    setActiveProject, 
    addProject, 
    deleteProject 
  } = useContext(TaskContext);
  
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const [newProjectName, setNewProjectName] = useState('');
  const [showAddProject, setShowAddProject] = useState(false);
  const [projectIconType, setProjectIconType] = useState('color');
  const [projectIconColor, setProjectIconColor] = useState(PROJECT_COLORS[0]);
  const [projectIconImage, setProjectIconImage] = useState(PROJECT_ICONS[0].value);
  
  // Flaga do śledzenia, czy użytkownik ręcznie zwinął sidebar

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  // Funkcja do obsługi kliknięcia w logo na desktopie
  const handleLogoClick = () => {
    if (isCollapsed && !isMobile) {
      toggleSidebar();
    }
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      const iconValue = projectIconType === 'color' ? projectIconColor : projectIconImage;
      addProject(newProjectName, null, projectIconType, iconValue);
      setNewProjectName('');
      setShowAddProject(false);
      // Resetuj wartości do domyślnych
      setProjectIconType('color');
      setProjectIconColor(PROJECT_COLORS[0]);
      setProjectIconImage(PROJECT_ICONS[0].value);
    }
  };

  const handleDeleteProject = (e, projectId) => {
    e.stopPropagation();
    if (window.confirm('Czy na pewno chcesz usunąć ten projekt?')) {
      deleteProject(projectId);
    }
  };

  // Sprawdź, czy istnieje projekt "ukończone zadania", jeśli nie - dodaj go
  React.useEffect(() => {
    const completedProject = projects.find(p => p.id === 'completed');
    if (!completedProject) {
      addProject('Ukończone zadania', 'completed', 'icon', '/images/icons/check-circle.svg');
    }
  }, [projects, addProject]);

  return (
    <>
      {isMobile && (
        <button 
          className="sidebar-toggle mobile-toggle mobile-hamburger"
          onClick={toggleSidebar}
          aria-label={isCollapsed ? "Rozwiń sidebar" : "Zwiń sidebar"}
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
          <img 
            src="https://s3.us-east-1.amazonaws.com/files-greekthedev.click/dodotodo-images/DoDoToDo+Logo+Tick.png" 
            alt="Logo aplikacji DoDoToDo" 
            className="app-logo-mobile" 
            width="32"
            height="32"
            loading="eager"
          />
        </div>
        
        {!isMobile && !isCollapsed && (
          <button 
            className="sidebar-toggle desktop-toggle"
            onClick={toggleSidebar}
            aria-label="Zwiń sidebar"
          >
            <FiChevronLeft />
          </button>
        )}
        
        {/* Przycisk hamburger został przeniesiony poza sidebar */}
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
                {project.icon && (
                  <img 
                    src={project.icon} 
                    alt="" 
                    className="sidebar-item-icon"
                    width="20"
                    height="20"
                  />
                )}
                <span className="sidebar-item-name">{project.name}</span>
              </li>
            ))
          }
        </ul>

        <hr className="sidebar-divider" />

        {/* Projekty użytkownika */}
        <div className="sidebar-section projects-section">
          <div className="sidebar-section-header">
            <h2 className="sidebar-section-title">Projekty</h2>
            <Button 
              variant="text" 
              size="small"
              className="add-project-icon-button"
              onClick={() => setShowAddProject(true)}
              aria-label="Dodaj projekt"
            >
              <FiPlus />
            </Button>
          </div>
          
          {showAddProject && (
            <form className="add-project-form" onSubmit={handleAddProject}>
              <div className="project-form-container">
                <div className="project-icon-preview">
                  {projectIconType === 'color' ? (
                    <span 
                      className="project-color-preview" 
                      style={{ backgroundColor: projectIconColor }}
                    ></span>
                  ) : (
                    <img 
                      src={projectIconImage} 
                      alt="" 
                      className="project-icon-preview-img"
                    />
                  )}
                </div>
                
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Nazwa projektu"
                  autoFocus
                  className="project-name-input"
                />
              </div>
              
              <div className="project-icon-selector">
                <div className="icon-type-selector">
                  <label className={`icon-type-option ${projectIconType === 'color' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="iconType"
                      value="color"
                      checked={projectIconType === 'color'}
                      onChange={() => setProjectIconType('color')}
                    />
                    <span>Kolor</span>
                  </label>
                  <label className={`icon-type-option ${projectIconType === 'icon' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="iconType"
                      value="icon"
                      checked={projectIconType === 'icon'}
                      onChange={() => setProjectIconType('icon')}
                    />
                    <span>Ikona</span>
                  </label>
                </div>
                
                {projectIconType === 'color' ? (
                  <div className="color-picker">
                    {PROJECT_COLORS.map((color, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`color-option ${projectIconColor === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setProjectIconColor(color)}
                        aria-label={`Kolor ${index + 1}`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="icon-picker">
                    <div className="icon-grid">
                      {PROJECT_ICONS.map((icon, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`icon-option ${projectIconImage === icon.value ? 'selected' : ''}`}
                          onClick={() => setProjectIconImage(icon.value)}
                          aria-label={icon.label}
                        >
                          <img src={icon.value} alt={icon.label} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="add-project-actions">
                <Button 
                  type="button" 
                  variant="text" 
                  size="small"
                  onClick={() => setShowAddProject(false)}
                >
                  Anuluj
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="small"
                >
                  Dodaj
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
                    {project.icon ? (
                      <img 
                        src={project.icon} 
                        alt="" 
                        className="sidebar-item-icon"
                        width="20"
                        height="20"
                      />
                    ) : (
                      <span 
                        className="sidebar-item-color" 
                        style={{ backgroundColor: project.color || PROJECT_COLORS[0] }}
                      ></span>
                    )}
                    <span className="sidebar-item-name">{project.name}</span>
                    <button 
                      className="sidebar-item-delete"
                      onClick={(e) => handleDeleteProject(e, project.id)}
                      aria-label="Usuń projekt"
                    >
                      ×
                    </button>
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
                {project.icon && (
                  <img 
                    src={project.icon} 
                    alt="" 
                    className="sidebar-item-icon"
                    width="20"
                    height="20"
                  />
                )}
                <span className="sidebar-item-name">{project.name}</span>
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
            aria-label="Profil"
          >
            <FiUser />
          </Button>
          
          <Button 
            variant="icon" 
            size="small"
            className="sidebar-footer-button"
            onClick={toggleTheme}
            aria-label={darkMode ? 'Tryb jasny' : 'Tryb ciemny'}
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </Button>
          
          <Button 
            variant="icon" 
            size="small"
            className="sidebar-footer-button"
            aria-label="Ustawienia"
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