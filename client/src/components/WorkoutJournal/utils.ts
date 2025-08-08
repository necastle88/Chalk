import type { WorkoutLogEntry } from "../../services/workoutApi";
import type { StrengthEntry, CardioEntry } from "./types";

export const formatJournalDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatDuration = (seconds?: number) => {
  if (!seconds) return "N/A";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }
  
  return remainingSeconds > 0 
    ? `${minutes}m ${remainingSeconds}s`
    : `${minutes}m`;
};

export const formatDurationMinutes = (seconds?: number) => {
  if (!seconds) return "N/A";
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
};

export const formatWeight = (weight: number, unit: 'lbs' | 'kg' = 'lbs') => {
  return `${weight} ${unit}`;
};

export const formatHeartRate = (bpm?: number) => {
  return bpm ? `${bpm} bpm` : "N/A";
};

export const formatPerceivedEffort = (effort?: number) => {
  if (!effort) return "N/A";
  return `${effort}/10`;
};

export const formatCalories = (calories?: number) => {
  return calories ? `${calories} cal` : "N/A";
};

export const isCardioExercise = (category: string) => {
  return category.toLowerCase() === 'cardio';
};

export const convertWorkoutLogToJournalEntry = (log: WorkoutLogEntry): StrengthEntry | CardioEntry => {
  if (isCardioExercise(log.category)) {
    return {
      id: log.id,
      exerciseName: log.exerciseName,
      category: log.category,
      duration: log.duration ? Math.round(log.duration / 60) : 0, // convert to minutes
      heartRateStart: undefined, // Would need to be added to WorkoutLogEntry
      heartRateMax: undefined, // Would need to be added to WorkoutLogEntry
      caloriesBurned: undefined, // Would need to be added to WorkoutLogEntry
      perceivedEffort: undefined, // Would need to be added to WorkoutLogEntry
      notes: log.notes,
      date: log.date,
    } as CardioEntry;
  } else {
    return {
      id: log.id,
      exerciseName: log.exerciseName,
      category: log.category,
      sets: log.sets,
      reps: log.reps,
      weight: log.weight,
      unit: 'lbs', // Default unit, would need to be configurable
      duration: log.duration ? Math.round(log.duration / 60) : undefined,
      restDuration: log.restDuration,
      notes: log.notes,
      date: log.date,
    } as StrengthEntry;
  }
};

export const calculateDateRange = (dateFilter: string): Date | undefined => {
  if (dateFilter && dateFilter !== "all") {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateFilter));
    return startDate;
  }
  return undefined;
};

export const formatDateForGrouping = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const formatDateHeader = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const dateKey = formatDateForGrouping(dateString);
  const todayKey = formatDateForGrouping(today.toISOString());
  const yesterdayKey = formatDateForGrouping(yesterday.toISOString());
  
  if (dateKey === todayKey) {
    return "Today";
  } else if (dateKey === yesterdayKey) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
};

export const groupEntriesByDate = (entries: (StrengthEntry | CardioEntry)[]): Record<string, (StrengthEntry | CardioEntry)[]> => {
  return entries.reduce((groups, entry) => {
    const dateKey = formatDateForGrouping(entry.date);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(entry);
    return groups;
  }, {} as Record<string, (StrengthEntry | CardioEntry)[]>);
};

export const calculateDailySessionStats = (entries: (StrengthEntry | CardioEntry)[]) => {
  const totalExercises = entries.length;
  const totalDuration = entries.reduce((sum, entry) => {
    return sum + (entry.duration || 0);
  }, 0);
  
  const strengthCount = entries.filter(entry => !isCardioExercise(entry.category)).length;
  const cardioCount = entries.filter(entry => isCardioExercise(entry.category)).length;
  
  return {
    totalExercises,
    totalDuration,
    strengthCount,
    cardioCount,
  };
};
