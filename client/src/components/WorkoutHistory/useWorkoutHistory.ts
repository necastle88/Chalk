import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { workoutApi } from "../../services/workoutApi";
import type { WorkoutLogEntry } from "../../services/workoutApi";
import type { PaginationState, FilterState } from "./types";
import { calculateDateRange } from "./utils";
import { DEFAULT_DATE_FILTER } from "./constants";

export const useWorkoutHistory = (limit: number, refreshTrigger: number) => {
  const { getToken } = useAuth();
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationState>({
    limit: limit,
    offset: 0,
    total: 0,
    hasMore: false,
    totalPages: 0,
  });

  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    categoryFilter: "",
    dateFilter: DEFAULT_DATE_FILTER,
    searchTerm: "",
  });

  // Fetch workout logs
  const fetchWorkoutLogs = async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        setError("Please sign in to view your workout history");
        return;
      }

      const startDate = calculateDateRange(filters.dateFilter);
      const offset = (page - 1) * limit;

      const response = await workoutApi.getWorkoutLogs(
        {
          limit: limit,
          offset: offset,
          category: filters.categoryFilter || undefined,
          startDate: startDate?.toISOString(),
        },
        token
      );

      // Apply search filter
      let filteredLogs = response.data;
      if (filters.searchTerm) {
        filteredLogs = response.data.filter(
          log =>
            log.exerciseName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
            log.notes?.toLowerCase().includes(filters.searchTerm.toLowerCase())
        );
      }

      setWorkoutLogs(filteredLogs);

      const totalPages = Math.ceil(response.pagination.total / limit);
      setPagination({
        ...response.pagination,
        totalPages,
      });
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching workout logs:", error);
      // Check if it's an authentication error
      if (error instanceof Error && error.message.includes("401")) {
        setError("Please sign in to view your workout history");
      } else {
        setError("Failed to load workout history. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchWorkoutLogs(1); // Always start from page 1 when filters change
    setCurrentPage(1);
  }, [filters.categoryFilter, filters.dateFilter, filters.searchTerm, refreshTrigger]);

  // Add polling for faster updates (every 30 seconds when on first page)
  useEffect(() => {
    if (currentPage === 1) {
      const pollInterval = setInterval(() => {
        fetchWorkoutLogs(1);
      }, 30000); // Poll every 30 seconds

      return () => clearInterval(pollInterval);
    }
  }, [currentPage, filters.categoryFilter, filters.dateFilter, filters.searchTerm]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && !loading) {
      fetchWorkoutLogs(newPage);
    }
  };

  const deleteWorkout = async (logId: string) => {
    if (!confirm("Are you sure you want to delete this workout?")) {
      return;
    }

    try {
      const token = await getToken();
      if (token) {
        await workoutApi.deleteWorkoutLog(logId, token);
        fetchWorkoutLogs(currentPage); // Refresh current page
      }
    } catch (error) {
      console.error("Error deleting workout:", error);
      alert("Failed to delete workout");
    }
  };

  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return {
    workoutLogs,
    loading,
    error,
    currentPage,
    pagination,
    filters,
    updateFilters,
    handlePageChange,
    deleteWorkout,
    fetchWorkoutLogs,
  };
};
