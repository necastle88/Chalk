import React from "react";
import {
  useNotifications,
  type Notification,
} from "../../contexts/NotificationContext";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import DeleteIcon from "@mui/icons-material/Delete";
import styles from "./notification-item.module.css";

interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
}) => {
  const { markAsRead, removeNotification } = useNotifications();

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircleIcon className={styles.icon} />;
      case "error":
        return <ErrorIcon className={styles.icon} />;
      case "warning":
        return <WarningIcon className={styles.icon} />;
      case "info":
        return <InfoIcon className={styles.icon} />;
      case "achievement":
        return <EmojiEventsIcon className={styles.icon} />;
      case "workout-reminder":
        return <FitnessCenterIcon className={styles.icon} />;
      case "progress-update":
        return <TrendingUpIcon className={styles.icon} />;
      default:
        return <InfoIcon className={styles.icon} />;
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return timestamp.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeNotification(notification.id);
  };

  return (
    <div
      className={`${styles.notificationItem} ${styles[notification.type]} ${!notification.read ? styles.unread : ""}`}
      onClick={handleClick}
    >
      <div className={styles.iconContainer}>
        {getIcon()}
        {!notification.read && <div className={styles.unreadDot} />}
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h4 className={styles.title}>{notification.title}</h4>
          <span className={styles.timestamp}>
            {formatTime(notification.timestamp)}
          </span>
        </div>
        <p className={styles.message}>{notification.message}</p>

        {notification.actions && notification.actions.length > 0 && (
          <div className={styles.actions}>
            {notification.actions.map((action, index) => (
              <button
                key={index}
                className={`${styles.actionButton} ${styles[action.style || "primary"]}`}
                onClick={e => {
                  e.stopPropagation();
                  action.action();
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        className={styles.deleteButton}
        onClick={handleDelete}
        title="Remove notification"
      >
        <DeleteIcon />
      </button>
    </div>
  );
};

export default NotificationItem;
