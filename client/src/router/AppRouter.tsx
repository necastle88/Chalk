import { Routes, Route } from "react-router-dom";
import NotFound from "../pages/404/NotFound";
import Dashboard from "../pages/Dashboard/Dashboard";
import Workouts from "../pages/Workouts/Workouts";
import Nutrition from "../pages/Nutrition/Nutrition";
import Progress from "../pages/Progress/Progress";

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/workouts" element={<Workouts />} />
    <Route path="/nutrition" element={<Nutrition />} />
    <Route path="/progress" element={<Progress />} />
    <Route path="/not-found" element={<NotFound />} />
  </Routes>
);

export default AppRouter;
