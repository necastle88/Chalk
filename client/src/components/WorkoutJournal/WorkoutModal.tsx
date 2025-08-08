import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { workoutApi } from "../../services/workoutApi";
import type { StrengthEntry, CardioEntry } from "./types";
import {
  JOURNAL_CATEGORIES,
  PERCEIVED_EFFORT_SCALE,
  WEIGHT_UNITS,
} from "./constants";
import { isCardioExercise } from "./utils";
import styles from "./workout-modal.module.css";

interface WorkoutModalProps {
  entry: StrengthEntry | CardioEntry;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEntry: StrengthEntry | CardioEntry) => void;
  onDelete: (entryId: string) => void;
}

const WorkoutModal: React.FC<WorkoutModalProps> = ({
  entry,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState(entry);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isCardio = isCardioExercise(entry.category);

  // Reset form data when entry changes
  useEffect(() => {
    setFormData(entry);
    setError(null);
    setShowDeleteConfirm(false);
  }, [entry]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        setError("Authentication required");
        return;
      }

      // Convert form data back to API format
      const updateData: any = {
        exerciseName: formData.exerciseName,
        category: formData.category,
        notes: formData.notes,
      };

      if (isCardio) {
        const cardioEntry = formData as CardioEntry;
        updateData.duration = cardioEntry.duration * 60; // Convert minutes to seconds
        // Note: Heart rate, calories, and perceived effort would need to be added to the API
      } else {
        const strengthEntry = formData as StrengthEntry;
        updateData.sets = strengthEntry.sets;
        updateData.reps = strengthEntry.reps;
        updateData.weight = strengthEntry.weight;
        updateData.duration = strengthEntry.duration
          ? strengthEntry.duration * 60
          : undefined;
        updateData.restDuration = strengthEntry.restDuration;
      }

      await workoutApi.updateWorkoutLog(entry.id, updateData, token);
      onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error updating workout:", error);
      setError("Failed to update workout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        setError("Authentication required");
        return;
      }

      await workoutApi.deleteWorkoutLog(entry.id, token);
      onDelete(entry.id);
      onClose();
    } catch (error) {
      console.error("Error deleting workout:", error);
      setError("Failed to delete workout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {isCardio ? "Edit Cardio Workout" : "Edit Strength Workout"}
          </h3>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Exercise Name</label>
            <input
              type="text"
              value={formData.exerciseName}
              onChange={e => handleInputChange("exerciseName", e.target.value)}
              className={styles.input}
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Category</label>
            <select
              value={formData.category}
              onChange={e => handleInputChange("category", e.target.value)}
              className={styles.select}
              disabled={loading}
            >
              {JOURNAL_CATEGORIES.filter(cat => cat.value !== "").map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {isCardio ? (
            // Cardio-specific fields
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>Duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  value={(formData as CardioEntry).duration}
                  onChange={e =>
                    handleInputChange("duration", parseInt(e.target.value) || 0)
                  }
                  className={styles.input}
                  disabled={loading}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Start Heart Rate (bpm)</label>
                  <input
                    type="number"
                    min="40"
                    max="220"
                    value={(formData as CardioEntry).heartRateStart || ""}
                    onChange={e =>
                      handleInputChange(
                        "heartRateStart",
                        parseInt(e.target.value) || undefined
                      )
                    }
                    className={styles.input}
                    disabled={loading}
                    placeholder="Optional"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Max Heart Rate (bpm)</label>
                  <input
                    type="number"
                    min="40"
                    max="220"
                    value={(formData as CardioEntry).heartRateMax || ""}
                    onChange={e =>
                      handleInputChange(
                        "heartRateMax",
                        parseInt(e.target.value) || undefined
                      )
                    }
                    className={styles.input}
                    disabled={loading}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Calories Burned</label>
                  <input
                    type="number"
                    min="0"
                    value={(formData as CardioEntry).caloriesBurned || ""}
                    onChange={e =>
                      handleInputChange(
                        "caloriesBurned",
                        parseInt(e.target.value) || undefined
                      )
                    }
                    className={styles.input}
                    disabled={loading}
                    placeholder="Optional"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Perceived Effort</label>
                  <select
                    value={(formData as CardioEntry).perceivedEffort || ""}
                    onChange={e =>
                      handleInputChange(
                        "perceivedEffort",
                        parseInt(e.target.value) || undefined
                      )
                    }
                    className={styles.select}
                    disabled={loading}
                  >
                    <option value="">Select effort level</option>
                    {PERCEIVED_EFFORT_SCALE.map(effort => (
                      <option key={effort.value} value={effort.value}>
                        {effort.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          ) : (
            // Strength training fields
            <>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Sets</label>
                  <input
                    type="number"
                    min="1"
                    value={(formData as StrengthEntry).sets}
                    onChange={e =>
                      handleInputChange("sets", parseInt(e.target.value) || 1)
                    }
                    className={styles.input}
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Reps</label>
                  <input
                    type="number"
                    min="1"
                    value={(formData as StrengthEntry).reps}
                    onChange={e =>
                      handleInputChange("reps", parseInt(e.target.value) || 1)
                    }
                    className={styles.input}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Weight</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={(formData as StrengthEntry).weight}
                    onChange={e =>
                      handleInputChange(
                        "weight",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className={styles.input}
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Unit</label>
                  <select
                    value={(formData as StrengthEntry).unit}
                    onChange={e => handleInputChange("unit", e.target.value)}
                    className={styles.select}
                    disabled={loading}
                  >
                    {WEIGHT_UNITS.map(unit => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Duration (minutes)</label>
                  <input
                    type="number"
                    min="0"
                    value={(formData as StrengthEntry).duration || ""}
                    onChange={e =>
                      handleInputChange(
                        "duration",
                        parseInt(e.target.value) || undefined
                      )
                    }
                    className={styles.input}
                    disabled={loading}
                    placeholder="Optional"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Rest Duration (seconds)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={(formData as StrengthEntry).restDuration || ""}
                    onChange={e =>
                      handleInputChange(
                        "restDuration",
                        parseInt(e.target.value) || undefined
                      )
                    }
                    className={styles.input}
                    disabled={loading}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Notes</label>
            <textarea
              value={formData.notes || ""}
              onChange={e => handleInputChange("notes", e.target.value)}
              className={styles.textarea}
              disabled={loading}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <div className={styles.leftActions}>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className={styles.deleteButton}
                disabled={loading}
              >
                Delete Workout
              </button>
            ) : (
              <div className={styles.deleteConfirm}>
                <span className={styles.deleteText}>Are you sure?</span>
                <button
                  onClick={handleDelete}
                  className={styles.confirmDeleteButton}
                  disabled={loading}
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className={styles.cancelButton}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className={styles.rightActions}>
            <button
              onClick={onClose}
              className={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={styles.saveButton}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutModal;
