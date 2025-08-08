import { PrismaClient, ExerciseCategory } from '@prisma/client';
import { sanitizeExerciseInput, detectExercise, getOfflineExerciseDetection } from './exerciseDetectionService';
import sanitizeHtml from 'sanitize-html';

const prisma = new PrismaClient();

// Helper function to extract cardio metrics from notes
function extractCardioMetrics(notes: string | null, category: ExerciseCategory): any {
  if (!notes || category !== ExerciseCategory.CARDIO) {
    return {};
  }
  
  const cardioMatch = notes.match(/\[CARDIO_METRICS\](.+?)(?:\n|$)/);
  if (cardioMatch) {
    try {
      return JSON.parse(cardioMatch[1]);
    } catch (error) {
      console.warn('Failed to parse cardio metrics from notes:', error);
      return {};
    }
  }
  return {};
}

// Helper function to clean notes by removing cardio metrics
function cleanNotes(notes: string | null): string | undefined {
  if (!notes) return undefined;
  return notes.replace(/\[CARDIO_METRICS\].+?(?:\n|$)/g, '').trim() || undefined;
}

export interface CreateWorkoutLogData {
  exerciseDescription: string;
  sets: number;
  reps: number;
  weight: number;
  duration?: number; // for time-based exercises in seconds
  restDuration?: number;
  notes?: string;
  category?: ExerciseCategory;
  // Cardio-specific fields
  distance?: number; // distance in miles
  laps?: number;
  heartRate?: number; // average heart rate in bpm
  heartRateMax?: number; // maximum heart rate in bpm
  perceivedEffort?: string; // effort level
  lapTime?: number; // average lap time in seconds
  estimatedCalories?: number; // estimated calories burned
  pace?: string; // pace per mile/km
}

export interface UpdateWorkoutLogData {
  exerciseName?: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number; // for time-based exercises in seconds
  restDuration?: number;
  notes?: string;
  category?: ExerciseCategory;
  // Cardio-specific fields
  distance?: number;
  laps?: number;
  heartRate?: number;
  heartRateMax?: number;
  perceivedEffort?: string;
  lapTime?: number;
  estimatedCalories?: number;
  pace?: string;
}

export interface WorkoutLogResponse {
  id: string;
  exerciseName: string;
  category: ExerciseCategory;
  sets: number;
  reps: number;
  weight: number;
  duration?: number; // for time-based exercises in seconds
  restDuration?: number;
  notes?: string;
  date: Date;
  aiConfidence?: number;
  // Cardio-specific fields
  distance?: number;
  laps?: number;
  heartRate?: number;
  heartRateMax?: number;
  perceivedEffort?: string;
  lapTime?: number;
  estimatedCalories?: number;
  pace?: string;
}

export interface PaginatedWorkoutLogsResponse {
  data: WorkoutLogResponse[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

// OWASP Security: Input validation and sanitization
function validateWorkoutLogInput(data: CreateWorkoutLogData): void {
  // Validate required fields
  if (!data.exerciseDescription || typeof data.exerciseDescription !== 'string') {
    throw new Error('Exercise description is required and must be a string');
  }

  // For cardio exercises, allow more flexible sets/reps/weight validation
  if (data.category === ExerciseCategory.CARDIO) {
    // Cardio typically uses sets=1, reps=1, weight=0
    if (typeof data.sets !== 'number' || data.sets < 1 || data.sets > 10) {
      throw new Error('Sets for cardio must be a number between 1 and 10');
    }
    if (typeof data.reps !== 'number' || data.reps < 1 || data.reps > 100) {
      throw new Error('Reps for cardio must be a number between 1 and 100');
    }
    if (typeof data.weight !== 'number' || data.weight < 0 || data.weight > 100) {
      throw new Error('Weight for cardio must be a number between 0 and 100 (for weighted cardio)');
    }
  } else {
    // Standard strength training validation
    if (typeof data.sets !== 'number' || data.sets < 1 || data.sets > 50) {
      throw new Error('Sets must be a number between 1 and 50');
    }
    if (typeof data.reps !== 'number' || data.reps < 1 || data.reps > 1000) {
      throw new Error('Reps must be a number between 1 and 1000');
    }
    if (typeof data.weight !== 'number' || data.weight < 0 || data.weight > 2000) {
      throw new Error('Weight must be a number between 0 and 2000');
    }
  }

  // Optional field validations
  if (data.duration !== undefined) {
    // Allow longer durations for cardio (up to 8 hours for marathons/long rides)
    const maxDuration = data.category === ExerciseCategory.CARDIO ? 28800 : 3600; // 8 hours vs 1 hour
    if (typeof data.duration !== 'number' || data.duration < 0 || data.duration > maxDuration) {
      const maxHours = maxDuration / 3600;
      throw new Error(`Duration must be a number between 0 and ${maxHours} hours (${maxDuration} seconds)`);
    }
  }

  if (data.restDuration !== undefined) {
    if (typeof data.restDuration !== 'number' || data.restDuration < 0 || data.restDuration > 3600) {
      throw new Error('Rest duration must be a number between 0 and 3600 seconds');
    }
  }

  if (data.notes !== undefined) {
    if (typeof data.notes !== 'string' || data.notes.length > 500) {
      throw new Error('Notes must be a string with maximum 500 characters');
    }
  }

  if (data.category !== undefined) {
    if (!Object.values(ExerciseCategory).includes(data.category)) {
      throw new Error('Invalid exercise category');
    }
  }

  // Validate cardio-specific fields
  if (data.distance !== undefined) {
    if (typeof data.distance !== 'number' || data.distance < 0 || data.distance > 500) {
      throw new Error('Distance must be a number between 0 and 500 miles (for ultra-marathons)');
    }
  }

  if (data.laps !== undefined) {
    if (typeof data.laps !== 'number' || data.laps < 1 || data.laps > 1000) {
      throw new Error('Laps must be a number between 1 and 1000');
    }
  }

  if (data.heartRate !== undefined) {
    if (typeof data.heartRate !== 'number' || data.heartRate < 40 || data.heartRate > 250) {
      throw new Error('Heart rate must be a number between 40 and 250 bpm (resting to max exercise)');
    }
  }

  if (data.heartRateMax !== undefined) {
    if (typeof data.heartRateMax !== 'number' || data.heartRateMax < 40 || data.heartRateMax > 250) {
      throw new Error('Maximum heart rate must be a number between 40 and 250 bpm');
    }
  }

  if (data.lapTime !== undefined) {
    if (typeof data.lapTime !== 'number' || data.lapTime < 60 || data.lapTime > 7200) {
      throw new Error('Lap time must be a number between 1 minute and 2 hours (60-7200 seconds)');
    }
  }

  if (data.estimatedCalories !== undefined) {
    if (typeof data.estimatedCalories !== 'number' || data.estimatedCalories < 1 || data.estimatedCalories > 10000) {
      throw new Error('Estimated calories must be a number between 1 and 10,000 (for long endurance events)');
    }
  }

  if (data.perceivedEffort !== undefined) {
    if (typeof data.perceivedEffort !== 'string' || data.perceivedEffort.trim().length === 0) {
      throw new Error('Perceived effort must be a non-empty string');
    }
  }

  if (data.pace !== undefined) {
    if (typeof data.pace !== 'string' || data.pace.trim().length === 0) {
      throw new Error('Pace must be a non-empty string');
    }
  }
}

function sanitizeWorkoutLogData(data: CreateWorkoutLogData): CreateWorkoutLogData {
  return {
    exerciseDescription: sanitizeExerciseInput(data.exerciseDescription),
    sets: Math.floor(Math.abs(data.sets)),
    reps: Math.floor(Math.abs(data.reps)),
    weight: Math.abs(data.weight),
    duration: data.duration ? Math.floor(Math.abs(data.duration)) : undefined,
    restDuration: data.restDuration ? Math.floor(Math.abs(data.restDuration)) : undefined,
    notes: data.notes ? sanitizeHtml(data.notes.trim(), {
      allowedTags: [],
      allowedAttributes: {}
    }).slice(0, 500) : undefined,
    category: data.category,
    // Cardio-specific fields
    distance: data.distance ? Math.round(Math.abs(data.distance) * 100) / 100 : undefined,
    laps: data.laps ? Math.floor(Math.abs(data.laps)) : undefined,
    heartRate: data.heartRate ? Math.floor(Math.abs(data.heartRate)) : undefined,
    heartRateMax: data.heartRateMax ? Math.floor(Math.abs(data.heartRateMax)) : undefined,
    lapTime: data.lapTime ? Math.floor(Math.abs(data.lapTime)) : undefined,
    estimatedCalories: data.estimatedCalories ? Math.floor(Math.abs(data.estimatedCalories)) : undefined,
    perceivedEffort: data.perceivedEffort ? data.perceivedEffort.trim() : undefined,
    pace: data.pace ? data.pace.trim() : undefined,
  };
}

export async function createWorkoutLog(
  userId: string,
  data: CreateWorkoutLogData,
  useAI: boolean = true
): Promise<WorkoutLogResponse> {
  try {
    // OWASP Security: Validate user ID format
    if (!userId || typeof userId !== 'string' || userId.length < 10) {
      throw new Error('Invalid user ID');
    }

    // Validate and sanitize input
    validateWorkoutLogInput(data);
    const sanitizedData = sanitizeWorkoutLogData(data);

    let exerciseName: string;
    let category: ExerciseCategory;
    let aiConfidence: number | undefined;

    // Use provided category or detect with AI
    if (sanitizedData.category) {
      exerciseName = sanitizedData.exerciseDescription;
      category = sanitizedData.category;
    } else if (useAI) {
      try {
        const detection = await detectExercise(sanitizedData.exerciseDescription);
        exerciseName = detection.exerciseName;
        category = detection.category;
        aiConfidence = detection.confidence;
      } catch (aiError) {
        console.warn('AI detection failed, using offline fallback:', aiError);
        const fallback = getOfflineExerciseDetection(sanitizedData.exerciseDescription);
        exerciseName = fallback.exerciseName;
        category = fallback.category;
        aiConfidence = fallback.confidence;
      }
    } else {
      const fallback = getOfflineExerciseDetection(sanitizedData.exerciseDescription);
      exerciseName = fallback.exerciseName;
      category = fallback.category;
    }

    // Create or get exercise record
    let exercise = await prisma.exercise.findFirst({
      where: { name: exerciseName }
    });

    if (!exercise) {
      exercise = await prisma.exercise.create({
        data: {
          name: exerciseName,
          category: category,
          description: `Auto-created from user input: ${sanitizedData.exerciseDescription}`
        }
      });
    }

    // Create workout log entry
    // For cardio exercises, embed cardio metrics in notes as JSON
    let finalNotes = sanitizedData.notes || '';
    
    if (category === ExerciseCategory.CARDIO) {
      const cardioMetrics: any = {};
      
      if (sanitizedData.distance) cardioMetrics.distance = sanitizedData.distance;
      if (sanitizedData.laps) cardioMetrics.laps = sanitizedData.laps;
      if (sanitizedData.heartRate) cardioMetrics.heartRate = sanitizedData.heartRate;
      if (sanitizedData.heartRateMax) cardioMetrics.heartRateMax = sanitizedData.heartRateMax;
      if (sanitizedData.perceivedEffort) cardioMetrics.perceivedEffort = sanitizedData.perceivedEffort;
      if (sanitizedData.lapTime) cardioMetrics.lapTime = sanitizedData.lapTime;
      if (sanitizedData.estimatedCalories) cardioMetrics.estimatedCalories = sanitizedData.estimatedCalories;
      if (sanitizedData.pace) cardioMetrics.pace = sanitizedData.pace;
      
      if (Object.keys(cardioMetrics).length > 0) {
        const cardioData = JSON.stringify(cardioMetrics);
        finalNotes = finalNotes ? `${finalNotes}\n[CARDIO_METRICS]${cardioData}` : `[CARDIO_METRICS]${cardioData}`;
      }
    }
    
    const workoutLog = await prisma.workoutLog.create({
      data: {
        userId,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        category: category,
        sets: sanitizedData.sets,
        reps: sanitizedData.reps,
        weight: sanitizedData.weight,
        duration: sanitizedData.duration,
        restDuration: sanitizedData.restDuration,
        notes: finalNotes || undefined
      }
    });

    // Extract cardio metrics for response
    const cardioMetrics = extractCardioMetrics(workoutLog.notes, workoutLog.category);
    const cleanedNotes = cleanNotes(workoutLog.notes);

    return {
      id: workoutLog.id,
      exerciseName: workoutLog.exerciseName,
      category: workoutLog.category,
      sets: workoutLog.sets,
      reps: workoutLog.reps,
      weight: workoutLog.weight,
      duration: workoutLog.duration || undefined,
      restDuration: workoutLog.restDuration || undefined,
      notes: cleanedNotes,
      date: workoutLog.date,
      aiConfidence,
      ...cardioMetrics
    };

  } catch (error) {
    console.error('Error creating workout log:', error);
    throw error;
  }
}

export async function getWorkoutLogs(
  userId: string,
  limit: number = 50,
  offset: number = 0,
  category?: ExerciseCategory,
  startDate?: Date,
  endDate?: Date
): Promise<PaginatedWorkoutLogsResponse> {
  try {
    // OWASP Security: Validate input parameters
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID');
    }

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    if (offset < 0) {
      throw new Error('Offset must be non-negative');
    }

    const whereClause: any = { userId };

    if (category && Object.values(ExerciseCategory).includes(category)) {
      whereClause.category = category;
    }

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = startDate;
      if (endDate) whereClause.date.lte = endDate;
    }

    // Get total count for pagination
    const totalCount = await prisma.workoutLog.count({
      where: whereClause
    });

    const workoutLogs = await prisma.workoutLog.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset
    });

    const data = workoutLogs.map(log => {
      const cardioMetrics = extractCardioMetrics(log.notes, log.category);
      const cleanedNotes = cleanNotes(log.notes);
      
      return {
        id: log.id,
        exerciseName: log.exerciseName,
        category: log.category,
        sets: log.sets,
        reps: log.reps,
        weight: log.weight,
        duration: log.duration || undefined,
        restDuration: log.restDuration || undefined,
        notes: cleanedNotes,
        date: log.date,
        ...cardioMetrics
      };
    });

    return {
      data,
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: offset + limit < totalCount
      }
    };

  } catch (error) {
    console.error('Error fetching workout logs:', error);
    throw error;
  }
}

export async function getWorkoutStats(userId: string, days: number = 30): Promise<any> {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID');
    }

    if (days < 1 || days > 365) {
      throw new Error('Days must be between 1 and 365');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await prisma.workoutLog.groupBy({
      by: ['category'],
      where: {
        userId,
        date: { gte: startDate }
      },
      _count: {
        id: true
      },
      _sum: {
        sets: true,
        reps: true
      },
      _avg: {
        weight: true
      }
    });

    return stats.map(stat => ({
      category: stat.category,
      totalWorkouts: stat._count.id,
      totalSets: stat._sum.sets || 0,
      totalReps: stat._sum.reps || 0,
      averageWeight: stat._avg.weight ? Math.round(stat._avg.weight * 100) / 100 : 0
    }));

  } catch (error) {
    console.error('Error fetching workout stats:', error);
    throw error;
  }
}

export async function deleteWorkoutLog(userId: string, logId: string): Promise<void> {
  try {
    if (!userId || !logId) {
      throw new Error('User ID and log ID are required');
    }

    // Verify ownership before deletion
    const log = await prisma.workoutLog.findFirst({
      where: { id: logId, userId }
    });

    if (!log) {
      throw new Error('Workout log not found or access denied');
    }

    await prisma.workoutLog.delete({
      where: { id: logId }
    });

  } catch (error) {
    console.error('Error deleting workout log:', error);
    throw error;
  }
}

export async function updateWorkoutLog(userId: string, logId: string, data: UpdateWorkoutLogData): Promise<WorkoutLogResponse> {
  try {
    if (!userId || !logId) {
      throw new Error('User ID and log ID are required');
    }

    // Verify ownership before update
    const existingLog = await prisma.workoutLog.findFirst({
      where: { id: logId, userId }
    });

    if (!existingLog) {
      throw new Error('Workout log not found or access denied');
    }

    // Validate and sanitize update data
    const updateData: any = {};
    
    if (data.exerciseName !== undefined) {
      if (typeof data.exerciseName !== 'string' || data.exerciseName.trim().length === 0) {
        throw new Error('Exercise name must be a non-empty string');
      }
      updateData.exerciseName = sanitizeHtml(data.exerciseName.trim(), {
        allowedTags: [],
        allowedAttributes: {}
      }).slice(0, 200);
    }

    if (data.sets !== undefined) {
      if (typeof data.sets !== 'number' || data.sets < 1 || data.sets > 50) {
        throw new Error('Sets must be a number between 1 and 50');
      }
      updateData.sets = Math.floor(Math.abs(data.sets));
    }

    if (data.reps !== undefined) {
      if (typeof data.reps !== 'number' || data.reps < 1 || data.reps > 1000) {
        throw new Error('Reps must be a number between 1 and 1000');
      }
      updateData.reps = Math.floor(Math.abs(data.reps));
    }

    if (data.weight !== undefined) {
      if (typeof data.weight !== 'number' || data.weight < 0 || data.weight > 2000) {
        throw new Error('Weight must be a number between 0 and 2000');
      }
      updateData.weight = Math.abs(data.weight);
    }

    if (data.duration !== undefined) {
      // Allow longer durations for cardio updates too
      const maxDuration = (existingLog.category === ExerciseCategory.CARDIO || data.category === ExerciseCategory.CARDIO) ? 28800 : 3600;
      if (typeof data.duration !== 'number' || data.duration < 0 || data.duration > maxDuration) {
        const maxHours = maxDuration / 3600;
        throw new Error(`Duration must be a number between 0 and ${maxHours} hours (${maxDuration} seconds)`);
      }
      updateData.duration = Math.floor(Math.abs(data.duration));
    }

    if (data.restDuration !== undefined) {
      if (typeof data.restDuration !== 'number' || data.restDuration < 0 || data.restDuration > 3600) {
        throw new Error('Rest duration must be a number between 0 and 3600 seconds');
      }
      updateData.restDuration = Math.floor(Math.abs(data.restDuration));
    }

    if (data.notes !== undefined) {
      if (typeof data.notes !== 'string') {
        throw new Error('Notes must be a string');
      }
      updateData.notes = data.notes.trim() ? sanitizeHtml(data.notes.trim(), {
        allowedTags: [],
        allowedAttributes: {}
      }).slice(0, 500) : null;
    }

    if (data.category !== undefined) {
      if (!Object.values(ExerciseCategory).includes(data.category)) {
        throw new Error('Invalid exercise category');
      }
      updateData.category = data.category;
    }

    // Handle cardio metrics update for existing cardio workouts
    if (existingLog.category === ExerciseCategory.CARDIO || data.category === ExerciseCategory.CARDIO) {
      // Extract existing cardio metrics
      const existingCardioMetrics = extractCardioMetrics(existingLog.notes, existingLog.category);
      const cleanedExistingNotes = cleanNotes(existingLog.notes);
      
      // Merge with new cardio data
      const updatedCardioMetrics: any = { ...existingCardioMetrics };
      
      if (data.distance !== undefined) {
        if (typeof data.distance !== 'number' || data.distance < 0 || data.distance > 500) {
          throw new Error('Distance must be a number between 0 and 500 miles');
        }
        updatedCardioMetrics.distance = Math.round(Math.abs(data.distance) * 100) / 100;
      }
      
      if (data.laps !== undefined) {
        if (typeof data.laps !== 'number' || data.laps < 1 || data.laps > 1000) {
          throw new Error('Laps must be a number between 1 and 1000');
        }
        updatedCardioMetrics.laps = Math.floor(Math.abs(data.laps));
      }
      
      if (data.heartRate !== undefined) {
        if (typeof data.heartRate !== 'number' || data.heartRate < 40 || data.heartRate > 250) {
          throw new Error('Heart rate must be a number between 40 and 250 bpm');
        }
        updatedCardioMetrics.heartRate = Math.floor(Math.abs(data.heartRate));
      }
      
      if (data.heartRateMax !== undefined) {
        if (typeof data.heartRateMax !== 'number' || data.heartRateMax < 40 || data.heartRateMax > 250) {
          throw new Error('Maximum heart rate must be a number between 40 and 250 bpm');
        }
        updatedCardioMetrics.heartRateMax = Math.floor(Math.abs(data.heartRateMax));
      }
      
      if (data.perceivedEffort !== undefined) {
        if (typeof data.perceivedEffort !== 'string' || data.perceivedEffort.trim().length === 0) {
          throw new Error('Perceived effort must be a non-empty string');
        }
        updatedCardioMetrics.perceivedEffort = data.perceivedEffort.trim();
      }
      
      if (data.lapTime !== undefined) {
        if (typeof data.lapTime !== 'number' || data.lapTime < 60 || data.lapTime > 7200) {
          throw new Error('Lap time must be a number between 1 minute and 2 hours');
        }
        updatedCardioMetrics.lapTime = Math.floor(Math.abs(data.lapTime));
      }
      
      if (data.estimatedCalories !== undefined) {
        if (typeof data.estimatedCalories !== 'number' || data.estimatedCalories < 1 || data.estimatedCalories > 10000) {
          throw new Error('Estimated calories must be a number between 1 and 10,000');
        }
        updatedCardioMetrics.estimatedCalories = Math.floor(Math.abs(data.estimatedCalories));
      }
      
      if (data.pace !== undefined) {
        if (typeof data.pace !== 'string' || data.pace.trim().length === 0) {
          throw new Error('Pace must be a non-empty string');
        }
        updatedCardioMetrics.pace = data.pace.trim();
      }
      
      // Rebuild notes with cardio metrics
      let finalNotes = data.notes !== undefined ? (data.notes.trim() || '') : (cleanedExistingNotes || '');
      
      if (Object.keys(updatedCardioMetrics).length > 0) {
        const cardioData = JSON.stringify(updatedCardioMetrics);
        finalNotes = finalNotes ? `${finalNotes}\n[CARDIO_METRICS]${cardioData}` : `[CARDIO_METRICS]${cardioData}`;
      }
      
      updateData.notes = finalNotes || null;
    }

    // Update the workout log
    const updatedLog = await prisma.workoutLog.update({
      where: { id: logId },
      data: updateData
    });

    // Extract cardio metrics for response
    const cardioMetrics = extractCardioMetrics(updatedLog.notes, updatedLog.category);
    const cleanedNotes = cleanNotes(updatedLog.notes);

    return {
      id: updatedLog.id,
      exerciseName: updatedLog.exerciseName,
      category: updatedLog.category,
      sets: updatedLog.sets,
      reps: updatedLog.reps,
      weight: updatedLog.weight,
      duration: updatedLog.duration || undefined,
      restDuration: updatedLog.restDuration || undefined,
      notes: cleanedNotes,
      date: updatedLog.date,
      ...cardioMetrics
    };

  } catch (error) {
    console.error('Error updating workout log:', error);
    throw error;
  }
}
