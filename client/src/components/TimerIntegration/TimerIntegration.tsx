import React, { useState, useEffect } from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";
import styles from "./timer-integration.module.css";

interface TimerIntegrationProps {
  onRestDurationCapture: (duration: number) => void;
  disabled?: boolean;
}

const TimerIntegration: React.FC<TimerIntegrationProps> = ({
  onRestDurationCapture,
  disabled = false,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [lastCapturedDuration, setLastCapturedDuration] = useState<
    number | null
  >(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleStart = () => {
    if (!disabled) {
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setSeconds(0);
    setLastCapturedDuration(null);
  };

  const handleCapture = () => {
    if (seconds > 0) {
      onRestDurationCapture(seconds);
      setLastCapturedDuration(seconds);
      setSeconds(0);
      setIsRunning(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <AccessTimeIcon className={styles.icon} />
        <h4>Rest Timer</h4>
      </div>

      <div className={styles.display}>
        <span className={styles.time}>{formatTime(seconds)}</span>
        {lastCapturedDuration && (
          <span className={styles.captured}>
            Last: {formatTime(lastCapturedDuration)}
          </span>
        )}
      </div>

      <div className={styles.controls}>
        <button
          onClick={handleStart}
          disabled={disabled || isRunning}
          className={`${styles.button} ${styles.startButton}`}
          title="Start rest timer"
        >
          <PlayArrowIcon className={styles.buttonIcon} />
        </button>

        <button
          onClick={handlePause}
          disabled={disabled || !isRunning}
          className={`${styles.button} ${styles.pauseButton}`}
          title="Pause timer"
        >
          <PauseIcon className={styles.buttonIcon} />
        </button>

        <button
          onClick={handleStop}
          disabled={disabled}
          className={`${styles.button} ${styles.stopButton}`}
          title="Reset timer"
        >
          <StopIcon className={styles.buttonIcon} />
        </button>

        <button
          onClick={handleCapture}
          disabled={disabled || seconds === 0}
          className={`${styles.button} ${styles.captureButton}`}
          title="Capture rest duration"
        >
          Capture
        </button>
      </div>

      {lastCapturedDuration && (
        <div className={styles.captureMessage}>
          ✓ Captured {formatTime(lastCapturedDuration)} rest duration
        </div>
      )}
    </div>
  );
};

export default TimerIntegration;
