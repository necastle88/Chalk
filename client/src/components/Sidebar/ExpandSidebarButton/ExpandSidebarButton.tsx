import styles from "./expand-sidebar-button.module.css";

const ExpandSidebarButton = (props: { isOpen: boolean; onClick: () => void }) => {
    const { onClick, isOpen } = props;

    // Apply styles conditionally based on isOpen state
    const buttonClasses = `${styles.expandButton} ${isOpen ? styles.open : ""}`;
    return (
            <div className={ styles.chevronContainer } onClick={onClick}>
                <div className={ styles.biggerChevron }>
                    <div className={styles.line}></div>
                    <div className={styles.line}></div>
                </div>
                <div className={styles.smallerChevron}>
                    <div className={styles.line}></div>
                    <div className={styles.line}></div>
                </div>
            </div>
    );
};
    
export default ExpandSidebarButton;