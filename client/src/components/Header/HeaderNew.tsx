import { SignedIn, UserButton } from "@clerk/clerk-react";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MenuIcon from "@mui/icons-material/Menu";
import styles from "./header.module.css";

import { useNotifications } from "../../contexts/NotificationContext";
import { NotificationCenter } from "../NotificationSystem";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const { state: notificationState } = useNotifications();
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  const handleNotificationClick = () => {
    setShowNotificationCenter(true);
  };

  const handleCloseNotificationCenter = () => {
    setShowNotificationCenter(false);
  };

  // Map paths to readable titles
  const pathToTitle: { [key: string]: string } = {
    "/": "Dashboard",
    "/workouts": "Workouts",
    "/nutrition": "Nutrition",
    "/progress": "Progress",
    "/journal": "Journal",
    "/not-found": "Page Not Found",
  };

  useEffect(() => {
    const title = pathToTitle[location.pathname] || "Dashboard";
    setPageTitle(title);
  }, [location.pathname]);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <button
            className={styles.mobileMenuButton}
            onClick={onMobileMenuToggle}
            aria-label="Toggle mobile menu"
            type="button"
          >
            <MenuIcon />
          </button>
          <h1>{pageTitle}</h1>
        </div>
        <ul className={styles.navList}>
          <li className={styles.notifications}>
            <button
              className={styles.headerButtons}
              onClick={handleNotificationClick}
              type="button"
              aria-label={`Notifications ${notificationState.unreadCount > 0 ? `(${notificationState.unreadCount} unread)` : ""}`}
            >
              {notificationState.unreadCount > 0 && (
                <div className={styles.notificationsDot}></div>
              )}
              <NotificationsIcon />
            </button>
          </li>
          <li className={styles.headerButtons}>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </li>
        </ul>
      </header>

      <NotificationCenter
        isOpen={showNotificationCenter}
        onClose={handleCloseNotificationCenter}
      />
    </>
  );
};

export default Header;
