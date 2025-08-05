import "./App.css";
import Header from "./components/Header/Header";
import Sidebar from "./layouts/Sidebar/Sidebar";
import AppRouter from "./router/AppRouter";

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content">
          <AppRouter />
        </div>
      </div>
    </div>
  );
}

export default App;
