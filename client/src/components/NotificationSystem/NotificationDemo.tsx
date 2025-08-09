import React from "react";
import { useNotifications } from "../../contexts/NotificationContext";
import styles from "./notification-demo.module.css";

const NotificationDemo: React.FC = () => {
  const {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showAchievement,
    showWorkoutReminder,
    addNotification,
  } = useNotifications();

  const demoNotifications = [
    {
      title: "Test Success",
      action: () =>
        showSuccess(
          "Workout Completed!",
          "Great job on completing your morning workout session!"
        ),
      color: "var(--secondary-color)",
    },
    {
      title: "Test Error",
      action: () =>
        showError(
          "Connection Failed",
          "Unable to sync your workout data. Please check your internet connection."
        ),
      color: "var(--danger-color)",
    },
    {
      title: "Test Warning",
      action: () =>
        showWarning(
          "Rest Day Recommended",
          "You've worked out 6 days in a row. Consider taking a rest day."
        ),
      color: "var(--warning-color)",
    },
    {
      title: "Test Info",
      action: () =>
        showInfo(
          "New Feature Available",
          "Check out the new exercise tracking features in the workout logger!"
        ),
      color: "var(--primary-color)",
    },
    {
      title: "Test Achievement",
      action: () =>
        showAchievement(
          "Milestone Reached!",
          "🎉 You've completed 50 workouts! Keep up the excellent work!"
        ),
      color: "#ffd700",
    },
    {
      title: "Test Workout Reminder",
      action: () =>
        showWorkoutReminder(
          "Time to Work Out!",
          "Your scheduled leg day workout starts in 30 minutes.",
          {
            actions: [
              {
                label: "Start Now",
                action: () => console.log("Starting workout"),
                style: "primary",
              },
              {
                label: "Snooze 15min",
                action: () => console.log("Snoozed"),
                style: "secondary",
              },
            ],
          }
        ),
      color: "#ff6b6b",
    },
    {
      title: "Test Progress Update",
      action: () =>
        addNotification({
          type: "progress-update",
          priority: "medium",
          title: "Weekly Progress",
          message: "You've increased your bench press by 10lbs this week! 💪",
          duration: 6000,
        }),
      color: "#4ecdc4",
    },
    {
      title: "Test Urgent Notification",
      action: () =>
        addNotification({
          type: "error",
          priority: "urgent",
          title: "Account Security Alert",
          message:
            "Unusual login activity detected. Please verify your account.",
          persistent: true,
          actions: [
            {
              label: "Verify Now",
              action: () => console.log("Verifying"),
              style: "danger",
            },
            {
              label: "Ignore",
              action: () => console.log("Ignored"),
              style: "secondary",
            },
          ],
        }),
      color: "#ff4757",
    },
  ];

  return (
    <div className={styles.notificationDemo}>
      <h3>🔔 Notification System Demo</h3>
      <p className={styles.description}>
        Test different types of notifications to see how they look and behave.
        Click the bell icon in the header to view all notifications.
      </p>

      <div className={styles.buttonGrid}>
        {demoNotifications.map((demo, index) => (
          <button
            key={index}
            className={styles.demoButton}
            onClick={demo.action}
            style={{ borderLeft: `4px solid ${demo.color}` }}
          >
            {demo.title}
          </button>
        ))}
      </div>

      <div className={styles.features}>
        <h4>✨ Features Included:</h4>
        <ul>
          <li>
            🎯 <strong>Smart Priority System</strong> - Different urgency levels
            with appropriate styling
          </li>
          <li>
            ⏰ <strong>Auto-dismiss Timers</strong> - Notifications
            automatically disappear after set time
          </li>
          <li>
            🔕 <strong>Quiet Hours</strong> - Respects user's do-not-disturb
            preferences
          </li>
          <li>
            📱 <strong>Mobile Responsive</strong> - Optimized for all screen
            sizes
          </li>
          <li>
            ♿ <strong>Accessible</strong> - Screen reader friendly and keyboard
            navigable
          </li>
          <li>
            🎨 <strong>Contextual Design</strong> - Colors and icons match
            notification type
          </li>
          <li>
            👆 <strong>Interactive Actions</strong> - Buttons for quick
            responses
          </li>
          <li>
            📊 <strong>Notification Center</strong> - Central hub for viewing
            all notifications
          </li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationDemo;
