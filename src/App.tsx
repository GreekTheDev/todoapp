import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TaskList from './components/TaskList';
import Settings from './components/Settings';
import { Project, Task, AppSettings, Section } from './types/types';
import './styles/App.css';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([
    { id: 'all', name: 'Wszystkie zadania', color: '#9e9e9e' },
    { id: 'inbox', name: 'Inbox', color: '#246fe0' },
    { id: 'work', name: 'Praca', color: '#eb8909' },
    { id: 'personal', name: 'Osobiste', color: '#a970ff' },
    { id: 'completed', name: 'Ukończone', color: '#25b84c' },
  ]);
  const [sections, setSections] = useState<Section[]>([]);
  const [activeProject, setActiveProject] = useState<string>('inbox');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [settings, setSettings] = useState<AppSettings>({
    language: 'pl',
    darkMode: false
  });

  // Efekt dla trybu ciemnego
  useEffect(() => {
    if (settings.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [settings.darkMode]);

  const addTask = (task: Task) => {
    setTasks(prevTasks => [...prevTasks, task]);
  };
  
  const addMultipleTasks = (newTasks: Task[]) => {
    if (newTasks.length === 0) return;
    setTasks(prevTasks => [...prevTasks, ...newTasks]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const addProject = (project: Project) => {
    setProjects([...projects, project]);
  };

  const deleteProject = (projectId: string) => {
    if (projectId === 'inbox' || projectId === 'completed' || projectId === 'all') return; // Nie można usunąć domyślnych projektów
    setProjects(projects.filter(project => project.id !== projectId));
    if (activeProject === projectId) {
      setActiveProject('inbox');
    }
  };
  
  const updateProject = (updatedProject: Project) => {
    if (updatedProject.id === 'inbox' || updatedProject.id === 'completed' || updatedProject.id === 'all') return; // Nie można edytować domyślnych projektów
    setProjects(projects.map(project => 
      project.id === updatedProject.id ? updatedProject : project
    ));
  };
  
  const reorderProjects = (newProjectsOrder: Project[]) => {
    // Upewnij się, że domyślne projekty pozostają na swoich miejscach
    const topProjects = projects.filter(p => p.id === 'inbox' || p.id === 'all');
    const completedProject = projects.find(p => p.id === 'completed');
    const customProjects = newProjectsOrder.filter(p => p.id !== 'inbox' && p.id !== 'all' && p.id !== 'completed');
    
    // Ustaw nową kolejność projektów
    const reorderedProjects = [
      ...topProjects, // Inbox i Wszystkie zadania zawsze na górze
      ...customProjects, // Projekty użytkownika w środku
      ...(completedProject ? [completedProject] : []) // Ukończone zawsze na dole
    ];
    
    setProjects(reorderedProjects);
  };

  // Funkcje do zarządzania sekcjami
  const addSection = (section: Section) => {
    setSections([...sections, section]);
  };

  const updateSection = (updatedSection: Section) => {
    setSections(sections.map(section => 
      section.id === updatedSection.id ? updatedSection : section
    ));
  };

  const deleteSection = (sectionId: string) => {
    // Usuń sekcję
    setSections(sections.filter(section => section.id !== sectionId));
    
    // Zaktualizuj zadania, które były w tej sekcji
    setTasks(tasks.map(task => 
      task.sectionId === sectionId ? { ...task, sectionId: undefined } : task
    ));
  };

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Obsługa ukończonych zadań
  useEffect(() => {
    // Gdy zadanie zostanie oznaczone jako ukończone, przenieś je do projektu "Ukończone"
    const handleCompletedTasks = () => {
      const updatedTasks = tasks.map(task => {
        if (task.completed && task.projectId !== 'completed') {
          return { ...task, projectId: 'completed' };
        }
        return task;
      });
      
      // Sprawdź, czy nastąpiła zmiana
      if (JSON.stringify(updatedTasks) !== JSON.stringify(tasks)) {
        setTasks(updatedTasks);
      }
    };
    
    handleCompletedTasks();
  }, [tasks]);

  // Filtrowanie zadań w zależności od aktywnego projektu
  const filteredTasks = 
    activeProject === 'all' 
      ? tasks.filter(task => !task.completed) // Wszystkie niezakończone zadania
      : activeProject === 'completed' 
        ? tasks.filter(task => task.completed) 
        : tasks.filter(task => task.projectId === activeProject && !task.completed);



  return (
    <div className="app">
      <div className="app-container">
        <Sidebar 
          projects={projects} 
          activeProject={activeProject} 
          setActiveProject={setActiveProject}
          addProject={addProject}
          deleteProject={deleteProject}
          updateProject={updateProject}
          reorderProjects={reorderProjects}
          toggleSettings={toggleSettings}
          darkMode={settings.darkMode}
          toggleDarkMode={() => setSettings({...settings, darkMode: !settings.darkMode})}
          tasks={tasks}
        />
        <main className="main-content">
          <TaskList 
            tasks={filteredTasks} 
            addTask={addTask}
            addMultipleTasks={addMultipleTasks}
            updateTask={updateTask} 
            deleteTask={deleteTask}
            activeProject={activeProject}
            projects={projects}
            sections={sections}
            addSection={addSection}
            updateSection={updateSection}
            deleteSection={deleteSection}
          />
        </main>
      </div>
      
      {showSettings && (
        <Settings 
          settings={settings}
          updateSettings={updateSettings}
          closeSettings={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;