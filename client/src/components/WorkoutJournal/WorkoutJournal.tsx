import React from "react";
import type { WorkoutJournalProps, StrengthEntry, CardioEntry } from "./types";
import { useWorkoutJournal } from "./useWorkoutJournal";
import JournalFilters from "./JournalFilters";
import DailySessionView from "./DailySessionView";
import JournalPaginationComponent from "./JournalPagination";
import WorkoutLogModal from "./WorkoutLogModal";
import { DEFAULT_JOURNAL_LIMIT } from "./constants";
import { isCardioExercise, groupEntriesByDate } from "./utils";
import styles from "./workout-journal.module.css";

const WorkoutJournal: React.FC<WorkoutJournalProps> = ({
  limit = DEFAULT_JOURNAL_LIMIT,
  showFilters = true,
  showTitle = true,
  refreshTrigger = 0,
}) => {
  const {
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
    closeModal,
    updateJournalEntry,
    deleteJournalEntry,
  } = useWorkoutJournal(limit, refreshTrigger);

  if (loading && journalEntries.length === 0) {
    return (
      <div className={styles.container}>
        {showTitle && <h2 className={styles.title}>Workout Journal</h2>}
        <div className={styles.loading}>Loading workout journal...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        {showTitle && <h2 className={styles.title}>Workout Journal</h2>}
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  // Separate entries by type
  const strengthEntries = journalEntries.filter(
    entry => !isCardioExercise(entry.category)
  ) as StrengthEntry[];
  const cardioEntries = journalEntries.filter(entry =>
    isCardioExercise(entry.category)
  ) as CardioEntry[];

  // Calculate session counts for each tab (number of unique dates)
  const getSessionCount = (entries: (StrengthEntry | CardioEntry)[]) => {
    const groupedByDate = groupEntriesByDate(entries);
    return Object.keys(groupedByDate).length;
  };

  const allSessionsCount = getSessionCount(journalEntries);
  const strengthSessionsCount = getSessionCount(strengthEntries);
  const cardioSessionsCount = getSessionCount(cardioEntries);

  // Determine current session count based on active tab
  const getCurrentSessionCount = () => {
    switch (filters.exerciseType) {
      case "daily":
      case "all":
        return allSessionsCount;
      case "strength":
        return strengthSessionsCount;
      case "cardio":
        return cardioSessionsCount;
      default:
        return allSessionsCount;
    }
  };

  const currentSessionCount = getCurrentSessionCount();

  return (
    <div className={styles.container}>
      {showTitle && <h2 className={styles.title}>Workout Journal</h2>}

      {showFilters && (
        <JournalFilters filters={filters} onFiltersChange={updateFilters} />
      )}

      {journalEntries.length === 0 ? (
        <div className={styles.emptyState}>
          <p>
            No workout entries found
            {filters.searchTerm ? " for your search" : ""}.
          </p>
          <p>Start logging your exercises to see them in your journal!</p>
        </div>
      ) : (
        <div className={styles.journalContent}>
          {/* Exercise Type Tabs */}
          <div className={styles.exerciseTabs}>
            <button
              onClick={() => updateFilters({ exerciseType: "daily" })}
              className={`${styles.tabButton} ${filters.exerciseType === "daily" ? styles.active : ""}`}
            >
              Daily Sessions ({allSessionsCount})
            </button>
            <button
              onClick={() => updateFilters({ exerciseType: "all" })}
              className={`${styles.tabButton} ${filters.exerciseType === "all" ? styles.active : ""}`}
            >
              All Exercises ({allSessionsCount})
            </button>
            <button
              onClick={() => updateFilters({ exerciseType: "strength" })}
              className={`${styles.tabButton} ${filters.exerciseType === "strength" ? styles.active : ""}`}
            >
              Strength Training ({strengthSessionsCount})
            </button>
            <button
              onClick={() => updateFilters({ exerciseType: "cardio" })}
              className={`${styles.tabButton} ${filters.exerciseType === "cardio" ? styles.active : ""}`}
            >
              Cardio ({cardioSessionsCount})
            </button>
          </div>

          {/* Tables */}
          <div className={styles.tablesContainer}>
            {filters.exerciseType === "daily" && (
              <DailySessionView
                entries={journalEntries}
                onUpdateEntry={updateJournalEntry}
                onDeleteEntry={deleteJournalEntry}
              />
            )}

            {filters.exerciseType === "all" && (
              <DailySessionView
                entries={journalEntries}
                onUpdateEntry={updateJournalEntry}
                onDeleteEntry={deleteJournalEntry}
              />
            )}

            {filters.exerciseType === "strength" && (
              <DailySessionView
                entries={strengthEntries}
                onUpdateEntry={updateJournalEntry}
                onDeleteEntry={deleteJournalEntry}
              />
            )}

            {filters.exerciseType === "cardio" && (
              <DailySessionView
                entries={cardioEntries}
                onUpdateEntry={updateJournalEntry}
                onDeleteEntry={deleteJournalEntry}
              />
            )}
          </div>
        </div>
      )}

      {currentSessionCount > 7 && (
        <JournalPaginationComponent
          pagination={pagination}
          currentPage={currentPage}
          loading={loading}
          onPageChange={handlePageChange}
        />
      )}

      {loading && journalEntries.length > 0 && (
        <div className={styles.loadingMore}>Loading more entries...</div>
      )}

      {/* Workout Log Modal */}
      {selectedEntry && (
        <WorkoutLogModal
          entry={selectedEntry}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default WorkoutJournal;
