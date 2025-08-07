import React, { useEffect } from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import styles from "../timer.module.css";

interface CountdownTimerProps {
  duration: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onComplete?: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  duration,
  isRunning,
  onStart,
  onPause,
  onStop,
  onComplete,
}) => {
  const [timeLeft, setTimeLeft] = React.useState<number>(duration);

  // Update timeLeft when duration changes
  useEffect(() => {
    if (duration > 0) {
      setTimeLeft(duration);
    }
  }, [duration]);

  // Countdown timer logic
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (isRunning && timeLeft > 0 && duration > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev > 0 ? prev - 1 : 0;
          if (newTime === 0 && onComplete) {
            onComplete();
          }
          return newTime;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, onComplete, duration]);

  // Stop timer when countdown reaches zero
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      onPause(); // Auto-pause when time reaches zero
    }
  }, [timeLeft, isRunning, onPause]);

  const handleStop = () => {
    if (duration > 0) {
      setTimeLeft(duration);
    }
    onStop();
  };

  // Display time in mm:ss
  const formatTime = (seconds: number) =>
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
      seconds % 60
    ).padStart(2, "0")}`;

  const timerDisplay = formatTime(timeLeft);

  // Calculate timer progress as a percentage
  const timerProgress =
    duration > 0
      ? Math.min(100, Math.max(0, ((duration - timeLeft) / duration) * 100))
      : 0;

  return (
    <>
      <div className={styles.timerCircle}>
        <Box
          sx={{
            position: "relative",
            display: "inline-flex",
            width: "200px !important",
            height: "200px !important",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress
            variant="determinate"
            value={100}
            sx={{
              position: "absolute",
              width: "200px !important",
              height: "200px !important",
              color: "var( --darkmode-border-color)",
            }}
            thickness={4}
          />
          <CircularProgress
            variant="determinate"
            value={timerProgress}
            sx={{
              position: "absolute",
              width: "200px !important",
              height: "200px !important",
              color: "var(--secondary-color)",
            }}
            thickness={4}
          />
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "200px !important",
              height: "200px !important",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2rem" },
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            {timerDisplay}
          </Box>
        </Box>
      </div>

      <div className={styles.timerButtonControls}>
        <button className={styles.timerButton} onClick={onStart}>
          <PlayArrowIcon />
        </button>
        <button className={styles.timerButton} onClick={onPause}>
          <PauseIcon />
        </button>
        <button className={styles.timerButton} onClick={handleStop}>
          <RestartAltIcon />
        </button>
      </div>
    </>
  );
};

export default CountdownTimer;
