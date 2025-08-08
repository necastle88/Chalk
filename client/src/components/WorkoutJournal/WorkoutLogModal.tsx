import React from "react";
import type { StrengthEntry, CardioEntry } from "./types";
import {
  formatJournalDate,
  formatWeight,
  formatHeartRate,
  formatCalories,
  formatPerceivedEffort,
  isCardioExercise,
} from "./utils";
import styles from "./workout-log-modal.module.css";

interface WorkoutLogModalProps {
  entry: StrengthEntry | CardioEntry;
  isOpen: boolean;
  onClose: () => void;
}

const WorkoutLogModal: React.FC<WorkoutLogModalProps> = ({
  entry,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const isCardio = isCardioExercise(entry.category);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Workout Details</h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Basic Information */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionTitle}>Exercise Information</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>Exercise Name</label>
                <span className={styles.infoValue}>{entry.exerciseName}</span>
              </div>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>Category</label>
                <span
                  className={`${styles.categoryBadge} ${styles[entry.category.toLowerCase()]}`}
                >
                  {entry.category}
                </span>
              </div>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>Date</label>
                <span className={styles.infoValue}>
                  {formatJournalDate(entry.date)}
                </span>
              </div>
            </div>
          </div>

          {/* Exercise Specific Details */}
          {isCardio ? (
            <CardioDetails entry={entry as CardioEntry} />
          ) : (
            <StrengthDetails entry={entry as StrengthEntry} />
          )}

          {/* Notes Section */}
          {entry.notes && (
            <div className={styles.infoSection}>
              <h3 className={styles.sectionTitle}>Notes</h3>
              <div className={styles.notesContent}>{entry.notes}</div>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.closeButtonSecondary}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const StrengthDetails: React.FC<{ entry: StrengthEntry }> = ({ entry }) => (
  <div className={styles.infoSection}>
    <h3 className={styles.sectionTitle}>Strength Training Details</h3>
    <div className={styles.infoGrid}>
      <div className={styles.infoItem}>
        <label className={styles.infoLabel}>Sets</label>
        <span className={styles.infoValue}>{entry.sets}</span>
      </div>
      <div className={styles.infoItem}>
        <label className={styles.infoLabel}>Repetitions</label>
        <span className={styles.infoValue}>{entry.reps}</span>
      </div>
      <div className={styles.infoItem}>
        <label className={styles.infoLabel}>Weight</label>
        <span className={styles.infoValue}>
          {formatWeight(entry.weight, entry.unit)}
        </span>
      </div>
      {entry.duration && (
        <div className={styles.infoItem}>
          <label className={styles.infoLabel}>Duration</label>
          <span className={styles.infoValue}>{entry.duration} minutes</span>
        </div>
      )}
      {entry.restDuration && (
        <div className={styles.infoItem}>
          <label className={styles.infoLabel}>Rest Between Sets</label>
          <span className={styles.infoValue}>{entry.restDuration} seconds</span>
        </div>
      )}
    </div>

    {/* Volume Calculation */}
    <div className={styles.calculatedMetrics}>
      <h4 className={styles.metricsTitle}>Calculated Metrics</h4>
      <div className={styles.metricsGrid}>
        <div className={styles.metricItem}>
          <label className={styles.metricLabel}>Total Volume</label>
          <span className={styles.metricValue}>
            {(entry.sets * entry.reps * entry.weight).toLocaleString()}{" "}
            {entry.unit}
          </span>
        </div>
        <div className={styles.metricItem}>
          <label className={styles.metricLabel}>Total Reps</label>
          <span className={styles.metricValue}>{entry.sets * entry.reps}</span>
        </div>
      </div>
    </div>
  </div>
);

const CardioDetails: React.FC<{ entry: CardioEntry }> = ({ entry }) => (
  <div className={styles.infoSection}>
    <h3 className={styles.sectionTitle}>Cardio Details</h3>
    <div className={styles.infoGrid}>
      <div className={styles.infoItem}>
        <label className={styles.infoLabel}>Duration</label>
        <span className={styles.infoValue}>{entry.duration} minutes</span>
      </div>
      {entry.heartRateStart && (
        <div className={styles.infoItem}>
          <label className={styles.infoLabel}>Starting Heart Rate</label>
          <span className={styles.infoValue}>
            {formatHeartRate(entry.heartRateStart)}
          </span>
        </div>
      )}
      {entry.heartRateMax && (
        <div className={styles.infoItem}>
          <label className={styles.infoLabel}>Maximum Heart Rate</label>
          <span className={styles.infoValue}>
            {formatHeartRate(entry.heartRateMax)}
          </span>
        </div>
      )}
      {entry.caloriesBurned && (
        <div className={styles.infoItem}>
          <label className={styles.infoLabel}>Calories Burned</label>
          <span className={styles.infoValue}>
            {formatCalories(entry.caloriesBurned)}
          </span>
        </div>
      )}
      {entry.perceivedEffort && (
        <div className={styles.infoItem}>
          <label className={styles.infoLabel}>Perceived Effort</label>
          <span className={styles.infoValue}>
            {formatPerceivedEffort(entry.perceivedEffort)}
          </span>
        </div>
      )}
    </div>

    {/* Heart Rate Zone (if applicable) */}
    {entry.heartRateStart && entry.heartRateMax && (
      <div className={styles.calculatedMetrics}>
        <h4 className={styles.metricsTitle}>Heart Rate Analysis</h4>
        <div className={styles.metricsGrid}>
          <div className={styles.metricItem}>
            <label className={styles.metricLabel}>Heart Rate Range</label>
            <span className={styles.metricValue}>
              {entry.heartRateMax - entry.heartRateStart} bpm increase
            </span>
          </div>
          <div className={styles.metricItem}>
            <label className={styles.metricLabel}>Average Estimate</label>
            <span className={styles.metricValue}>
              {Math.round((entry.heartRateStart + entry.heartRateMax) / 2)} bpm
            </span>
          </div>
        </div>
      </div>
    )}
  </div>
);

export default WorkoutLogModal;
