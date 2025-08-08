import React, { useEffect, useState } from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";
import FlagIcon from "@mui/icons-material/Flag";
import styles from "../timer.module.css";
import CardioWorkoutModal from "./CardioWorkoutModal";
import type { CardioWorkoutData } from "./CardioWorkoutModal";

interface CardioTimerProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onLapCapture?: (lapTime: number) => void;
  onDurationCapture?: (totalDuration: number) => void;
  onWorkoutSave?: (workoutData: CardioWorkoutData) => void;
}

interface LapRecord {
  lapNumber: number;
  lapTime: number;
  totalTime: number;
}

const CardioTimer: React.FC<CardioTimerProps> = ({
  isRunning,
  onStart,
  onPause,
  onStop,
  onLapCapture,
  onDurationCapture,
  onWorkoutSave,
}) => {
  const [totalTime, setTotalTime] = useState<number>(0);
  const [currentLapTime, setCurrentLapTime] = useState<number>(0);
  const [laps, setLaps] = useState<LapRecord[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [lastLapTime, setLastLapTime] = useState<number>(0);
  const [showWorkoutModal, setShowWorkoutModal] = useState<boolean>(false);
  const [completedWorkoutData, setCompletedWorkoutData] = useState<{
    duration: number;
    lapCount: number;
  } | null>(null);

  // Main timer logic
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    if (isRunning && startTime) {
      timer = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setTotalTime(elapsed);
        setCurrentLapTime(elapsed - lastLapTime);
      }, 100); // Update every 100ms for smooth display
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, startTime, lastLapTime]);

  const handleStart = () => {
    if (!startTime) {
      setStartTime(Date.now() - totalTime * 1000); // Resume from where we left off
    }
    onStart();
  };

  const handlePause = () => {
    onPause();
  };

  const handleStop = () => {
    // Capture final workout data before resetting
    if (totalTime > 0) {
      const workoutData = {
        duration: totalTime,
        lapCount: laps.length,
      };

      setCompletedWorkoutData(workoutData);
      setShowWorkoutModal(true);

      // Capture duration for parent if provided
      if (onDurationCapture) {
        onDurationCapture(totalTime);
      }
    }

    // Reset everything
    setTotalTime(0);
    setCurrentLapTime(0);
    setLaps([]);
    setStartTime(null);
    setLastLapTime(0);
    onStop();
  };

  const handleLap = () => {
    if (isRunning && totalTime > 0) {
      const lapRecord: LapRecord = {
        lapNumber: laps.length + 1,
        lapTime: currentLapTime,
        totalTime: totalTime,
      };

      setLaps(prev => [...prev, lapRecord]);
      setLastLapTime(totalTime);
      setCurrentLapTime(0);

      // Notify parent of lap time
      if (onLapCapture) {
        onLapCapture(currentLapTime);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleWorkoutSave = (workoutData: CardioWorkoutData) => {
    if (onWorkoutSave) {
      onWorkoutSave(workoutData);
    }
    setShowWorkoutModal(false);
    setCompletedWorkoutData(null);
  };

  const handleModalClose = () => {
    setShowWorkoutModal(false);
    setCompletedWorkoutData(null);
  };

  return (
    <div className={styles.timerContainer}>
      <div className={styles.timerDisplay}>
        <div className={styles.mainTime}>
          <div className={styles.timeLabel}>Total Time</div>
          <div className={styles.timeValue}>{formatTime(totalTime)}</div>
        </div>

        {isRunning && (
          <div className={styles.lapTime}>
            <div className={styles.timeLabel}>Current Lap</div>
            <div className={styles.timeValue}>{formatTime(currentLapTime)}</div>
          </div>
        )}
      </div>

      <div className={styles.timerControls}>
        {!isRunning ? (
          <button
            onClick={handleStart}
            className={`${styles.timerButton} ${styles.startButton}`}
            title="Start workout"
          >
            <PlayArrowIcon />
            <span>Start</span>
          </button>
        ) : (
          <button
            onClick={handlePause}
            className={`${styles.timerButton} ${styles.pauseButton}`}
            title="Pause workout"
          >
            <PauseIcon />
            <span>Pause</span>
          </button>
        )}

        {totalTime > 0 && (
          <>
            <button
              onClick={handleLap}
              disabled={!isRunning}
              className={`${styles.timerButton} ${styles.lapButton}`}
              title="Record lap"
            >
              <FlagIcon />
              <span>Lap</span>
            </button>

            <button
              onClick={handleStop}
              className={`${styles.timerButton} ${styles.stopButton}`}
              title="Stop and finish workout"
            >
              <StopIcon />
              <span>Finish</span>
            </button>
          </>
        )}
      </div>

      {laps.length > 0 && (
        <div className={styles.lapHistory}>
          <h4>Lap Times</h4>
          <div className={styles.lapList}>
            {laps.slice(-5).map(lap => (
              <div key={lap.lapNumber} className={styles.lapEntry}>
                <span className={styles.lapNumber}>Lap {lap.lapNumber}</span>
                <span className={styles.lapTime}>
                  {formatTime(lap.lapTime)}
                </span>
                <span className={styles.totalTime}>
                  {formatTime(lap.totalTime)}
                </span>
              </div>
            ))}
            {laps.length > 5 && (
              <div className={styles.lapSummary}>
                ... and {laps.length - 5} more laps
              </div>
            )}
          </div>
        </div>
      )}

      <CardioWorkoutModal
        isOpen={showWorkoutModal}
        onClose={handleModalClose}
        duration={completedWorkoutData?.duration || 0}
        lapCount={completedWorkoutData?.lapCount || 0}
        onSave={handleWorkoutSave}
      />
    </div>
  );
};

export default CardioTimer;
