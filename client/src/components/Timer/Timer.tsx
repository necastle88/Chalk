import React, { useEffect } from "react";
import CancelIcon from "@mui/icons-material/Cancel";
import styles from "./timer.module.css";
import LapTimer from "./LapTimer";
import CountdownTimer from "./CountdownTimer";

const Timer: React.FC = () => {
  const [timerType, setTimerType] = React.useState("Select Type");
  const [timerDuration, setTimerDuration] = React.useState("Select Duration");
  const [timerRunning, setTimerRunning] = React.useState(false);
  const [displayWarning, setDisplayWarning] = React.useState(false);

  // Reset timer when switching type
  useEffect(() => {
    setTimerRunning(false);
    setDisplayWarning(false);
  }, [timerType]);

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTimerType(event.target.value);
    setTimerDuration("Select Duration");
    setTimerRunning(false);
    // Clear warning if valid type is selected
    if (event.target.value !== "Select Type") {
      setDisplayWarning(false);
    }
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
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

    if (
      timerType === "Select Type" ||
      (timerType !== "workout" &&
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
  };

  const handleTimerComplete = () => {
    setTimerRunning(false);
    // You can add notification logic here (sound, toast, etc.)
    console.log("Timer completed!");
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
          {timerType !== "workout" ? " and duration" : ""} before starting.
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
            </select>
          </div>
          {/* Hide duration select if Lap is selected */}
          {timerType !== "workout" && (
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

        {/* Render appropriate timer component */}
        {timerType === "workout" && (
          <LapTimer
            isRunning={timerRunning}
            onStart={handleStart}
            onPause={handlePause}
            onStop={handleStop}
          />
        )}

        {timerType === "rest" && (
          <CountdownTimer
            duration={
              timerDuration !== "Select Duration" ? Number(timerDuration) : 0
            }
            isRunning={timerRunning}
            onStart={handleStart}
            onPause={handlePause}
            onStop={handleStop}
            onComplete={handleTimerComplete}
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
};

export default Timer;
