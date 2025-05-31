import React, { useContext, useState, useRef, useEffect } from 'react';
import { TaskContext } from '../../context/TaskContext';
import Button from '../UI/Button';
import { FiEdit2, FiTrash2, FiCalendar, FiChevronDown, FiX } from 'react-icons/fi';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import './SubtaskList.css';

const SubtaskList = ({ taskId, subtasks }) => {
  const { 
    toggleSubtaskCompletion, 
    updateSubtask, 
    deleteSubtask 
  } = useContext(TaskContext);
  
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editDate, setEditDate] = useState(null);
  const [editPriority, setEditPriority] = useState(null);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const priorityRef = useRef(null);

  // Zamknij dropdown po kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (priorityRef.current && !priorityRef.current.contains(event.target)) {
        setShowPriorityDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sortowanie podzadań według daty (od najwcześniejszych do najpóźniejszych)
  const sortedSubtasks = [...subtasks].sort((a, b) => {
    // Jeśli podzadanie nie ma daty, umieść je na końcu
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    
    // Sortuj od najwcześniejszych do najpóźniejszych
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  const handleToggleComplete = (subtaskId) => {
    toggleSubtaskCompletion(taskId, subtaskId);
  };

  const handleEdit = (subtask) => {
    setEditingId(subtask.id);
    setEditText(subtask.title);
    setEditDate(subtask.dueDate ? dayjs(subtask.dueDate) : null);
    setEditPriority(subtask.priority || null);
  };

  const handleSave = (subtaskId) => {
    if (editText.trim()) {
      updateSubtask(taskId, {
        id: subtaskId,
        title: editText,
        dueDate: editDate ? editDate.toISOString() : null,
        priority: editPriority,
        completed: subtasks.find(s => s.id === subtaskId).completed
      });
      setEditingId(null);
    }
  };
  
  const handleDateChange = (date) => {
    setEditDate(date);
  };
  
  const handlePriorityChange = (priority) => {
    setEditPriority(priority);
    setShowPriorityDropdown(false);
  };
  
  const removePriority = (e) => {
    e.stopPropagation();
    setEditPriority(null);
  };
  
  // Funkcja pomocnicza do renderowania etykiety priorytetu
  const getPriorityLabel = () => {
    if (!editPriority) return 'Priorytet';
    
    const priorityIcons = {
      low: '❯',
      medium: '❯❯',
      high: '❯❯❯'
    };
    
    const priorityNames = {
      low: 'Niski',
      medium: 'Średni',
      high: 'Wysoki'
    };
    
    return (
      <span className={`priority-value ${editPriority}`}>
        <span className="priority-icon">{priorityIcons[editPriority]}</span>
        <span className="priority-name">{priorityNames[editPriority]}</span>
      </span>
    );
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
        {sortedSubtasks.map(subtask => (
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
                  placeholder="Nazwa podzadania"
                />
                
                <div className="subtask-edit-row">
                  <div className="priority-dropdown-container" ref={priorityRef}>
                    <button 
                      type="button" 
                      className="priority-dropdown-button"
                      onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                    >
                      {getPriorityLabel()}
                      {editPriority ? (
                        <button 
                          type="button" 
                          className="clear-priority-button"
                          onClick={removePriority}
                          aria-label="Usuń priorytet"
                        >
                          <FiX />
                        </button>
                      ) : (
                        <FiChevronDown className="dropdown-icon" />
                      )}
                    </button>
                    
                    {showPriorityDropdown && (
                      <div className="priority-dropdown">
                        <div 
                          className="priority-dropdown-item low"
                          onClick={() => handlePriorityChange('low')}
                        >
                          <span className="priority-icon">❯</span>
                          <span className="priority-name">Niski</span>
                        </div>
                        <div 
                          className="priority-dropdown-item medium"
                          onClick={() => handlePriorityChange('medium')}
                        >
                          <span className="priority-icon">❯❯</span>
                          <span className="priority-name">Średni</span>
                        </div>
                        <div 
                          className="priority-dropdown-item high"
                          onClick={() => handlePriorityChange('high')}
                        >
                          <span className="priority-icon">❯❯❯</span>
                          <span className="priority-name">Wysoki</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <DatePicker
                    onChange={handleDateChange}
                    format="DD.MM.YYYY"
                    placeholder="Termin"
                    className="date-picker"
                    value={editDate}
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                    allowClear={true}
                  />
                </div>
                
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
                  <div className="subtask-info">
                    <span className="subtask-title">{subtask.title}</span>
                    <div className="subtask-meta">
                      {subtask.priority && (
                        <span className={`subtask-priority ${subtask.priority}`}>
                          {subtask.priority === 'low' && 'Niski'}
                          {subtask.priority === 'medium' && 'Średni'}
                          {subtask.priority === 'high' && 'Wysoki'}
                        </span>
                      )}
                      {subtask.dueDate && (
                        <div className="subtask-date">
                          <FiCalendar className="subtask-date-icon" />
                          <span>{dayjs(subtask.dueDate).format('DD.MM.YYYY')}</span>
                        </div>
                      )}
                    </div>
                  </div>
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