import { useState, useEffect } from "react";
import styles from "./Sidebar.module.css";
import SidebarFooter from "./SidebarFooter/SidebarFooter";
import SidebarHeader from "./SidebarHeader/SidebarHeader";
import SidebarLinks from "./SidebarLinks/SidebarLinks";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen: mobileIsOpen, onClose }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile && onClose) {
      onClose();
    } else {
      setIsOpen(!isOpen);
    }
  };

  // Use mobile state if on mobile, otherwise use internal state
  const sidebarIsOpen = isMobile ? (mobileIsOpen ?? false) : isOpen;

  // Apply styles conditionally based on isOpen state
  const sidebarClasses = `${styles.sidebar} ${!sidebarIsOpen && styles.closed} ${
    isMobile && mobileIsOpen ? styles.open : ""
  }`;

  return (
    <aside className={sidebarClasses}>
      <SidebarHeader isOpen={sidebarIsOpen} toggleSidebar={toggleSidebar} />
      <SidebarLinks isOpen={sidebarIsOpen} />
      <SidebarFooter isOpen={sidebarIsOpen} />
    </aside>
  );
};

export default Sidebar;
