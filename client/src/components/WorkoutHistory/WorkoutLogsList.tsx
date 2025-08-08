import React from "react";
import type { WorkoutLogEntry as WorkoutLogEntryType } from "../../services/workoutApi";
import WorkoutLogEntry from "./WorkoutLogEntry";
import styles from "./workout-history.module.css";

interface WorkoutLogsListProps {
  workoutLogs: WorkoutLogEntryType[];
  compact: boolean;
  searchTerm: string;
  onDeleteWorkout: (logId: string) => void;
}

const WorkoutLogsList: React.FC<WorkoutLogsListProps> = ({
  workoutLogs,
  compact,
  searchTerm,
  onDeleteWorkout,
}) => {
  if (workoutLogs.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No workouts found{searchTerm ? " for your search" : ""}.</p>
        {!compact && <p>Start logging your exercises to see them here!</p>}
      </div>
    );
  }

  return (
    <div className={styles.logsList}>
      {workoutLogs.map(log => (
        <WorkoutLogEntry
          key={log.id}
          log={log}
          compact={compact}
          onDelete={onDeleteWorkout}
        />
      ))}
    </div>
  );
};

export default WorkoutLogsList;
