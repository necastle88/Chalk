import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import type {
  StrengthEntry,
  CardioEntry,
  PersonalRecords,
} from "../../components/WorkoutJournal/types";
import { isCardioExercise } from "../../components/WorkoutJournal/utils";
import { workoutApi } from "../../services/workoutApi";
import { convertWorkoutLogToJournalEntry } from "../../components/WorkoutJournal/utils";
import styles from "./progress.module.css";

const Progress: React.FC = () => {
  const { getToken } = useAuth();
  const [entries, setEntries] = useState<(StrengthEntry | CardioEntry)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkoutData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = await getToken();
        if (!token) {
          setError("Please sign in to view your progress");
          setLoading(false);
          return;
        }

        console.log("Fetching workout data with token...");

        // Fetch workout data in batches if needed
        let allEntries: any[] = [];
        let offset = 0;
        const batchSize = 100; // Max allowed by server
        let hasMore = true;

        while (hasMore && allEntries.length < 500) {
          // Limit to 500 total records to avoid infinite loop
          const response = await workoutApi.getWorkoutLogs(
            {
              limit: batchSize,
              offset: offset,
            },
            token
          );

          console.log(
            `API Response batch ${offset / batchSize + 1}:`,
            response
          );

          if (response && response.data && response.data.length > 0) {
            allEntries = [...allEntries, ...response.data];
            hasMore = response.data.length === batchSize; // If we got less than batchSize, we're done
            offset += batchSize;
          } else {
            hasMore = false;
          }
        }

        console.log("Total entries fetched:", allEntries.length);

        if (allEntries.length > 0) {
          const journalEntries = allEntries.map(
            convertWorkoutLogToJournalEntry
          );
          setEntries(journalEntries);
          console.log("Loaded workout entries:", journalEntries.length);
        } else {
          console.log("No workout data found");
          setEntries([]);
        }
      } catch (err: any) {
        console.error("Detailed error:", err);

        let errorMessage = "Failed to load workout data";

        if (err.code === "ERR_NETWORK") {
          errorMessage = "Network Error - Unable to connect to server";
        } else if (err.response) {
          errorMessage =
            err.response.data?.message ||
            `Server Error: ${err.response.status}`;
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutData();
  }, [getToken]);

  // Calculate personal records from entries
  const calculatePersonalRecords = (): PersonalRecords => {
    const strengthEntries = entries.filter(
      entry => !isCardioExercise(entry.category)
    ) as StrengthEntry[];
    const cardioEntries = entries.filter(entry =>
      isCardioExercise(entry.category)
    ) as CardioEntry[];

    // Group strength entries by muscle group and find PRs
    const strengthPRs: Record<string, any[]> = {};

    strengthEntries.forEach(entry => {
      const category = entry.category;
      if (!strengthPRs[category]) {
        strengthPRs[category] = [];
      }

      // Calculate one-rep max using Epley formula: weight * (1 + reps/30)
      const oneRepMax = entry.weight * (1 + entry.reps / 30);

      const existingPR = strengthPRs[category].find(
        pr => pr.exerciseName === entry.exerciseName
      );

      if (!existingPR || oneRepMax > existingPR.oneRepMax) {
        if (existingPR) {
          const index = strengthPRs[category].indexOf(existingPR);
          strengthPRs[category][index] = {
            category: entry.category,
            exerciseName: entry.exerciseName,
            weight: entry.weight,
            unit: entry.unit,
            reps: entry.reps,
            sets: entry.sets,
            date: entry.date,
            oneRepMax,
          };
        } else {
          strengthPRs[category].push({
            category: entry.category,
            exerciseName: entry.exerciseName,
            weight: entry.weight,
            unit: entry.unit,
            reps: entry.reps,
            sets: entry.sets,
            date: entry.date,
            oneRepMax,
          });
        }
      }
    });

    // Calculate cardio PRs
    const cardioPRs: any[] = [];
    const cardioExerciseMap = new Map();

    cardioEntries.forEach(entry => {
      const existing = cardioExerciseMap.get(entry.exerciseName);

      if (!existing) {
        cardioExerciseMap.set(entry.exerciseName, {
          exerciseName: entry.exerciseName,
          longestDuration: entry.duration,
          date: entry.date,
          category: entry.category,
        });
      } else if (entry.duration > existing.longestDuration) {
        cardioExerciseMap.set(entry.exerciseName, {
          exerciseName: entry.exerciseName,
          longestDuration: entry.duration,
          date: entry.date,
          category: entry.category,
        });
      }
    });

    cardioPRs.push(...cardioExerciseMap.values());

    // Calculate workout statistics
    const totalWorkouts = new Set(
      entries.map(entry => entry.date.split("T")[0])
    ).size;
    const totalWorkoutTime = entries.reduce(
      (sum, entry) => sum + (entry.duration || 0),
      0
    );
    const strengthWorkouts = new Set(
      strengthEntries.map(entry => entry.date.split("T")[0])
    ).size;
    const cardioWorkouts = new Set(
      cardioEntries.map(entry => entry.date.split("T")[0])
    ).size;

    // Calculate streaks (simplified - consecutive days with workouts)
    const workoutDates = Array.from(
      new Set(entries.map(entry => entry.date.split("T")[0]))
    ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < workoutDates.length; i++) {
      const prevDate = new Date(workoutDates[i - 1]);
      const currDate = new Date(workoutDates[i]);
      const diffDays =
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate current streak from most recent date
    if (workoutDates.length > 0) {
      const today = new Date();
      const lastWorkout = new Date(workoutDates[workoutDates.length - 1]);
      const daysSinceLastWorkout =
        (today.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceLastWorkout <= 1) {
        currentStreak = tempStreak;
      }
    }

    return {
      strengthPRs,
      cardioPRs,
      totalWorkouts,
      totalWorkoutTime,
      strengthWorkouts,
      cardioWorkouts,
      currentStreak,
      longestStreak,
    };
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Progress & Personal Records</h2>
        <div className={styles.loading}>Loading your progress data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Progress & Personal Records</h2>
        <div className={styles.error}>
          <p>{error}</p>
          <p
            style={{ fontSize: "0.875rem", marginTop: "0.5rem", opacity: 0.8 }}
          >
            Make sure you're signed in and have logged some workouts.
          </p>
        </div>
      </div>
    );
  }

  const personalRecords = calculatePersonalRecords();

  if (entries.length === 0) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Progress & Personal Records</h2>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📈</div>
          <h3>No progress data yet</h3>
          <p>
            Start logging your workouts to track your progress and personal
            records!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Progress & Personal Records</h2>

      {/* Workout Statistics Charts */}
      <div className={styles.statsSection}>
        <h3 className={styles.sectionTitle}>Workout Overview</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🏋️</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>
                {personalRecords.totalWorkouts}
              </div>
              <div className={styles.statLabel}>Total Workouts</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⏱️</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>
                {Math.round(personalRecords.totalWorkoutTime / 60)}h
              </div>
              <div className={styles.statLabel}>Total Time</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🔥</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>
                {personalRecords.currentStreak}
              </div>
              <div className={styles.statLabel}>Current Streak</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🏆</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>
                {personalRecords.longestStreak}
              </div>
              <div className={styles.statLabel}>Longest Streak</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>💪</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>
                {personalRecords.strengthWorkouts}
              </div>
              <div className={styles.statLabel}>Strength Sessions</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🏃</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>
                {personalRecords.cardioWorkouts}
              </div>
              <div className={styles.statLabel}>Cardio Sessions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Strength Personal Records */}
      {Object.keys(personalRecords.strengthPRs).length > 0 && (
        <div className={styles.prSection}>
          <h3 className={styles.sectionTitle}>💪 Strength Personal Records</h3>
          <div className={styles.muscleGroups}>
            {Object.entries(personalRecords.strengthPRs).map(
              ([muscleGroup, prs]) => (
                <div key={muscleGroup} className={styles.muscleGroupCard}>
                  <h4 className={styles.muscleGroupTitle}>
                    {muscleGroup.charAt(0) + muscleGroup.slice(1).toLowerCase()}
                  </h4>
                  <div className={styles.prList}>
                    {prs.map((pr, index) => (
                      <div key={index} className={styles.prItem}>
                        <div className={styles.prHeader}>
                          <div className={styles.prExercise}>
                            {pr.exerciseName}
                          </div>
                          <div className={styles.prDate}>
                            {new Date(pr.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className={styles.prDetails}>
                          <div className={styles.prStat}>
                            <span className={styles.prLabel}>Weight:</span>
                            <span className={styles.prValue}>
                              {pr.weight} {pr.unit}
                            </span>
                          </div>
                          <div className={styles.prStat}>
                            <span className={styles.prLabel}>Reps:</span>
                            <span className={styles.prValue}>
                              {pr.sets} × {pr.reps}
                            </span>
                          </div>
                          <div className={styles.prStat}>
                            <span className={styles.prLabel}>1RM:</span>
                            <span className={styles.prValue}>
                              {Math.round(pr.oneRepMax || 0)} {pr.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Cardio Personal Records */}
      {personalRecords.cardioPRs.length > 0 && (
        <div className={styles.prSection}>
          <h3 className={styles.sectionTitle}>🏃 Cardio Personal Records</h3>
          <div className={styles.cardioGrid}>
            {personalRecords.cardioPRs.map((pr, index) => (
              <div key={index} className={styles.cardioPrCard}>
                <div className={styles.cardioHeader}>
                  <h4 className={styles.cardioExercise}>{pr.exerciseName}</h4>
                  <div className={styles.prDate}>
                    {new Date(pr.date).toLocaleDateString()}
                  </div>
                </div>
                <div className={styles.cardioPrDetails}>
                  <div className={styles.cardioPrStat}>
                    <span className={styles.cardioPrLabel}>
                      Longest Duration:
                    </span>
                    <span className={styles.cardioPrValue}>
                      {pr.longestDuration} min
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Progress;
