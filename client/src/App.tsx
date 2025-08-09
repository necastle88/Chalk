import "./App.css";
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { useState } from "react";
import Header from "./components/Header/Header";
import Sidebar from "./layouts/Sidebar/Sidebar";
import AppRouter from "./router/AppRouter";
import {
  NotificationProvider,
  NotificationManager,
} from "./components/NotificationSystem";

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <NotificationProvider>
      <SignedOut>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            gap: "20px",
          }}
        >
          <h1>Welcome to Chalk Workout Tracker</h1>
          <p>Please sign in to access your workout dashboard</p>
          <SignInButton mode="modal">
            <button
              style={{
                padding: "12px 24px",
                fontSize: "16px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Sign In
            </button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="app-container">
          {/* Mobile overlay */}
          {isMobileMenuOpen && (
            <div
              className="mobile-overlay visible"
              onClick={handleMobileMenuClose}
            />
          )}

          <div
            className={`sidebar-container ${isMobileMenuOpen ? "open" : ""}`}
          >
            <Sidebar
              isOpen={isMobileMenuOpen}
              onClose={handleMobileMenuClose}
            />
          </div>

          <div className="main-content">
            <Header onMobileMenuToggle={handleMobileMenuToggle} />
            <div className="content">
              <AppRouter />
            </div>
          </div>
        </div>

        {/* Global notification manager for toast notifications */}
        <NotificationManager />
      </SignedIn>
    </NotificationProvider>
  );
}

export default App;
