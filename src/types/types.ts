export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export type RepeatType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface RepeatConfig {
  type: RepeatType;
  interval?: number; // np. co 2 dni, co 3 tygodnie
  endDate?: string; // data zakończenia powtarzania
  daysOfWeek?: number[]; // dni tygodnia (0-6, gdzie 0 to niedziela)
  daysOfMonth?: number[]; // dni miesiąca (1-31)
  monthsOfYear?: number[]; // miesiące (0-11, gdzie 0 to styczeń)
}

export interface Section {
  id: string;
  title: string;
  projectId: string;
  order: number;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  projectId: string;
  sectionId?: string; // Opcjonalne pole dla zadań przypisanych do sekcji
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  notes?: string;
  createdAt: string;
  subTasks?: SubTask[];
  repeat?: RepeatConfig;
}

export interface Project {
  id: string;
  name: string;
  color: string;
}

export interface AppSettings {
  language: 'pl' | 'en';
  darkMode: boolean;
}