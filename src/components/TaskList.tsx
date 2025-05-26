import { useState, useEffect, useRef } from 'react';
import { Task, Project, SubTask, Section } from '../types/types';
import '../styles/TaskList.css';

interface TaskListProps {
  tasks: Task[];
  addTask: (task: Task) => void;
  addMultipleTasks?: (tasks: Task[]) => void; // Opcjonalna, dla kompatybilności wstecznej
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  activeProject: string;
  projects: Project[];
  sections: Section[];
  addSection: (section: Section) => void;
  updateSection: (section: Section) => void;
  deleteSection: (sectionId: string) => void;
}

const TaskList = ({ 
  tasks, 
  addTask, 
  addMultipleTasks,
  updateTask, 
  deleteTask, 
  activeProject,
  projects,
  sections,
  addSection,
  updateSection,
  deleteSection
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
  const [showSectionTaskForm, setShowSectionTaskForm] = useState<string | null>(null);
  const [newSectionTaskTitle, setNewSectionTaskTitle] = useState('');
  
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
  
  // Stan dla sekcji
  const [showAddSectionForm, setShowAddSectionForm] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editedSectionTitle, setEditedSectionTitle] = useState('');
  const [hoverSectionArea, setHoverSectionArea] = useState(false);
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);
  
  // Stan dla zadań (kopia lokalna do manipulacji)
  const [localTasks, setTasks] = useState<Task[]>([]);
  
  // Stan dla interfejsu
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [isDraggingTask, setIsDraggingTask] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  
  // Stan dla wklejania wielu linijek
  const [pastedLines, setPastedLines] = useState<string[]>([]);
  const [showPasteOptionsModal, setShowPasteOptionsModal] = useState(false);
  const [pasteTargetTaskId, setPasteTargetTaskId] = useState<string | null>(null);
  const [pasteSectionId, setPasteSectionId] = useState<string | undefined>(undefined);
  
  // Referencje do formularzy
  const taskFormRef = useRef<HTMLFormElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const taskDetailsModalRef = useRef<HTMLDivElement>(null);
  const sectionFormRef = useRef<HTMLFormElement>(null);
  const addSectionAreaRef = useRef<HTMLDivElement>(null);
  const pasteOptionsModalRef = useRef<HTMLDivElement>(null);
  const sectionTaskFormRef = useRef<HTMLFormElement>(null);
  
  // Aktualizuj lokalną kopię zadań, gdy zmienią się zadania z props
  useEffect(() => {
    setTasks([...tasks]);
  }, [tasks]);

  const handleAddTask = (e: React.FormEvent, sectionId?: string) => {
    e.preventDefault();
    
    // Sprawdź, czy jesteśmy w projekcie "Ukończone"
    if (activeProject === 'completed') {
      alert('Nie można dodać zadania bezpośrednio do projektu "Ukończone".');
      return;
    }
    
    // Określ tytuł zadania w zależności od tego, czy dodajemy z głównego formularza czy z sekcji
    const taskTitle = sectionId ? newSectionTaskTitle : newTaskTitle;
    
    if (taskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: taskTitle,
        completed: false,
        projectId: activeProject,
        sectionId: sectionId, // Przypisz zadanie do sekcji, jeśli podano
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
      
      // Resetuj odpowiedni formularz
      if (sectionId) {
        setNewSectionTaskTitle('');
        setShowSectionTaskForm(null);
      } else {
        resetTaskForm();
      }
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
  
  // Obsługa wklejania wielu linijek tekstu
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, sectionId?: string, taskId?: string) => {
    const pastedText = e.clipboardData.getData('text');
    
    console.log('handlePaste wywołany z tekstem:', pastedText);
    console.log('taskId:', taskId);
    console.log('sectionId:', sectionId);
    
    // Jeśli tekst jest pusty, nie rób nic
    if (!pastedText.trim()) {
      console.log('Tekst jest pusty, przerywam');
      return;
    }
    
    // Sprawdź różne możliwe separatory linii
    let lines: string[] = [];
    
    // Najpierw sprawdź, czy tekst zawiera znaki nowej linii
    if (pastedText.includes('\n')) {
      console.log('Wykryto separator \\n');
      lines = pastedText.split(/\r?\n/).filter(line => line.trim() !== '');
    } 
    // Jeśli nie, sprawdź inne możliwe separatory
    else if (pastedText.includes(';')) {
      console.log('Wykryto separator ;');
      lines = pastedText.split(';').filter(line => line.trim() !== '');
    }
    else if (pastedText.includes(',')) {
      console.log('Wykryto separator ,');
      lines = pastedText.split(',').filter(line => line.trim() !== '');
    }
    else {
      console.log('Nie wykryto separatorów, traktuję jako jedną linię');
      // Jeśli nie znaleziono separatorów, traktuj jako jedną linię
      lines = [pastedText];
    }
    
    // Usuń puste linie
    lines = lines.filter(line => line.trim() !== '');
    console.log('Po filtrowaniu pustych linii:', lines);
    
    // Jeśli wklejono tylko jedną linijkę, obsłuż standardowo
    if (lines.length <= 1) {
      console.log('Wykryto tylko jedną linię, obsługuję standardowo');
      return;
    }
    
    // Zapobiegaj domyślnej akcji wklejania
    e.preventDefault();
    
    console.log('Wykryto wklejanie wielu linii:', lines);
    
    // Zapisz linie do stanu
    setPastedLines(lines);
    setPasteSectionId(sectionId);
    
    // Jeśli przekazano ID zadania, ustawiamy je
    if (taskId) {
      console.log('Ustawiam pasteTargetTaskId na:', taskId);
      setPasteTargetTaskId(taskId);
    } else {
      console.log('Brak taskId, nie ustawiam pasteTargetTaskId');
    }
    
    // Pokazujemy modal z opcjami
    console.log('Pokazuję modal z opcjami');
    setShowPasteOptionsModal(true);
  };
  
  // Dodawanie wielu zadań na podstawie wklejonych linii
  const handleAddMultipleTasks = () => {
    if (pastedLines.length === 0) return;
    
    // Sprawdź, czy jesteśmy w projekcie "Ukończone"
    if (activeProject === 'completed') {
      alert('Nie można dodać zadań bezpośrednio do projektu "Ukończone".');
      return;
    }
    
    // Przygotuj tablicę nowych zadań
    const newTasks: Task[] = [];
    
    // Utwórz zadania dla każdej niepustej linii
    pastedLines.forEach((line, index) => {
      if (line.trim()) {
        // Generuj unikalny identyfikator dla każdego zadania
        const uniqueId = Date.now().toString() + '-' + index + '-' + Math.random().toString(36).substr(2, 5);
        
        const newTask: Task = {
          id: uniqueId,
          title: line.trim(),
          completed: false,
          projectId: activeProject,
          sectionId: pasteSectionId,
          priority: taskPriority,
          dueDate: taskDueDate || undefined,
          notes: taskNotes || undefined,
          createdAt: new Date().toISOString(),
          subTasks: [],
        };
        
        if (repeatType) {
          newTask.repeat = {
            type: repeatType,
            endDate: repeatEndDate || undefined
          };
        }
        
        newTasks.push(newTask);
      }
    });
    
    // Jeśli nie ma żadnych ważnych zadań, przerwij
    if (newTasks.length === 0) {
      setShowPasteOptionsModal(false);
      setPastedLines([]);
      setPasteTargetTaskId(null);
      return;
    }
    
    // Dodaj wszystkie zadania jednocześnie
    if (addMultipleTasks) {
      addMultipleTasks(newTasks);
    } else {
      // Fallback, jeśli addMultipleTasks nie jest dostępne
      newTasks.forEach(task => addTask(task));
    }
    
    // Wyświetl potwierdzenie
    alert(`Dodano ${newTasks.length} nowych zadań.`);
    
    // Zamknij modal i zresetuj stan
    setShowPasteOptionsModal(false);
    setPastedLines([]);
    setPasteTargetTaskId(null);
    resetTaskForm();
  };
  
  // Dodawanie wielu podzadań do istniejącego zadania
  const handleAddMultipleSubTasks = () => {
    console.log('handleAddMultipleSubTasks wywołany');
    console.log('pastedLines:', pastedLines);
    console.log('pasteTargetTaskId:', pasteTargetTaskId);
    
    if (pastedLines.length === 0) {
      console.log('Brak linii do dodania, przerywam');
      return;
    }
    
    // Jeśli mamy ID zadania, dodajemy podzadania do istniejącego zadania
    if (pasteTargetTaskId) {
      console.log('Mamy ID zadania:', pasteTargetTaskId);
      const task = tasks.find(t => t.id === pasteTargetTaskId);
      console.log('Znalezione zadanie:', task);
      
      if (task) {
        try {
          // Filtruj puste linie i twórz podzadania z unikalnymi ID
          const newSubTasks: SubTask[] = [];
          
          // Utwórz podzadania dla każdej niepustej linii
          pastedLines.forEach((line, index) => {
            if (line.trim()) {
              // Generuj unikalny identyfikator dla każdego podzadania
              const uniqueId = `subtask-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`;
              
              newSubTasks.push({
                id: uniqueId,
                title: line.trim(),
                completed: false
              });
            }
          });
          
          console.log('Utworzone podzadania:', newSubTasks);
          
          // Jeśli nie ma żadnych ważnych linii, przerwij
          if (newSubTasks.length === 0) {
            console.log('Brak ważnych linii, przerywam');
            setShowPasteOptionsModal(false);
            setPastedLines([]);
            setPasteTargetTaskId(null);
            return;
          }
          
          console.log('Dodawanie podzadań:', newSubTasks);
          
          // Połącz istniejące podzadania z nowymi
          const updatedSubTasks = task.subTasks ? [...task.subTasks, ...newSubTasks] : newSubTasks;
          console.log('Zaktualizowane podzadania:', updatedSubTasks);
          
          // Aktualizuj zadanie z nowymi podzadaniami
          const updatedTask = {
            ...task,
            subTasks: updatedSubTasks
          };
          
          console.log('Zaktualizowane zadanie:', updatedTask);
          
          // Aktualizuj zadanie
          updateTask(updatedTask);
          
          // Rozwiń zadanie, aby pokazać nowo dodane podzadania
          setExpandedTaskId(pasteTargetTaskId);
          
          // Wyświetl potwierdzenie
          alert(`Dodano ${newSubTasks.length} nowych podzadań do zadania "${task.title}".`);
        } catch (error) {
          console.error('Błąd podczas dodawania podzadań:', error);
          alert('Wystąpił błąd podczas dodawania podzadań. Spróbuj ponownie.');
        }
      } else {
        console.log('Nie znaleziono zadania o ID:', pasteTargetTaskId);
      }
    } else {
      console.log('Brak ID zadania, tworzę nowe zadanie z podzadaniami');
      // Jeśli nie mamy ID zadania, tworzymy nowe zadanie z podzadaniami
      handleAddTaskWithSubTasks();
    }
    
    // Zamknij modal i zresetuj stan
    console.log('Zamykam modal i resetuję stan');
    setShowPasteOptionsModal(false);
    setPastedLines([]);
    setPasteTargetTaskId(null);
  };
  
  // Tworzenie nowego zadania z podzadaniami
  const handleAddTaskWithSubTasks = () => {
    if (pastedLines.length === 0) return;
    
    // Sprawdź, czy jesteśmy w projekcie "Ukończone"
    if (activeProject === 'completed') {
      alert('Nie można dodać zadań bezpośrednio do projektu "Ukończone".');
      return;
    }
    
    try {
      // Pierwsza linia będzie tytułem zadania
      const taskTitle = pastedLines[0].trim();
      
      // Pozostałe linie będą podzadaniami
      const subTaskLines = pastedLines.slice(1);
      
      // Jeśli nie ma podzadań, dodaj zwykłe zadanie
      if (subTaskLines.length === 0) {
        const newTask: Task = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          title: taskTitle,
          completed: false,
          projectId: activeProject,
          sectionId: pasteSectionId,
          priority: taskPriority,
          dueDate: taskDueDate || undefined,
          notes: taskNotes || undefined,
          createdAt: new Date().toISOString(),
          subTasks: [],
        };
        
        if (repeatType) {
          newTask.repeat = {
            type: repeatType,
            endDate: repeatEndDate || undefined
          };
        }
        
        addTask(newTask);
        alert('Dodano nowe zadanie.');
        return;
      }
      
      // Utwórz podzadania
      const subTasks: SubTask[] = subTaskLines
        .filter(line => line.trim() !== '')
        .map((line, index) => ({
          id: `subtask-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
          title: line.trim(),
          completed: false
        }));
      
      // Utwórz nowe zadanie z podzadaniami
      const newTask: Task = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        title: taskTitle,
        completed: false,
        projectId: activeProject,
        sectionId: pasteSectionId,
        priority: taskPriority,
        dueDate: taskDueDate || undefined,
        notes: taskNotes || undefined,
        createdAt: new Date().toISOString(),
        subTasks: subTasks,
      };
      
      if (repeatType) {
        newTask.repeat = {
          type: repeatType,
          endDate: repeatEndDate || undefined
        };
      }
      
      // Dodaj zadanie
      addTask(newTask);
      
      // Wyświetl potwierdzenie
      alert(`Dodano nowe zadanie "${taskTitle}" z ${subTasks.length} podzadaniami.`);
    } catch (error) {
      console.error('Błąd podczas dodawania zadania z podzadaniami:', error);
      alert('Wystąpił błąd podczas dodawania zadania. Spróbuj ponownie.');
    }
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
      
      // Zamknij formularz dodawania sekcji, jeśli kliknięto poza nim
      if (showAddSectionForm && sectionFormRef.current && !sectionFormRef.current.contains(event.target as Node)) {
        setShowAddSectionForm(false);
        setNewSectionTitle('');
      }
      
      // Nie zamykaj modalu z opcjami wklejania, jeśli kliknięto poza nim
      // Użytkownik musi wybrać opcję lub kliknąć przycisk zamknięcia
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTaskForm, showDatePicker, selectedTaskId, showAddSectionForm, showPasteOptionsModal]);

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

  const addSubTask = (taskId: string, inputText?: string) => {
    // Jeśli przekazano tekst, użyj go zamiast wartości z pola formularza
    const textToAdd = inputText || newSubTaskTitle;
    
    console.log('addSubTask wywołany z tekstem:', textToAdd);
    
    if (textToAdd.trim()) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        // Sprawdź, czy tekst zawiera wiele linii
        if (textToAdd.includes('\n')) {
          console.log('Wykryto wiele linii w addSubTask');
          
          // Podziel tekst na linie
          const lines = textToAdd.split(/\r?\n/).filter(line => line.trim() !== '');
          console.log('Linie:', lines);
          
          if (lines.length > 1) {
            // Ustaw dane do modalu z opcjami wklejania
            setPastedLines(lines);
            setPasteTargetTaskId(taskId);
            setPasteSectionId(task.sectionId);
            setShowPasteOptionsModal(true);
            return;
          }
        }
        
        // Standardowe dodawanie pojedynczego podzadania
        const newSubTask: SubTask = {
          id: Date.now().toString(),
          title: textToAdd.trim(),
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

  // Funkcja openTaskDetails została przeniesiona bezpośrednio do renderTask

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

  // Funkcje do obsługi sekcji
  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSectionTitle.trim()) {
      const newSection: Section = {
        id: `section-${Date.now()}`,
        title: newSectionTitle,
        projectId: activeProject,
        order: sections.filter(s => s.projectId === activeProject).length
      };
      
      addSection(newSection);
      setNewSectionTitle('');
      setShowAddSectionForm(false);
    }
  };
  
  const handleUpdateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSectionId && editedSectionTitle.trim()) {
      const sectionToUpdate = sections.find(section => section.id === editingSectionId);
      if (sectionToUpdate) {
        updateSection({
          ...sectionToUpdate,
          title: editedSectionTitle
        });
        setEditingSectionId(null);
        setEditedSectionTitle('');
      }
    }
  };
  
  const startEditingSection = (section: Section) => {
    setEditingSectionId(section.id);
    setEditedSectionTitle(section.title);
  };
  
  // Funkcje do obsługi przeciągania sekcji
  const handleSectionDragStart = (e: React.DragEvent<HTMLDivElement>, sectionId: string) => {
    setDraggedSectionId(sectionId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Ustawiamy dane dla przeciągania
    e.dataTransfer.setData('text/plain', sectionId);
    e.dataTransfer.setData('type', 'section');
    
    // Dodajemy klasę do przeciąganego elementu
    setTimeout(() => {
      const element = document.getElementById(`section-${sectionId}`);
      if (element) {
        element.classList.add('dragging');
      }
    }, 0);
  };
  
  // Funkcja do obsługi rozpoczęcia przeciągania zadania została zastąpiona przyciskami do przesuwania zadań
  
  // Funkcja do obsługi zakończenia przeciągania sekcji
  const handleSectionDragEnd = () => {
    // Usuwamy klasę z przeciąganego elementu sekcji
    if (draggedSectionId) {
      const element = document.getElementById(`section-${draggedSectionId}`);
      if (element) {
        element.classList.remove('dragging');
      }
    }
    
    // Resetujemy stany związane z przeciąganiem sekcji
    setDraggedSectionId(null);
    setDragOverSectionId(null);
  };
  
  // Funkcja do obsługi zakończenia przeciągania zadania została zastąpiona przyciskami do przesuwania zadań
  
  // Funkcja do obsługi przeciągania nad sekcją
  const handleSectionDragOver = (e: React.DragEvent<HTMLDivElement>, sectionId: string) => {
    e.preventDefault();
    
    // Jeśli przeciągamy sekcję
    if (draggedSectionId) {
      if (draggedSectionId === sectionId) return;
      setDragOverSectionId(sectionId);
    } 
    // Jeśli przeciągamy zadanie
    else if (isDraggingTask) {
      setDragOverSection(sectionId);
    }
    
    e.dataTransfer.dropEffect = 'move';
  };
  
  // Funkcja do obsługi opuszczenia obszaru sekcji podczas przeciągania
  const handleSectionDragLeave = () => {
    setDragOverSectionId(null);
    setDragOverSection(null);
  };
  
  // Funkcja do obsługi rozpoczęcia przeciągania zadania
  const handleTaskDragStart = (e: React.DragEvent<HTMLLIElement>, taskId: string) => {
    setDraggedTaskId(taskId);
    setIsDraggingTask(true);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  // Funkcja do obsługi zakończenia przeciągania zadania
  const handleTaskDragEnd = () => {
    setDraggedTaskId(null);
    setIsDraggingTask(false);
    setDragOverSection(null);
  };
  
  // Funkcje do obsługi przeciągania zadań nad innymi zadaniami zostały zastąpione przyciskami do przesuwania zadań
  
  // Funkcja handleTaskDragLeave została zastąpiona przyciskami do przesuwania zadań
  
  // Funkcja handleTaskDrop została zastąpiona przyciskami do przesuwania zadań
  
  // Funkcja do obsługi upuszczania na sekcję
  const handleSectionDrop = (e: React.DragEvent<HTMLDivElement>, targetSectionId: string) => {
    // Zawsze zapobiegaj domyślnej akcji
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Upuszczanie na sekcję:', targetSectionId, {
      draggedSectionId,
      draggedTaskId
    });
    
    // Obsługa upuszczania sekcji
    if (draggedSectionId) {
      console.log('Obsługa upuszczania sekcji');
      
      if (draggedSectionId === targetSectionId) {
        console.log('Upuszczenie na tę samą sekcję - ignoruję');
        return;
      }
      
      try {
        // Pobieramy wszystkie sekcje dla aktualnego projektu
        const projectSections = sections
          .filter(section => section.projectId === activeProject)
          .sort((a, b) => a.order - b.order);
        
        // Znajdujemy indeksy sekcji źródłowej i docelowej
        const draggedSectionIndex = projectSections.findIndex(section => section.id === draggedSectionId);
        const targetSectionIndex = projectSections.findIndex(section => section.id === targetSectionId);
        
        if (draggedSectionIndex === -1 || targetSectionIndex === -1) {
          console.error('Nie znaleziono sekcji:', { draggedSectionId, targetSectionId });
          return;
        }
        
        console.log('Zmiana kolejności sekcji:', { 
          z: draggedSectionIndex, 
          na: targetSectionIndex 
        });
        
        // Tworzymy kopię tablicy sekcji
        const updatedSections = [...projectSections];
        
        // Usuwamy przeciąganą sekcję z jej obecnej pozycji
        const [draggedSection] = updatedSections.splice(draggedSectionIndex, 1);
        
        // Wstawiamy ją na nową pozycję
        updatedSections.splice(targetSectionIndex, 0, draggedSection);
        
        // Aktualizujemy kolejność wszystkich sekcji
        const reorderedSections = updatedSections.map((section, index) => ({
          ...section,
          order: index
        }));
        
        console.log('Nowa kolejność sekcji:', reorderedSections.map(s => ({ id: s.id, title: s.title, order: s.order })));
        
        // Aktualizujemy wszystkie sekcje z nowymi wartościami order
        reorderedSections.forEach(section => {
          updateSection(section);
        });
      } catch (error) {
        console.error('Błąd podczas zmiany kolejności sekcji:', error);
      }
    }
    // Obsługa upuszczania zadania
    else if (draggedTaskId) {
      console.log('Obsługa upuszczania zadania na sekcję');
      
      try {
        // Znajdź zadanie, które jest przeciągane
        const draggedTask = tasks.find(task => task.id === draggedTaskId);
        
        if (!draggedTask) {
          console.error('Nie znaleziono przeciąganego zadania:', draggedTaskId);
          return;
        }
        
        console.log('Przenoszenie zadania do sekcji:', {
          zadanie: { id: draggedTask.id, title: draggedTask.title },
          zSekcji: draggedTask.sectionId,
          doSekcji: targetSectionId
        });
        
        // Aktualizuj zadanie, przypisując je do nowej sekcji
        const updatedTask = {
          ...draggedTask,
          sectionId: targetSectionId
        };
        
        updateTask(updatedTask);
        console.log('Zadanie przeniesione do sekcji:', targetSectionId);
      } catch (error) {
        console.error('Błąd podczas przenoszenia zadania do sekcji:', error);
      }
    } else {
      console.log('Brak przeciąganego elementu');
    }
    
    // Resetujemy stany po upuszczeniu
    setDraggedSectionId(null);
    setDragOverSectionId(null);
    setDragOverSection(null);
    
    console.log('Upuszczanie na sekcję - zakończone');
  };

  // Funkcja do przesuwania zadania w górę
  const moveTaskUp = (taskId: string) => {
    // Znajdź zadanie, które chcemy przesunąć
    const taskToMove = localTasks.find(task => task.id === taskId);
    if (!taskToMove) return;
    
    // Pobierz wszystkie zadania z tego samego projektu i sekcji (lub bez sekcji)
    const relatedTasks = localTasks.filter(task => 
      task.projectId === taskToMove.projectId && 
      task.sectionId === taskToMove.sectionId &&
      !task.completed
    );
    
    // Znajdź indeks zadania w tej grupie
    const currentIndex = relatedTasks.findIndex(task => task.id === taskId);
    
    // Jeśli zadanie jest już na górze, nie rób nic
    if (currentIndex <= 0) return;
    
    // Znajdź zadanie, które jest nad nim
    const taskAbove = relatedTasks[currentIndex - 1];
    
    // Dodaj klasę animacji do obu zadań
    const taskElement = document.getElementById(`task-${taskId}`);
    const taskAboveElement = document.getElementById(`task-${taskAbove.id}`);
    
    if (taskElement && taskAboveElement) {
      // Dodaj klasy animacji
      taskElement.classList.add('task-moving-up');
      taskAboveElement.classList.add('task-moving-down');
      
      // Usuń klasy po zakończeniu animacji
      setTimeout(() => {
        taskElement.classList.remove('task-moving-up');
        taskAboveElement.classList.remove('task-moving-down');
      }, 300);
    }
    
    // Zamień zadania miejscami w stanie aplikacji
    // Tworzymy kopię zadań
    const updatedTasks = [...localTasks];
    
    // Znajdź indeksy obu zadań w pełnej liście zadań
    const taskIndex = updatedTasks.findIndex(task => task.id === taskId);
    const aboveTaskIndex = updatedTasks.findIndex(task => task.id === taskAbove.id);
    
    // Zamień zadania miejscami
    [updatedTasks[taskIndex], updatedTasks[aboveTaskIndex]] = 
    [updatedTasks[aboveTaskIndex], updatedTasks[taskIndex]];
    
    // Zaktualizuj stan lokalny
    setTasks(updatedTasks);
    
    // Zaktualizuj zadania w głównym stanie aplikacji
    updatedTasks.forEach(task => {
      if (task.id === taskId || task.id === taskAbove.id) {
        updateTask(task);
      }
    });
  };
  
  // Funkcja do przesuwania zadania w dół
  const moveTaskDown = (taskId: string) => {
    // Znajdź zadanie, które chcemy przesunąć
    const taskToMove = localTasks.find(task => task.id === taskId);
    if (!taskToMove) return;
    
    // Pobierz wszystkie zadania z tego samego projektu i sekcji (lub bez sekcji)
    const relatedTasks = localTasks.filter(task => 
      task.projectId === taskToMove.projectId && 
      task.sectionId === taskToMove.sectionId &&
      !task.completed
    );
    
    // Znajdź indeks zadania w tej grupie
    const currentIndex = relatedTasks.findIndex(task => task.id === taskId);
    
    // Jeśli zadanie jest już na dole, nie rób nic
    if (currentIndex >= relatedTasks.length - 1) return;
    
    // Znajdź zadanie, które jest pod nim
    const taskBelow = relatedTasks[currentIndex + 1];
    
    // Dodaj klasę animacji do obu zadań
    const taskElement = document.getElementById(`task-${taskId}`);
    const taskBelowElement = document.getElementById(`task-${taskBelow.id}`);
    
    if (taskElement && taskBelowElement) {
      // Dodaj klasy animacji
      taskElement.classList.add('task-moving-down');
      taskBelowElement.classList.add('task-moving-up');
      
      // Usuń klasy po zakończeniu animacji
      setTimeout(() => {
        taskElement.classList.remove('task-moving-down');
        taskBelowElement.classList.remove('task-moving-up');
      }, 300);
    }
    
    // Zamień zadania miejscami w stanie aplikacji
    // Tworzymy kopię zadań
    const updatedTasks = [...localTasks];
    
    // Znajdź indeksy obu zadań w pełnej liście zadań
    const taskIndex = updatedTasks.findIndex(task => task.id === taskId);
    const belowTaskIndex = updatedTasks.findIndex(task => task.id === taskBelow.id);
    
    // Zamień zadania miejscami
    [updatedTasks[taskIndex], updatedTasks[belowTaskIndex]] = 
    [updatedTasks[belowTaskIndex], updatedTasks[taskIndex]];
    
    // Zaktualizuj stan lokalny
    setTasks(updatedTasks);
    
    // Zaktualizuj zadania w głównym stanie aplikacji
    updatedTasks.forEach(task => {
      if (task.id === taskId || task.id === taskBelow.id) {
        updateTask(task);
      }
    });
  };

  const getCurrentProject = () => {
    return projects.find(project => project.id === activeProject) || projects[0];
  };

  const currentProject = getCurrentProject();
  
  // Grupowanie zadań według projektów dla widoku "Wszystkie zadania"
  const getTasksByProject = () => {
    if (activeProject !== 'all') return null;
    
    const projectsWithTasks: { project: Project; tasks: Task[] }[] = [];
    
    // Pobierz wszystkie projekty oprócz "Wszystkie zadania" i "Ukończone"
    const relevantProjects = projects.filter(p => p.id !== 'all' && p.id !== 'completed');
    
    // Dla każdego projektu znajdź jego zadania
    relevantProjects.forEach(project => {
      const projectTasks = tasks.filter(task => task.projectId === project.id && !task.completed);
      
      // Dodaj projekt i jego zadania do listy tylko jeśli ma jakieś zadania
      if (projectTasks.length > 0) {
        projectsWithTasks.push({
          project,
          tasks: projectTasks
        });
      }
    });
    
    return projectsWithTasks;
  };
  
  const tasksByProject = getTasksByProject();

  // Funkcja do renderowania pojedynczego zadania
  const renderTask = (task: Task) => (
    <li 
      key={task.id}
      id={`task-${task.id}`}
      className={`task-item ${task.completed ? 'completed' : ''}`}
      draggable={true}
      onDragStart={(e) => handleTaskDragStart(e, task.id)}
      onDragEnd={handleTaskDragEnd}
      onClick={(e) => {
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
      }}
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
                {task.priority === 'low' && 'Niski'}
                {task.priority === 'medium' && 'Średni'}
                {task.priority === 'high' && 'Wysoki'}
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
                  <span>{task.notes.length > 30 ? task.notes.substring(0, 30) + '...' : task.notes}</span>
                </div>
              )}
            </div>
          )}
          
          {expandedTaskId === task.id && (
            <div className="subtasks-container">
              {task.subTasks && task.subTasks.length > 0 && (
                <ul className="subtasks-list">
                  {task.subTasks.map(subTask => (
                    <li key={subTask.id} className="subtask-item">
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
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
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
                    onPaste={(e) => handlePaste(e, task.sectionId, task.id)}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSubTaskForm(task.id);
                  }}
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
          
          <div className="task-actions" onClick={(e) => e.stopPropagation()}>
            {!task.completed && (
              <>
                <button 
                  className="move-up-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveTaskUp(task.id);
                  }}
                  aria-label="Przesuń zadanie w górę"
                  title="Przesuń w górę"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </svg>
                </button>
                
                <button 
                  className="move-down-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveTaskDown(task.id);
                  }}
                  aria-label="Przesuń zadanie w dół"
                  title="Przesuń w dół"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                
                <button 
                  className="edit-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditingTask(task);
                  }}
                  aria-label="Edytuj zadanie"
                  title="Edytuj"
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
                    title="Dodaj podzadanie"
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
              onClick={(e) => {
                e.stopPropagation();
                deleteTask(task.id);
              }}
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
  );

  // Renderowanie sekcji z zadaniami
  const renderSections = () => {
    // Filtruj sekcje dla aktualnego projektu
    const projectSections = sections.filter(section => section.projectId === activeProject)
      .sort((a, b) => a.order - b.order);
    
    return projectSections.map(section => {
      // Znajdź zadania dla tej sekcji
      const sectionTasks = tasks.filter(task => 
        task.sectionId === section.id && 
        !task.completed && 
        task.projectId === activeProject
      );
      
      return (
        <div 
          key={section.id} 
          id={`section-${section.id}`}
          className={`section ${dragOverSectionId === section.id ? 'drag-over' : ''}`}
          draggable={editingSectionId !== section.id}
          onDragStart={(e) => handleSectionDragStart(e, section.id)}
          onDragEnd={handleSectionDragEnd}
          onDragOver={(e) => handleSectionDragOver(e, section.id)}
          onDragLeave={handleSectionDragLeave}
          onDrop={(e) => handleSectionDrop(e, section.id)}
        >
          <div className="section-header">
            {editingSectionId === section.id ? (
              <form onSubmit={handleUpdateSection}>
                <input
                  type="text"
                  value={editedSectionTitle}
                  onChange={(e) => setEditedSectionTitle(e.target.value)}
                  autoFocus
                  required
                />
                <div className="section-edit-actions">
                  <button type="submit" className="save-button">Zapisz</button>
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={() => {
                      setEditingSectionId(null);
                      setEditedSectionTitle('');
                    }}
                  >
                    Anuluj
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="section-title-area">
                  <div className="drag-handle" title="Przeciągnij, aby zmienić kolejność">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="8" y1="6" x2="21" y2="6"></line>
                      <line x1="8" y1="12" x2="21" y2="12"></line>
                      <line x1="8" y1="18" x2="21" y2="18"></line>
                      <line x1="3" y1="6" x2="3.01" y2="6"></line>
                      <line x1="3" y1="12" x2="3.01" y2="12"></line>
                      <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                  </div>
                  <h3>{section.title}</h3>
                </div>
                <div className="section-actions">
                  <button 
                    className="edit-section-button"
                    onClick={() => startEditingSection(section)}
                    aria-label="Edytuj sekcję"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button 
                    className="delete-section-button"
                    onClick={() => deleteSection(section.id)}
                    aria-label="Usuń sekcję"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
          
          <ul 
            className={`tasks ${dragOverSection === section.id ? 'section-drag-over' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              if (isDraggingTask) {
                setDragOverSection(section.id);
              }
            }}
            onDragLeave={() => setDragOverSection(null)}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedTaskId) {
                const draggedTask = tasks.find(task => task.id === draggedTaskId);
                if (draggedTask) {
                  updateTask({
                    ...draggedTask,
                    sectionId: section.id
                  });
                }
              }
            }}
          >
            {sectionTasks.map(task => renderTask(task))}
            {sectionTasks.length === 0 && dragOverSection === section.id && (
              <div className="drop-indicator">Upuść tutaj</div>
            )}
          </ul>
          
          {showSectionTaskForm === section.id ? (
            <form 
              className="section-task-form" 
              onSubmit={(e) => handleAddTask(e, section.id)}
              ref={sectionTaskFormRef}
            >
              <input
                type="text"
                placeholder="Tytuł zadania"
                value={newSectionTaskTitle}
                onChange={(e) => setNewSectionTaskTitle(e.target.value)}
                onPaste={(e) => handlePaste(e, section.id, undefined)}
                autoFocus
                required
              />
              <div className="form-actions">
                <button type="submit" className="submit-button">Dodaj</button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => {
                    setShowSectionTaskForm(null);
                    setNewSectionTaskTitle('');
                  }}
                >
                  Anuluj
                </button>
              </div>
            </form>
          ) : (
            <button 
              className="add-task-to-section-button"
              onClick={() => setShowSectionTaskForm(section.id)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Dodaj zadanie
            </button>
          )}
        </div>
      );
    });
  };

  return (
    <div className="task-list">
      <div className="task-list-header">
        <h2 style={{ color: currentProject.color }}>{currentProject.name}</h2>
        {activeProject !== 'completed' && activeProject !== 'all' && (
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
        <form className="task-form" onSubmit={(e) => handleAddTask(e)} ref={taskFormRef}>
          <input
            type="text"
            placeholder="Tytuł zadania"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onPaste={(e) => handlePaste(e, undefined, undefined)}
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
                    <label>Wybierz datę:</label>
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
                      {repeatType ? 'Zmień powtarzanie' : 'Dodaj powtarzanie'}
                    </button>
                  </div>
                  
                  {showRepeatOptions && (
                    <div className="repeat-options">
                      <div className="repeat-type-options">
                        <button 
                          type="button"
                          className={`${repeatType === 'daily' ? 'active' : ''}`}
                          onClick={() => setRepeatType('daily')}
                        >
                          Codziennie
                        </button>
                        <button 
                          type="button"
                          className={`${repeatType === 'weekly' ? 'active' : ''}`}
                          onClick={() => setRepeatType('weekly')}
                        >
                          Co tydzień
                        </button>
                        <button 
                          type="button"
                          className={`${repeatType === 'monthly' ? 'active' : ''}`}
                          onClick={() => setRepeatType('monthly')}
                        >
                          Co miesiąc
                        </button>
                        <button 
                          type="button"
                          className={`${repeatType === 'yearly' ? 'active' : ''}`}
                          onClick={() => setRepeatType('yearly')}
                        >
                          Co rok
                        </button>
                      </div>
                      
                      {repeatType && (
                        <div className="repeat-end-date">
                          <label>Data zakończenia powtarzania:</label>
                          <input 
                            type="date" 
                            value={repeatEndDate} 
                            onChange={(e) => setRepeatEndDate(e.target.value)}
                          />
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
        {activeProject === 'all' && tasksByProject ? (
          // Widok "Wszystkie zadania" - grupowanie według projektów
          <div className="all-tasks-view">
            {tasksByProject.length === 0 ? (
              <div className="empty-tasks">
                <p>Brak zadań we wszystkich projektach</p>
              </div>
            ) : (
              tasksByProject.map(({ project, tasks }) => (
                <div key={project.id} className="project-tasks-group">
                  <div className="project-group-header">
                    <div className="project-color" style={{ backgroundColor: project.color }}></div>
                    <h3>{project.name}</h3>
                  </div>
                  <ul className="tasks">
                    {tasks.map(task => renderTask(task))}
                  </ul>
                </div>
              ))
            )}
          </div>
        ) : (
          // Widok pojedynczego projektu
          <div className="project-view">
            {/* Zadania bez sekcji */}
            <ul 
              className={`tasks no-section-tasks ${dragOverSection === 'none' ? 'section-drag-over' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (isDraggingTask) {
                  console.log('Przeciąganie nad obszarem bez sekcji');
                  setDragOverSection('none');
                }
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                console.log('Opuszczenie obszaru bez sekcji');
                setDragOverSection(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('Upuszczenie na obszar bez sekcji');
                
                if (!draggedTaskId) {
                  console.log('Brak przeciąganego zadania');
                  return;
                }
                
                try {
                  const draggedTask = tasks.find(task => task.id === draggedTaskId);
                  
                  if (!draggedTask) {
                    console.error('Nie znaleziono przeciąganego zadania:', draggedTaskId);
                    return;
                  }
                  
                  console.log('Usuwanie przypisania do sekcji dla zadania:', {
                    id: draggedTask.id,
                    title: draggedTask.title,
                    obecnaSekcja: draggedTask.sectionId
                  });
                  
                  // Aktualizuj zadanie, usuwając przypisanie do sekcji
                  const updatedTask = {
                    ...draggedTask,
                    sectionId: undefined
                  };
                  
                  updateTask(updatedTask);
                  console.log('Zadanie przeniesione poza sekcje');
                } catch (error) {
                  console.error('Błąd podczas przenoszenia zadania poza sekcje:', error);
                }
              }}
            >
              {tasks
                .filter(task => task.projectId === activeProject && !task.sectionId && !task.completed)
                .map(task => renderTask(task))}
              {tasks.filter(task => task.projectId === activeProject && !task.sectionId && !task.completed).length === 0 && 
               dragOverSection === 'none' && (
                <div className="drop-indicator">Upuść tutaj, aby usunąć z sekcji</div>
              )}
            </ul>
            
            {/* Sekcje z zadaniami */}
            {activeProject !== 'completed' && activeProject !== 'all' && (
              <>
                {renderSections()}
                
                {/* Obszar dodawania nowej sekcji */}
                <div 
                  className={`add-section-area ${hoverSectionArea ? 'hover' : ''}`}
                  onMouseEnter={() => setHoverSectionArea(true)}
                  onMouseLeave={() => setHoverSectionArea(false)}
                  ref={addSectionAreaRef}
                >
                  {showAddSectionForm ? (
                    <form className="add-section-form" onSubmit={handleAddSection} ref={sectionFormRef}>
                      <input
                        type="text"
                        placeholder="Nazwa sekcji"
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        autoFocus
                        required
                      />
                      <div className="section-form-actions">
                        <button type="submit" className="submit-button">Dodaj</button>
                        <button 
                          type="button" 
                          className="cancel-button"
                          onClick={() => {
                            setShowAddSectionForm(false);
                            setNewSectionTitle('');
                          }}
                        >
                          Anuluj
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button 
                      className="add-section-button"
                      onClick={() => setShowAddSectionForm(true)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      Dodaj sekcję
                    </button>
                  )}
                </div>
              </>
            )}
            
            {/* Komunikat o braku zadań lub wyświetlenie pierwszego zadania */}
            {(() => {
              const filteredTasks = tasks.filter(task => 
                task.projectId === activeProject && 
                (activeProject === 'completed' ? task.completed : !task.completed)
              );
              
              if (filteredTasks.length === 0) {
                return (
                  <div className="empty-tasks">
                    <p>
                      {activeProject === 'completed' 
                        ? 'Brak ukończonych zadań' 
                        : 'Brak zadań w tym projekcie'}
                    </p>
                    {activeProject !== 'completed' && (
                      <button 
                        className="add-first-task"
                        onClick={() => setShowTaskForm(true)}
                      >
                        Dodaj pierwsze zadanie
                      </button>
                    )}
                  </div>
                );
              }
              return null;
            })()}
          </div>
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
      
      {/* Modal z opcjami wklejania wielu linijek */}
      {showPasteOptionsModal && (
        <div className="modal-overlay">
          <div className="paste-options-modal" ref={pasteOptionsModalRef}>
            <h3>Wykryto wklejanie wielu linii</h3>
            <p>Wykryto <strong>{pastedLines.length}</strong> linii tekstu. Wybierz jedną z opcji:</p>
            
            <div className="paste-preview">
              <h4>Podgląd:</h4>
              <ul>
                {pastedLines.slice(0, 5).map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
                {pastedLines.length > 5 && <li>... i {pastedLines.length - 5} więcej</li>}
              </ul>
            </div>
            
            <div className="paste-options">
              <button 
                className="option-button"
                onClick={handleAddMultipleTasks}
              >
                Dodaj jako osobne zadania
              </button>
              
              {pasteTargetTaskId ? (
                <button 
                  className="option-button"
                  onClick={handleAddMultipleSubTasks}
                >
                  Dodaj jako podzadania do bieżącego zadania
                </button>
              ) : (
                <button 
                  className="option-button"
                  onClick={handleAddTaskWithSubTasks}
                  style={{ 
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  Utwórz zadanie z podzadaniami
                  <small style={{ display: 'block', marginTop: '4px', opacity: '0.8' }}>
                    Pierwsza linia jako tytuł zadania, pozostałe jako podzadania
                  </small>
                </button>
              )}
              
              <button 
                className="cancel-button"
                onClick={() => {
                  setShowPasteOptionsModal(false);
                  setPastedLines([]);
                  setPasteTargetTaskId(null);
                }}
                style={{ 
                  marginTop: '16px', 
                  padding: '14px 16px',
                  fontSize: 'var(--font-size-md)',
                  fontWeight: 'var(--font-weight-medium)',
                  width: '100%'
                }}
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