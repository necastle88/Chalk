import DashboardIcon from "@mui/icons-material/Dashboard";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import MenuBookIcon from "@mui/icons-material/MenuBook";

const listItems = [
  {
    name: "Dashboard",
    link: "/",
    icon: <DashboardIcon fontSize="small" />,
    id: "dashboard",
  },
  {
    name: "Workouts",
    link: "/workouts",
    icon: <FitnessCenterIcon fontSize="small" />,
    id: "workouts",
  },
  {
    name: "Journal",
    link: "/journal",
    icon: <MenuBookIcon fontSize="small" />,
    id: "journal",
  },
  {
    name: "Nutrition",
    link: "/nutrition",
    icon: <LocalDiningIcon fontSize="small" />,
    id: "nutrition",
  },
  {
    name: "Progress",
    link: "/progress",
    icon: <RotateRightIcon fontSize="small" />,
    id: "progress",
  },
];

export default listItems;
