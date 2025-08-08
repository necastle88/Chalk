import { useState, useCallback } from "react";
import WorkoutLogger from "../../components/WorkoutLogger/WorkoutLogger";
import CardioLogger from "../../components/CardioLogger/CardioLogger";
import WorkoutHistory from "../../components/WorkoutHistory/WorkoutHistory";
import styles from "./workouts.module.css";

const Workouts = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<"strength" | "cardio">("strength");

  // Function to trigger refresh of history and journal
  const handleWorkoutLogged = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Workouts</h1>
        <p className={styles.subtitle}>
          Log workouts, track progress, and review your fitness journey
        </p>

        <div className={styles.tabControls}>
          <button
            className={`${styles.tabButton} ${activeTab === "strength" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("strength")}
          >
            💪 Strength Training
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "cardio" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("cardio")}
          >
            🏃‍♂️ Cardio Workout
          </button>
        </div>
      </div>

      <div className={styles.workoutsGrid}>
        <div className={styles.loggerSection}>
          {activeTab === "strength" ? (
            <WorkoutLogger onWorkoutLogged={handleWorkoutLogged} />
          ) : (
            <CardioLogger onWorkoutLogged={handleWorkoutLogged} />
          )}
        </div>

        <div className={styles.historySection}>
          <WorkoutHistory
            limit={10}
            showFilters={true}
            showTitle={true}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>
    </div>
  );
};

export default Workouts;
