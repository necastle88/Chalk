import { useState, useCallback } from "react";
import WorkoutJournal from "../../components/WorkoutJournal/WorkoutJournal";
import styles from "./journal.module.css";

const Journal = () => {
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

      <div className={styles.journalSection}>
        <WorkoutJournal
          limit={15}
          showFilters={true}
          showTitle={true}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </div>
  );
};

export default Journal;
