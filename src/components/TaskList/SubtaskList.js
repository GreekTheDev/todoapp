import React, { useContext, useState } from 'react';
import { TaskContext } from '../../context/TaskContext';
import Button from '../UI/Button';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import './SubtaskList.css';

const SubtaskList = ({ taskId, subtasks }) => {
  const { 
    toggleSubtaskCompletion, 
    updateSubtask, 
    deleteSubtask 
  } = useContext(TaskContext);
  
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const handleToggleComplete = (subtaskId) => {
    toggleSubtaskCompletion(taskId, subtaskId);
  };

  const handleEdit = (subtask) => {
    setEditingId(subtask.id);
    setEditText(subtask.title);
  };

  const handleSave = (subtaskId) => {
    if (editText.trim()) {
      updateSubtask(taskId, {
        id: subtaskId,
        title: editText,
        completed: subtasks.find(s => s.id === subtaskId).completed
      });
      setEditingId(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleDelete = (subtaskId) => {
    if (window.confirm('Czy na pewno chcesz usunąć to podzadanie?')) {
      deleteSubtask(taskId, subtaskId);
    }
  };

  return (
    <div className="subtask-list">
      <h4 className="subtask-list-title">Podzadania</h4>
      <ul className="subtasks">
        {subtasks.map(subtask => (
          <li 
            key={subtask.id} 
            className={`subtask-item ${subtask.completed ? 'completed' : ''}`}
          >
            {editingId === subtask.id ? (
              <div className="subtask-edit">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="subtask-edit-input"
                  autoFocus
                />
                <div className="subtask-edit-actions">
                  <Button 
                    variant="text" 
                    size="small" 
                    onClick={() => handleSave(subtask.id)}
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
              <div className="subtask-content">
                <div className="subtask-main">
                  <div className="subtask-checkbox-container">
                    <input
                      type="checkbox"
                      id={`subtask-${subtask.id}`}
                      checked={subtask.completed}
                      onChange={() => handleToggleComplete(subtask.id)}
                      className="subtask-checkbox"
                    />
                    <label htmlFor={`subtask-${subtask.id}`} className="subtask-checkbox-label"></label>
                  </div>
                  <span className="subtask-title">{subtask.title}</span>
                </div>
                <div className="subtask-actions">
                  <Button 
                    variant="icon" 
                    size="small" 
                    onClick={() => handleEdit(subtask)}
                    aria-label="Edytuj podzadanie"
                  >
                    <FiEdit2 />
                  </Button>
                  <Button 
                    variant="icon" 
                    size="small" 
                    onClick={() => handleDelete(subtask.id)}
                    aria-label="Usuń podzadanie"
                    className="delete-icon"
                  >
                    <FiTrash2 />
                  </Button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubtaskList;