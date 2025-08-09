import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";

export type NotificationType =
  | "success"
  | "info"
  | "warning"
  | "error"
  | "achievement"
  | "workout-reminder"
  | "progress-update";

export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  persistent?: boolean; // Doesn't auto-dismiss
  actionable?: boolean; // Has action buttons
  actions?: NotificationAction[];
  duration?: number; // Custom duration in ms
  category?: string; // For grouping/filtering
  relatedEntity?: {
    type: "workout" | "exercise" | "goal" | "achievement";
    id: string;
  };
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: "primary" | "secondary" | "danger";
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
}

interface NotificationSettings {
  showToasts: boolean;
  showWorkoutReminders: boolean;
  showProgressUpdates: boolean;
  showAchievements: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string; // "08:00"
  };
  soundEnabled: boolean;
  maxToastNotifications: number;
}

type NotificationAction_Type =
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "REMOVE_NOTIFICATION"; payload: string }
  | { type: "MARK_AS_READ"; payload: string }
  | { type: "MARK_ALL_AS_READ" }
  | { type: "CLEAR_ALL" }
  | { type: "UPDATE_SETTINGS"; payload: Partial<NotificationSettings> };

const defaultSettings: NotificationSettings = {
  showToasts: true,
  showWorkoutReminders: true,
  showProgressUpdates: true,
  showAchievements: true,
  quietHours: {
    enabled: false,
    start: "22:00",
    end: "08:00",
  },
  soundEnabled: true,
  maxToastNotifications: 3,
};

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  settings: defaultSettings,
};

function notificationReducer(
  state: NotificationState,
  action: NotificationAction_Type
): NotificationState {
  switch (action.type) {
    case "ADD_NOTIFICATION":
      const newNotifications = [action.payload, ...state.notifications];
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: state.unreadCount + 1,
      };

    case "REMOVE_NOTIFICATION":
      const filteredNotifications = state.notifications.filter(
        n => n.id !== action.payload
      );
      const removedNotification = state.notifications.find(
        n => n.id === action.payload
      );
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount:
          removedNotification && !removedNotification.read
            ? state.unreadCount - 1
            : state.unreadCount,
      };

    case "MARK_AS_READ":
      const updatedNotifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, read: true } : n
      );
      const wasUnread = state.notifications.find(
        n => n.id === action.payload && !n.read
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount,
      };

    case "MARK_ALL_AS_READ":
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      };

    case "CLEAR_ALL":
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };

    case "UPDATE_SETTINGS":
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    default:
      return state;
  }
}

interface NotificationContextValue {
  state: NotificationState;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => string;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  // Convenience methods
  showSuccess: (
    title: string,
    message: string,
    options?: Partial<Notification>
  ) => string;
  showError: (
    title: string,
    message: string,
    options?: Partial<Notification>
  ) => string;
  showInfo: (
    title: string,
    message: string,
    options?: Partial<Notification>
  ) => string;
  showWarning: (
    title: string,
    message: string,
    options?: Partial<Notification>
  ) => string;
  showAchievement: (
    title: string,
    message: string,
    options?: Partial<Notification>
  ) => string;
  showWorkoutReminder: (
    title: string,
    message: string,
    options?: Partial<Notification>
  ) => string;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const generateId = () =>
    `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const isQuietHours = useCallback(() => {
    if (!state.settings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const { start, end } = state.settings.quietHours;

    if (start <= end) {
      return currentTime >= start && currentTime <= end;
    } else {
      // Overnight quiet hours (e.g., 22:00 to 08:00)
      return currentTime >= start || currentTime <= end;
    }
  }, [state.settings.quietHours]);

  const addNotification = useCallback(
    (notificationData: Omit<Notification, "id" | "timestamp" | "read">) => {
      const id = generateId();
      const notification: Notification = {
        ...notificationData,
        id,
        timestamp: new Date(),
        read: false,
      };

      // Check if we should show this notification based on settings
      if (isQuietHours() && notification.priority !== "urgent") {
        // Store for later but don't show toast
        dispatch({
          type: "ADD_NOTIFICATION",
          payload: { ...notification, read: true },
        });
        return id;
      }

      dispatch({ type: "ADD_NOTIFICATION", payload: notification });
      return id;
    },
    [isQuietHours]
  );

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: "REMOVE_NOTIFICATION", payload: id });
  }, []);

  const markAsRead = useCallback((id: string) => {
    dispatch({ type: "MARK_AS_READ", payload: id });
  }, []);

  const markAllAsRead = useCallback(() => {
    dispatch({ type: "MARK_ALL_AS_READ" });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: "CLEAR_ALL" });
  }, []);

  const updateSettings = useCallback(
    (settings: Partial<NotificationSettings>) => {
      dispatch({ type: "UPDATE_SETTINGS", payload: settings });
    },
    []
  );

  // Convenience methods
  const showSuccess = useCallback(
    (title: string, message: string, options?: Partial<Notification>) => {
      return addNotification({
        type: "success",
        priority: "medium",
        title,
        message,
        duration: 4000,
        ...options,
      });
    },
    [addNotification]
  );

  const showError = useCallback(
    (title: string, message: string, options?: Partial<Notification>) => {
      return addNotification({
        type: "error",
        priority: "high",
        title,
        message,
        persistent: true,
        ...options,
      });
    },
    [addNotification]
  );

  const showInfo = useCallback(
    (title: string, message: string, options?: Partial<Notification>) => {
      return addNotification({
        type: "info",
        priority: "low",
        title,
        message,
        duration: 3000,
        ...options,
      });
    },
    [addNotification]
  );

  const showWarning = useCallback(
    (title: string, message: string, options?: Partial<Notification>) => {
      return addNotification({
        type: "warning",
        priority: "medium",
        title,
        message,
        duration: 5000,
        ...options,
      });
    },
    [addNotification]
  );

  const showAchievement = useCallback(
    (title: string, message: string, options?: Partial<Notification>) => {
      return addNotification({
        type: "achievement",
        priority: "medium",
        title,
        message,
        duration: 6000,
        category: "achievement",
        ...options,
      });
    },
    [addNotification]
  );

  const showWorkoutReminder = useCallback(
    (title: string, message: string, options?: Partial<Notification>) => {
      return addNotification({
        type: "workout-reminder",
        priority: "medium",
        title,
        message,
        actionable: true,
        category: "workout",
        ...options,
      });
    },
    [addNotification]
  );

  const value: NotificationContextValue = {
    state,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    updateSettings,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showAchievement,
    showWorkoutReminder,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
