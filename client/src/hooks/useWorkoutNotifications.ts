import { useCallback } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

interface WorkoutMilestone {
  type: 'streak' | 'weight' | 'volume' | 'frequency' | 'time';
  value: number;
  exercise?: string;
  message: string;
}

export const useWorkoutNotifications = () => {
  const { showSuccess, showAchievement, showInfo, showWarning, addNotification } = useNotifications();

  const celebrateWorkoutCompletion = useCallback((workoutData: {
    exerciseName?: string;
    sets: number;
    reps: number;
    weight: number;
    duration?: number;
    category?: string;
  }) => {
    const { exerciseName = "Exercise", sets, reps, weight, category } = workoutData;

    // Check for personal records and milestones
    const isHeavyWeight = weight >= 100;
    const isHighVolume = sets * reps >= 50;
    const isPowerlifting = ["bench press", "squat", "deadlift", "overhead press"].some(
      exercise => exerciseName.toLowerCase().includes(exercise)
    );

    // Achievement notifications for milestones
    if (isPowerlifting && weight >= 225) {
      showAchievement(
        "Powerlifting Milestone! 🏋️‍♂️",
        `Crushing ${weight} lbs on ${exerciseName}! You're getting seriously strong!`,
        {
          actions: [
            { label: "Share PR", action: () => console.log("Share PR"), style: "primary" },
            { label: "View Progress", action: () => console.log("View progress"), style: "secondary" }
          ]
        }
      );
    } else if (isHeavyWeight && weight >= 135) {
      showAchievement(
        "New Weight Milestone! 💪",
        `${weight} lbs on ${exerciseName}! Your strength is really showing!`,
        { duration: 6000 }
      );
    } else if (isHighVolume) {
      showAchievement(
        "Volume Champion! 🔥",
        `${sets * reps} total reps on ${exerciseName}! That's some serious work!`,
        { duration: 5000 }
      );
    } else {
      // Standard completion notification
      showSuccess(
        "Exercise Logged! ✅",
        `${exerciseName} • ${sets} sets × ${reps} reps${weight > 0 ? ` @ ${weight} lbs` : ''}`,
        {
          duration: 4000,
          actions: [
            { label: "View History", action: () => console.log("View history"), style: "secondary" }
          ]
        }
      );
    }

    // Contextual suggestions based on exercise type
    setTimeout(() => {
      if (category && ["strength", "powerlifting", "bodybuilding"].includes(category.toLowerCase())) {
        showInfo(
          "Recovery Tip 💡",
          "Rest 2-3 minutes between sets for strength training to maximize your next set!",
          { duration: 5000 }
        );
      } else if (category === "cardio") {
        showInfo(
          "Cardio Tip 🏃‍♀️",
          "Great cardio session! Remember to hydrate and stretch to aid recovery.",
          { duration: 4000 }
        );
      }
    }, 2000);
  }, [showSuccess, showAchievement, showInfo]);

  const celebrateStreak = useCallback((streakDays: number) => {
    if (streakDays === 3) {
      showAchievement(
        "3-Day Streak! 🔥",
        "You're building momentum! Consistency is the key to success!",
        { duration: 5000 }
      );
    } else if (streakDays === 7) {
      showAchievement(
        "Week Warrior! 🏆",
        "7 days straight! You're officially on fire! Keep it up!",
        {
          actions: [
            { label: "Share Achievement", action: () => console.log("Share streak"), style: "primary" }
          ]
        }
      );
    } else if (streakDays === 30) {
      showAchievement(
        "Month Dominator! 👑",
        "30 DAYS! You're a fitness legend! This is what champions are made of!",
        {
          persistent: true,
          actions: [
            { label: "Celebrate!", action: () => console.log("Celebrate"), style: "primary" },
            { label: "Set New Goal", action: () => console.log("New goal"), style: "secondary" }
          ]
        }
      );
    } else if (streakDays % 10 === 0 && streakDays > 30) {
      showAchievement(
        `${streakDays}-Day Legend! 🌟`,
        "You're in elite territory now! Your dedication is truly inspiring!",
        { duration: 8000 }
      );
    }
  }, [showAchievement]);

  const workoutReminder = useCallback((reminderType: 'scheduled' | 'rest_day' | 'hydration') => {
    switch (reminderType) {
      case 'scheduled':
        addNotification({
          type: 'workout-reminder',
          priority: 'medium',
          title: "Workout Time! 🏋️‍♀️",
          message: "Your scheduled workout starts in 30 minutes. Ready to crush it?",
          actionable: true,
          actions: [
            { label: "Start Early", action: () => console.log("Start early"), style: "primary" },
            { label: "Snooze 15min", action: () => console.log("Snooze"), style: "secondary" }
          ]
        });
        break;
      case 'rest_day':
        showInfo(
          "Rest Day Reminder 😌",
          "You've been crushing it! Today might be perfect for some light stretching or a walk.",
          {
            duration: 6000,
            actions: [
              { label: "Log Stretching", action: () => console.log("Log stretching"), style: "secondary" }
            ]
          }
        );
        break;
      case 'hydration':
        showInfo(
          "Hydration Check! 💧",
          "Don't forget to drink water throughout your workout. Stay hydrated!",
          { duration: 4000 }
        );
        break;
    }
  }, [addNotification, showInfo]);

  const progressUpdate = useCallback((progressData: {
    metric: string;
    improvement: number;
    timeframe: string;
  }) => {
    const { metric, improvement, timeframe } = progressData;
    
    addNotification({
      type: 'progress-update',
      priority: 'medium',
      title: "Progress Update! 📈",
      message: `Your ${metric} has improved by ${improvement > 0 ? '+' : ''}${improvement}% over the ${timeframe}!`,
      duration: 6000,
      actions: [
        { label: "View Details", action: () => console.log("View progress"), style: "primary" }
      ]
    });
  }, [addNotification]);

  const safetyAlert = useCallback((alertType: 'form_check' | 'rest_needed' | 'overtraining') => {
    switch (alertType) {
      case 'form_check':
        showWarning(
          "Form Check Reminder ⚠️",
          "Remember to focus on proper form over heavy weight. Quality over quantity!",
          { duration: 5000 }
        );
        break;
      case 'rest_needed':
        showWarning(
          "Recovery Alert 😴",
          "You've been going hard! Consider taking a rest day to prevent overtraining.",
          {
            actions: [
              { label: "Schedule Rest", action: () => console.log("Schedule rest"), style: "primary" }
            ]
          }
        );
        break;
      case 'overtraining':
        addNotification({
          type: 'warning',
          priority: 'high',
          title: "Overtraining Risk! ⚠️",
          message: "You've worked out 8+ days in a row. Your body needs recovery time.",
          persistent: true,
          actions: [
            { label: "Plan Rest Day", action: () => console.log("Plan rest"), style: "danger" },
            { label: "Reduce Intensity", action: () => console.log("Reduce intensity"), style: "secondary" }
          ]
        });
        break;
    }
  }, [showWarning, addNotification]);

  return {
    celebrateWorkoutCompletion,
    celebrateStreak,
    workoutReminder,
    progressUpdate,
    safetyAlert
  };
};
