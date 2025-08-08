import React, { useState } from "react";
import type { CardioEntry, StrengthEntry } from "./types";
import {
  formatJournalDate,
  formatHeartRate,
  formatCalories,
  formatPerceivedEffort,
} from "./utils";
import WorkoutModal from "./WorkoutModal";
import styles from "./workout-journal.module.css";

interface CardioTableProps {
  entries: CardioEntry[];
  onNavigateToLog: (logId: string) => void;
  onUpdateEntry: (updatedEntry: CardioEntry) => void;
  onDeleteEntry: (entryId: string) => void;
}

const CardioTable: React.FC<CardioTableProps> = ({
  entries,
  onNavigateToLog,
  onUpdateEntry,
  onDeleteEntry,
}) => {
  const [selectedEntry, setSelectedEntry] = useState<CardioEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditClick = (entry: CardioEntry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEntry(null);
  };

  const handleModalSave = (updatedEntry: StrengthEntry | CardioEntry) => {
    onUpdateEntry(updatedEntry as CardioEntry);
    setIsModalOpen(false);
    setSelectedEntry(null);
  };

  const handleModalDelete = (entryId: string) => {
    onDeleteEntry(entryId);
    setIsModalOpen(false);
    setSelectedEntry(null);
  };
  if (entries.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No cardio workouts found.</p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      {/* Desktop Table View */}
      <table className={`${styles.journalTable} ${styles.desktopOnly}`}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Exercise</th>
            <th>Duration</th>
            <th>Heart Rate</th>
            <th>Calories</th>
            <th>Effort</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(entry => (
            <tr key={entry.id} className={styles.tableRow}>
              <td className={styles.dateCell}>
                {formatJournalDate(entry.date)}
              </td>
              <td className={styles.exerciseCell}>
                <div className={styles.exerciseInfo}>
                  <span className={styles.exerciseName}>
                    {entry.exerciseName}
                  </span>
                  <span className={`${styles.category} ${styles.cardio}`}>
                    {entry.category}
                  </span>
                </div>
              </td>
              <td className={styles.durationCell}>{entry.duration} min</td>
              <td className={styles.heartRateCell}>
                <div className={styles.heartRateInfo}>
                  <span className={styles.heartRateStart}>
                    Start: {formatHeartRate(entry.heartRateStart)}
                  </span>
                  <span className={styles.heartRateMax}>
                    Max: {formatHeartRate(entry.heartRateMax)}
                  </span>
                </div>
              </td>
              <td className={styles.caloriesCell}>
                {formatCalories(entry.caloriesBurned)}
              </td>
              <td className={styles.effortCell}>
                {formatPerceivedEffort(entry.perceivedEffort)}
              </td>
              <td className={styles.notesCell}>
                <div className={styles.notes} title={entry.notes || ""}>
                  {entry.notes
                    ? entry.notes.length > 30
                      ? `${entry.notes.substring(0, 30)}...`
                      : entry.notes
                    : "—"}
                </div>
              </td>
              <td className={styles.actionsCell}>
                <div className={styles.actionButtons}>
                  <button
                    onClick={() => handleEditClick(entry)}
                    className={styles.editButton}
                    title="Edit workout"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onNavigateToLog(entry.id)}
                    className={styles.linkButton}
                    title="View workout details"
                  >
                    View
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile Card View */}
      <div className={`${styles.cardContainer} ${styles.mobileOnly}`}>
        {entries.map(entry => (
          <div key={entry.id} className={styles.workoutCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardExerciseInfo}>
                <h4 className={styles.cardExerciseName}>
                  {entry.exerciseName}
                </h4>
                <span className={`${styles.category} ${styles.cardio}`}>
                  {entry.category}
                </span>
              </div>
              <div className={styles.cardDate}>
                {formatJournalDate(entry.date)}
              </div>
            </div>

            <div className={styles.cardDetails}>
              <div className={styles.cardStat}>
                <span className={styles.cardLabel}>Duration:</span>
                <span className={styles.cardValue}>{entry.duration} min</span>
              </div>
              <div className={styles.cardStat}>
                <span className={styles.cardLabel}>Calories:</span>
                <span className={styles.cardValue}>
                  {formatCalories(entry.caloriesBurned)}
                </span>
              </div>
              <div className={styles.cardStat}>
                <span className={styles.cardLabel}>Effort:</span>
                <span className={styles.cardValue}>
                  {formatPerceivedEffort(entry.perceivedEffort)}
                </span>
              </div>
              <div className={styles.cardStat}>
                <span className={styles.cardLabel}>HR Start:</span>
                <span className={styles.cardValue}>
                  {formatHeartRate(entry.heartRateStart)}
                </span>
              </div>
              <div className={styles.cardStat}>
                <span className={styles.cardLabel}>HR Max:</span>
                <span className={styles.cardValue}>
                  {formatHeartRate(entry.heartRateMax)}
                </span>
              </div>
            </div>

            {entry.notes && (
              <div className={styles.cardNotes}>
                <span className={styles.cardLabel}>Notes:</span>
                <p className={styles.cardNotesText}>{entry.notes}</p>
              </div>
            )}

            <div className={styles.cardActions}>
              <button
                onClick={() => handleEditClick(entry)}
                className={`${styles.editButton} ${styles.cardButton}`}
                title="Edit workout"
              >
                Edit
              </button>
              <button
                onClick={() => onNavigateToLog(entry.id)}
                className={`${styles.linkButton} ${styles.cardButton}`}
                title="View workout details"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedEntry && (
        <WorkoutModal
          entry={selectedEntry}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
          onDelete={handleModalDelete}
        />
      )}
    </div>
  );
};

export default CardioTable;
