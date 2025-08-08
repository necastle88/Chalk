import React, { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import Timer from "../Timer/Timer";
import type { TimerRef } from "../Timer/Timer";
import type { CardioWorkoutData } from "../Timer/CardioTimer/CardioWorkoutModal";
import Toast from "../Toast/Toast";
import { workoutApi } from "../../services/workoutApi";
import styles from "./cardio-logger.module.css";

interface CardioLoggerProps {
  onWorkoutLogged?: () => void;
}

const CardioLogger: React.FC<CardioLoggerProps> = ({ onWorkoutLogged }) => {
  const { user } = useUser();
  const { getToken } = useAuth();

  // Form state
  const [exerciseInput, setExerciseInput] = useState("");
  const [distance, setDistance] = useState<number>(0);
  const [heartRateStart, setHeartRateStart] = useState<number>(0);
  const [heartRateMax, setHeartRateMax] = useState<number>(0);
  const [perceivedEffort, setPerceivedEffort] = useState<number>(1);
  const [estimatedCalories, setEstimatedCalories] = useState<number>(0);
  const [pace, setPace] = useState<string>("");
  const [notes, setNotes] = useState("");

  // Timer and workout state
  const [duration, setDuration] = useState<number>(0);
  const [laps, setLaps] = useState<number>(0);
  const [totalLapTime, setTotalLapTime] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Mode state - Auto (timer + modal) vs Manual (form)
  const [useAutoMode, setUseAutoMode] = useState(true);

  // Toast state
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const timerRef = React.useRef<TimerRef>(null);

  // Auto-calculate average lap time when laps or total time changes
  useEffect(() => {
    if (laps > 0 && totalLapTime > 0) {
      // Could be used to display average lap time if needed
      // const avgLapTimeSeconds = totalLapTime / laps;
    }
  }, [laps, totalLapTime]);

  // Auto-calculate pace when distance and duration are available
  useEffect(() => {
    if (distance > 0 && duration > 0) {
      const paceSeconds = duration / distance;
      const paceMinutes = Math.floor(paceSeconds / 60);
      const paceSecs = Math.floor(paceSeconds % 60);
      setPace(`${paceMinutes}:${paceSecs.toString().padStart(2, "0")}`);
    }
  }, [distance, duration]);

  const handleCardioDurationCapture = (totalDuration: number) => {
    console.log("Cardio workout completed, duration:", totalDuration);
    setDuration(totalDuration);
  };

  const handleLapTimeCapture = (lapTime: number) => {
    console.log("Lap recorded:", lapTime);
    setLaps(prev => prev + 1);
    setTotalLapTime(prev => prev + lapTime);

    // Add lap info to notes
    const lapNumber = laps + 1;
    const lapMinutes = Math.floor(lapTime / 60);
    const lapSeconds = lapTime % 60;
    const lapTimeString = `${lapMinutes}:${lapSeconds.toString().padStart(2, "0")}`;

    setNotes(prev =>
      prev
        ? `${prev}\nLap ${lapNumber}: ${lapTimeString}`
        : `Lap ${lapNumber}: ${lapTimeString}`
    );
  };

  const handleCardioWorkoutSave = async (workoutData: CardioWorkoutData) => {
    console.log("Cardio workout data from modal:", workoutData);
    setLoading(true);

    try {
      const token = await getToken();
      if (!token) {
        showError("Authentication required");
        return;
      }

      // Map the modal data to our API format
      const apiWorkoutData = {
        exerciseDescription: workoutData.exerciseName,
        sets: 1,
        reps: 1,
        weight: 0,
        duration: workoutData.duration,
        notes: workoutData.notes || undefined,
        category: "CARDIO",
        distance: workoutData.distance,
        laps: workoutData.lapCount > 0 ? workoutData.lapCount : undefined,
        heartRate: workoutData.heartRate,
        pace: workoutData.pace,
        useAI: false,
      };

      console.log("Saving cardio workout:", apiWorkoutData);
      await workoutApi.createWorkoutLog(apiWorkoutData, token);

      // Reset the form completely
      setExerciseInput("");
      setDistance(0);
      setHeartRateStart(0);
      setHeartRateMax(0);
      setPerceivedEffort(1);
      setEstimatedCalories(0);
      setPace("");
      setNotes("");
      setDuration(0);
      setLaps(0);
      setTotalLapTime(0);

      // Reset timer
      if (timerRef.current) {
        timerRef.current.resetTimer();
      }

      // Show success
      setShowSuccessToast(true);
      onWorkoutLogged?.();
    } catch (error) {
      console.error("Error saving cardio workout:", error);
      showError("Failed to save workout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!exerciseInput.trim()) {
      showError("Please enter an exercise type");
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
        sets: 1,
        reps: 1,
        weight: 0,
        duration: duration,
        notes: notes.trim() || undefined,
        category: "CARDIO",
        distance: distance > 0 ? distance : undefined,
        laps: laps > 0 ? laps : undefined,
        heartRate: heartRateStart > 0 ? heartRateStart : undefined,
        heartRateMax: heartRateMax > 0 ? heartRateMax : undefined,
        perceivedEffort: perceivedEffort.toString(),
        estimatedCalories:
          estimatedCalories > 0 ? estimatedCalories : undefined,
        pace: pace || undefined,
        useAI: false,
      };

      console.log("Manual cardio workout:", workoutData);
      await workoutApi.createWorkoutLog(workoutData, token);

      // Reset form
      setExerciseInput("");
      setDistance(0);
      setHeartRateStart(0);
      setHeartRateMax(0);
      setPerceivedEffort(1);
      setEstimatedCalories(0);
      setPace("");
      setNotes("");
      setDuration(0);
      setLaps(0);
      setTotalLapTime(0);

      // Show success
      setShowSuccessToast(true);
      onWorkoutLogged?.();
    } catch (error) {
      console.error("Error logging manual cardio workout:", error);
      showError("Failed to log workout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorToast(true);
  };

  const handleSuccessToastClose = () => {
    setShowSuccessToast(false);
  };

  const handleErrorToastClose = () => {
    setShowErrorToast(false);
  };

  if (!user) {
    return (
      <div className={styles.container}>
        <p>Please log in to use the cardio logger.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Cardio Workout Logger</h2>
        <p>Track your cardio sessions with detailed metrics and timing</p>
      </div>

      <form
        onSubmit={useAutoMode ? e => e.preventDefault() : handleManualSubmit}
        className={styles.form}
      >
        <div className={styles.headerRow}>
          <div className={styles.toggleContainer}>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={useAutoMode}
                onChange={e => setUseAutoMode(e.target.checked)}
                className={styles.toggle}
              />
              <span className={styles.toggleText}>
                {useAutoMode ? "⏱️ Auto Mode" : "📝 Manual Mode"}
              </span>
            </label>
          </div>
        </div>

        {useAutoMode ? (
          // Auto Mode: Timer + Modal workflow
          <div className={styles.autoModeSection}>
            <div className={styles.inputHint}>
              <p>
                ⏱️ <strong>Auto Mode:</strong> Start your cardio workout with
                the timer below. When you finish, you'll be prompted to enter
                workout details.
              </p>
            </div>

            <div className={styles.timerSection}>
              <h3>Workout Timer</h3>
              <Timer
                ref={timerRef}
                workoutType="cardio"
                onCardioDurationCapture={handleCardioDurationCapture}
                onLapTimeCapture={handleLapTimeCapture}
                onCardioWorkoutSave={handleCardioWorkoutSave}
              />
            </div>
          </div>
        ) : (
          // Manual Mode: Traditional form
          <div className={styles.manualModeSection}>
            <div className={styles.inputHint}>
              <p>
                📝 <strong>Manual Mode:</strong> Enter your completed cardio
                workout details manually.
              </p>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="exercise">Exercise Type *</label>
              <select
                id="exercise"
                value={exerciseInput}
                onChange={e => setExerciseInput(e.target.value)}
                required
                className={styles.input}
              >
                <option value="">Select exercise type</option>
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

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label htmlFor="manualDuration">Duration (minutes) *</label>
                <input
                  id="manualDuration"
                  type="number"
                  value={duration > 0 ? Math.round(duration / 60) : ""}
                  onChange={e =>
                    setDuration((parseInt(e.target.value) || 0) * 60)
                  }
                  min="1"
                  max="480"
                  placeholder="e.g., 30"
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="manualDistance">Distance (miles)</label>
                <input
                  id="manualDistance"
                  type="number"
                  value={distance || ""}
                  onChange={e => setDistance(parseFloat(e.target.value) || 0)}
                  min="0"
                  max="500"
                  step="0.1"
                  placeholder="e.g., 3.1"
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label htmlFor="manualHeartRate">Avg Heart Rate (bpm)</label>
                <input
                  id="manualHeartRate"
                  type="number"
                  value={heartRateStart || ""}
                  onChange={e =>
                    setHeartRateStart(parseInt(e.target.value) || 0)
                  }
                  min="40"
                  max="250"
                  placeholder="e.g., 150"
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="manualPace">Pace</label>
                <input
                  id="manualPace"
                  type="text"
                  value={pace}
                  onChange={e => setPace(e.target.value)}
                  placeholder="e.g., 8:30/mile"
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="manualNotes">Notes</label>
              <textarea
                id="manualNotes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Route details, weather conditions, how you felt..."
                maxLength={500}
                rows={3}
                className={styles.textarea}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !exerciseInput.trim() || duration === 0}
              className={styles.submitButton}
            >
              {loading ? "Logging..." : "Log Cardio Workout"}
            </button>
          </div>
        )}
      </form>

      <Toast
        isVisible={showSuccessToast}
        onClose={handleSuccessToastClose}
        title="Cardio Workout Logged!"
        message="Your cardio session has been saved to your workout history."
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

export default CardioLogger;
