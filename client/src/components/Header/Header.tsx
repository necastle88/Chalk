import { SignedIn, UserButton } from "@clerk/clerk-react";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MenuIcon from "@mui/icons-material/Menu";
import styles from "./header.module.css";

import type { NotificationData } from "./header-types";
import Popover from "@mui/material/Popover";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const [notifications, setNotifications] = useState<
    NotificationData[] | undefined
  >([]);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

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
      await new Promise(resolve => setTimeout(resolve, 1000));
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
            onClick={handleClick}
            aria-describedby={id}
            type="button"
          >
            {notifications && notifications.length > 0 ? (
              <div className={styles.notificationsDot}></div>
            ) : null}
            <NotificationsIcon />
          </button>
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 45,
              horizontal: -232,
            }}
          >
            {notifications && notifications.length > 0 ? (
              <div className={styles.notificationPopover}>
                <div className={styles.notificationHeader}>
                  <h3>Notifications</h3>
                  <button className={styles.closeButton} onClick={handleClose}>
                    &times;
                  </button>
                </div>
                {(notifications ?? []).map(notification => (
                  <p
                    key={notification.id}
                    className={styles.notificationMessage}
                  >
                    {notification.message}
                  </p>
                ))}
              </div>
            ) : null}
          </Popover>
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
