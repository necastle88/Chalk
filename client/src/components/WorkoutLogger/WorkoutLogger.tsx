import React, { useState, useEffect, useRef } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import Timer from "../Timer/Timer";
import type { TimerRef } from "../Timer/Timer";
import Toast from "../Toast/Toast";
import { workoutApi } from "../../services/workoutApi";
import type {
  ExerciseCategory,
  ExerciseDetection,
} from "../../services/workoutApi";
import styles from "./workout-logger.module.css";

interface WorkoutLoggerProps {
  onWorkoutLogged?: () => void;
}

const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({ onWorkoutLogged }) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [exerciseInput, setExerciseInput] = useState("");
  const [sets, setSets] = useState<number>(1);
  const [reps, setReps] = useState<number>(1);
  const [weight, setWeight] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0); // for time-based exercises
  const [restDuration, setRestDuration] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [useAI, setUseAI] = useState(true);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [categories, setCategories] = useState<ExerciseCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<ExerciseDetection | null>(
    null
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [workoutReady, setWorkoutReady] = useState(false);
  const [pendingWorkout, setPendingWorkout] = useState<any>(null);
  const timerRef = useRef<TimerRef>(null);

  // Load categories on component mount
  useEffect(() => {
    // Set fallback categories immediately for better UX
    setFallbackCategories();
    // Then try to fetch from API
    fetchCategories();
  }, []);

  // Auto-detect exercise when user types - only in AI mode
  useEffect(() => {
    if (exerciseInput.length > 2 && useAI) {
      const timeoutId = setTimeout(() => {
        detectExercise(exerciseInput);
      }, 2500); // Increased debounce to 2.5 seconds for better typing experience

      return () => clearTimeout(timeoutId);
    } else {
      setAiSuggestion(null);
      setShowSuggestions(false);
    }
  }, [exerciseInput, useAI]);

  // Clear AI-related state when switching to manual mode
  useEffect(() => {
    if (!useAI) {
      setAiSuggestion(null);
      setShowSuggestions(false);
      setWorkoutReady(false);
      setPendingWorkout(null);
    }
  }, [useAI]);

  // Auto-prepare workout in AI mode when suggestion is received
  useEffect(() => {
    if (useAI && aiSuggestion && exerciseInput.length > 2) {
      const workoutData = {
        exerciseDescription: exerciseInput,
        sets: Number(aiSuggestion.sets || 1),
        reps: Number(aiSuggestion.reps || 1),
        weight: Number(aiSuggestion.weight || 0),
        duration:
          aiSuggestion.duration && aiSuggestion.duration > 0
            ? Number(aiSuggestion.duration)
            : undefined,
        restDuration: restDuration > 0 ? Number(restDuration) : undefined,
        notes: notes.trim() || undefined,
        category: aiSuggestion.category || selectedCategory || undefined,
        useAI: true,
      };

      setPendingWorkout(workoutData);
      setWorkoutReady(true);
    }
  }, [
    aiSuggestion,
    useAI,
    exerciseInput,
    restDuration,
    notes,
    selectedCategory,
  ]);

  const fetchCategories = async () => {
    try {
      console.log("Fetching categories...");
      const token = await getToken();
      console.log("Token obtained:", !!token);

      // Try to fetch categories (now public endpoint)
      const categories = await workoutApi.getCategories(token || undefined);
      console.log("Categories received:", categories);
      setCategories(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Set fallback categories on error
      setFallbackCategories();
    }
  };

  const setFallbackCategories = () => {
    const fallbackCategories = [
      { value: "CHEST", label: "Chest" },
      { value: "BACK", label: "Back" },
      { value: "LEGS", label: "Legs" },
      { value: "ARMS", label: "Arms" },
      { value: "SHOULDERS", label: "Shoulders" },
      { value: "CORE", label: "Core" },
      { value: "CARDIO", label: "Cardio" },
      { value: "FULLBODY", label: "Full Body" },
      { value: "OTHER", label: "Other" },
    ];
    console.log("Setting fallback categories:", fallbackCategories);
    setCategories(fallbackCategories);
  };

  const detectExercise = async (description: string) => {
    try {
      const token = await getToken();
      if (token) {
        const detection = await workoutApi.detectExercise(description, token);
        setAiSuggestion(detection);

        // Always show suggestions when AI detects an exercise, unless user manually selected category
        const hasManualCategory = selectedCategory && selectedCategory !== "";
        setShowSuggestions(!hasManualCategory);

        // Auto-select category if confidence is high and no manual selection
        if (detection.confidence > 0.7 && !hasManualCategory) {
          setSelectedCategory(detection.category);
        }

        // Auto-populate sets, reps, weight, and duration if detected
        if (detection.sets && detection.sets > 0) {
          setSets(detection.sets);
        }
        if (detection.reps && detection.reps > 0) {
          setReps(detection.reps);
        }
        if (detection.weight && detection.weight > 0) {
          setWeight(detection.weight);
        }
        if (detection.duration && detection.duration > 0) {
          setDuration(detection.duration);
        }
      }
    } catch (error) {
      console.error("Error detecting exercise:", error);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);

    // Hide AI suggestions when user manually selects a category
    if (newCategory && newCategory !== "") {
      setShowSuggestions(false);
    } else {
      // If user clears the category and there's an AI suggestion, show it again
      if (aiSuggestion && useAI) {
        setShowSuggestions(true);
      }
    }
  };

  const handleManualLog = async () => {
    if (!exerciseInput.trim()) {
      showError("Please enter an exercise description");
      return;
    }

    // In manual mode, validate that required fields are filled
    if (sets < 1 || reps < 1 || weight < 0) {
      showError("Please fill in all required fields (sets, reps, weight)");
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();
      if (!token) {
        showError("Authentication required");
        return;
      }

      const workoutData = {
        exerciseDescription: exerciseInput,
        sets: Number(sets),
        reps: Number(reps),
        weight: Number(weight),
        duration: duration > 0 ? Number(duration) : undefined,
        restDuration: restDuration > 0 ? Number(restDuration) : undefined,
        notes: notes.trim() || undefined,
        category: selectedCategory || undefined,
        useAI: false,
      };

      await workoutApi.createWorkoutLog(workoutData, token);

      // Reset form and state
      setExerciseInput("");
      setSets(1);
      setReps(1);
      setWeight(0);
      setDuration(0);
      setRestDuration(0);
      setNotes("");
      setSelectedCategory("");

      // Show success toast
      setShowSuccessToast(true);

      // Notify parent component that workout was logged
      onWorkoutLogged?.();
    } catch (error) {
      console.error("Error logging workout:", error);

      // More detailed error logging
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as any;
        console.error("Response status:", axiosError.response?.status);
        console.error("Response data:", axiosError.response?.data);

        // Show more specific error messages
        if (axiosError.response?.status === 401) {
          showError("Authentication failed. Please sign in again.");
        } else if (axiosError.response?.status === 400) {
          const errorMsg =
            axiosError.response?.data?.message ||
            axiosError.response?.data?.error ||
            "Invalid workout data";
          showError(`Validation error: ${errorMsg}`);
        } else if (axiosError.response?.data?.message) {
          showError(
            `Failed to log workout: ${axiosError.response.data.message}`
          );
        } else {
          showError("Failed to log workout. Please try again.");
        }
      } else {
        showError("Failed to log workout. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!exerciseInput.trim()) {
      showError("Please enter an exercise description");
      return;
    }

    // In manual mode, validate that required fields are filled
    if (!useAI) {
      if (sets < 1 || reps < 1 || weight < 0) {
        showError("Please fill in all required fields (sets, reps, weight)");
        return;
      }
    }

    // In AI mode, use detected values or defaults
    const finalSets = useAI && aiSuggestion?.sets ? aiSuggestion.sets : sets;
    const finalReps = useAI && aiSuggestion?.reps ? aiSuggestion.reps : reps;
    const finalWeight =
      useAI && aiSuggestion?.weight ? aiSuggestion.weight : weight;
    const finalDuration =
      useAI && aiSuggestion?.duration ? aiSuggestion.duration : duration;

    const workoutData = {
      exerciseDescription: exerciseInput,
      sets: Number(finalSets),
      reps: Number(finalReps),
      weight: Number(finalWeight),
      duration: finalDuration > 0 ? Number(finalDuration) : undefined,
      restDuration: restDuration > 0 ? Number(restDuration) : undefined,
      notes: notes.trim() || undefined,
      category: selectedCategory || undefined,
      useAI,
    };

    // Store the prepared workout data for timer use (both AI and manual mode)
    setPendingWorkout(workoutData);
    setWorkoutReady(true);
  };

  const logPendingWorkout = async (finalRestDuration?: number) => {
    if (!pendingWorkout) {
      console.error("No pending workout to log");
      return;
    }

    console.log("Starting logPendingWorkout with:", {
      pendingWorkout,
      finalRestDuration,
    });

    setLoading(true);

    try {
      const token = await getToken();
      if (!token) {
        console.error("No authentication token available");
        showError("Authentication required");
        return;
      }

      console.log("Token obtained successfully");

      // Update the workout data with the actual rest duration from timer
      const updatedWorkoutData = {
        ...pendingWorkout,
        restDuration: finalRestDuration || pendingWorkout.restDuration,
      };

      console.log("Logging workout data:", updatedWorkoutData);

      await workoutApi.createWorkoutLog(updatedWorkoutData, token);

      console.log("Workout logged successfully");

      // Reset form and state
      setExerciseInput("");
      setSets(1);
      setReps(1);
      setWeight(0);
      setDuration(0);
      setRestDuration(0);
      setNotes("");
      setSelectedCategory("");
      setAiSuggestion(null);
      setShowSuggestions(false);
      setPendingWorkout(null);
      setWorkoutReady(false);

      // Show success toast
      setShowSuccessToast(true);

      // Reset timer to user's previous selection
      if (timerRef.current) {
        timerRef.current.resetTimer();
      }

      // Notify parent component that workout was logged
      onWorkoutLogged?.();
    } catch (error) {
      console.error("Error logging workout:", error);

      // More detailed error logging
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as any;
        console.error("Response status:", axiosError.response?.status);
        console.error("Response data:", axiosError.response?.data);
        console.error("Response headers:", axiosError.response?.headers);
        console.error("Request config:", axiosError.config);

        // Show more specific error messages
        if (axiosError.response?.status === 401) {
          showError("Authentication failed. Please sign in again.");
        } else if (axiosError.response?.status === 400) {
          const errorMsg =
            axiosError.response?.data?.message ||
            axiosError.response?.data?.error ||
            "Invalid workout data";
          showError(`Validation error: ${errorMsg}`);
        } else if (axiosError.response?.data?.message) {
          showError(
            `Failed to log workout: ${axiosError.response.data.message}`
          );
        } else {
          showError("Failed to log workout. Please try again.");
        }
      } else {
        showError("Failed to log workout. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorToast(true);
  };

  const acceptAISuggestion = () => {
    if (aiSuggestion) {
      setExerciseInput(aiSuggestion.exerciseName);
      setSelectedCategory(aiSuggestion.category);

      // Auto-populate detected values
      if (aiSuggestion.sets && aiSuggestion.sets > 0) {
        setSets(aiSuggestion.sets);
      }
      if (aiSuggestion.reps && aiSuggestion.reps > 0) {
        setReps(aiSuggestion.reps);
      }
      if (aiSuggestion.weight && aiSuggestion.weight > 0) {
        setWeight(aiSuggestion.weight);
      }
      if (aiSuggestion.duration && aiSuggestion.duration > 0) {
        setDuration(aiSuggestion.duration);
      }

      setShowSuggestions(false);
    }
  };

  const handleToastClose = () => {
    setShowSuggestions(false);
  };

  const handleSuccessToastClose = () => {
    setShowSuccessToast(false);
  };

  const handleErrorToastClose = () => {
    setShowErrorToast(false);
  };

  const handleRestDurationCapture = (duration: number) => {
    console.log(`Rest duration captured: ${duration} seconds`);
    console.log(
      `Workout ready: ${workoutReady}, Pending workout exists: ${!!pendingWorkout}`
    );

    setRestDuration(duration);

    // If we have a pending workout, log it now with the captured rest duration
    if (workoutReady && pendingWorkout) {
      console.log("Logging pending workout with rest duration:", duration);
      logPendingWorkout(duration);
    }
  };

  const handleLapTimeCapture = (lapTime: number) => {
    console.log(`Lap time captured: ${lapTime} seconds`);
    // For lap times, you might want to add them to notes or handle differently
    const lapMinutes = Math.floor(lapTime / 60);
    const lapSeconds = lapTime % 60;
    const lapTimeString = `${lapMinutes}:${lapSeconds
      .toString()
      .padStart(2, "0")}`;
    setNotes(prev =>
      prev ? `${prev}\nLap: ${lapTimeString}` : `Lap: ${lapTimeString}`
    );
  };

  if (!user) {
    return (
      <div className={styles.container}>
        <p>Please log in to use the workout logger.</p>
      </div>
    );
  }

  console.log("Current categories state:", categories);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Workout Logger</h2>
        <p>Track your exercises with AI-powered detection</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.headerRow}>
          <div className={styles.toggleContainer}>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={useAI}
                onChange={e => setUseAI(e.target.checked)}
                className={styles.toggle}
              />
              <span className={styles.toggleText}>
                {useAI ? "🤖 AI Mode" : "📝 Manual Mode"}
              </span>
            </label>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="exercise">Exercise Description</label>
          {workoutReady && pendingWorkout && (
            <div className={styles.subtleHint}>
              Ready to log:{" "}
              <strong>{pendingWorkout.exerciseDescription}</strong> - Use timer
              below to track rest
            </div>
          )}
          <div className={`${styles.combinedInputWrapper}`}>
            {!useAI && (
              <div className={styles.categoryDropdownInline}>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className={styles.inlineSelect}
                  disabled={workoutReady}
                >
                  <option value="">Category</option>
                  {categories.map(cat => {
                    console.log("Rendering category:", cat);
                    return (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    );
                  })}
                </select>
                <div className={styles.inlineChevron}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M3 4.5L6 7.5L9 4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            )}
            <input
              id="exercise"
              type="text"
              value={exerciseInput}
              onChange={e => setExerciseInput(e.target.value)}
              placeholder={
                useAI
                  ? "e.g., bench press 3x8 @ 185 lbs, crab walks 1 set of 30 seconds, burpees 4x15..."
                  : "e.g., bench press, crab walks, burpees..."
              }
              maxLength={200}
              required
              className={`${styles.combinedInput} ${useAI ? styles.aiModeInput : ""}`}
            />
          </div>
          <div className={styles.inputHint}>
            {useAI ? (
              <>
                🤖 <strong>AI Mode:</strong> Include sets, reps, weight, or
                duration for auto-detection. Examples: "bench press 3x10 @ 135
                lbs", "crab walks 1 set of 30 seconds", "burpees 4x15"
              </>
            ) : (
              <>
                📝 <strong>Manual Mode:</strong> Enter your exercise name and
                fill in the details below manually
              </>
            )}
          </div>
        </div>

        {/* Manual inputs - only show when AI is disabled */}
        {!useAI && (
          <div className={styles.manualInputsSection}>
            <div className={styles.inputGroup}>
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={selectedCategory}
                onChange={handleCategoryChange}
                disabled={workoutReady}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label htmlFor="sets">Sets</label>
                <input
                  id="sets"
                  type="number"
                  value={sets}
                  onChange={e => setSets(parseInt(e.target.value) || 1)}
                  min="1"
                  max="50"
                  disabled={workoutReady}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="reps">Reps</label>
                <input
                  id="reps"
                  type="number"
                  value={reps}
                  onChange={e => setReps(parseInt(e.target.value) || 1)}
                  min="1"
                  max="1000"
                  disabled={workoutReady}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="weight">Weight (lbs)</label>
                <input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={e => setWeight(parseFloat(e.target.value) || 0)}
                  min="0"
                  max="2000"
                  step="0.5"
                  disabled={workoutReady}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="duration">Duration (seconds)</label>
                <input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={e => setDuration(parseInt(e.target.value) || 0)}
                  min="0"
                  max="3600"
                  placeholder="For time-based exercises"
                  disabled={workoutReady}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="rest">Rest Duration (seconds)</label>
              <input
                id="rest"
                type="number"
                value={restDuration}
                onChange={e => setRestDuration(parseInt(e.target.value) || 0)}
                min="0"
                max="3600"
                placeholder="Optional - can be grabbed from timer"
                disabled={workoutReady}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="notes">Notes (optional)</label>
              <textarea
                id="notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Additional notes about this exercise..."
                maxLength={500}
                rows={3}
                disabled={workoutReady}
              />
            </div>

            <button
              type="button"
              onClick={handleManualLog}
              disabled={loading || workoutReady}
              className={styles.manualLogButton}
            >
              {loading ? "Logging..." : "Log Workout"}
            </button>
          </div>
        )}

        {/* AI detected values display - only show when AI is enabled and values are detected */}
        {useAI && aiSuggestion && (
          <div className={styles.aiValuesSection}>
            <div className={styles.aiValuesHeader}>
              <span>🎯 AI Detected Values</span>
              <div className={styles.aiDetectionCategory}>
                Ready to use the values below or dismiss to enter manually
              </div>
            </div>

            {/* Exercise name and type info */}
            <div className={styles.aiDetectionDetails}>
              <span className={styles.aiDetectionExerciseName}>
                Exercise: {aiSuggestion.exerciseName}
              </span>
              <span className={styles.aiDetectionMuscleGroup}>
                Type:{" "}
                {aiSuggestion.muscleGroup || aiSuggestion.category
                  ? aiSuggestion.muscleGroup ||
                    aiSuggestion.category.charAt(0) +
                      aiSuggestion.category
                        .slice(1)
                        .toLowerCase()
                        .replace("_", " ")
                  : "Unknown"}
              </span>
              {aiSuggestion.confidence && (
                <span className={styles.aiDetectionConfidence}>
                  Confidence: {Math.round(aiSuggestion.confidence * 100)}%
                </span>
              )}
            </div>

            <div className={styles.row}>
              {aiSuggestion.sets && (
                <div className={styles.detectedValue}>
                  <label>Sets</label>
                  <span className={styles.valueDisplay}>
                    {aiSuggestion.sets}
                  </span>
                </div>
              )}
              {aiSuggestion.reps && (
                <div className={styles.detectedValue}>
                  <label>Reps</label>
                  <span className={styles.valueDisplay}>
                    {aiSuggestion.reps}
                  </span>
                </div>
              )}
              {aiSuggestion.weight && (
                <div className={styles.detectedValue}>
                  <label>Weight</label>
                  <span className={styles.valueDisplay}>
                    {aiSuggestion.weight} lbs
                  </span>
                </div>
              )}
              {aiSuggestion.duration && (
                <div className={styles.detectedValue}>
                  <label>Duration</label>
                  <span className={styles.valueDisplay}>
                    {aiSuggestion.duration}s
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons - only show when suggestions are available and not auto-prepared */}
            {showSuggestions && !workoutReady && (
              <div className={styles.aiDetectionActions}>
                <button
                  type="button"
                  onClick={acceptAISuggestion}
                  className={styles.aiAcceptButton}
                  disabled={workoutReady}
                >
                  ✓ Use AI Values
                </button>
                <button
                  type="button"
                  onClick={handleToastClose}
                  className={styles.aiDismissButton}
                  disabled={workoutReady}
                >
                  ✕ Dismiss
                </button>
              </div>
            )}

            {/* Cancel button - always show when AI values are detected */}
            <div className={styles.aiDetectionActions}>
              <button
                type="button"
                onClick={() => setUseAI(false)}
                className={styles.aiCancelButton}
              >
                Switch to Manual Mode
              </button>
            </div>
          </div>
        )}

        <div
          className={`${styles.timerSection} ${workoutReady ? styles.timerActive : ""}`}
        >
          <Timer
            ref={timerRef}
            onRestDurationCapture={handleRestDurationCapture}
            onLapTimeCapture={handleLapTimeCapture}
            aiMode={useAI}
          />
        </div>

        {/* Notes section - only show in AI mode */}
        {useAI && (
          <div className={styles.inputGroup}>
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Additional notes about this exercise..."
              maxLength={500}
              rows={3}
              disabled={workoutReady}
            />
          </div>
        )}

        {/* Submit button - only show in manual mode */}
        {!useAI && (
          <button
            type="submit"
            disabled={loading || workoutReady}
            className={styles.submitButton}
          >
            {loading
              ? "Logging..."
              : workoutReady
                ? "Ready - Use Timer Below"
                : "Prepare Workout"}
          </button>
        )}

        {/* Log Workout button for AI mode when workout is ready */}
        {useAI && workoutReady && (
          <button
            type="button"
            onClick={() => logPendingWorkout()}
            disabled={loading}
            className={styles.manualLogButton}
          >
            {loading ? "Logging..." : "Log Set"}
          </button>
        )}
      </form>

      <Toast
        isVisible={showSuccessToast}
        onClose={handleSuccessToastClose}
        title="Workout Logged Successfully!"
        message="Your exercise has been saved to your workout history."
        type="success"
        autoClose={true}
        duration={3000}
      />

      <Toast
        isVisible={showErrorToast}
        onClose={handleErrorToastClose}
        title="Error"
        message={errorMessage}
        type="warning"
        autoClose={true}
        duration={5000}
      />
    </div>
  );
};

export default WorkoutLogger;
