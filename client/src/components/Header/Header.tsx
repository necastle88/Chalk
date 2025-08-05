import { SignedIn, UserButton } from "@clerk/clerk-react";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import styles from "./header.module.css";

import type { NotificationData } from "./header-types";

const Header: React.FC = () => {
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const [notifications, setNotifications] = useState<
    NotificationData[] | undefined
  >([]);

  // Map paths to readable titles
  const pathToTitle: { [key: string]: string } = {
    "/": "Dashboard",
    "/workouts": "Workouts",
    "/nutrition": "Nutrition",
    "/progress": "Progress",
    "/not-found": "Page Not Found",
  };

  useEffect(() => {
    const title = pathToTitle[location.pathname] || "Dashboard";
    setPageTitle(title);
  }, [location.pathname]);

  // Simulate fetching notifications
  useEffect(() => {
    // This would be replaced with an actual API call to fetch notifications
    const fetchNotifications = async () => {
      // Simulated delay for fetching notifications
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Simulated notifications data
      const notificationsData = [
        { id: 1, message: "New workout plan available!" },
        { id: 2, message: "Your meal plan has been updated." },
      ];
      setNotifications(notificationsData);
    };
    fetchNotifications();
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <h1>{pageTitle}</h1>
      </div>
      <ul className={styles.navList}>
        <li className={styles.notifications}>
          <button className={styles.headerButtons}>
            {notifications && notifications.length > 0 ? (
              <div className={styles.notificationsDot}></div>
            ) : null}
            <NotificationsIcon />
          </button>
        </li>
        <li className={styles.settings}>
          <button className={styles.headerButtons}>
            <SettingsIcon />
          </button>
        </li>
        <li className={styles.headerButtons}>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </li>
      </ul>
    </header>
  );
};

export default Header;
