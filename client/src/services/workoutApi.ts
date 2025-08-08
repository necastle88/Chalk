import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Token will be added by the components using clerk auth
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface WorkoutLogData {
  exerciseDescription: string;
  sets: number;
  reps: number;
  weight: number;
  duration?: number; // for time-based exercises in seconds
  restDuration?: number;
  notes?: string;
  category?: string;
  useAI?: boolean;
}

export interface WorkoutLogEntry {
  id: string;
  exerciseName: string;
  category: string;
  sets: number;
  reps: number;
  weight: number;
  duration?: number; // for time-based exercises in seconds
  restDuration?: number;
  notes?: string;
  date: string;
  aiConfidence?: number;
}

export interface ExerciseCategory {
  value: string;
  label: string;
}

export interface ExerciseDetection {
  exerciseName: string;
  category: string;
  muscleGroup: string; // Human-readable muscle group name
  confidence: number;
  suggestions?: string[];
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number; // for time-based exercises in seconds
}

export interface WorkoutLogsResponse {
  data: WorkoutLogEntry[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

// Workout API endpoints
export const workoutApi = {
  // Create a new workout log
  createWorkoutLog: async (data: WorkoutLogData, token: string): Promise<WorkoutLogEntry> => {
    const response = await api.post('/workouts', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  },

  // Get workout logs with pagination
  getWorkoutLogs: async (params: {
    limit?: number;
    offset?: number;
    category?: string;
    startDate?: string;
    endDate?: string;
  }, token: string): Promise<WorkoutLogsResponse> => {
    const response = await api.get('/workouts', {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });
    return {
      data: response.data.data,
      pagination: response.data.pagination
    };
  },

  // Get workout statistics
  getWorkoutStats: async (days: number, token: string): Promise<any> => {
    const response = await api.get('/workouts/stats', {
      params: { days },
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  },

  // Delete a workout log
  deleteWorkoutLog: async (logId: string, token: string): Promise<void> => {
    await api.delete(`/workouts/${logId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Update a workout log
  updateWorkoutLog: async (logId: string, data: Partial<WorkoutLogData>, token: string): Promise<WorkoutLogEntry> => {
    const response = await api.put(`/workouts/${logId}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  },

  // Detect exercise with AI
  detectExercise: async (exerciseDescription: string, token: string): Promise<ExerciseDetection> => {
    const response = await api.post('/workouts/detect-exercise', 
      { exerciseDescription },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.data;
  },

  // Get exercise categories
  getCategories: async (token?: string): Promise<ExerciseCategory[]> => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.get('/workouts/categories', config);
    return response.data.data;
  },
};

export default api;
