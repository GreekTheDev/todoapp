import React, { useState, useContext, useRef, useEffect } from 'react';
import { TaskContext } from '../../context/TaskContext';
import { LanguageContext } from '../../context/LanguageContext';
import Button from '../UI/Button';
import Modal from '../UI/Modal';
import { DatePicker, ConfigProvider } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/pl'; // Importuj polską lokalizację dla dayjs
import 'dayjs/locale/en'; // Importuj angielską lokalizację dla dayjs
import 'dayjs/locale/de'; // Importuj niemiecką lokalizację dla dayjs
import 'dayjs/locale/fr'; // Importuj francuską lokalizację dla dayjs
import plLocale from 'antd/locale/pl_PL'; // Importuj polską lokalizację dla antd
import enLocale from 'antd/locale/en_US'; // Importuj angielską lokalizację dla antd
import deLocale from 'antd/locale/de_DE'; // Importuj niemiecką lokalizację dla antd
import frLocale from 'antd/locale/fr_FR'; // Importuj francuską lokalizację dla antd
import { FiChevronDown, FiX } from 'react-icons/fi';
import './TaskForm.css';

const TaskForm = ({ onClose, projectId, editTask = null }) => {
  const { addTask, updateTask } = useContext(TaskContext);
  const { language, t } = useContext(LanguageContext);
  const [task, setTask] = useState({
    title: editTask ? editTask.title : '',
    description: editTask ? editTask.description : '',
    dueDate: editTask ? editTask.dueDate : null,
    priority: editTask ? editTask.priority : null, // Domyślnie brak priorytetu
    projectId: editTask ? editTask.projectId : (projectId || 'inbox'),
    // Zachowaj pozostałe właściwości zadania, jeśli edytujemy istniejące
    ...(editTask && { 
      id: editTask.id,
      completed: editTask.completed,
      subtasks: editTask.subtasks,
      createdAt: editTask.createdAt
    })
  });
  
  // Stan dla dropdown priorytetu
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const priorityRef = useRef(null);
  
  // Stan dla dropdown priorytetu (usunięto nieużywane zmienne)
  
  // Stan dla obsługi wklejania wielu linii
  const [showMultilineDialog, setShowMultilineDialog] = useState(false);
  const [firstLine, setFirstLine] = useState('');
  const [remainingLines, setRemainingLines] = useState([]);

  // Funkcja do rozpoznawania dat i priorytetów w tytule zadania
  const detectPatternInTitle = (title) => {
    // Słownik miesięcy
    const months = {
      'styczeń': 0, 'stycznia': 0, 'styczen': 0, 'styczniu': 0,
      'luty': 1, 'lutego': 1, 'lutym': 1,
      'marzec': 2, 'marca': 2, 'marcu': 2,
      'kwiecień': 3, 'kwietnia': 3, 'kwiecien': 3, 'kwietniu': 3,
      'maj': 4, 'maja': 4, 'maju': 4,
      'czerwiec': 5, 'czerwca': 5, 'czerwcu': 5,
      'lipiec': 6, 'lipca': 6, 'lipcu': 6,
      'sierpień': 7, 'sierpnia': 7, 'sierpien': 7, 'sierpniu': 7,
      'wrzesień': 8, 'września': 8, 'wrzesien': 8, 'wrzesniu': 8,
      'październik': 9, 'października': 9, 'pazdziernik': 9, 'pazdziernika': 9, 'październiku': 9, 'pazdzierniku': 9,
      'listopad': 10, 'listopada': 10, 'listopadzie': 10,
      'grudzień': 11, 'grudnia': 11, 'grudzien': 11, 'grudniu': 11
    };

    // Wzorce do rozpoznawania dat
    const datePatterns = [
      // Dzisiaj
      {
        regex: /\b(dzisiaj|dziś|dzis)\b/i,
        getDate: () => dayjs().startOf('day')
      },
      // Jutro
      {
        regex: /\b(jutro)\b/i,
        getDate: () => dayjs().add(1, 'day').startOf('day')
      },
      // Za tydzień
      {
        regex: /\b(za tydzień|za tydzien)\b/i,
        getDate: () => dayjs().add(7, 'days').startOf('day')
      },
      // W miesiącu
      {
        regex: /\bw\s+([a-zżźćńółęąś]+)\b/i,
        getDate: (match) => {
          const monthName = match[1].toLowerCase();
          if (months[monthName] !== undefined) {
            const currentYear = dayjs().year();
            const monthIndex = months[monthName];
            const currentMonth = dayjs().month();
            
            // Jeśli wybrany miesiąc jest wcześniejszy niż obecny, ustaw na przyszły rok
            const year = monthIndex < currentMonth ? currentYear + 1 : currentYear;
            
            return dayjs().year(year).month(monthIndex).date(1).startOf('day');
          }
          return null;
        }
      }
    ];

    // Wzorce do rozpoznawania priorytetów
    const priorityPatterns = [
      // Niski priorytet
      {
        regex: /\b(niski|p1)\b/i,
        getPriority: () => 'low'
      },
      // Średni priorytet
      {
        regex: /\b(średni|sredni|p2)\b/i,
        getPriority: () => 'medium'
      },
      // Wysoki priorytet
      {
        regex: /\b(wysoki|p3)\b/i,
        getPriority: () => 'high'
      }
    ];

    let result = {
      date: null,
      priority: null,
      dateMatch: null,
      priorityMatch: null
    };

    // Sprawdź wzorce dat
    for (const pattern of datePatterns) {
      const match = title.match(pattern.regex);
      if (match) {
        const date = pattern.getDate(match);
        if (date) {
          result.date = date;
          result.dateMatch = {
            matchedText: match[0],
            startIndex: match.index,
            endIndex: match.index + match[0].length
          };
          break;
        }
      }
    }

    // Sprawdź wzorce priorytetów
    for (const pattern of priorityPatterns) {
      const match = title.match(pattern.regex);
      if (match) {
        const priority = pattern.getPriority();
        if (priority) {
          result.priority = priority;
          result.priorityMatch = {
            matchedText: match[0],
            startIndex: match.index,
            endIndex: match.index + match[0].length
          };
          break;
        }
      }
    }

    return result;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask({ ...task, [name]: value });
    
    // Sprawdź, czy wklejono wiele linii tekstu
    if (name === 'title' && value.includes('\n')) {
      const lines = value.split('\n').filter(line => line.trim());
      
      if (lines.length > 1) {
        // Zatrzymaj pierwszą linię jako tytuł zadania
        const firstLine = lines[0];
        // Pozostałe linie jako potencjalne podzadania
        const remainingLines = lines.slice(1);
        
        setFirstLine(firstLine);
        setRemainingLines(remainingLines);
        setShowMultilineDialog(true);
        
        // Tymczasowo ustaw tylko pierwszą linię jako tytuł
        setTask({ ...task, title: firstLine });
      }
    }
    
    // Rozpoznaj daty i priorytety w tytule zadania
    if (name === 'title') {
      const patternInfo = detectPatternInTitle(value);
      
      // Automatycznie ustaw datę w polu terminu, jeśli wykryto
      if (patternInfo.date) {
        setTask(prevTask => ({ 
          ...prevTask, 
          dueDate: patternInfo.date.toISOString() 
        }));
      }
      
      // Automatycznie ustaw priorytet, jeśli wykryto
      if (patternInfo.priority) {
        setTask(prevTask => ({ 
          ...prevTask, 
          priority: patternInfo.priority 
        }));
      }
    }
  };

  const handleDateChange = (date, dateString) => {
    console.log("handleDateChange called with:", date);
    setTask({ ...task, dueDate: date ? date.toISOString() : null });
  };
  
  const handlePriorityChange = (priority) => {
    setTask({ ...task, priority });
    setShowPriorityDropdown(false);
  };
  
  const removePriority = (e) => {
    e.stopPropagation();
    setTask({ ...task, priority: null });
  };
  
  // Obsługa wyboru opcji dla wklejonych wielu linii
  const handleMultilineOption = (option) => {
    if (option === 'subtasks') {
      // Dodaj jako jedno zadanie z podzadaniami
      
      // Przetwórz każdą linię podzadania, aby wykryć daty i priorytety
      const processedSubtasks = remainingLines.map(line => {
        const patternInfo = detectPatternInTitle(line);
        let processedTitle = line;
        let subtaskDueDate = null;
        let subtaskPriority = null;
        
        // Jeśli wykryto datę, usuń ją z tytułu i zapisz
        if (patternInfo.dateMatch) {
          const { startIndex, endIndex } = patternInfo.dateMatch;
          const titleBeforeDate = processedTitle.substring(0, startIndex).trim();
          const titleAfterDate = processedTitle.substring(endIndex).trim();
          processedTitle = `${titleBeforeDate} ${titleAfterDate}`.trim();
          subtaskDueDate = patternInfo.date ? patternInfo.date.toISOString() : null;
        }
        
        // Jeśli wykryto priorytet, usuń go z tytułu i zapisz
        if (patternInfo.priorityMatch) {
          const { startIndex, endIndex } = patternInfo.priorityMatch;
          const titleBeforePriority = processedTitle.substring(0, startIndex).trim();
          const titleAfterPriority = processedTitle.substring(endIndex).trim();
          processedTitle = `${titleBeforePriority} ${titleAfterPriority}`.trim();
          subtaskPriority = patternInfo.priority;
        }
        
        return {
          title: processedTitle,
          completed: false,
          dueDate: subtaskDueDate,
          priority: subtaskPriority
        };
      });
      
      // Przetwórz główne zadanie
      const mainTaskPatternInfo = detectPatternInTitle(firstLine);
      let mainTaskTitle = firstLine;
      
      // Jeśli wykryto datę w głównym zadaniu, usuń ją z tytułu
      if (mainTaskPatternInfo.dateMatch) {
        const { startIndex, endIndex } = mainTaskPatternInfo.dateMatch;
        const titleBeforeDate = mainTaskTitle.substring(0, startIndex).trim();
        const titleAfterDate = mainTaskTitle.substring(endIndex).trim();
        mainTaskTitle = `${titleBeforeDate} ${titleAfterDate}`.trim();
      }
      
      // Jeśli wykryto priorytet w głównym zadaniu, usuń go z tytułu
      if (mainTaskPatternInfo.priorityMatch) {
        const { startIndex, endIndex } = mainTaskPatternInfo.priorityMatch;
        const titleBeforePriority = mainTaskTitle.substring(0, startIndex).trim();
        const titleAfterPriority = mainTaskTitle.substring(endIndex).trim();
        mainTaskTitle = `${titleBeforePriority} ${titleAfterPriority}`.trim();
      }
      
      const newTask = {
        ...task,
        title: mainTaskTitle,
        subtasks: processedSubtasks
      };
      
      if (editTask) {
        updateTask({ ...editTask, ...newTask });
      } else {
        addTask(newTask);
      }
      onClose();
    } else if (option === 'separate') {
      // Dodaj jako osobne zadania
      
      // Przetwórz główne zadanie
      const mainTaskPatternInfo = detectPatternInTitle(firstLine);
      let mainTaskTitle = firstLine;
      let mainTaskDueDate = task.dueDate;
      let mainTaskPriority = task.priority;
      
      // Jeśli wykryto datę w głównym zadaniu, usuń ją z tytułu i zapisz
      if (mainTaskPatternInfo.dateMatch) {
        const { startIndex, endIndex } = mainTaskPatternInfo.dateMatch;
        const titleBeforeDate = mainTaskTitle.substring(0, startIndex).trim();
        const titleAfterDate = mainTaskTitle.substring(endIndex).trim();
        mainTaskTitle = `${titleBeforeDate} ${titleAfterDate}`.trim();
        mainTaskDueDate = mainTaskPatternInfo.date ? mainTaskPatternInfo.date.toISOString() : mainTaskDueDate;
      }
      
      // Jeśli wykryto priorytet w głównym zadaniu, usuń go z tytułu i zapisz
      if (mainTaskPatternInfo.priorityMatch) {
        const { startIndex, endIndex } = mainTaskPatternInfo.priorityMatch;
        const titleBeforePriority = mainTaskTitle.substring(0, startIndex).trim();
        const titleAfterPriority = mainTaskTitle.substring(endIndex).trim();
        mainTaskTitle = `${titleBeforePriority} ${titleAfterPriority}`.trim();
        mainTaskPriority = mainTaskPatternInfo.priority || mainTaskPriority;
      }
      
      // Najpierw dodaj główne zadanie
      if (editTask) {
        updateTask({ 
          ...editTask, 
          ...task, 
          title: mainTaskTitle,
          dueDate: mainTaskDueDate,
          priority: mainTaskPriority
        });
      } else {
        addTask({ 
          ...task, 
          title: mainTaskTitle,
          dueDate: mainTaskDueDate,
          priority: mainTaskPriority
        });
        
        // Następnie dodaj pozostałe zadania
        remainingLines.forEach(line => {
          const patternInfo = detectPatternInTitle(line);
          let processedTitle = line;
          let taskDueDate = null;
          let taskPriority = null;
          
          // Jeśli wykryto datę, usuń ją z tytułu i zapisz
          if (patternInfo.dateMatch) {
            const { startIndex, endIndex } = patternInfo.dateMatch;
            const titleBeforeDate = processedTitle.substring(0, startIndex).trim();
            const titleAfterDate = processedTitle.substring(endIndex).trim();
            processedTitle = `${titleBeforeDate} ${titleAfterDate}`.trim();
            taskDueDate = patternInfo.date ? patternInfo.date.toISOString() : null;
          }
          
          // Jeśli wykryto priorytet, usuń go z tytułu i zapisz
          if (patternInfo.priorityMatch) {
            const { startIndex, endIndex } = patternInfo.priorityMatch;
            const titleBeforePriority = processedTitle.substring(0, startIndex).trim();
            const titleAfterPriority = processedTitle.substring(endIndex).trim();
            processedTitle = `${titleBeforePriority} ${titleAfterPriority}`.trim();
            taskPriority = patternInfo.priority;
          }
          
          addTask({
            title: processedTitle,
            description: '',
            dueDate: taskDueDate,
            priority: taskPriority,
            projectId: task.projectId
          });
        });
      }
      onClose();
    } else {
      // Anuluj i wróć do edycji
      setShowMultilineDialog(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!task.title.trim()) {
      return;
    }
    
    // Przygotuj zadanie do zapisania
    const taskToSave = { ...task };
    
    // Sprawdź wzorce w tytule ponownie, aby mieć aktualne informacje
    const patternInfo = detectPatternInTitle(task.title);
    let titleToClean = task.title;
    
    // Jeśli wykryto datę w tytule, usuń ją
    if (patternInfo.dateMatch) {
      const { startIndex, endIndex } = patternInfo.dateMatch;
      const titleBeforeDate = titleToClean.substring(0, startIndex).trim();
      const titleAfterDate = titleToClean.substring(endIndex).trim();
      
      // Połącz części tytułu, usuwając wykrytą datę
      titleToClean = `${titleBeforeDate} ${titleAfterDate}`.trim();
    }
    
    // Jeśli wykryto priorytet w tytule, usuń go
    if (patternInfo.priorityMatch) {
      const { startIndex, endIndex } = patternInfo.priorityMatch;
      const titleBeforePriority = titleToClean.substring(0, startIndex).trim();
      const titleAfterPriority = titleToClean.substring(endIndex).trim();
      
      // Połącz części tytułu, usuwając wykryty priorytet
      titleToClean = `${titleBeforePriority} ${titleAfterPriority}`.trim();
    }
    
    // Sprawdź, czy po usunięciu wzorców tytuł nie jest pusty
    // Jeśli jest pusty, zachowaj oryginalny tytuł
    if (!titleToClean.trim()) {
      titleToClean = task.title;
    }
    
    // Ustaw oczyszczony tytuł
    taskToSave.title = titleToClean;
    
    if (editTask) {
      updateTask({ ...editTask, ...taskToSave });
    } else {
      addTask(taskToSave);
    }
    
    onClose();
  };
  
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

  // Sprawdzenie, czy przycisk dodawania powinien być aktywny
  const isSubmitDisabled = !task.title.trim();
  
  // Funkcja pomocnicza do renderowania etykiety priorytetu
  const getPriorityLabel = () => {
    if (!task.priority) return t('priority');
    
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
      <span className={`priority-value ${task.priority}`}>
        <span className="priority-icon">{priorityIcons[task.priority]}</span>
        <span className="priority-name">{priorityNames[task.priority]}</span>
      </span>
    );
  };

  // Ustawienie odpowiedniej lokalizacji dla dayjs
  useEffect(() => {
    dayjs.locale(language);
  }, [language]);

  return (
    <Modal 
      isOpen={true} 
      onClose={onClose}
      title={showMultilineDialog ? t('multilineDetected') : (editTask ? t('editTask') : t('newTask'))}
      size="medium"
    >
      {showMultilineDialog ? (
        <div className="multiline-dialog">
          <p className="multiline-dialog-description">
            {t('multilineDescription')}
          </p>
          
          <div className="multiline-preview">
            <div className="multiline-preview-main">
              <strong>{t('mainTask')}:</strong> {firstLine}
            </div>
            <div className="multiline-preview-subtasks">
              <strong>{t('remainingLines')} ({remainingLines.length}):</strong>
              <ul>
                {remainingLines.map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="multiline-dialog-actions">
            <Button 
              type="button" 
              variant="primary"
              onClick={() => handleMultilineOption('subtasks')}
            >
              {t('addAsOneWithSubtasks')}
            </Button>
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => handleMultilineOption('separate')}
            >
              {t('addAsSeparateTasks')}
            </Button>
            <Button 
              type="button" 
              variant="text"
              onClick={() => handleMultilineOption('cancel')}
            >
              {t('cancel')}
            </Button>
          </div>
        </div>
      ) : (
        <form className="task-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              id="title"
              name="title"
              value={task.title}
              onChange={handleChange}
              placeholder={t('taskNamePlaceholder')}
              autoFocus
              className="title-input"
            />
          </div>
          
          <div className="form-group">
            <input
              type="text"
              id="description"
              name="description"
              value={task.description}
              onChange={handleChange}
              placeholder={t('descriptionPlaceholder')}
              className="description-input"
            />
          </div>
          
          <div className="form-row">
            <div className="priority-dropdown-container" ref={priorityRef}>
              <button 
                type="button" 
                className="priority-dropdown-button"
                onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
              >
                {getPriorityLabel()}
                {task.priority ? (
                  <button 
                    type="button" 
                    className="clear-priority-button"
                    onClick={removePriority}
                    aria-label={t('removePriority')}
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
                    <span className="priority-name">{t('priorityLow')}</span>
                  </div>
                  <div 
                    className="priority-dropdown-item medium"
                    onClick={() => handlePriorityChange('medium')}
                  >
                    <span className="priority-icon">❯❯</span>
                    <span className="priority-name">{t('priorityMedium')}</span>
                  </div>
                  <div 
                    className="priority-dropdown-item high"
                    onClick={() => handlePriorityChange('high')}
                  >
                    <span className="priority-icon">❯❯❯</span>
                    <span className="priority-name">{t('priorityHigh')}</span>
                  </div>
                </div>
              )}
            </div>
            
            <ConfigProvider locale={
              language === 'pl' ? plLocale :
              language === 'en' ? enLocale :
              language === 'de' ? deLocale :
              language === 'fr' ? frLocale : plLocale
            }>
              <div className="date-picker-container">
                <DatePicker
                  onChange={handleDateChange}
                  format="DD.MM.YYYY"
                  placeholder={t('dueDatePlaceholder')}
                  className="date-picker"
                  value={task.dueDate ? dayjs(task.dueDate) : null}
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                  allowClear={true}
                />
              </div>
            </ConfigProvider>
          </div>
          
          {/* Przyciski szybkiego wyboru daty w nowej linii */}
          <div className="date-quick-buttons">
            <button 
              type="button" 
              className="date-preset-button"
              onClick={() => {
                // Ustaw datę na dzisiaj
                setTask(prevTask => ({ 
                  ...prevTask, 
                  dueDate: dayjs().toISOString() 
                }));
              }}
            >
              {t('today')}
            </button>
            <button 
              type="button" 
              className="date-preset-button"
              onClick={() => {
                // Ustaw datę na jutro
                setTask(prevTask => ({ 
                  ...prevTask, 
                  dueDate: dayjs().add(1, 'day').toISOString() 
                }));
              }}
            >
              {t('tomorrow')}
            </button>
            <button 
              type="button" 
              className="date-preset-button"
              onClick={() => {
                // Ustaw datę na za tydzień
                setTask(prevTask => ({ 
                  ...prevTask, 
                  dueDate: dayjs().add(7, 'days').toISOString() 
                }));
              }}
            >
              {t('nextWeek')}
            </button>
          </div>
          
          <div className="form-actions">
            <Button 
              type="submit" 
              variant="primary"
              disabled={isSubmitDisabled}
              className={isSubmitDisabled ? 'button-disabled' : ''}
            >
              {editTask ? t('saveChanges') : t('addTask')}
            </Button>
            <Button 
              type="button" 
              variant="text" 
              onClick={onClose}
            >
              {t('cancel')}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default TaskForm;