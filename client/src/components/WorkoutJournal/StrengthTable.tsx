import React, { useState } from "react";
import type { StrengthEntry, CardioEntry } from "./types";
import {
  formatJournalDate,
  formatDurationMinutes,
  formatWeight,
} from "./utils";
import WorkoutModal from "./WorkoutModal";
import styles from "./workout-journal.module.css";

interface StrengthTableProps {
  entries: StrengthEntry[];
  onNavigateToLog: (logId: string) => void;
  onUpdateEntry: (updatedEntry: StrengthEntry) => void;
  onDeleteEntry: (entryId: string) => void;
}

const StrengthTable: React.FC<StrengthTableProps> = ({
  entries,
  onNavigateToLog,
  onUpdateEntry,
  onDeleteEntry,
}) => {
  const [selectedEntry, setSelectedEntry] = useState<StrengthEntry | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditClick = (entry: StrengthEntry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEntry(null);
  };

  const handleModalSave = (updatedEntry: StrengthEntry | CardioEntry) => {
    onUpdateEntry(updatedEntry as StrengthEntry);
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
        <p>No strength training workouts found.</p>
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
            <th>Sets</th>
            <th>Weight/Reps</th>
            <th>Rest</th>
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
                  <span
                    className={`${styles.category} ${styles[entry.category.toLowerCase()]}`}
                  >
                    {entry.category}
                  </span>
                </div>
              </td>
              <td className={styles.durationCell}>
                {formatDurationMinutes(
                  entry.duration ? entry.duration * 60 : undefined
                )}
              </td>
              <td className={styles.setsCell}>{entry.sets}</td>
              <td className={styles.weightRepsCell}>
                <div className={styles.weightRepsInfo}>
                  <span className={styles.weight}>
                    {formatWeight(entry.weight, entry.unit)}
                  </span>
                  <span className={styles.reps}>{entry.reps} reps</span>
                </div>
              </td>
              <td className={styles.restCell}>
                {entry.restDuration ? `${entry.restDuration}s` : "N/A"}
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
                <span
                  className={`${styles.category} ${styles[entry.category.toLowerCase()]}`}
                >
                  {entry.category}
                </span>
              </div>
              <div className={styles.cardDate}>
                {formatJournalDate(entry.date)}
              </div>
            </div>

            <div className={styles.cardDetails}>
              <div className={styles.cardStat}>
                <span className={styles.cardLabel}>Sets:</span>
                <span className={styles.cardValue}>{entry.sets}</span>
              </div>
              <div className={styles.cardStat}>
                <span className={styles.cardLabel}>Weight:</span>
                <span className={styles.cardValue}>
                  {formatWeight(entry.weight, entry.unit)}
                </span>
              </div>
              <div className={styles.cardStat}>
                <span className={styles.cardLabel}>Reps:</span>
                <span className={styles.cardValue}>{entry.reps}</span>
              </div>
              {entry.duration && (
                <div className={styles.cardStat}>
                  <span className={styles.cardLabel}>Duration:</span>
                  <span className={styles.cardValue}>
                    {formatDurationMinutes(entry.duration * 60)}
                  </span>
                </div>
              )}
              {entry.restDuration && (
                <div className={styles.cardStat}>
                  <span className={styles.cardLabel}>Rest:</span>
                  <span className={styles.cardValue}>
                    {entry.restDuration}s
                  </span>
                </div>
              )}
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

export default StrengthTable;
