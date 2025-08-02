import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
} from "@clerk/clerk-react";

import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import styles from "./sidebar-footer.module.css";

const SidebarFooter = (props: { isOpen: boolean }) => {
  const { isOpen } = props;

  const renderFooterContent = () => {
    if (isOpen) {
      return (
        <div className={styles.footerButtons}>
          <SignedOut>
            <SignInButton>
              <button className={styles.authButton}>
                <LoginIcon fontSize="small" />
                <span>Sign in</span>
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <SignOutButton>
              <button className={styles.authButton}>
                <LogoutIcon fontSize="small" />
                <span>Sign out</span>
              </button>
            </SignOutButton>
          </SignedIn>
          <p className={styles.copyright}>&copy; 2025 Chalk</p>
        </div>
      );
    } else {
      return (
        <div className={`${styles.footerButtons} ${styles.closed}`}>
          <SignedOut>
            <SignInButton>
              <button className={`${styles.authButton} ${styles.closed}`}>
                <LoginIcon fontSize="small" />
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <SignOutButton>
              <button className={`${styles.authButton} ${styles.closed}`}>
                <LogoutIcon fontSize="small" />
              </button>
            </SignOutButton>
          </SignedIn>
        </div>
      );
    }
  };

  return <div className={styles.sidebarFooter}>{renderFooterContent()}</div>;
};

export default SidebarFooter;
