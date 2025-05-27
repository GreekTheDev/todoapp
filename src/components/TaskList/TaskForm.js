import React, { useState, useContext } from 'react';
import { TaskContext } from '../../context/TaskContext';
import Button from '../UI/Button';
import { DatePicker } from 'antd';
import './TaskForm.css';

const TaskForm = ({ onClose, projectId, editTask = null }) => {
  const { addTask, updateTask } = useContext(TaskContext);
  const [task, setTask] = useState({
    title: editTask ? editTask.title : '',
    description: editTask ? editTask.description : '',
    dueDate: editTask ? editTask.dueDate : null,
    projectId: projectId || 'inbox',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask({ ...task, [name]: value });
  };

  const handleDateChange = (date, dateString) => {
    setTask({ ...task, dueDate: date ? date.toISOString() : null });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!task.title.trim()) {
      return;
    }
    
    if (editTask) {
      updateTask({ ...editTask, ...task });
    } else {
      addTask(task);
    }
    
    onClose();
  };

  return (
    <div className="task-form-container">
      <form className="task-form" onSubmit={handleSubmit}>
        <h3 className="task-form-title">
          {editTask ? 'Edytuj zadanie' : 'Nowe zadanie'}
        </h3>
        
        <div className="form-group">
          <label htmlFor="title">Tytuł</label>
          <input
            type="text"
            id="title"
            name="title"
            value={task.title}
            onChange={handleChange}
            placeholder="Wpisz tytuł zadania"
            autoFocus
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Opis (opcjonalnie)</label>
          <textarea
            id="description"
            name="description"
            value={task.description}
            onChange={handleChange}
            placeholder="Dodaj opis zadania"
            rows="3"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="dueDate">Termin wykonania (opcjonalnie)</label>
          <DatePicker
            onChange={handleDateChange}
            format="DD.MM.YYYY"
            placeholder="Wybierz datę"
            className="date-picker"
            value={task.dueDate ? new Date(task.dueDate) : null}
          />
        </div>
        
        <div className="form-actions">
          <Button 
            type="submit" 
            variant="primary"
          >
            {editTask ? 'Zapisz zmiany' : 'Dodaj zadanie'}
          </Button>
          <Button 
            type="button" 
            variant="text" 
            onClick={onClose}
          >
            Anuluj
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;