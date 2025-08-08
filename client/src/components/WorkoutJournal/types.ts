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
  exerciseType: 'all' | 'strength' | 'cardio' | 'daily';
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

export interface StrengthPR {
  category: string;
  exerciseName: string;
  weight: number;
  unit: 'lbs' | 'kg';
  reps: number;
  sets: number;
  date: string;
  oneRepMax?: number;
}

export interface CardioPR {
  exerciseName: string;
  fastestTime?: number; // in minutes for time-based activities
  longestDistance?: number; // in miles/km
  longestDuration?: number; // in minutes
  bestPace?: number; // pace in min/mile or min/km
  date: string;
  category: string;
}

export interface PersonalRecords {
  strengthPRs: Record<string, StrengthPR[]>; // grouped by muscle group
  cardioPRs: CardioPR[];
  totalWorkouts: number;
  totalWorkoutTime: number; // in minutes
  strengthWorkouts: number;
  cardioWorkouts: number;
  currentStreak: number;
  longestStreak: number;
}
