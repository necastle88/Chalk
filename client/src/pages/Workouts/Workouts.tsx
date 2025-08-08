import { useState, useCallback } from "react";
import WorkoutLogger from "../../components/WorkoutLogger/WorkoutLogger";
import WorkoutHistory from "../../components/WorkoutHistory/WorkoutHistory";
import WorkoutJournal from "../../components/WorkoutJournal/WorkoutJournal";
import styles from "./workouts.module.css";

const Workouts = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
      </div>

      <div className={styles.workoutsGrid}>
        <div className={styles.loggerSection}>
          <WorkoutLogger onWorkoutLogged={handleWorkoutLogged} />
        </div>

        <div className={styles.historySection}>
          <WorkoutHistory
            limit={10}
            showFilters={true}
            showTitle={true}
            refreshTrigger={refreshTrigger}
          />
        </div>

        <div className={styles.journalSection}>
          <WorkoutJournal
            limit={15}
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
