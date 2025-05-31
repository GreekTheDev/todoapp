import React, { useContext, useState, useRef, useEffect } from 'react';
import { TaskContext } from '../../context/TaskContext';
import { LanguageContext } from '../../context/LanguageContext';
import Button from '../UI/Button';
import SubtaskList from './SubtaskList';
import TaskForm from './TaskForm';
import DeleteTaskModal from './DeleteTaskModal';
import { FiEdit2, FiTrash2, FiChevronDown, FiChevronUp, FiPlus, FiX, FiArrowRight } from 'react-icons/fi';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import './TaskItem.css';

const TaskItem = ({ task }) => {
  const { 
    toggleTaskCompletion, 
    deleteTask, 
    updateTask,
    addSubtask,
    projects
  } = useContext(TaskContext);
  const { t } = useContext(LanguageContext);
  
  const [isEditing, setIsEditing] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [subtaskDueDate, setSubtaskDueDate] = useState(null);
  const [subtaskPriority, setSubtaskPriority] = useState(null);
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showProjectsList, setShowProjectsList] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const priorityRef = useRef(null);
  const projectsListRef = useRef(null);
  
  // Zamknij dropdown po kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (priorityRef.current && !priorityRef.current.contains(event.target)) {
        setShowPriorityDropdown(false);
      }
      if (projectsListRef.current && !projectsListRef.current.contains(event.target)) {
        setShowProjectsList(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleComplete = () => {
    toggleTaskCompletion(task.id);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };
  
  const confirmDelete = () => {
    deleteTask(task.id);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
  const handleMoveToProject = (projectId) => {
    if (projectId !== task.projectId) {
      const updatedTask = { ...task, projectId };
      updateTask(updatedTask);
    }
    setShowProjectsList(false);
  };

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (newSubtask.trim()) {
      addSubtask(task.id, {
        title: newSubtask,
        dueDate: subtaskDueDate ? subtaskDueDate.toISOString() : null,
        priority: subtaskPriority
      });
      setNewSubtask('');
      setSubtaskDueDate(null);
      setSubtaskPriority(null);
      setShowSubtasks(true);
    }
  };
  
  const handleSubtaskDateChange = (date) => {
    setSubtaskDueDate(date);
  };
  
  const handlePriorityChange = (priority) => {
    setSubtaskPriority(priority);
    setShowPriorityDropdown(false);
  };
  
  const removePriority = (e) => {
    e.stopPropagation();
    setSubtaskPriority(null);
  };
  
  // Funkcja pomocnicza do renderowania etykiety priorytetu
  const getPriorityLabel = () => {
    if (!subtaskPriority) return t('priority');
    
    const priorityIcons = {
      low: '❯',
      medium: '❯❯',
      high: '❯❯❯'
    };
    
    const priorityNames = {
      low: t('priorityLow'),
      medium: t('priorityMedium'),
      high: t('priorityHigh')
    };
    
    return (
      <span className={`priority-value ${subtaskPriority}`}>
        <span className="priority-icon">{priorityIcons[subtaskPriority]}</span>
        <span className="priority-name">{priorityNames[subtaskPriority]}</span>
      </span>
    );
  };

  const formattedDate = task.dueDate 
    ? new Date(task.dueDate).toLocaleDateString('pl-PL') 
    : '';

  return (
    <>
      {/* Formularz edycji jako modal */}
      {isEditing && (
        <TaskForm 
          onClose={handleCancelEdit} 
          projectId={task.projectId}
          editTask={task}
        />
      )}
      
      {/* Modal potwierdzenia usunięcia */}
      <DeleteTaskModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        taskTitle={task.title}
      />
      
      <div className={`task-item ${task.completed ? 'completed' : ''} ${isEditing ? 'is-editing' : ''}`}>
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
            {task.priority && (
              <span className={`task-priority ${task.priority}`}>
                {task.priority === 'low' && t('priorityLow')}
                {task.priority === 'medium' && t('priorityMedium')}
                {task.priority === 'high' && t('priorityHigh')}
              </span>
            )}
            {formattedDate && (
              <span className="task-due-date">
                {formattedDate}
              </span>
            )}
            <div className="task-action-buttons">
              <Button 
                variant="icon" 
                size="small" 
                onClick={() => setShowAddSubtask(!showAddSubtask)}
                aria-label={showAddSubtask ? t('cancelAddSubtask') : t('addSubtask')}
                className="mobile-add-button"
              >
                <FiPlus />
              </Button>
              <Button 
                variant="icon" 
                size="small" 
                onClick={handleEdit}
                aria-label={t('editTaskLabel')}
              >
                <FiEdit2 />
              </Button>
              <div className="move-task-container" ref={projectsListRef}>
                <Button 
                  variant="icon" 
                  size="small" 
                  onClick={() => setShowProjectsList(!showProjectsList)}
                  aria-label={t('moveTask')}
                  className="move-task-button"
                >
                  <FiArrowRight />
                </Button>
                {showProjectsList && (
                  <div className="projects-dropdown">
                    <div className="projects-dropdown-header">
                      <span>{t('moveToProject')}:</span>
                    </div>
                    <ul className="projects-dropdown-list">
                      {projects
                        .filter(project => 
                          project.id !== task.projectId && 
                          project.id !== 'all' && 
                          project.id !== 'completed'
                        )
                        .map(project => (
                          <li 
                            key={project.id} 
                            className="project-dropdown-item"
                            onClick={() => handleMoveToProject(project.id)}
                          >
                            <span 
                              className="project-color" 
                              style={{ backgroundColor: project.color }}
                            ></span>
                            <span className="project-name">{project.name}</span>
                          </li>
                        ))
                      }
                    </ul>
                  </div>
                )}
              </div>
              <Button 
                variant="icon" 
                size="small" 
                onClick={handleDelete}
                aria-label={t('deleteTaskLabel')}
                className="delete-icon"
              >
                <FiTrash2 />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="task-item-footer">
          <Button 
            variant="text" 
            size="small" 
            onClick={() => setShowSubtasks(!showSubtasks)}
            aria-label={showSubtasks ? 'Ukryj podzadania' : 'Pokaż podzadania'}
            className="subtasks-toggle-button"
          >
            {showSubtasks ? <FiChevronUp /> : <FiChevronDown />} 
            Podzadania ({task.subtasks.length})
          </Button>
          
          <Button 
            variant="text" 
            size="small" 
            onClick={() => setShowAddSubtask(!showAddSubtask)}
            aria-label={showAddSubtask ? 'Anuluj' : 'Dodaj podzadanie'}
            className="desktop-add-button"
          >
            {showAddSubtask ? 'Anuluj' : <><FiPlus /> </>}
          </Button>
        </div>
        
        {showAddSubtask && (
          <form className="add-subtask-form" onSubmit={handleAddSubtask}>
            <div className="subtask-form-inputs">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Nowe podzadanie"
                className="add-subtask-input"
              />
            </div>
            <div className="subtask-form-row">
              <div className="priority-dropdown-container" ref={priorityRef}>
                <button 
                  type="button" 
                  className="priority-dropdown-button"
                  onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                >
                  {getPriorityLabel()}
                  {subtaskPriority ? (
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
                onChange={handleSubtaskDateChange}
                format="DD.MM.YYYY"
                placeholder="Termin"
                className="date-picker"
                value={subtaskDueDate}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
                allowClear={true}
              />
            </div>
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
      </div>
    </>
  );
};

export default TaskItem;