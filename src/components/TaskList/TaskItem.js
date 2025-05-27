import React, { useContext, useState } from 'react';
import { TaskContext } from '../../context/TaskContext';
import Button from '../UI/Button';
import SubtaskList from './SubtaskList';
import { FiEdit2, FiTrash2, FiChevronDown, FiChevronUp, FiPlus } from 'react-icons/fi';
import './TaskItem.css';

const TaskItem = ({ task }) => {
  const { 
    toggleTaskCompletion, 
    deleteTask, 
    updateTask,
    addSubtask
  } = useContext(TaskContext);
  
  const [isEditing, setIsEditing] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [editedTask, setEditedTask] = useState({ ...task });
  const [newSubtask, setNewSubtask] = useState('');
  const [showAddSubtask, setShowAddSubtask] = useState(false);

  const handleToggleComplete = () => {
    toggleTaskCompletion(task.id);
  };

  const handleDelete = () => {
    if (window.confirm('Czy na pewno chcesz usunąć to zadanie?')) {
      deleteTask(task.id);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editedTask.title.trim()) {
      updateTask(editedTask);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedTask({ ...task });
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedTask({ ...editedTask, [name]: value });
  };

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (newSubtask.trim()) {
      addSubtask(task.id, newSubtask);
      setNewSubtask('');
      setShowSubtasks(true);
    }
  };

  const formattedDate = task.dueDate 
    ? new Date(task.dueDate).toLocaleDateString('pl-PL') 
    : '';

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      {isEditing ? (
        <div className="task-edit-form">
          <input
            type="text"
            name="title"
            value={editedTask.title}
            onChange={handleChange}
            placeholder="Tytuł zadania"
            className="task-edit-input"
          />
          <textarea
            name="description"
            value={editedTask.description || ''}
            onChange={handleChange}
            placeholder="Opis (opcjonalnie)"
            className="task-edit-textarea"
          />
          <div className="task-edit-actions">
            <Button 
              variant="primary" 
              size="small" 
              onClick={handleSave}
            >
              Zapisz
            </Button>
            <Button 
              variant="text" 
              size="small" 
              onClick={handleCancel}
            >
              Anuluj
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="task-item-header">
            <div className="task-item-main">
              <div className="task-checkbox-container">
                <input
                  type="checkbox"
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onChange={handleToggleComplete}
                  className="task-checkbox"
                />
                <label htmlFor={`task-${task.id}`} className="task-checkbox-label"></label>
              </div>
              <div className="task-content">
                <h3 className="task-title">{task.title}</h3>
                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}
              </div>
            </div>
            <div className="task-item-actions">
              {formattedDate && (
                <span className="task-due-date">
                  {formattedDate}
                </span>
              )}
              <Button 
                variant="icon" 
                size="small" 
                onClick={handleEdit}
                aria-label="Edytuj zadanie"
              >
                <FiEdit2 />
              </Button>
              <Button 
                variant="icon" 
                size="small" 
                onClick={handleDelete}
                aria-label="Usuń zadanie"
                className="delete-icon"
              >
                <FiTrash2 />
              </Button>
            </div>
          </div>
          
          <div className="task-item-footer">
            <Button 
              variant="text" 
              size="small" 
              onClick={() => setShowSubtasks(!showSubtasks)}
              aria-label={showSubtasks ? 'Ukryj podzadania' : 'Pokaż podzadania'}
            >
              {showSubtasks ? <FiChevronUp /> : <FiChevronDown />} 
              Podzadania ({task.subtasks.length})
            </Button>
            
            <Button 
              variant="text" 
              size="small" 
              onClick={() => setShowAddSubtask(!showAddSubtask)}
              aria-label={showAddSubtask ? 'Anuluj' : ' '}
            >
              {showAddSubtask ? 'Anuluj' : <><FiPlus /> </>}
            </Button>
          </div>
          
          {showAddSubtask && (
            <form className="add-subtask-form" onSubmit={handleAddSubtask}>
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Nowe podzadanie"
                className="add-subtask-input"
              />
              <Button 
                type="submit" 
                variant="primary" 
                size="small"
              >
                Dodaj
              </Button>
            </form>
          )}
          
          {showSubtasks && task.subtasks.length > 0 && (
            <SubtaskList taskId={task.id} subtasks={task.subtasks} />
          )}
        </>
      )}
    </div>
  );
};

export default TaskItem;