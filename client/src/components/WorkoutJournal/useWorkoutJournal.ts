import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { workoutApi } from "../../services/workoutApi";
import type { JournalFilterState, JournalPagination, JournalEntry } from "./types";
import { calculateDateRange, convertWorkoutLogToJournalEntry, isCardioExercise } from "./utils";
import { DEFAULT_JOURNAL_DATE_FILTER } from "./constants";

export const useWorkoutJournal = (limit: number, refreshTrigger: number) => {
  const { getToken } = useAuth();
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState<JournalPagination>({
    limit: limit,
    offset: 0,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });

  // Filter states
  const [filters, setFilters] = useState<JournalFilterState>({
    categoryFilter: "",
    dateFilter: DEFAULT_JOURNAL_DATE_FILTER,
    searchTerm: "",
    exerciseType: "daily",
  });

  // Fetch workout logs and convert to journal entries
  const fetchJournalEntries = async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        setError("Please sign in to view your workout journal");
        return;
      }

      const startDate = calculateDateRange(filters.dateFilter);
      const offset = (page - 1) * limit;

      const response = await workoutApi.getWorkoutLogs(
        {
          limit: limit * 2, // Fetch more to account for filtering
          offset: offset,
          category: filters.categoryFilter || undefined,
          startDate: startDate?.toISOString(),
        },
        token
      );

      // Convert workout logs to journal entries
      let entries = response.data.map(convertWorkoutLogToJournalEntry);

      // Apply exercise type filter
      if (filters.exerciseType !== "all") {
        entries = entries.filter(entry => {
          if (filters.exerciseType === "cardio") {
            return isCardioExercise(entry.category);
          } else if (filters.exerciseType === "strength") {
            return !isCardioExercise(entry.category);
          }
          return true;
        });
      }

      // Apply search filter
      if (filters.searchTerm) {
        entries = entries.filter(entry =>
          entry.exerciseName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          entry.notes?.toLowerCase().includes(filters.searchTerm.toLowerCase())
        );
      }

      // Paginate the filtered results
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedEntries = entries.slice(startIndex, endIndex);

      setJournalEntries(paginatedEntries);

      const totalPages = Math.ceil(entries.length / limit);
      setPagination({
        limit,
        offset: startIndex,
        total: entries.length,
        totalPages,
        hasMore: page < totalPages,
      });
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      if (error instanceof Error && error.message.includes("401")) {
        setError("Please sign in to view your workout journal");
      } else {
        setError("Failed to load workout journal. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchJournalEntries(1);
    setCurrentPage(1);
  }, [filters.categoryFilter, filters.dateFilter, filters.searchTerm, filters.exerciseType, refreshTrigger]);

  // Add polling for faster updates (every 30 seconds when on first page)
  useEffect(() => {
    if (currentPage === 1) {
      const pollInterval = setInterval(() => {
        fetchJournalEntries(1);
      }, 30000); // Poll every 30 seconds

      return () => clearInterval(pollInterval);
    }
  }, [currentPage, filters.categoryFilter, filters.dateFilter, filters.searchTerm, filters.exerciseType]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && !loading) {
      fetchJournalEntries(newPage);
    }
  };

  const updateJournalEntry = async (updatedEntry: JournalEntry) => {
    // Update the local state immediately for optimistic UI
    setJournalEntries(prev => 
      prev.map(entry => 
        entry.id === updatedEntry.id ? updatedEntry : entry
      )
    );
  };

  const deleteJournalEntry = async (entryId: string) => {
    // Remove from local state immediately for optimistic UI
    setJournalEntries(prev => 
      prev.filter(entry => entry.id !== entryId)
    );
    
    // Update pagination totals
    setPagination(prev => ({
      ...prev,
      total: prev.total - 1,
      totalPages: Math.ceil((prev.total - 1) / limit),
    }));
  };

  const updateFilters = (newFilters: Partial<JournalFilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const navigateToWorkoutLog = (logId: string) => {
    // Find the entry by ID and open the modal
    const entry = journalEntries.find(e => e.id === logId);
    if (entry) {
      setSelectedEntry(entry);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEntry(null);
  };

  return {
    journalEntries,
    loading,
    error,
    currentPage,
    pagination,
    filters,
    selectedEntry,
    isModalOpen,
    updateFilters,
    handlePageChange,
    navigateToWorkoutLog,
    closeModal,
    fetchJournalEntries,
    updateJournalEntry,
    deleteJournalEntry,
  };
};
