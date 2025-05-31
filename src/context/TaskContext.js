import React, { createContext, useState, useEffect, useContext } from 'react';
import { LanguageContext } from './LanguageContext';

export const TaskContext = createContext();

// Predefiniowane kolory dla projektów
export const PROJECT_COLORS = [
  '#4A6FA5', // niebieski
  '#E63946', // czerwony
  '#2A9D8F', // turkusowy
  '#F4A261', // pomarańczowy
  '#8338EC', // fioletowy
  '#06D6A0', // zielony
  '#FFB703', // żółty
  '#FB8500'  // ciemny pomarańczowy
];

export const TaskProvider = ({ children }) => {
  const { t } = useContext(LanguageContext);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState('inbox');

  // Load tasks and projects from localStorage on initial render
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    const savedProjects = localStorage.getItem('projects');
    
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    } else {
      // Set default projects if none exist
      const defaultProjects = [
        { id: 'inbox', name: t('inbox'), color: '#4A6FA5', isDefault: true },
        { id: 'all', name: t('allTasks'), color: '#2A9D8F', isDefault: true },
        { id: 'completed', name: t('taskCompleted'), color: '#06D6A0', isDefault: true }
      ];
      setProjects(defaultProjects);
      localStorage.setItem('projects', JSON.stringify(defaultProjects));
    }
  }, [t]);

  // Save tasks and projects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    // Sprawdź, czy istnieją wszystkie domyślne projekty
    const hasInbox = projects.some(project => project.id === 'inbox');
    const hasAll = projects.some(project => project.id === 'all');
    const hasCompleted = projects.some(project => project.id === 'completed');
    
    let updatedProjects = [...projects];
    
    // Dodaj brakujące domyślne projekty
    if (!hasInbox) {
      updatedProjects.push({ id: 'inbox', name: t('inbox'), color: '#4A6FA5', isDefault: true });
    }
    
    if (!hasAll) {
      updatedProjects.push({ id: 'all', name: t('allTasks'), color: '#2A9D8F', isDefault: true });
    }
    
    if (!hasCompleted) {
      updatedProjects.push({ id: 'completed', name: t('taskCompleted'), color: '#06D6A0', isDefault: true });
    }
    
    // Jeśli dodano brakujące projekty, zaktualizuj stan
    if (updatedProjects.length !== projects.length) {
      setProjects(updatedProjects);
    } else {
      localStorage.setItem('projects', JSON.stringify(projects));
    }
  }, [projects, t]);

  // Aktualizuj nazwy domyślnych projektów przy zmianie języka
  useEffect(() => {
    const updatedProjects = projects.map(project => {
      if (project.isDefault) {
        if (project.id === 'inbox') {
          return { ...project, name: t('inbox') };
        } else if (project.id === 'all') {
          return { ...project, name: t('allTasks') };
        } else if (project.id === 'completed') {
          return { ...project, name: t('taskCompleted') };
        }
      }
      return project;
    });
    
    // Sprawdź, czy coś się zmieniło
    const hasChanges = updatedProjects.some((project, index) => 
      project.name !== projects[index]?.name
    );
    
    if (hasChanges) {
      setProjects(updatedProjects);
    }
  }, [t, projects]);

  // Task operations
  const addTask = (task) => {
    const newTask = {
      ...task,
      id: Date.now().toString(),
      completed: false,
      subtasks: task.subtasks || [],
      priority: task.priority, // Może być null
      createdAt: new Date().toISOString()
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (updatedTask) => {
    setTasks(tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newCompletedState = !task.completed;
        
        // Jeśli zadanie zostało oznaczone jako ukończone, przenieś je do projektu "Ukończone zadania"
        if (newCompletedState) {
          return { 
            ...task, 
            completed: true, 
            projectId: 'completed',
            completedAt: new Date().toISOString()
          };
        } else {
          // Jeśli zadanie zostało odznaczone, przenieś je z powrotem do skrzynki odbiorczej
          const updatedTask = { ...task, completed: false };
          delete updatedTask.completedAt;
          
          // Jeśli zadanie było w projekcie "Ukończone zadania", przenieś je do skrzynki odbiorczej
          if (task.projectId === 'completed') {
            updatedTask.projectId = 'inbox';
          }
          
          return updatedTask;
        }
      }
      return task;
    }));
  };

  // Subtask operations
  const addSubtask = (taskId, subtask) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newSubtask = {
          id: Date.now().toString(),
          title: subtask.title || subtask,
          completed: false,
          dueDate: subtask.dueDate || null
        };
        return {
          ...task,
          subtasks: [...task.subtasks, newSubtask]
        };
      }
      return task;
    }));
  };

  const updateSubtask = (taskId, updatedSubtask) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: task.subtasks.map(subtask => 
            subtask.id === updatedSubtask.id ? updatedSubtask : subtask
          )
        };
      }
      return task;
    }));
  };

  const deleteSubtask = (taskId, subtaskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: task.subtasks.filter(subtask => subtask.id !== subtaskId)
        };
      }
      return task;
    }));
  };

  const toggleSubtaskCompletion = (taskId, subtaskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        // Aktualizacja podzadania
        const updatedSubtasks = task.subtasks.map(subtask => 
          subtask.id === subtaskId 
            ? { ...subtask, completed: !subtask.completed } 
            : subtask
        );
        
        // Sprawdź, czy wszystkie podzadania są ukończone
        const allSubtasksCompleted = updatedSubtasks.length > 0 && 
          updatedSubtasks.every(subtask => subtask.completed);
        
        // Jeśli wszystkie podzadania są ukończone, oznacz również zadanie główne jako ukończone
        // i przenieś je do projektu "Ukończone zadania"
        if (allSubtasksCompleted && !task.completed) {
          return {
            ...task,
            subtasks: updatedSubtasks,
            completed: true,
            projectId: 'completed',
            completedAt: new Date().toISOString()
          };
        }
        
        return {
          ...task,
          subtasks: updatedSubtasks
        };
      }
      return task;
    }));
  };

  // Project operations
  const addProject = (projectName, customId = null, iconType = 'color', iconValue = null) => {
    // Sprawdź, czy projekt o podanym ID już istnieje
    const projectId = customId || Date.now().toString();
    if (projects.some(project => project.id === projectId)) {
      return;
    }
    
    // Sprawdź, czy nie próbujemy utworzyć projektu o nazwie "Ukończone zadania"
    // jeśli taki projekt już istnieje
    if (projectName === 'Ukończone zadania' && 
        projects.some(project => project.name === 'Ukończone zadania')) {
      return;
    }
    
    const newProject = {
      id: projectId,
      name: projectName,
      isDefault: false,
      // Domyślny kolor, jeśli nie podano
      color: iconValue || '#4A6FA5'
    };
    
    setProjects([...projects, newProject]);
  };

  const updateProject = (updatedProject) => {
    setProjects(projects.map(project => 
      project.id === updatedProject.id ? updatedProject : project
    ));
  };

  const deleteProject = (projectId) => {
    // Don't allow deletion of default projects
    if (projectId === 'inbox' || projectId === 'all' || projectId === 'completed') {
      return;
    }
    
    // Remove the project
    setProjects(projects.filter(project => project.id !== projectId));
    
    // If the active project is being deleted, switch to inbox
    if (activeProject === projectId) {
      setActiveProject('inbox');
    }
    
    // Remove tasks associated with this project or move them to inbox
    setTasks(tasks.map(task => 
      task.projectId === projectId 
        ? { ...task, projectId: 'inbox' } 
        : task
    ));
  };

  // Filter tasks by project
  const getTasksByProject = (projectId) => {
    if (projectId === 'all') {
      // Dla projektu "Wszystkie zadania" pokazuj tylko nieukończone zadania
      return tasks.filter(task => !task.completed);
    }
    return tasks.filter(task => task.projectId === projectId);
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      projects,
      activeProject,
      setActiveProject,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskCompletion,
      addSubtask,
      updateSubtask,
      deleteSubtask,
      toggleSubtaskCompletion,
      addProject,
      updateProject,
      deleteProject,
      getTasksByProject
    }}>
      {children}
    </TaskContext.Provider>
  );
};