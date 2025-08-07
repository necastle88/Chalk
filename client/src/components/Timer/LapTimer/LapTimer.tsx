import React, { useEffect } from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import FlagIcon from "@mui/icons-material/Flag";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import styles from "../timer.module.css";

interface LapTimerProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
}

const LapTimer: React.FC<LapTimerProps> = ({
  isRunning,
  onStart,
  onPause,
  onStop,
}) => {
  const [lapTime, setLapTime] = React.useState<number>(0);
  const [laps, setLaps] = React.useState<number[]>([]);

  // Lap timer logic with security limits
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (isRunning) {
      timer = setInterval(() => {
        setLapTime((prev) => {
          // Security: Prevent extremely long lap times (24 hours max)
          const MAX_LAP_TIME = 86400; // 24 hours in seconds
          if (prev >= MAX_LAP_TIME) {
            console.warn("Lap time exceeds security limit");
            return prev; // Stop incrementing
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning]);

  // Reset when stopped
  useEffect(() => {
    if (!isRunning) {
      // Only reset if we're calling stop, not pause
    }
  }, [isRunning]);

  const handleStop = () => {
    setLapTime(0);
    setLaps([]);
    onStop();
  };

  // Lap button handler with security limits
  const handleLap = () => {
    // Prevent memory exhaustion - limit to 100 laps
    if (laps.length >= 100) {
      console.warn("Maximum lap limit reached for security");
      return;
    }
    setLaps((prev) => [lapTime, ...prev]);
    setLapTime(0);
  };

  // Display time in mm:ss
  const formatTime = (seconds: number) =>
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
      seconds % 60
    ).padStart(2, "0")}`;

  const lapDisplay = formatTime(lapTime);

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
            value={100} // Always full for lap timer
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
            {lapDisplay}
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
        <button
          className={styles.timerButton}
          onClick={handleLap}
          disabled={!isRunning}
          title="Record Lap"
        >
          <FlagIcon />
        </button>
      </div>

      {/* Show laps if any exist */}
      {laps.length > 0 && (
        <table className={styles.lapTable}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Lap</th>
              <th style={{ textAlign: "right" }}>Lap Time</th>
            </tr>
          </thead>
          <tbody>
            {laps.map((lap, idx) => (
              <tr key={idx}>
                <td style={{ textAlign: "left" }}>{laps.length - idx}</td>
                <td style={{ textAlign: "right" }}>{formatTime(lap)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

export default LapTimer;
