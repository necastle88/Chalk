import React from "react";
import type { WorkoutHistoryProps } from "./types";
import { useWorkoutHistory } from "./useWorkoutHistory";
import WorkoutFilters from "./WorkoutFilters";
import WorkoutLogsList from "./WorkoutLogsList";
import Pagination from "./Pagination";
import { DEFAULT_LIMIT } from "./constants";
import styles from "./workout-history.module.css";

const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({
  limit = DEFAULT_LIMIT,
  showFilters = false,
  showTitle = true,
  compact = false,
  refreshTrigger = 0,
}) => {
  const {
    workoutLogs,
    loading,
    error,
    currentPage,
    pagination,
    filters,
    updateFilters,
    handlePageChange,
    deleteWorkout,
  } = useWorkoutHistory(limit, refreshTrigger);

  if (loading && workoutLogs.length === 0) {
    return (
      <div className={`${styles.container} ${compact ? styles.compact : ""}`}>
        {showTitle && <h3 className={styles.title}>Workout History</h3>}
        <div className={styles.loading}>Loading workout history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.container} ${compact ? styles.compact : ""}`}>
        {showTitle && <h3 className={styles.title}>Workout History</h3>}
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${compact ? styles.compact : ""}`}>
      {showTitle && <h3 className={styles.title}>Workout History</h3>}

      {showFilters && (
        <WorkoutFilters filters={filters} onFiltersChange={updateFilters} />
      )}

      <WorkoutLogsList
        workoutLogs={workoutLogs}
        compact={compact}
        searchTerm={filters.searchTerm}
        onDeleteWorkout={deleteWorkout}
      />

      <Pagination
        pagination={pagination}
        currentPage={currentPage}
        compact={compact}
        loading={loading}
        onPageChange={handlePageChange}
      />

      {loading && workoutLogs.length > 0 && (
        <div className={styles.loadingMore}>Loading workout history...</div>
      )}
    </div>
  );
};

export default WorkoutHistory;
