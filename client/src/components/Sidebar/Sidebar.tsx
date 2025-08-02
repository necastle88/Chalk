import { useState } from "react";
import styles from "./Sidebar.module.css";
import SidebarFooter from "./SidebarFooter/SidebarFooter";
import SidebarHeader from "./SidebarHeader/SidebarHeader";
import SidebarLinks from "./SidebarLinks/SidebarLinks";

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Apply styles conditionally based on isOpen state
  const sidebarClasses = `${styles.sidebar} ${!isOpen && styles.closed}`;

  return (
    <aside className={sidebarClasses}>
      <SidebarHeader isOpen={isOpen} toggleSidebar={toggleSidebar} />
      <SidebarLinks isOpen={isOpen} />
      <SidebarFooter isOpen={isOpen} />
    </aside>
  );
};

export default Sidebar;
