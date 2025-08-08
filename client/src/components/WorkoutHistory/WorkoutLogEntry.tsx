import React from "react";
import type { WorkoutLogEntry as WorkoutLogEntryType } from "../../services/workoutApi";
import { formatDate, formatCategory } from "./utils";
import styles from "./workout-history.module.css";

interface WorkoutLogEntryProps {
  log: WorkoutLogEntryType;
  compact: boolean;
  onDelete: (logId: string) => void;
}

const WorkoutLogEntry: React.FC<WorkoutLogEntryProps> = ({
  log,
  compact,
  onDelete,
}) => {
  return (
    <div className={`${styles.logEntry} ${compact ? styles.compactEntry : ""}`}>
      <div className={styles.logHeader}>
        <h4 className={styles.exerciseName}>{log.exerciseName}</h4>
        <div className={styles.logMeta}>
          <span className={styles.logDate}>
            {formatDate(log.date, compact)}
          </span>
          {!compact && (
            <button
              onClick={() => onDelete(log.id)}
              className={styles.deleteButton}
              title="Delete workout"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className={styles.logDetails}>
        <span
          className={`${styles.category} ${styles[log.category.toLowerCase()]}`}
        >
          {formatCategory(log.category)}
        </span>
        <span className={styles.workoutStats}>
          {log.sets} sets × {log.reps} reps @ {log.weight} lbs
        </span>
        {log.restDuration && (
          <span className={styles.restDuration}>Rest: {log.restDuration}s</span>
        )}
        {log.aiConfidence && !compact && (
          <span className={styles.aiConfidence}>
            AI: {Math.round(log.aiConfidence * 100)}%
          </span>
        )}
      </div>

      {log.notes && !compact && (
        <div className={styles.logNotes}>{log.notes}</div>
      )}
    </div>
  );
};

export default WorkoutLogEntry;
