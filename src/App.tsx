import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TaskList from './components/TaskList';
import Settings from './components/Settings';
import { Project, Task, AppSettings } from './types/types';
import './styles/App.css';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([
    { id: 'inbox', name: 'Inbox', color: '#246fe0' },
    { id: 'work', name: 'Praca', color: '#eb8909' },
    { id: 'personal', name: 'Osobiste', color: '#a970ff' },
    { id: 'completed', name: 'Ukończone', color: '#25b84c' },
  ]);
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
    setTasks([...tasks, task]);
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
    if (projectId === 'inbox' || projectId === 'completed') return; // Nie można usunąć domyślnych projektów
    setProjects(projects.filter(project => project.id !== projectId));
    if (activeProject === projectId) {
      setActiveProject('inbox');
    }
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
  const filteredTasks = activeProject === 'completed' 
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
          toggleSettings={toggleSettings}
          darkMode={settings.darkMode}
          toggleDarkMode={() => setSettings({...settings, darkMode: !settings.darkMode})}
        />
        <main className="main-content">
          <TaskList 
            tasks={filteredTasks} 
            addTask={addTask} 
            updateTask={updateTask} 
            deleteTask={deleteTask}
            activeProject={activeProject}
            projects={projects}
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