// Test script to verify workout stats calculations
const testData = [
  // Strength entries
  {
    id: "1",
    exerciseName: "Bench Press",
    category: "CHEST",
    sets: 3,
    reps: 8,
    weight: 135,
    unit: "lbs",
    duration: 30,
    date: "2025-08-01T10:00:00Z",
  },
  {
    id: "2",
    exerciseName: "Bench Press",
    category: "CHEST",
    sets: 3,
    reps: 6,
    weight: 155,
    unit: "lbs",
    duration: 35,
    date: "2025-08-02T10:00:00Z",
  },
  {
    id: "3",
    exerciseName: "Squat",
    category: "LEGS",
    sets: 4,
    reps: 5,
    weight: 185,
    unit: "lbs",
    duration: 40,
    date: "2025-08-01T11:00:00Z",
  },
  // Cardio entries
  {
    id: "4",
    exerciseName: "Running",
    category: "cardio",
    duration: 45,
    date: "2025-08-03T09:00:00Z",
  },
  {
    id: "5",
    exerciseName: "Running",
    category: "cardio",
    duration: 60,
    date: "2025-08-04T09:00:00Z",
  },
  {
    id: "6",
    exerciseName: "Cycling",
    category: "cardio",
    duration: 30,
    date: "2025-08-05T09:00:00Z",
  },
];

function isCardioExercise(category) {
  return category.toLowerCase() === "cardio";
}

function calculatePersonalRecords(entries) {
  const strengthEntries = entries.filter(
    (entry) => !isCardioExercise(entry.category)
  );
  const cardioEntries = entries.filter((entry) =>
    isCardioExercise(entry.category)
  );

  console.log("Strength entries:", strengthEntries.length);
  console.log("Cardio entries:", cardioEntries.length);

  // Group strength entries by muscle group and find PRs
  const strengthPRs = {};

  strengthEntries.forEach((entry) => {
    const category = entry.category;
    if (!strengthPRs[category]) {
      strengthPRs[category] = [];
    }

    // Calculate one-rep max using Epley formula: weight * (1 + reps/30)
    const oneRepMax = entry.weight * (1 + entry.reps / 30);

    const existingPR = strengthPRs[category].find(
      (pr) => pr.exerciseName === entry.exerciseName
    );

    if (!existingPR || oneRepMax > existingPR.oneRepMax) {
      if (existingPR) {
        const index = strengthPRs[category].indexOf(existingPR);
        strengthPRs[category][index] = {
          ...entry,
          oneRepMax,
        };
      } else {
        strengthPRs[category].push({
          ...entry,
          oneRepMax,
        });
      }
    }
  });

  // Calculate cardio PRs
  const cardioPRs = [];
  const cardioExerciseMap = new Map();

  cardioEntries.forEach((entry) => {
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
    entries.map((entry) => entry.date.split("T")[0])
  ).size;
  const totalWorkoutTime = entries.reduce(
    (sum, entry) => sum + (entry.duration || 0),
    0
  );
  const strengthWorkouts = new Set(
    strengthEntries.map((entry) => entry.date.split("T")[0])
  ).size;
  const cardioWorkouts = new Set(
    cardioEntries.map((entry) => entry.date.split("T")[0])
  ).size;

  // Calculate streaks
  const workoutDates = Array.from(
    new Set(entries.map((entry) => entry.date.split("T")[0]))
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
}

// Test the calculations
console.log("=== Testing Workout Stats Calculations ===\n");

const results = calculatePersonalRecords(testData);

console.log(
  "Workout Dates:",
  testData.map((entry) => entry.date.split("T")[0])
);
console.log(
  "Unique Workout Dates:",
  Array.from(new Set(testData.map((entry) => entry.date.split("T")[0])))
);

console.log("\n=== RESULTS ===");
console.log("Total Workouts:", results.totalWorkouts);
console.log("Total Workout Time:", results.totalWorkoutTime, "minutes");
console.log("Strength Workouts:", results.strengthWorkouts);
console.log("Cardio Workouts:", results.cardioWorkouts);
console.log("Current Streak:", results.currentStreak);
console.log("Longest Streak:", results.longestStreak);

console.log("\n=== STRENGTH PRs ===");
Object.entries(results.strengthPRs).forEach(([category, prs]) => {
  console.log(`${category}:`);
  prs.forEach((pr) => {
    console.log(
      `  ${pr.exerciseName}: ${pr.weight}${pr.unit} x ${pr.reps} (1RM: ${Math.round(pr.oneRepMax)}${pr.unit})`
    );
  });
});

console.log("\n=== CARDIO PRs ===");
results.cardioPRs.forEach((pr) => {
  console.log(`${pr.exerciseName}: ${pr.longestDuration} minutes`);
});

// Expected results:
console.log("\n=== EXPECTED vs ACTUAL ===");
console.log("Expected Total Workouts: 5 (Aug 1, 2, 3, 4, 5)");
console.log("Actual Total Workouts:", results.totalWorkouts);

console.log("Expected Strength Workouts: 2 (Aug 1, 2)");
console.log("Actual Strength Workouts:", results.strengthWorkouts);

console.log("Expected Cardio Workouts: 3 (Aug 3, 4, 5)");
console.log("Actual Cardio Workouts:", results.cardioWorkouts);

console.log("Expected Total Time: 200 minutes (30+35+40+45+60+30)");
console.log("Actual Total Time:", results.totalWorkoutTime);

console.log("Expected Longest Streak: 5 (consecutive days)");
console.log("Actual Longest Streak:", results.longestStreak);
