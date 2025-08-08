import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import styles from "./cardio-workout-modal.module.css";

interface CardioWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  duration: number; // in seconds
  lapCount: number;
  onSave: (workoutData: CardioWorkoutData) => void;
}

export interface CardioWorkoutData {
  exerciseName: string;
  duration: number; // in seconds
  distance?: number;
  heartRate?: number;
  pace?: string;
  notes?: string;
  lapCount: number;
}

const CardioWorkoutModal: React.FC<CardioWorkoutModalProps> = ({
  isOpen,
  onClose,
  duration,
  lapCount,
  onSave,
}) => {
  const [exerciseName, setExerciseName] = useState("Running");
  const [distance, setDistance] = useState<string>("");
  const [heartRate, setHeartRate] = useState<string>("");
  const [pace, setPace] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const handleSave = () => {
    const workoutData: CardioWorkoutData = {
      exerciseName,
      duration,
      distance: distance ? parseFloat(distance) : undefined,
      heartRate: heartRate ? parseInt(heartRate) : undefined,
      pace: pace || undefined,
      notes: notes || undefined,
      lapCount,
    };

    onSave(workoutData);
    onClose();
  };

  const handleCancel = () => {
    // Reset form
    setExerciseName("Running");
    setDistance("");
    setHeartRate("");
    setPace("");
    setNotes("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Log Cardio Workout</h2>
          <button className={styles.closeButton} onClick={handleCancel}>
            <CloseIcon />
          </button>
        </div>

        <div className={styles.workoutSummary}>
          <h3>Workout Summary</h3>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.label}>Duration:</span>
              <span className={styles.value}>{formatDuration(duration)}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.label}>Laps:</span>
              <span className={styles.value}>{lapCount}</span>
            </div>
          </div>
        </div>

        <form
          className={styles.workoutForm}
          onSubmit={e => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className={styles.formGroup}>
            <label htmlFor="exerciseName">Exercise Type *</label>
            <select
              id="exerciseName"
              value={exerciseName}
              onChange={e => setExerciseName(e.target.value)}
              required
            >
              <option value="Running">Running</option>
              <option value="Cycling">Cycling</option>
              <option value="Swimming">Swimming</option>
              <option value="Walking">Walking</option>
              <option value="Rowing">Rowing</option>
              <option value="Elliptical">Elliptical</option>
              <option value="Treadmill">Treadmill</option>
              <option value="Stair Climber">Stair Climber</option>
              <option value="Other Cardio">Other Cardio</option>
            </select>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="distance">Distance (miles)</label>
              <input
                type="number"
                id="distance"
                value={distance}
                onChange={e => setDistance(e.target.value)}
                placeholder="e.g., 3.1"
                step="0.1"
                min="0"
                max="500"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="heartRate">Avg Heart Rate (bpm)</label>
              <input
                type="number"
                id="heartRate"
                value={heartRate}
                onChange={e => setHeartRate(e.target.value)}
                placeholder="e.g., 150"
                min="40"
                max="250"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="pace">Pace (e.g., 8:30/mile)</label>
            <input
              type="text"
              id="pace"
              value={pace}
              onChange={e => setPace(e.target.value)}
              placeholder="e.g., 8:30/mile or 15 mph"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="How did the workout feel? Any observations..."
              rows={3}
            />
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button type="submit" className={styles.saveButton}>
              Save Workout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CardioWorkoutModal;
