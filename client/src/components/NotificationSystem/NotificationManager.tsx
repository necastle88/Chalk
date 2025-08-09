import React from "react";
import { useNotifications } from "../../contexts/NotificationContext";
import ToastNotification from "./ToastNotification";
import styles from "./notification-manager.module.css";

const NotificationManager: React.FC = () => {
  const { state } = useNotifications();

  // Get notifications that should show as toasts
  const toastNotifications = state.notifications
    .filter(notification => {
      // Don't show toasts if disabled in settings
      if (!state.settings.showToasts) return false;

      // Only show recent unread notifications as toasts
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return !notification.read && notification.timestamp > fiveMinutesAgo;
    })
    .slice(0, state.settings.maxToastNotifications) // Limit number of simultaneous toasts
    .sort((a, b) => {
      // Sort by priority, then by timestamp
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

  return (
    <div className={styles.notificationManager}>
      {toastNotifications.map((notification, index) => (
        <ToastNotification
          key={notification.id}
          notification={notification}
          index={index}
        />
      ))}
    </div>
  );
};

export default NotificationManager;
