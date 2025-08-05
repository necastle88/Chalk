import listItems from "./links";
import styles from "./sidebar-links.module.css";
import { Link } from "react-router-dom";

const SidebarLinks = (props: { isOpen: boolean }) => {
  const { isOpen } = props;

  return (
    <div className={`${styles.sidebarLinks} ${!isOpen && styles.closed}`}>
      {listItems.map((item) => (
        <Link key={item.name} to={item.link}>
          {item.icon}
          {isOpen && item.name}
        </Link>
      ))}
    </div>
  );
};

export default SidebarLinks;
