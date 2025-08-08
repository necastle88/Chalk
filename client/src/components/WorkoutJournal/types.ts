export interface WorkoutJournalProps {
  limit?: number;
  showFilters?: boolean;
  showTitle?: boolean;
  refreshTrigger?: number;
}

export interface JournalFilterState {
  categoryFilter: string;
  dateFilter: string;
  searchTerm: string;
  exerciseType: 'all' | 'strength' | 'cardio';
}

export interface CardioEntry {
  id: string;
  exerciseName: string;
  category: string;
  duration: number; // in minutes
  heartRateStart?: number;
  heartRateMax?: number;
  caloriesBurned?: number;
  perceivedEffort?: number; // 1-10 scale
  notes?: string;
  date: string;
}

export interface StrengthEntry {
  id: string;
  exerciseName: string;
  category: string;
  sets: number;
  reps: number;
  weight: number;
  unit: 'lbs' | 'kg';
  duration?: number; // total exercise duration in minutes
  restDuration?: number;
  notes?: string;
  date: string;
}

export type JournalEntry = StrengthEntry | CardioEntry;

export interface JournalPagination {
  limit: number;
  offset: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}
