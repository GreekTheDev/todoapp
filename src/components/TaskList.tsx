import { useState, useEffect, useRef } from 'react';
import { Task, Project, SubTask } from '../types/types';
import '../styles/TaskList.css';

interface TaskListProps {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  activeProject: string;
  projects: Project[];
}

const TaskList = ({ 
  tasks, 
  addTask, 
  updateTask, 
  deleteTask, 
  activeProject,
  projects 
}: TaskListProps) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTaskTitle, setEditedTaskTitle] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showRepeatOptions, setShowRepeatOptions] = useState(false);
  const [repeatType, setRepeatType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom' | null>(null);
  const [repeatEndDate, setRepeatEndDate] = useState('');
  
  // Stan dla podzadań
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
  const [showSubTaskForm, setShowSubTaskForm] = useState<string | null>(null);
  
  // Stan dla szczegółów zadania
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editedTaskDetails, setEditedTaskDetails] = useState<{
    title: string;
    notes: string;
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
  }>({
    title: '',
    notes: '',
    priority: 'medium',
    dueDate: '',
  });
  
  // Referencje do formularzy
  const taskFormRef = useRef<HTMLFormElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const taskDetailsModalRef = useRef<HTMLDivElement>(null);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sprawdź, czy jesteśmy w projekcie "Ukończone"
    if (activeProject === 'completed') {
      alert('Nie można dodać zadania bezpośrednio do projektu "Ukończone".');
      return;
    }
    
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle,
        completed: false,
        projectId: activeProject,
        priority: taskPriority,
        dueDate: taskDueDate || undefined,
        notes: taskNotes || undefined,
        createdAt: new Date().toISOString(),
        subTasks: [],
      };
      
      // Dodaj konfigurację powtarzania, jeśli została wybrana
      if (repeatType) {
        newTask.repeat = {
          type: repeatType,
          endDate: repeatEndDate || undefined
        };
      }
      
      addTask(newTask);
      resetTaskForm();
    }
  };
  
  // Funkcja resetująca formularz
  const resetTaskForm = () => {
    setNewTaskTitle('');
    setTaskPriority('medium');
    setTaskDueDate('');
    setTaskNotes('');
    setRepeatType(null);
    setRepeatEndDate('');
    setShowTaskForm(false);
    setShowDatePicker(false);
    setShowRepeatOptions(false);
  };

  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTaskId && editedTaskTitle.trim()) {
      const taskToUpdate = tasks.find(task => task.id === editingTaskId);
      if (taskToUpdate) {
        updateTask({
          ...taskToUpdate,
          title: editedTaskTitle
        });
        setEditingTaskId(null);
        setEditedTaskTitle('');
      }
    }
  };

  const startEditingTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditedTaskTitle(task.title);
  };

  const toggleTaskCompletion = (task: Task) => {
    // Jeśli zadanie jest ukończone, nie pozwól na jego odznaczenie w projekcie "Ukończone"
    if (task.completed && activeProject === 'completed') {
      return;
    }
    
    updateTask({
      ...task,
      completed: !task.completed
    });
  };
  
  // Obsługa kliknięcia poza formularzem
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Zamknij formularz dodawania zadania, jeśli kliknięto poza nim
      if (showTaskForm && taskFormRef.current && !taskFormRef.current.contains(event.target as Node)) {
        // Nie zamykaj, jeśli kliknięto w dropdown z datą
        if (datePickerRef.current && datePickerRef.current.contains(event.target as Node)) {
          return;
        }
        setShowTaskForm(false);
        setShowDatePicker(false);
        setShowRepeatOptions(false);
      }
      
      // Zamknij dropdown z datą, jeśli kliknięto poza nim
      if (showDatePicker && datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
      
      // Zamknij modal ze szczegółami zadania, jeśli kliknięto poza nim
      if (selectedTaskId && taskDetailsModalRef.current && !taskDetailsModalRef.current.contains(event.target as Node)) {
        closeTaskDetails();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTaskForm, showDatePicker, selectedTaskId]);

  const toggleSubTaskCompletion = (taskId: string, subTaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.subTasks) {
      const updatedSubTasks = task.subTasks.map(subTask => 
        subTask.id === subTaskId ? { ...subTask, completed: !subTask.completed } : subTask
      );
      
      updateTask({
        ...task,
        subTasks: updatedSubTasks
      });
    }
  };

  const addSubTask = (taskId: string) => {
    if (newSubTaskTitle.trim()) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const newSubTask: SubTask = {
          id: Date.now().toString(),
          title: newSubTaskTitle,
          completed: false
        };
        
        const updatedSubTasks = task.subTasks ? [...task.subTasks, newSubTask] : [newSubTask];
        
        updateTask({
          ...task,
          subTasks: updatedSubTasks
        });
        
        setNewSubTaskTitle('');
        setShowSubTaskForm(null);
      }
    }
  };

  const deleteSubTask = (taskId: string, subTaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.subTasks) {
      const updatedSubTasks = task.subTasks.filter(subTask => subTask.id !== subTaskId);
      
      updateTask({
        ...task,
        subTasks: updatedSubTasks
      });
    }
  };

  const toggleExpandTask = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  const openTaskDetails = (task: Task, e: React.MouseEvent) => {
    // Zatrzymaj propagację, aby nie uruchamiać innych handlerów
    e.stopPropagation();
    
    // Nie otwieraj szczegółów, jeśli kliknięto w checkbox lub przyciski
    if (
      (e.target as HTMLElement).tagName === 'INPUT' || 
      (e.target as HTMLElement).tagName === 'BUTTON' ||
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('.task-actions')
    ) {
      return;
    }
    
    setSelectedTaskId(task.id);
    setEditedTaskDetails({
      title: task.title,
      notes: task.notes || '',
      priority: task.priority || 'medium',
      dueDate: task.dueDate || '',
    });
  };

  const closeTaskDetails = () => {
    setSelectedTaskId(null);
  };

  const saveTaskDetails = () => {
    if (selectedTaskId) {
      const taskToUpdate = tasks.find(task => task.id === selectedTaskId);
      if (taskToUpdate) {
        updateTask({
          ...taskToUpdate,
          title: editedTaskDetails.title,
          notes: editedTaskDetails.notes || undefined,
          priority: editedTaskDetails.priority,
          dueDate: editedTaskDetails.dueDate || undefined,
        });
        closeTaskDetails();
      }
    }
  };

  const getCurrentProject = () => {
    return projects.find(project => project.id === activeProject) || projects[0];
  };

  const currentProject = getCurrentProject();

  return (
    <div className="task-list">
      <div className="task-list-header">
        <h2 style={{ color: currentProject.color }}>{currentProject.name}</h2>
        {activeProject !== 'completed' && (
          <button 
            className="add-task-button"
            onClick={() => setShowTaskForm(!showTaskForm)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Dodaj zadanie
          </button>
        )}
      </div>

      {showTaskForm && (
        <form className="task-form" onSubmit={handleAddTask} ref={taskFormRef}>
          <input
            type="text"
            placeholder="Tytuł zadania"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            autoFocus
            required
          />
          
          <div className="task-form-options">
            <div className="form-group">
              <label>Priorytet:</label>
              <div className="priority-buttons">
                <button 
                  type="button"
                  className={`priority-button low ${taskPriority === 'low' ? 'active' : ''}`}
                  onClick={() => setTaskPriority('low')}
                >
                  Niski
                </button>
                <button 
                  type="button"
                  className={`priority-button medium ${taskPriority === 'medium' ? 'active' : ''}`}
                  onClick={() => setTaskPriority('medium')}
                >
                  Średni
                </button>
                <button 
                  type="button"
                  className={`priority-button high ${taskPriority === 'high' ? 'active' : ''}`}
                  onClick={() => setTaskPriority('high')}
                >
                  Wysoki
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <button 
                type="button"
                className="date-picker-trigger"
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>Termin</span>
              </button>
              
              {showDatePicker && (
                <div className="date-picker-dropdown" ref={datePickerRef}>
                  <div className="date-quick-options">
                    <button 
                      type="button" 
                      onClick={() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        setTaskDueDate(tomorrow.toISOString().split('T')[0]);
                      }}
                    >
                      Jutro
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        const dayAfterTomorrow = new Date();
                        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
                        setTaskDueDate(dayAfterTomorrow.toISOString().split('T')[0]);
                      }}
                    >
                      Pojutrze
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        const nextWeek = new Date();
                        nextWeek.setDate(nextWeek.getDate() + 7);
                        setTaskDueDate(nextWeek.toISOString().split('T')[0]);
                      }}
                    >
                      Za tydzień
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        const nextMonth = new Date();
                        nextMonth.setMonth(nextMonth.getMonth() + 1);
                        setTaskDueDate(nextMonth.toISOString().split('T')[0]);
                      }}
                    >
                      Za miesiąc
                    </button>
                  </div>
                  
                  <div className="date-picker-custom">
                    <input 
                      type="date" 
                      value={taskDueDate} 
                      onChange={(e) => setTaskDueDate(e.target.value)}
                    />
                  </div>
                  
                  <div className="repeat-options-trigger">
                    <button 
                      type="button"
                      onClick={() => setShowRepeatOptions(!showRepeatOptions)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 1l4 4-4 4"></path>
                        <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                        <path d="M7 23l-4-4 4-4"></path>
                        <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                      </svg>
                      <span>Powtarzaj</span>
                    </button>
                  </div>
                  
                  {showRepeatOptions && (
                    <div className="repeat-options">
                      <div className="repeat-type-options">
                        <button 
                          type="button" 
                          className={repeatType === 'daily' ? 'active' : ''}
                          onClick={() => setRepeatType('daily')}
                        >
                          Codziennie
                        </button>
                        <button 
                          type="button" 
                          className={repeatType === 'weekly' ? 'active' : ''}
                          onClick={() => setRepeatType('weekly')}
                        >
                          Co tydzień
                        </button>
                        <button 
                          type="button" 
                          className={repeatType === 'monthly' ? 'active' : ''}
                          onClick={() => setRepeatType('monthly')}
                        >
                          Co miesiąc
                        </button>
                        <button 
                          type="button" 
                          className={repeatType === 'yearly' ? 'active' : ''}
                          onClick={() => setRepeatType('yearly')}
                        >
                          Co rok
                        </button>
                        <button 
                          type="button" 
                          className={repeatType === 'custom' ? 'active' : ''}
                          onClick={() => setRepeatType('custom')}
                        >
                          Niestandardowo
                        </button>
                      </div>
                      
                      {repeatType && (
                        <div className="repeat-end-date">
                          <label>Powtarzaj do:</label>
                          <input 
                            type="date" 
                            value={repeatEndDate} 
                            onChange={(e) => setRepeatEndDate(e.target.value)}
                          />
                        </div>
                      )}
                      
                      {repeatType === 'custom' && (
                        <div className="repeat-custom-options">
                          {/* Tu można dodać bardziej zaawansowane opcje powtarzania */}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label>Notatki:</label>
            <textarea 
              value={taskNotes} 
              onChange={(e) => setTaskNotes(e.target.value)}
              placeholder="Dodatkowe informacje..."
            ></textarea>
          </div>
          
          <div className="task-form-actions">
            <button type="submit" className="submit-button">Dodaj</button>
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => {
                setShowTaskForm(false);
                setNewTaskTitle('');
                setTaskPriority('medium');
                setTaskDueDate('');
                setTaskNotes('');
              }}
            >
              Anuluj
            </button>
          </div>
        </form>
      )}

      <div className="tasks-container">
        {tasks.length === 0 ? (
          <div className="empty-tasks">
            <p>Brak zadań w tym projekcie</p>
            {activeProject !== 'completed' && (
              <button 
                className="add-first-task"
                onClick={() => setShowTaskForm(true)}
              >
                Dodaj pierwsze zadanie
              </button>
            )}
          </div>
        ) : (
          <ul className="tasks">
            {tasks.map(task => (
              <li 
                key={task.id} 
                className={`task-item ${task.completed ? 'completed' : ''}`}
                onClick={(e) => openTaskDetails(task, e)}
              >
                {editingTaskId === task.id ? (
                  <form className="edit-task-form" onSubmit={handleUpdateTask}>
                    <input
                      type="text"
                      value={editedTaskTitle}
                      onChange={(e) => setEditedTaskTitle(e.target.value)}
                      autoFocus
                      required
                    />
                    <div className="edit-actions">
                      <button type="submit" className="save-button">Zapisz</button>
                      <button 
                        type="button" 
                        className="cancel-button"
                        onClick={() => {
                          setEditingTaskId(null);
                          setEditedTaskTitle('');
                        }}
                      >
                        Anuluj
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="task-content">
                    <div className="task-main">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleTaskCompletion(task);
                        }}
                        id={`task-${task.id}`}
                      />
                      <label 
                        htmlFor={`task-${task.id}`}
                        className={task.completed ? 'completed' : ''}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {task.title}
                      </label>
                      
                      {task.priority && (
                        <span className={`priority-badge ${task.priority}`}>
                          {task.priority === 'low' ? 'Niski' : 
                           task.priority === 'medium' ? 'Średni' : 'Wysoki'}
                        </span>
                      )}
                      
                      {task.subTasks && task.subTasks.length > 0 && (
                        <button 
                          className="expand-subtasks-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpandTask(task.id);
                          }}
                          aria-label={expandedTaskId === task.id ? "Zwiń podzadania" : "Rozwiń podzadania"}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {expandedTaskId === task.id ? (
                              <polyline points="18 15 12 9 6 15"></polyline>
                            ) : (
                              <polyline points="6 9 12 15 18 9"></polyline>
                            )}
                          </svg>
                          <span className="subtask-count">{task.subTasks.length}</span>
                        </button>
                      )}
                    </div>
                    
                    {(task.dueDate || task.notes) && (
                      <div className="task-details">
                        {task.dueDate && (
                          <div className="task-due-date">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <span>{new Date(task.dueDate).toLocaleDateString('pl-PL')}</span>
                            
                            {task.repeat && (
                              <span className="task-repeat-badge">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17 1l4 4-4 4"></path>
                                  <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                                  <path d="M7 23l-4-4 4-4"></path>
                                  <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                                </svg>
                                {task.repeat.type === 'daily' && 'Codziennie'}
                                {task.repeat.type === 'weekly' && 'Co tydzień'}
                                {task.repeat.type === 'monthly' && 'Co miesiąc'}
                                {task.repeat.type === 'yearly' && 'Co rok'}
                                {task.repeat.type === 'custom' && 'Niestandardowo'}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {task.notes && (
                          <div className="task-notes">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                              <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            <span>{task.notes}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {expandedTaskId === task.id && (
                      <div className="subtasks-container">
                        {task.subTasks && task.subTasks.length > 0 && (
                          <ul className="subtasks-list">
                            {task.subTasks.map(subTask => (
                              <li key={subTask.id} className={`subtask-item ${subTask.completed ? 'completed' : ''}`}>
                                <input
                                  type="checkbox"
                                  checked={subTask.completed}
                                  onChange={() => toggleSubTaskCompletion(task.id, subTask.id)}
                                  id={`subtask-${subTask.id}`}
                                />
                                <label 
                                  htmlFor={`subtask-${subTask.id}`}
                                  className={subTask.completed ? 'completed' : ''}
                                >
                                  {subTask.title}
                                </label>
                                <button 
                                  className="delete-subtask-button"
                                  onClick={() => deleteSubTask(task.id, subTask.id)}
                                  aria-label="Usuń podzadanie"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                  </svg>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                        
                        {showSubTaskForm === task.id ? (
                          <div className="add-subtask-form">
                            <input
                              type="text"
                              placeholder="Tytuł podzadania"
                              value={newSubTaskTitle}
                              onChange={(e) => setNewSubTaskTitle(e.target.value)}
                              autoFocus
                            />
                            <div className="subtask-form-actions">
                              <button 
                                type="button"
                                className="add-subtask-button"
                                onClick={() => addSubTask(task.id)}
                              >
                                Dodaj
                              </button>
                              <button 
                                type="button"
                                className="cancel-button"
                                onClick={() => {
                                  setShowSubTaskForm(null);
                                  setNewSubTaskTitle('');
                                }}
                              >
                                Anuluj
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            className="add-subtask-trigger"
                            onClick={() => setShowSubTaskForm(task.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="5" x2="12" y2="19"></line>
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Dodaj podzadanie
                          </button>
                        )}
                      </div>
                    )}
                    
                    <div className="task-actions">
                      {!task.completed && (
                        <>
                          <button 
                            className="edit-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditingTask(task);
                            }}
                            aria-label="Edytuj zadanie"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          {expandedTaskId !== task.id && (
                            <button 
                              className="add-subtask-button-small"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpandTask(task.id);
                                setTimeout(() => setShowSubTaskForm(task.id), 100);
                              }}
                              aria-label="Dodaj podzadanie"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                              </svg>
                            </button>
                          )}
                        </>
                      )}
                      <button 
                        className="delete-button"
                        onClick={() => deleteTask(task.id)}
                        aria-label="Usuń zadanie"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Modal ze szczegółami zadania */}
      {selectedTaskId && (
        <div className="task-details-modal-overlay">
          <div className="task-details-modal" ref={taskDetailsModalRef}>
            <div className="modal-header">
              <h3>Szczegóły zadania</h3>
              <button 
                className="close-modal-button"
                onClick={closeTaskDetails}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="modal-content">
              <div className="form-group">
                <label>Tytuł:</label>
                <input 
                  type="text" 
                  value={editedTaskDetails.title} 
                  onChange={(e) => setEditedTaskDetails({...editedTaskDetails, title: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Priorytet:</label>
                <div className="priority-buttons">
                  <button 
                    type="button"
                    className={`priority-button low ${editedTaskDetails.priority === 'low' ? 'active' : ''}`}
                    onClick={() => setEditedTaskDetails({...editedTaskDetails, priority: 'low'})}
                  >
                    Niski
                  </button>
                  <button 
                    type="button"
                    className={`priority-button medium ${editedTaskDetails.priority === 'medium' ? 'active' : ''}`}
                    onClick={() => setEditedTaskDetails({...editedTaskDetails, priority: 'medium'})}
                  >
                    Średni
                  </button>
                  <button 
                    type="button"
                    className={`priority-button high ${editedTaskDetails.priority === 'high' ? 'active' : ''}`}
                    onClick={() => setEditedTaskDetails({...editedTaskDetails, priority: 'high'})}
                  >
                    Wysoki
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label>Termin:</label>
                <input 
                  type="date" 
                  value={editedTaskDetails.dueDate} 
                  onChange={(e) => setEditedTaskDetails({...editedTaskDetails, dueDate: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Notatki:</label>
                <textarea 
                  value={editedTaskDetails.notes} 
                  onChange={(e) => setEditedTaskDetails({...editedTaskDetails, notes: e.target.value})}
                  placeholder="Dodatkowe informacje..."
                ></textarea>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="save-button"
                onClick={saveTaskDetails}
              >
                Zapisz zmiany
              </button>
              <button 
                className="cancel-button"
                onClick={closeTaskDetails}
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;