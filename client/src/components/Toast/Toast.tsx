import React, { useEffect } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import styles from "./toast.module.css";

interface ToastProps {
  isVisible: boolean;
  onClose: () => void;
  onAccept?: () => void;
  title: string;
  message: string;
  details?: string[];
  confidence?: number;
  autoClose?: boolean;
  duration?: number;
  type?: "success" | "info" | "warning" | "ai-suggestion";
}

const Toast: React.FC<ToastProps> = ({
  isVisible,
  onClose,
  onAccept,
  title,
  message,
  details = [],
  confidence,
  autoClose = false,
  duration = 5000,
  type = "info",
}) => {
  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className={styles.icon} />;
      case "ai-suggestion":
        return <AutoAwesomeIcon className={styles.icon} />;
      default:
        return <AutoAwesomeIcon className={styles.icon} />;
    }
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div
        className={`${styles.toast} ${styles[type]} ${
          isVisible ? styles.visible : ""
        }`}
      >
        <div className={styles.header}>
          <div className={styles.titleRow}>
            {getIcon()}
            <span className={styles.title}>{title}</span>
            {confidence && (
              <span className={styles.confidence}>
                {Math.round(confidence * 100)}% confident
              </span>
            )}
          </div>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close notification"
          >
            <CloseIcon />
          </button>
        </div>

        <div className={styles.content}>
          <p className={styles.message}>{message}</p>

          {details.length > 0 && (
            <div className={styles.details}>
              {details.map((detail, index) => (
                <span key={index} className={styles.detail}>
                  {detail}
                </span>
              ))}
            </div>
          )}
        </div>

        {onAccept && (
          <div className={styles.actions}>
            <button className={styles.acceptButton} onClick={onAccept}>
              Accept All Suggestions
            </button>
            <button className={styles.dismissButton} onClick={onClose}>
              Dismiss
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Toast;
