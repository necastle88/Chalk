import { useState } from "react";
import Timer from "../../components/Timer/Timer";
import WorkoutHistory from "../../components/WorkoutHistory/WorkoutHistory";
import WorkoutJournal from "../../components/WorkoutJournal/WorkoutJournal";
import { NotificationDemo } from "../../components/NotificationSystem";
import styles from "./dashboard.module.css";

const Dashboard = () => {
  const [refreshTrigger] = useState(0); // Dashboard uses polling for updates

  const handleRestDurationCapture = (duration: number) => {
    // For dashboard use, show a simple log or notification
    console.log(`Rest duration captured on dashboard: ${duration} seconds`);
    // Could add toast notification here
  };

  const handleLapTimeCapture = (lapTime: number) => {
    // For dashboard use, show a simple log or notification
    console.log(`Lap time captured on dashboard: ${lapTime} seconds`);
    // Could add toast notification here
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h2>Welcome to Chalk</h2>
        <p>Your fitness tracking app</p>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.timerSection}>
          <Timer
            onRestDurationCapture={handleRestDurationCapture}
            onLapTimeCapture={handleLapTimeCapture}
          />
        </div>

        <div className={styles.workoutSection}>
          <WorkoutHistory
            limit={5}
            showFilters={false}
            showTitle={true}
            compact={true}
            refreshTrigger={refreshTrigger}
          />
        </div>

        <div className={styles.journalSection}>
          <WorkoutJournal
            limit={5}
            showFilters={false}
            showTitle={true}
            refreshTrigger={refreshTrigger}
          />
        </div>

        <div className={styles.demoSection}>
          <NotificationDemo />
        </div>
      </div>

      <div className={styles.quickActions}>
        <p>Track your workouts, nutrition, and progress.</p>
        <p>Get started by navigating through the app.</p>
      </div>
    </div>
  );
};

export default Dashboard;
