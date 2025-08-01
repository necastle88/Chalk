import ExpandSidebarButton from "../ExpandSidebarButton/ExpandSidebarButton";
import styles from "./sidebar-header.module.css";
import ChalkDarkModeLogo from "../../../assets/ChalkLogoDM.png";

type SidebarHeaderProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
};

const SidebarHeader = ({ isOpen, toggleSidebar }: SidebarHeaderProps) => {
  return (
    <div className={styles.sidebarHeader}>
      <div className={styles.logoContainer}>
        <img
          className={styles.logoImage}
          src={ChalkDarkModeLogo}
          alt="Chalk Logo"
        />
        <ExpandSidebarButton onClick={toggleSidebar} isOpen={isOpen} />
      </div>
      <p>Your fitness tracking app</p>
    </div>
  );
};

export default SidebarHeader;
