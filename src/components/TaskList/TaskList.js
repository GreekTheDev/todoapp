import React, { useContext, useState } from 'react';
import { TaskContext } from '../../context/TaskContext';
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
  
  const [showAddTask, setShowAddTask] = useState(false);
  
  const tasks = getTasksByProject(activeProject);
  const activeProjectName = projects.find(p => p.id === activeProject)?.name || '';

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h2 className="task-list-title">{activeProjectName}</h2>
        <Button 
          variant="primary"
          onClick={() => setShowAddTask(true)}
        >
          +
        </Button>
      </div>
      
      {showAddTask && (
        <TaskForm 
          onClose={() => setShowAddTask(false)} 
          projectId={activeProject}
        />
      )}
      
      <div className="task-list">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>Brak zadań. Dodaj nowe zadanie, aby rozpocząć.</p>
          </div>
        ) : (
          tasks.map(task => (
            <TaskItem key={task.id} task={task} />
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;