import { useState } from "react";
import styles from "./Sidebar.module.css";
import ExpandSidebarButton from "./ExpandSidebarButton/ExpandSidebarButton";
import SidebarFooter from "./SidebarFooter/SidebarFooter";
import ChalkDarkModeLogo from "../../assets/ChalkLogoDM.png";
import SidebarHeader from "./SidebarHeader/SidebarHeader";

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  // Apply styles conditionally based on isOpen state
  const sidebarClasses = `${styles.sidebar} ${isOpen && styles.closed}`;

  const listItems = [
    { name: "Dashboard", link: "/" },
    { name: "Workouts", link: "/workouts" },
    { name: "Nutrition", link: "/nutrition" },
    { name: "Progress", link: "/progress" },
  ];

  return (
    <aside className={sidebarClasses}>
      <div className={styles.sidebarContent}>
        <SidebarHeader isOpen={isOpen} toggleSidebar={toggleSidebar} />
        <div className={styles.sidebarLinks}>
          <h3>Quick Links</h3>
        </div>
        <nav>
          <ul>
            {listItems.map((item, index) => (
              <li key={index}>
                <a href={item.link}>{item.name}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <SidebarFooter isOpen={isOpen} />
    </aside>
  );
};

export default Sidebar;
