import React, { useState } from "react";
import type { StrengthEntry, CardioEntry } from "./types";
import {
  groupEntriesByDate,
  formatDateHeader,
  calculateDailySessionStats,
  isCardioExercise,
} from "./utils";
import WorkoutModal from "./WorkoutModal";
import styles from "./daily-session-view.module.css";

interface DailySessionViewProps {
  entries: (StrengthEntry | CardioEntry)[];
  onUpdateEntry?: (entry: StrengthEntry | CardioEntry) => void;
  onDeleteEntry?: (entryId: string) => void;
}

const DailySessionView: React.FC<DailySessionViewProps> = ({
  entries,
  onUpdateEntry,
  onDeleteEntry,
}) => {
  const [selectedEntry, setSelectedEntry] = useState<
    (StrengthEntry | CardioEntry) | null
  >(null);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(
    new Set()
  );

  const groupedEntries = groupEntriesByDate(entries);
  const sortedDates = Object.keys(groupedEntries).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const toggleSession = (date: string) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const handleEntryClick = (entry: StrengthEntry | CardioEntry) => {
    setSelectedEntry(entry);
  };

  const handleModalClose = () => {
    setSelectedEntry(null);
  };

  const handleModalSave = (updatedEntry: StrengthEntry | CardioEntry) => {
    if (onUpdateEntry) {
      onUpdateEntry(updatedEntry);
    }
    setSelectedEntry(null);
  };

  const handleModalDelete = (entryId: string) => {
    if (onDeleteEntry) {
      onDeleteEntry(entryId);
    }
    setSelectedEntry(null);
  };

  if (sortedDates.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📝</div>
        <h3>No workout sessions found</h3>
        <p>
          Start logging your exercises to see them organized by daily sessions!
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {sortedDates.map(date => {
        const dayEntries = groupedEntries[date];
        const stats = calculateDailySessionStats(dayEntries);
        const isExpanded = expandedSessions.has(date);

        return (
          <div key={date} className={styles.sessionCard}>
            <div
              className={`${styles.sessionHeader} ${isExpanded ? styles.expanded : ""}`}
              onClick={() => toggleSession(date)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleSession(date);
                }
              }}
            >
              <div className={styles.sessionInfo}>
                <h3 className={styles.dateHeader}>{formatDateHeader(date)}</h3>
                <div className={styles.sessionStats}>
                  <span className={styles.stat}>
                    <span className={styles.statValue}>
                      {stats.totalExercises}
                    </span>
                    <span className={styles.statLabel}>
                      exercise{stats.totalExercises !== 1 ? "s" : ""}
                    </span>
                  </span>
                  {stats.totalDuration > 0 && (
                    <span className={styles.stat}>
                      <span className={styles.statValue}>
                        {stats.totalDuration}
                      </span>
                      <span className={styles.statLabel}>min</span>
                    </span>
                  )}
                  {stats.strengthCount > 0 && (
                    <span className={`${styles.stat} ${styles.strengthStat}`}>
                      <span className={styles.statValue}>
                        {stats.strengthCount}
                      </span>
                      <span className={styles.statLabel}>strength</span>
                    </span>
                  )}
                  {stats.cardioCount > 0 && (
                    <span className={`${styles.stat} ${styles.cardioStat}`}>
                      <span className={styles.statValue}>
                        {stats.cardioCount}
                      </span>
                      <span className={styles.statLabel}>cardio</span>
                    </span>
                  )}
                </div>
              </div>
              <div
                className={`${styles.expandIcon} ${isExpanded ? styles.rotated : ""}`}
              >
                ▼
              </div>
            </div>

            {isExpanded && (
              <div className={styles.sessionContent}>
                <div className={styles.exerciseList}>
                  {dayEntries.map((entry: StrengthEntry | CardioEntry) => (
                    <div
                      key={entry.id}
                      className={`${styles.exerciseCard} ${isCardioExercise(entry.category) ? styles.cardioCard : styles.strengthCard}`}
                      onClick={() => handleEntryClick(entry)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleEntryClick(entry);
                        }
                      }}
                    >
                      <div className={styles.exerciseHeader}>
                        <h4 className={styles.exerciseName}>
                          {entry.exerciseName}
                        </h4>
                        <span
                          className={`${styles.exerciseType} ${isCardioExercise(entry.category) ? styles.cardioType : styles.strengthType}`}
                        >
                          {isCardioExercise(entry.category)
                            ? "Cardio"
                            : "Strength"}
                        </span>
                      </div>
                      <div className={styles.exerciseDetails}>
                        {!isCardioExercise(entry.category) && (
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>
                              Sets × Reps:
                            </span>
                            <span className={styles.detailValue}>
                              {(entry as StrengthEntry).sets} ×{" "}
                              {(entry as StrengthEntry).reps}
                            </span>
                          </div>
                        )}
                        {!isCardioExercise(entry.category) &&
                          (entry as StrengthEntry).weight && (
                            <div className={styles.detailItem}>
                              <span className={styles.detailLabel}>
                                Weight:
                              </span>
                              <span className={styles.detailValue}>
                                {(entry as StrengthEntry).weight}{" "}
                                {(entry as StrengthEntry).unit}
                              </span>
                            </div>
                          )}
                        {entry.duration && (
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>
                              Duration:
                            </span>
                            <span className={styles.detailValue}>
                              {entry.duration} min
                            </span>
                          </div>
                        )}
                        {isCardioExercise(entry.category) &&
                          (entry as CardioEntry).caloriesBurned && (
                            <div className={styles.detailItem}>
                              <span className={styles.detailLabel}>
                                Calories:
                              </span>
                              <span className={styles.detailValue}>
                                {(entry as CardioEntry).caloriesBurned}
                              </span>
                            </div>
                          )}
                      </div>
                      {entry.notes && (
                        <div className={styles.exerciseNotes}>
                          <span className={styles.notesLabel}>Notes:</span>
                          <span className={styles.notesText}>
                            {entry.notes}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {selectedEntry && (
        <WorkoutModal
          entry={selectedEntry}
          isOpen={!!selectedEntry}
          onClose={handleModalClose}
          onSave={handleModalSave}
          onDelete={handleModalDelete}
        />
      )}
    </div>
  );
};

export default DailySessionView;
