import React, { useContext, useState } from 'react';
import { TaskContext } from '../../context/TaskContext';
import { LanguageContext } from '../../context/LanguageContext';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import Button from '../UI/Button';
import './TaskList.css';

const TaskList = () => {
  const { 
    activeProject, 
    getTasksByProject, 
    projects 
  } = useContext(TaskContext);
  const { t } = useContext(LanguageContext);
  
  const [showAddTask, setShowAddTask] = useState(false);
  
  // Pobierz zadania i posortuj je według daty (od najwcześniejszych do najpóźniejszych)
  const unsortedTasks = getTasksByProject(activeProject);
  const tasks = [...unsortedTasks].sort((a, b) => {
    // Jeśli zadanie nie ma daty, umieść je na końcu
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    
    // Sortuj od najwcześniejszych do najpóźniejszych
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
  
  const activeProjectName = projects.find(p => p.id === activeProject)?.name || '';

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h2 className="task-list-title">{activeProjectName}</h2>
      </div>
      
      {showAddTask && activeProject !== 'completed' && (
        <TaskForm 
          onClose={() => setShowAddTask(false)} 
          projectId={activeProject}
        />
      )}
      
      <div className="task-list">
        {tasks.length === 0 ? (
          <div className="empty-state">
            {activeProject === 'completed' ? (
              <p>{t('allCompleted')}</p>
            ) : (
              <p>{t('noTasksDescription')}</p>
            )}
          </div>
        ) : (
          tasks.map(task => (
            <TaskItem key={task.id} task={task} />
          ))
        )}
      </div>
      
      {/* Ukryj przycisk dodawania zadania w projekcie "Ukończone zadania" */}
      {activeProject !== 'completed' && (
        <div className="add-task-button-container">
          <Button 
            variant="primary"
            size="large"
            className="add-task-button"
            onClick={() => setShowAddTask(true)}
            aria-label={t('addTask')}
          >
            +
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskList;