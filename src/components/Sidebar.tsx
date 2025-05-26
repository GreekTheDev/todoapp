import { useState, useEffect, useRef } from 'react';
import { Project, Task } from '../types/types';
import '../styles/Sidebar.css';

interface SidebarProps {
  projects: Project[];
  activeProject: string;
  setActiveProject: (projectId: string) => void;
  addProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  updateProject: (project: Project) => void;
  reorderProjects: (projects: Project[]) => void;
  toggleSettings: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  tasks: Task[]; // Dodajemy zadania, aby móc zliczać aktywne zadania dla każdego projektu
}

const Sidebar = ({ 
  projects, 
  activeProject, 
  setActiveProject, 
  addProject, 
  deleteProject,
  updateProject,
  reorderProjects,
  toggleSettings,
  darkMode,
  toggleDarkMode,
  tasks
}: SidebarProps) => {
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Editing project states
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState('');
  const [editingProjectColor, setEditingProjectColor] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // Drag and drop states
  const [draggedProject, setDraggedProject] = useState<string | null>(null);
  const [dragOverProject, setDragOverProject] = useState<string | null>(null);
  
  // Menu kontekstowe
  const [showContextMenu, setShowContextMenu] = useState<string | null>(null);
  
  // Refs
  const editInputRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

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
  
  // Efekt do obsługi kliknięcia poza menu kontekstowym
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Zamknij menu kontekstowe, jeśli kliknięto poza nim
      if (showContextMenu && 
          !(e.target as Element).closest('.project-context-menu') && 
          !(e.target as Element).closest('.project-menu-trigger')) {
        setShowContextMenu(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showContextMenu]);

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
  
  // Funkcja do liczenia aktywnych zadań dla danego projektu
  const getActiveTaskCount = (projectId: string) => {
    if (projectId === 'all') {
      // Dla "Wszystkie zadania" zliczamy wszystkie aktywne zadania
      return tasks.filter(task => !task.completed).length;
    } else if (projectId === 'completed') {
      // Dla "Ukończone" zliczamy wszystkie ukończone zadania
      return tasks.filter(task => task.completed).length;
    } else {
      // Dla pozostałych projektów zliczamy tylko aktywne zadania przypisane do tego projektu
      return tasks.filter(task => task.projectId === projectId && !task.completed).length;
    }
  };
  
  // Funkcja decydująca, czy pokazać licznik zadań
  const shouldShowTaskCount = (projectId: string) => {
    // Nie pokazuj licznika dla ukończonych zadań
    if (projectId === 'completed') return false;
    
    // Nie pokazuj licznika, gdy liczba zadań wynosi 0
    const count = getActiveTaskCount(projectId);
    return count > 0;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSidebar = () => {
    // Jeśli zwijamy sidebar, a edytujemy projekt, anuluj edycję
    if (!isSidebarCollapsed && editingProjectId) {
      handleCancelProjectEdit();
    }
    
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Funkcja do zamykania menu po kliknięciu w projekt
  const handleProjectClick = (projectId: string) => {
    // Jeśli aktualnie edytujemy projekt, zapisz zmiany przed przełączeniem
    if (editingProjectId) {
      handleSaveProjectEdit();
    }
    setActiveProject(projectId);
    setIsMobileMenuOpen(false);
  };

  // Obsługa kliknięcia poza menu, aby je zamknąć
  const handleBackdropClick = () => {
    setIsMobileMenuOpen(false);
  };
  
  // Funkcje do obsługi menu kontekstowego
  const toggleContextMenu = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (showContextMenu === projectId) {
      setShowContextMenu(null);
    } else {
      setShowContextMenu(projectId);
    }
  };
  
  // Funkcja do duplikowania projektu
  const handleDuplicateProject = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    const newId = `project-${Date.now()}`;
    const duplicatedProject: Project = {
      id: newId,
      name: `${project.name} (kopia)`,
      color: project.color
    };
    addProject(duplicatedProject);
    setShowContextMenu(null);
  };
  
  // Funkcje do edycji projektu
  const handleEditProject = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Nie pozwalaj na edycję domyślnych projektów
    if (project.id === 'inbox' || project.id === 'completed' || project.id === 'all') return;
    
    // Nie pozwalaj na edycję, gdy sidebar jest zwinięty
    if (isSidebarCollapsed) {
      // Rozwiń sidebar przed edycją
      setIsSidebarCollapsed(false);
      // Opóźnij rozpoczęcie edycji, aby sidebar zdążył się rozwinąć
      setTimeout(() => {
        setEditingProjectId(project.id);
        setEditingProjectName(project.name);
        setEditingProjectColor(project.color);
        
        // Fokus na input po renderowaniu
        setTimeout(() => {
          if (editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
          }
        }, 10);
      }, 300);
      return;
    }
    
    setEditingProjectId(project.id);
    setEditingProjectName(project.name);
    setEditingProjectColor(project.color);
    setShowContextMenu(null);
    
    // Fokus na input po renderowaniu
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
        editInputRef.current.select();
      }
    }, 10);
  };
  
  const handleSaveProjectEdit = () => {
    if (editingProjectId && editingProjectName.trim()) {
      const updatedProject = projects.find(p => p.id === editingProjectId);
      if (updatedProject) {
        updateProject({
          ...updatedProject,
          name: editingProjectName,
          color: editingProjectColor
        });
      }
    }
    setEditingProjectId(null);
    setShowColorPicker(false);
  };
  
  const handleCancelProjectEdit = () => {
    setEditingProjectId(null);
    setShowColorPicker(false);
  };
  
  const handleColorSelect = (color: string) => {
    setEditingProjectColor(color);
    setShowColorPicker(false);
  };
  
  // Funkcje do obsługi drag and drop
  const handleDragStart = (projectId: string, e: React.DragEvent) => {
    // Nie pozwalaj na przeciąganie domyślnych projektów lub gdy sidebar jest zwinięty
    if (isSidebarCollapsed) {
      e.preventDefault();
      return;
    }
    
    setDraggedProject(projectId);
    // Dodaj przezroczystość do przeciąganego elementu
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.4';
    }
    
    // Ustaw dane dla operacji drag
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedProject(null);
    setDragOverProject(null);
    
    // Przywróć normalny wygląd
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };
  
  const handleDragOver = (projectId: string, e: React.DragEvent) => {
    e.preventDefault();
    
    // Nie rób nic, jeśli to ten sam projekt
    if (projectId === draggedProject) return;
    
    setDragOverProject(projectId);
  };
  
  const handleDragLeave = () => {
    setDragOverProject(null);
  };
  
  const handleDrop = (targetProjectId: string, e: React.DragEvent) => {
    e.preventDefault();
    
    // Nie rób nic, jeśli to ten sam projekt
    if (targetProjectId === draggedProject || !draggedProject) return;
    
    // Znajdź indeksy projektów
    const customProjects = projects.filter(p => p.id !== 'inbox' && p.id !== 'all' && p.id !== 'completed');
    const draggedIndex = customProjects.findIndex(p => p.id === draggedProject);
    const targetIndex = customProjects.findIndex(p => p.id === targetProjectId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Usuń przeciągany projekt z tablicy
      const customProjectsCopy = [...customProjects];
      const [draggedItem] = customProjectsCopy.splice(draggedIndex, 1);
      
      // Wstaw go na nowej pozycji
      customProjectsCopy.splice(targetIndex, 0, draggedItem);
      
      // Aktualizuj stan
      reorderProjects(customProjectsCopy);
    }
    
    setDraggedProject(null);
    setDragOverProject(null);
  };

  // Renderowanie przycisku menu kontekstowego
  const renderMenuButton = (projectId: string) => (
    <button 
      className="project-menu-trigger"
      onClick={(e) => toggleContextMenu(projectId, e)}
      aria-label="Opcje projektu"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1"></circle>
        <circle cx="19" cy="12" r="1"></circle>
        <circle cx="5" cy="12" r="1"></circle>
      </svg>
    </button>
  );

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
      
      <aside ref={sidebarRef} className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo">
          <h1>ToDo App</h1>
          
          {/* Przycisk zwijania/rozwijania sidebara - widoczny tylko na desktopie */}
          {!isMobile && (
            <button 
              className="sidebar-toggle" 
              onClick={toggleSidebar} 
              aria-label={isSidebarCollapsed ? "Rozwiń menu" : "Zwiń menu"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: '20px', minHeight: '20px' }}>
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
            {/* 1. Sekcja Inbox i Wszystkie zadania (Top Section) */}
            <div className="project-section top-section">
              {projects
                .filter(project => project.id === 'inbox' || project.id === 'all')
                .map(project => (
                  <li 
                    key={project.id}
                    className={`project-item ${activeProject === project.id ? 'active' : ''}`}
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <div className="project-color" style={{ backgroundColor: project.color }}></div>
                    <span className="project-name">{project.name}</span>
                    <div className="task-count-wrapper">
                      {shouldShowTaskCount(project.id) && (
                        <span className="task-count">
                          {getActiveTaskCount(project.id)}
                        </span>
                      )}
                      {renderMenuButton(project.id)}
                      
                      {/* Menu kontekstowe dla projektu */}
                      {showContextMenu === project.id && (
                        <div className="project-context-menu">
                          <button onClick={(e) => handleDuplicateProject(project, e)} className="context-menu-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            Duplikuj
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
            </div>
            
            {/* 2. Sekcja projektów użytkownika (Custom Section) */}
            <div className="project-section custom-projects">
              <div className="section-header">
                <h3>Moje projekty</h3>
              </div>
              
              {/* Lista projektów użytkownika */}
              {projects
                .filter(project => project.id !== 'inbox' && project.id !== 'all' && project.id !== 'completed')
                .map(project => (
                  <li 
                    key={project.id}
                    className={`project-item ${activeProject === project.id ? 'active' : ''} ${dragOverProject === project.id ? 'drag-over' : ''}`}
                    onClick={() => handleProjectClick(project.id)}
                    draggable={!isSidebarCollapsed}
                    onDragStart={(e) => handleDragStart(project.id, e)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(project.id, e)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(project.id, e)}
                  >
                    {editingProjectId === project.id ? (
                      // Tryb edycji projektu
                      <div className="project-edit-mode">
                        <div 
                          className="project-color-edit" 
                          style={{ backgroundColor: editingProjectColor }}
                          onClick={() => setShowColorPicker(!showColorPicker)}
                        ></div>
                        <input
                          ref={editInputRef}
                          type="text"
                          className="project-name-input"
                          value={editingProjectName}
                          onChange={(e) => setEditingProjectName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveProjectEdit();
                            if (e.key === 'Escape') handleCancelProjectEdit();
                          }}
                        />
                        
                        {showColorPicker && (
                          <div className="color-picker">
                            {['#246fe0', '#eb8909', '#a970ff', '#25b84c', '#e44747', '#f9a825', '#16a5a5', '#9e9e9e'].map(color => (
                              <div 
                                key={color} 
                                className="color-option" 
                                style={{ backgroundColor: color }}
                                onClick={() => handleColorSelect(color)}
                              ></div>
                            ))}
                          </div>
                        )}
                        
                        <div className="project-edit-actions">
                          <button 
                            className="project-edit-save"
                            onClick={handleSaveProjectEdit}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </button>
                          <button 
                            className="project-edit-cancel"
                            onClick={handleCancelProjectEdit}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Normalny widok projektu
                      <>
                        <div className="project-color" style={{ backgroundColor: project.color }}></div>
                        <span className="project-name">{project.name}</span>
                        <div className="task-count-wrapper">
                          {shouldShowTaskCount(project.id) && (
                            <span className="task-count">
                              {getActiveTaskCount(project.id)}
                            </span>
                          )}
                          {renderMenuButton(project.id)}
                          
                          {/* Menu kontekstowe dla projektu */}
                          {showContextMenu === project.id && (
                            <div className="project-context-menu">
                              <button onClick={(e) => handleEditProject(project, e)} className="context-menu-item">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                Edytuj
                              </button>
                              <button onClick={(e) => handleDuplicateProject(project, e)} className="context-menu-item">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                                Duplikuj
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteProject(project.id);
                                  setShowContextMenu(null);
                                }} 
                                className="context-menu-item delete"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                                Usuń
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </li>
                ))}
            </div>
            
            {/* 3. Sekcja Ukończone (Completed Section) */}
            <div className="project-section completed-section">
              {projects
                .filter(project => project.id === 'completed')
                .map(project => (
                  <li 
                    key={project.id}
                    className={`project-item ${activeProject === project.id ? 'active' : ''}`}
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <div className="project-color" style={{ backgroundColor: project.color }}></div>
                    <span className="project-name">{project.name}</span>
                    <div className="task-count-wrapper">
                      {shouldShowTaskCount(project.id) && (
                        <span className="task-count">
                          {getActiveTaskCount(project.id)}
                        </span>
                      )}
                      {renderMenuButton(project.id)}
                      
                      {/* Menu kontekstowe dla projektu */}
                      {showContextMenu === project.id && (
                        <div className="project-context-menu">
                          <button onClick={(e) => handleDuplicateProject(project, e)} className="context-menu-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            Duplikuj
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
            </div>
          </ul>
        </nav>
        
        {/* 4. Kontener dla przycisku dodawania projektu */}
        <div className="add-project-container">
          <button 
            className="add-project-trigger"
            onClick={() => setIsAddingProject(true)}
            aria-label="Dodaj projekt"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Dodaj projekt</span>
          </button>
          
          {/* Formularz dodawania projektu */}
          {isAddingProject && (
            <div className="add-project-form">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Nazwa projektu"
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
          )}
        </div>
        
        {/* 5. Sidebar footer z przyciskami: profil, tryb ciemny/jasny, ustawienia */}
        <div className="sidebar-footer">
          <div className="sidebar-user-actions">
            {/* Profil */}
            <button 
              className="sidebar-action-button"
              aria-label="Profil"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Profil</span>
            </button>
            
            {/* Tryb ciemny/jasny */}
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
            
            {/* Ustawienia */}
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
      
      {/* Tło do zamykania menu na urządzeniach mobilnych */}
      {isMobile && isMobileMenuOpen && (
        <div className="sidebar-backdrop active" onClick={handleBackdropClick}></div>
      )}
    </>
  );
};

export default Sidebar;