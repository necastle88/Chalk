import React, { useState } from "react";
import {
  useNotifications,
  type Notification,
} from "../../contexts/NotificationContext";
import NotificationItem from "./NotificationItem";
import CheckIcon from "@mui/icons-material/Check";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import SettingsIcon from "@mui/icons-material/Settings";
import FilterListIcon from "@mui/icons-material/FilterList";
import styles from "./notification-center.module.css";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
}) => {
  const { state, markAllAsRead, clearAll } = useNotifications();
  const [filter, setFilter] = useState<"all" | "unread" | "today">("all");
  const [showSettings, setShowSettings] = useState(false);

  const getFilteredNotifications = () => {
    let filtered = [...state.notifications];

    switch (filter) {
      case "unread":
        filtered = filtered.filter(n => !n.read);
        break;
      case "today":
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filtered = filtered.filter(n => n.timestamp >= today);
        break;
    }

    return filtered.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  };

  const groupNotificationsByDate = (notifications: Notification[]) => {
    const groups: { [key: string]: Notification[] } = {};

    notifications.forEach(notification => {
      const date = notification.timestamp.toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
    });

    return groups;
  };

  const formatDateGroup = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const groupedNotifications = groupNotificationsByDate(filteredNotifications);

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.notificationCenter}>
        <div className={styles.header}>
          <h2 className={styles.title}>Notifications</h2>
          <div className={styles.headerActions}>
            <button
              className={styles.headerButton}
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
            >
              <SettingsIcon />
            </button>
            <button
              className={styles.headerButton}
              onClick={markAllAsRead}
              title="Mark all as read"
              disabled={state.unreadCount === 0}
            >
              <CheckIcon />
            </button>
            <button
              className={styles.headerButton}
              onClick={clearAll}
              title="Clear all"
              disabled={state.notifications.length === 0}
            >
              <ClearAllIcon />
            </button>
          </div>
        </div>

        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${filter === "all" ? styles.active : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({state.notifications.length})
          </button>
          <button
            className={`${styles.filterButton} ${filter === "unread" ? styles.active : ""}`}
            onClick={() => setFilter("unread")}
          >
            Unread ({state.unreadCount})
          </button>
          <button
            className={`${styles.filterButton} ${filter === "today" ? styles.active : ""}`}
            onClick={() => setFilter("today")}
          >
            Today
          </button>
        </div>

        <div className={styles.content}>
          {filteredNotifications.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔔</div>
              <p className={styles.emptyTitle}>No notifications</p>
              <p className={styles.emptyMessage}>
                {filter === "unread"
                  ? "You're all caught up!"
                  : "You'll see your notifications here"}
              </p>
            </div>
          ) : (
            <div className={styles.notificationGroups}>
              {Object.entries(groupedNotifications).map(
                ([dateString, notifications]) => (
                  <div key={dateString} className={styles.notificationGroup}>
                    <h3 className={styles.dateHeader}>
                      {formatDateGroup(dateString)}
                    </h3>
                    <div className={styles.notifications}>
                      {notifications.map(notification => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                        />
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {showSettings && (
          <div className={styles.settingsPanel}>
            <h3>Notification Settings</h3>
            <div className={styles.settingItem}>
              <label>
                <input
                  type="checkbox"
                  checked={state.settings.showToasts}
                  onChange={e =>
                    // This would be implemented with the settings update
                    console.log("Toggle toasts:", e.target.checked)
                  }
                />
                Show toast notifications
              </label>
            </div>
            <div className={styles.settingItem}>
              <label>
                <input
                  type="checkbox"
                  checked={state.settings.soundEnabled}
                  onChange={e => console.log("Toggle sound:", e.target.checked)}
                />
                Sound notifications
              </label>
            </div>
            <div className={styles.settingItem}>
              <label>
                <input
                  type="checkbox"
                  checked={state.settings.showWorkoutReminders}
                  onChange={e =>
                    console.log("Toggle workout reminders:", e.target.checked)
                  }
                />
                Workout reminders
              </label>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationCenter;
