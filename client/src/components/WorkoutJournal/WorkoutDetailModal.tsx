import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { workoutApi } from "../../services/workoutApi";
import type { StrengthEntry, CardioEntry } from "./types";
import { JOURNAL_CATEGORIES, WEIGHT_UNITS } from "./constants";
import { isCardioExercise, formatJournalDate, formatDuration } from "./utils";
import styles from "./workout-detail-modal.module.css";

interface WorkoutDetailModalProps {
  entry: StrengthEntry | CardioEntry;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEntry: StrengthEntry | CardioEntry) => void;
  onDelete: (entryId: string) => void;
}

const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
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
  const [isEditing, setIsEditing] = useState(false);

  const isCardio = isCardioExercise(entry.category);

  // Reset form data when entry changes
  useEffect(() => {
    setFormData(entry);
    setError(null);
    setShowDeleteConfirm(false);
    setIsEditing(false);
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
        setError("Please sign in to update entries");
        return;
      }

      // Convert the entry back to the API format
      const updateData = {
        exerciseName: formData.exerciseName,
        category: formData.category,
        notes: formData.notes,
        ...(isCardio
          ? {
              duration: formData.duration ? formData.duration * 60 : 0, // Convert minutes to seconds
            }
          : {
              sets: (formData as StrengthEntry).sets,
              reps: (formData as StrengthEntry).reps,
              weight: (formData as StrengthEntry).weight,
              duration: formData.duration ? formData.duration * 60 : undefined,
              restDuration: (formData as StrengthEntry).restDuration,
            }),
      };

      await workoutApi.updateWorkoutLog(entry.id, updateData, token);
      onSave(formData);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update entry");
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
        setError("Please sign in to delete entries");
        return;
      }

      await workoutApi.deleteWorkoutLog(entry.id, token);
      onDelete(entry.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete entry");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(entry);
    setIsEditing(false);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <h2 className={styles.title}>{formData.exerciseName}</h2>
            <div className={styles.metadata}>
              <span
                className={`${styles.badge} ${isCardio ? styles.cardioBadge : styles.strengthBadge}`}
              >
                {isCardio ? "Cardio" : "Strength Training"}
              </span>
              <span className={styles.date}>
                {formatJournalDate(entry.date)}
              </span>
            </div>
          </div>
          <div className={styles.headerActions}>
            {!isEditing && (
              <button
                className={styles.editButton}
                onClick={() => setIsEditing(true)}
                disabled={loading}
              >
                ✏️ Edit
              </button>
            )}
            <button className={styles.closeButton} onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.content}>
          {/* Exercise Name */}
          <div className={styles.section}>
            <label className={styles.label}>Exercise Name</label>
            {isEditing ? (
              <input
                type="text"
                className={styles.input}
                value={formData.exerciseName}
                onChange={e =>
                  handleInputChange("exerciseName", e.target.value)
                }
                disabled={loading}
              />
            ) : (
              <div className={styles.value}>{formData.exerciseName}</div>
            )}
          </div>

          {/* Category */}
          <div className={styles.section}>
            <label className={styles.label}>Category</label>
            {isEditing ? (
              <select
                className={styles.select}
                value={formData.category}
                onChange={e => handleInputChange("category", e.target.value)}
                disabled={loading}
              >
                {JOURNAL_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            ) : (
              <div className={styles.value}>{formData.category}</div>
            )}
          </div>

          {/* Strength-specific fields */}
          {!isCardio && (
            <>
              <div className={styles.row}>
                <div className={styles.section}>
                  <label className={styles.label}>Sets</label>
                  {isEditing ? (
                    <input
                      type="number"
                      className={styles.input}
                      value={(formData as StrengthEntry).sets}
                      onChange={e =>
                        handleInputChange("sets", parseInt(e.target.value) || 0)
                      }
                      disabled={loading}
                      min="0"
                    />
                  ) : (
                    <div className={styles.value}>
                      {(formData as StrengthEntry).sets}
                    </div>
                  )}
                </div>
                <div className={styles.section}>
                  <label className={styles.label}>Reps</label>
                  {isEditing ? (
                    <input
                      type="number"
                      className={styles.input}
                      value={(formData as StrengthEntry).reps}
                      onChange={e =>
                        handleInputChange("reps", parseInt(e.target.value) || 0)
                      }
                      disabled={loading}
                      min="0"
                    />
                  ) : (
                    <div className={styles.value}>
                      {(formData as StrengthEntry).reps}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.section}>
                  <label className={styles.label}>Weight</label>
                  {isEditing ? (
                    <input
                      type="number"
                      className={styles.input}
                      value={(formData as StrengthEntry).weight}
                      onChange={e =>
                        handleInputChange(
                          "weight",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      disabled={loading}
                      min="0"
                      step="0.1"
                    />
                  ) : (
                    <div className={styles.value}>
                      {(formData as StrengthEntry).weight}{" "}
                      {(formData as StrengthEntry).unit}
                    </div>
                  )}
                </div>
                <div className={styles.section}>
                  <label className={styles.label}>Unit</label>
                  {isEditing ? (
                    <select
                      className={styles.select}
                      value={(formData as StrengthEntry).unit}
                      onChange={e => handleInputChange("unit", e.target.value)}
                      disabled={loading}
                    >
                      {WEIGHT_UNITS.map(unit => (
                        <option key={unit.value} value={unit.value}>
                          {unit.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className={styles.value}>
                      {(formData as StrengthEntry).unit}
                    </div>
                  )}
                </div>
              </div>

              {(formData as StrengthEntry).restDuration && (
                <div className={styles.section}>
                  <label className={styles.label}>Rest Duration</label>
                  {isEditing ? (
                    <input
                      type="number"
                      className={styles.input}
                      value={(formData as StrengthEntry).restDuration}
                      onChange={e =>
                        handleInputChange(
                          "restDuration",
                          parseInt(e.target.value) || 0
                        )
                      }
                      disabled={loading}
                      min="0"
                      placeholder="Rest time in seconds"
                    />
                  ) : (
                    <div className={styles.value}>
                      {formatDuration((formData as StrengthEntry).restDuration)}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Cardio-specific fields */}
          {isCardio && (
            <>
              {(formData as CardioEntry).heartRateStart && (
                <div className={styles.row}>
                  <div className={styles.section}>
                    <label className={styles.label}>Starting Heart Rate</label>
                    <div className={styles.value}>
                      {(formData as CardioEntry).heartRateStart} bpm
                    </div>
                  </div>
                  {(formData as CardioEntry).heartRateMax && (
                    <div className={styles.section}>
                      <label className={styles.label}>Max Heart Rate</label>
                      <div className={styles.value}>
                        {(formData as CardioEntry).heartRateMax} bpm
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(formData as CardioEntry).caloriesBurned && (
                <div className={styles.section}>
                  <label className={styles.label}>Calories Burned</label>
                  <div className={styles.value}>
                    {(formData as CardioEntry).caloriesBurned} calories
                  </div>
                </div>
              )}

              {(formData as CardioEntry).perceivedEffort && (
                <div className={styles.section}>
                  <label className={styles.label}>Perceived Effort</label>
                  <div className={styles.value}>
                    {(formData as CardioEntry).perceivedEffort}/10
                  </div>
                </div>
              )}
            </>
          )}

          {/* Duration */}
          {formData.duration && (
            <div className={styles.section}>
              <label className={styles.label}>Duration</label>
              {isEditing ? (
                <input
                  type="number"
                  className={styles.input}
                  value={formData.duration}
                  onChange={e =>
                    handleInputChange("duration", parseInt(e.target.value) || 0)
                  }
                  disabled={loading}
                  min="0"
                  placeholder="Duration in minutes"
                />
              ) : (
                <div className={styles.value}>{formData.duration} minutes</div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className={styles.section}>
            <label className={styles.label}>Notes</label>
            {isEditing ? (
              <textarea
                className={styles.textarea}
                value={formData.notes || ""}
                onChange={e => handleInputChange("notes", e.target.value)}
                disabled={loading}
                rows={3}
                placeholder="Add any notes about this exercise..."
              />
            ) : (
              <div className={styles.value}>
                {formData.notes || (
                  <span className={styles.noValue}>No notes</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          {isEditing ? (
            <div className={styles.editActions}>
              <button
                className={styles.cancelButton}
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className={styles.saveButton}
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          ) : (
            <div className={styles.viewActions}>
              <button
                className={styles.deleteButton}
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className={styles.deleteConfirm}>
            <div className={styles.confirmContent}>
              <h3>Delete Exercise</h3>
              <p>
                Are you sure you want to delete this exercise entry? This action
                cannot be undone.
              </p>
              <div className={styles.confirmActions}>
                <button
                  className={styles.cancelButton}
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className={styles.confirmDeleteButton}
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutDetailModal;
