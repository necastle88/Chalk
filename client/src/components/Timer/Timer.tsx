import React, { useEffect, useImperativeHandle, forwardRef } from "react";
import CancelIcon from "@mui/icons-material/Cancel";
import styles from "./timer.module.css";
import LapTimer from "./LapTimer";
import CountdownTimer from "./CountdownTimer";
import CardioTimer from "./CardioTimer";
import type { CardioWorkoutData } from "./CardioTimer/CardioWorkoutModal";

interface TimerProps {
  onRestDurationCapture?: (duration: number) => void;
  onLapTimeCapture?: (lapTime: number) => void;
  onCardioDurationCapture?: (duration: number) => void;
  onCardioWorkoutSave?: (workoutData: CardioWorkoutData) => void;
  aiMode?: boolean;
  workoutType?: "strength" | "cardio";
}

export interface TimerRef {
  resetTimer: () => void;
}

const Timer = forwardRef<TimerRef, TimerProps>(
  (
    {
      onRestDurationCapture,
      onLapTimeCapture,
      onCardioDurationCapture,
      onCardioWorkoutSave,
      aiMode = false,
      workoutType = "strength",
    },
    ref
  ) => {
    const [timerType, setTimerType] = React.useState(
      aiMode ? "rest" : workoutType === "cardio" ? "cardio" : "Select Type"
    );
    const [timerDuration, setTimerDuration] = React.useState(
      aiMode ? "90" : "Select Duration"
    );
    const [timerRunning, setTimerRunning] = React.useState(false);
    const [displayWarning, setDisplayWarning] = React.useState(false);
    const [resetKey, setResetKey] = React.useState(0); // Add reset key to force remount

    // Reset timer when switching type
    useEffect(() => {
      setTimerRunning(false);
      setDisplayWarning(false);
    }, [timerType]);

    // Set defaults when AI mode or workout type changes
    useEffect(() => {
      if (aiMode) {
        setTimerType("rest");
        setTimerDuration("90"); // Moderate Rest (1.5 min)
      } else if (workoutType === "cardio") {
        setTimerType("cardio");
        setTimerDuration("Select Duration"); // Not needed for cardio
      } else {
        setTimerType("Select Type");
        setTimerDuration("Select Duration");
      }
      setTimerRunning(false);
      setDisplayWarning(false);
    }, [aiMode, workoutType]);

    // Expose reset function to parent component
    useImperativeHandle(ref, () => ({
      resetTimer: () => {
        console.log("Timer: resetTimer called");
        setTimerRunning(false);
        setDisplayWarning(false);
        // Force remount of timer components by incrementing reset key
        setResetKey(prev => prev + 1);
        // Keep the current timer type and duration (user's previous selection)
        console.log(
          "Timer: Reset complete, preserving type:",
          timerType,
          "duration:",
          timerDuration
        );
      },
    }));

    const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      setTimerType(event.target.value);
      setTimerDuration("Select Duration");
      setTimerRunning(false);
      // Clear warning if valid type is selected
      if (event.target.value !== "Select Type") {
        setDisplayWarning(false);
      }
    };

    const handleSelectChange = (
      event: React.ChangeEvent<HTMLSelectElement>
    ) => {
      setTimerDuration(event.target.value);
      setTimerRunning(false);
      // Clear warning if valid selection is made
      if (
        timerType !== "Select Type" &&
        event.target.value !== "Select Duration"
      ) {
        setDisplayWarning(false);
      }
    };

    const handleStart = () => {
      const duration = Number(timerDuration);
      const MAX_TIMER_DURATION = 3600; // 1 hour max
      const isValidDuration =
        !isNaN(duration) &&
        duration > 0 &&
        duration <= MAX_TIMER_DURATION &&
        Number.isInteger(duration);

      // For cardio and workout types, no duration validation needed
      // For countdown timers, duration validation is required
      if (
        timerType === "Select Type" ||
        (timerType !== "workout" &&
          timerType !== "cardio" &&
          (timerDuration === "Select Duration" || !isValidDuration))
      ) {
        setDisplayWarning(true);
      } else {
        setDisplayWarning(false);
        setTimerRunning(true);
      }
    };

    const handlePause = () => {
      setTimerRunning(false);
    };

    const handleStop = () => {
      setTimerRunning(false);
      // The CountdownTimer component handles rest duration capture internally
      // when the user stops the timer, so we don't need to do it here
    };

    const handleTimerComplete = () => {
      setTimerRunning(false);
      // The CountdownTimer component handles rest duration capture internally
      // when the timer completes, so we don't need to do it here
      // TODO add notification logic here (sound, toast, etc.)
      console.log("Timer completed!");
    };

    const handleLapCapture = (lapTime: number) => {
      if (onLapTimeCapture) {
        onLapTimeCapture(lapTime);
      }
    };

    // Display warning if no type or duration is selected
    const displayWarningMessage = () => {
      const handleCloseWarning = () => {
        setDisplayWarning(false);
      };

      return (
        <div className={styles.warningMessage}>
          <p>
            Please select a timer type
            {timerType !== "workout" && timerType !== "cardio"
              ? " and duration"
              : ""}{" "}
            before starting.
          </p>
          <button className={styles.closeButton} onClick={handleCloseWarning}>
            <CancelIcon />
          </button>
        </div>
      );
    };

    return (
      <>
        <div className={styles.timerContainer}>
          <div className={styles.timerControls}>
            <div className={styles.selectContainer}>
              <select
                className={styles.timerSelect}
                value={timerType}
                onChange={handleTypeChange}
              >
                <option value="Select Type" disabled>
                  Select Type
                </option>
                <option value="workout">Lap</option>
                <option value="rest">Rest</option>
                <option value="cardio">Cardio Workout</option>
              </select>
            </div>
            {timerType !== "workout" && timerType !== "cardio" && (
              <div className={styles.selectContainer}>
                <select
                  className={styles.timerSelect}
                  value={timerDuration}
                  onChange={handleSelectChange}
                >
                  <option value="Select Duration" disabled>
                    Select Duration
                  </option>
                  <optgroup label="Warmup">
                    <option value={30}>Short Warmup (30 sec)</option>
                    <option value={60}>Standard Warmup (1 min)</option>
                  </optgroup>
                  <optgroup label="HIIT">
                    <option value={30}>Short Break (30 sec)</option>
                    <option value={60}>Light Recovery (1 min)</option>
                  </optgroup>
                  <optgroup label="Strength">
                    <option value={90}>Moderate Rest (1.5 min)</option>
                    <option value={120}>Standard Rest (2 min)</option>
                    <option value={180}>Deep Recovery (3 min)</option>
                  </optgroup>
                  <optgroup label="Cooldown">
                    <option value={300}>Long Rest (5 min)</option>
                    <option value={600}>Full Reset (10 min)</option>
                  </optgroup>
                </select>
              </div>
            )}
          </div>
          {displayWarning ? displayWarningMessage() : null}
          {timerType === "workout" && (
            <LapTimer
              key={`lap-${resetKey}`} // Force remount on reset
              isRunning={timerRunning}
              onStart={handleStart}
              onPause={handlePause}
              onStop={handleStop}
              onLapCapture={handleLapCapture}
            />
          )}
          {timerType === "rest" && (
            <CountdownTimer
              key={`countdown-${resetKey}`} // Force remount on reset
              duration={
                timerDuration !== "Select Duration" ? Number(timerDuration) : 0
              }
              isRunning={timerRunning}
              onStart={handleStart}
              onPause={handlePause}
              onStop={handleStop}
              onComplete={handleTimerComplete}
              onRestCapture={onRestDurationCapture}
            />
          )}
          {timerType === "cardio" && (
            <CardioTimer
              key={`cardio-${resetKey}`} // Force remount on reset
              isRunning={timerRunning}
              onStart={handleStart}
              onPause={handlePause}
              onStop={handleStop}
              onLapCapture={handleLapCapture}
              onDurationCapture={onCardioDurationCapture}
              onWorkoutSave={onCardioWorkoutSave}
            />
          )}
          {timerType === "Select Type" && (
            <div className={styles.placeholderMessage}>
              <p>Select a timer type to get started</p>
            </div>
          )}
        </div>
      </>
    );
  }
);

export default Timer;
