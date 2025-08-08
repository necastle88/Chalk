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
