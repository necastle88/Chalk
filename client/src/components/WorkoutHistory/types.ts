export interface WorkoutHistoryProps {
  limit?: number;
  showFilters?: boolean;
  showTitle?: boolean;
  compact?: boolean;
  refreshTrigger?: number; // Used to trigger refresh from parent
}

export interface PaginationState {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
  totalPages: number;
}

export interface FilterState {
  categoryFilter: string;
  dateFilter: string;
  searchTerm: string;
}

export interface WorkoutHistoryState {
  workoutLogs: any[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  pagination: PaginationState;
  filters: FilterState;
}
