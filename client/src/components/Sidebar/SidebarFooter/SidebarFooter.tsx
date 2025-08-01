import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
} from "@clerk/clerk-react";

import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import styles from "./sidebar-footer.module.css";

const SidebarFooter = (props: { isOpen: boolean }) => {
  const { isOpen } = props;

  const renderFooterContent = () => {
    if (!isOpen) {
      return (
        <>
          <SignedOut>
            <SignInButton>
              <button className={styles.signInButton}>
                <LoginIcon fontSize="small" />
                <span>Sign in</span>
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <SignOutButton>
              <button className={styles.signOutButton}>
                <LogoutIcon fontSize="small" />
                <span>Sign out</span>
              </button>
            </SignOutButton>
          </SignedIn>
          <p className={styles.copyright}>&copy; 2025 Chalk</p>
        </>
      );
    } else {
      return (
        <>
          <SignedOut>
            <SignInButton>
              <button className={styles.signInButton}>
                <LoginIcon fontSize="small" />
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <SignOutButton>
              <button className={styles.signOutButton}>
                <LogoutIcon fontSize="small" />
              </button>
            </SignOutButton>
          </SignedIn>
        </>
      );
    }
  };

  return <div className={styles.sidebarFooter}>{renderFooterContent()}</div>;
};

export default SidebarFooter;
