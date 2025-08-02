import DashboardIcon from "@mui/icons-material/Dashboard";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import styles from "./sidebar-links.module.css";

const SidebarLinks = (props: { isOpen: boolean }) => {
  const { isOpen } = props;

  const listItems = [
    { name: "Dashboard", link: "/", icon: <DashboardIcon fontSize="small" /> },
    {
      name: "Workouts",
      link: "/workouts",
      icon: <FitnessCenterIcon fontSize="small" />,
    },
    {
      name: "Nutrition",
      link: "/nutrition",
      icon: <LocalDiningIcon fontSize="small" />,
    },
    {
      name: "Progress",
      link: "/progress",
      icon: <RotateRightIcon fontSize="small" />,
    },
  ];

  return (
    <div className={`${styles.sidebarLinks} ${!isOpen && styles.closed}`}>
      {listItems.map((item) => (
        <a key={item.name} href={item.link}>
          {item.icon}
          {isOpen && item.name}
        </a>
      ))}
    </div>
  );
};

export default SidebarLinks;
