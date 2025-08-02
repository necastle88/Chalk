import styles from "./expand-sidebar-button.module.css";

interface ExpandSidebarButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

const ExpandSidebarButton: React.FC<ExpandSidebarButtonProps> = ({
  isOpen,
  onClick,
}) => {
  // Apply styles conditionally based on isOpen state
  const buttonClasses = `${styles.expandButton} ${
    !isOpen ? styles.open : styles.closed
  }`;
  return (
    <div
      className={`${styles.chevronContainer} ${buttonClasses}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <div
        className={`${styles.biggerChevron} ${
          !isOpen ? styles.open : styles.closed
        }`}
      >
        <div className={styles.line}></div>
        <div className={styles.line}></div>
      </div>
      <div
        className={`${styles.smallerChevron} ${
          !isOpen ? styles.open : styles.closed
        }`}
      >
        <div className={styles.line}></div>
        <div className={styles.line}></div>
      </div>
    </div>
  );
};

export default ExpandSidebarButton;
