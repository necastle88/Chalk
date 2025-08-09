import React, { useEffect, useState } from "react";
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
import CloseIcon from "@mui/icons-material/Close";
import styles from "./toast-notification.module.css";

interface ToastNotificationProps {
  notification: Notification;
  index: number;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  notification,
  index,
}) => {
  const { removeNotification, markAsRead } = useNotifications();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Calculate auto-dismiss duration
  const getDuration = () => {
    if (notification.persistent) return null;
    if (notification.duration) return notification.duration;

    // Default durations based on priority
    switch (notification.priority) {
      case "urgent":
        return 10000;
      case "high":
        return 7000;
      case "medium":
        return 5000;
      case "low":
        return 3000;
      default:
        return 5000;
    }
  };

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      removeNotification(notification.id);
    }, 300); // Match animation duration
  };

  const handleClick = () => {
    markAsRead(notification.id);
    // Don't auto-close on click unless it's actionable
    if (!notification.actionable) {
      handleClose();
    }
  };

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

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);

    // Auto-dismiss
    const duration = getDuration();
    let dismissTimer: NodeJS.Timeout;
    if (duration) {
      dismissTimer = setTimeout(() => {
        handleClose();
      }, duration);
    }

    return () => {
      clearTimeout(timer);
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, []);

  return (
    <div
      className={`${styles.toast} ${styles[notification.type]} ${styles[notification.priority]} ${isVisible ? styles.visible : ""} ${isLeaving ? styles.leaving : ""}`}
      style={{
        transform: `translateY(${index * 10}px)`,
        zIndex: 1000 - index,
      }}
      onClick={handleClick}
    >
      <div className={styles.iconContainer}>{getIcon()}</div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h4 className={styles.title}>{notification.title}</h4>
          <button
            className={styles.closeButton}
            onClick={e => {
              e.stopPropagation();
              handleClose();
            }}
            aria-label="Close notification"
          >
            <CloseIcon />
          </button>
        </div>
        <p className={styles.message}>{notification.message}</p>

        {notification.actions && notification.actions.length > 0 && (
          <div className={styles.actions}>
            {notification.actions.map((action, actionIndex) => (
              <button
                key={actionIndex}
                className={`${styles.actionButton} ${styles[action.style || "primary"]}`}
                onClick={e => {
                  e.stopPropagation();
                  action.action();
                  handleClose();
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {!notification.persistent && (
        <div
          className={styles.progressBar}
          style={{
            animationDuration: `${getDuration()}ms`,
            animationPlayState: isLeaving ? "paused" : "running",
          }}
        />
      )}
    </div>
  );
};

export default ToastNotification;
