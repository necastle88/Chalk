import React from "react";
import { useNotifications } from "../../contexts/NotificationContext";
import styles from "./notification-demo.module.css";

const NotificationDemo: React.FC = () => {
  const {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showAchievement,
    showWorkoutReminder,
    addNotification,
  } = useNotifications();

  const handleSuccess = () => {
    showSuccess(
      "Workout Completed!",
      "Great job! You've completed your strength training session.",
      {
        duration: 5000,
        actions: [
          {
            label: "View Stats",
            action: () => console.log("Navigate to stats"),
            style: "primary",
          },
        ],
      }
    );
  };

  const handleError = () => {
    showError(
      "Sync Failed",
      "Unable to sync your workout data. Please check your internet connection.",
      {
        actions: [
          {
            label: "Retry",
            action: () => console.log("Retry sync"),
            style: "primary",
          },
          {
            label: "Dismiss",
            action: () => console.log("Dismissed"),
            style: "secondary",
          },
        ],
      }
    );
  };

  const handleWarning = () => {
    showWarning(
      "Rest Day Recommended",
      "You've worked out 6 days in a row. Consider taking a rest day.",
      {
        duration: 7000,
      }
    );
  };

  const handleInfo = () => {
    showInfo(
      "New Feature Available",
      "Try our new AI-powered workout suggestions in the exercise logger."
    );
  };

  const handleAchievement = () => {
    showAchievement(
      "Milestone Reached!",
      "🎉 You've logged 50 workouts! Keep up the great work!",
      {
        duration: 8000,
        actions: [
          {
            label: "Share Achievement",
            action: () => console.log("Share achievement"),
            style: "primary",
          },
        ],
      }
    );
  };

  const handleWorkoutReminder = () => {
    showWorkoutReminder(
      "Time for Your Workout!",
      "Your scheduled push day workout starts in 15 minutes.",
      {
        actions: [
          {
            label: "Start Now",
            action: () => console.log("Start workout"),
            style: "primary",
          },
          {
            label: "Snooze 10min",
            action: () => console.log("Snooze"),
            style: "secondary",
          },
        ],
      }
    );
  };

  const handleProgressUpdate = () => {
    addNotification({
      type: "progress-update",
      priority: "medium",
      title: "Weekly Progress",
      message:
        "You're 20% stronger than last month! Your bench press increased by 15 lbs.",
      duration: 6000,
      category: "progress",
    });
  };

  const handleUrgentNotification = () => {
    addNotification({
      type: "warning",
      priority: "urgent",
      title: "Form Alert!",
      message:
        "Poor form detected on your last set. Consider reducing weight to maintain proper technique.",
      persistent: true,
      actions: [
        {
          label: "Got it",
          action: () => console.log("Acknowledged"),
          style: "primary",
        },
        {
          label: "Learn More",
          action: () => console.log("Learn about form"),
          style: "secondary",
        },
      ],
    });
  };

  return (
    <div className={styles.demo}>
      <h2>Notification System Demo</h2>
      <p>Click the buttons below to see different types of notifications:</p>

      <div className={styles.buttonGrid}>
        <button className={styles.successBtn} onClick={handleSuccess}>
          Success Notification
        </button>

        <button className={styles.errorBtn} onClick={handleError}>
          Error Notification
        </button>

        <button className={styles.warningBtn} onClick={handleWarning}>
          Warning Notification
        </button>

        <button className={styles.infoBtn} onClick={handleInfo}>
          Info Notification
        </button>

        <button className={styles.achievementBtn} onClick={handleAchievement}>
          Achievement Notification
        </button>

        <button className={styles.reminderBtn} onClick={handleWorkoutReminder}>
          Workout Reminder
        </button>

        <button className={styles.progressBtn} onClick={handleProgressUpdate}>
          Progress Update
        </button>

        <button className={styles.urgentBtn} onClick={handleUrgentNotification}>
          Urgent Alert
        </button>
      </div>

      <div className={styles.info}>
        <h3>Features Demonstrated:</h3>
        <ul>
          <li>🎨 Multiple notification types with distinct styling</li>
          <li>
            ⚡ Priority levels (urgent notifications pulse and stay longer)
          </li>
          <li>🔔 Auto-dismiss with customizable durations</li>
          <li>📱 Responsive design for mobile devices</li>
          <li>
            ♿ Accessibility features (screen reader support, keyboard
            navigation)
          </li>
          <li>🎯 Action buttons for interactive notifications</li>
          <li>📊 Notification center with filtering and grouping</li>
          <li>⚙️ User settings for customization</li>
          <li>🌙 Quiet hours support</li>
          <li>📈 Progress tracking and achievement notifications</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationDemo;
