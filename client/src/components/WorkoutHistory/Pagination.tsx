import React from "react";
import type { PaginationState } from "./types";
import styles from "./workout-history.module.css";

interface PaginationProps {
  pagination: PaginationState;
  currentPage: number;
  compact: boolean;
  loading: boolean;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  pagination,
  currentPage,
  compact,
  loading,
  onPageChange,
}) => {
  const goToPrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < pagination.totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div
      className={`${styles.paginationContainer} ${compact ? styles.compactPagination : ""}`}
    >
      {!compact && (
        <div className={styles.paginationInfo}>
          Page {currentPage} of {pagination.totalPages} ({pagination.total}{" "}
          total workouts)
        </div>
      )}
      <div className={styles.paginationControls}>
        <button
          onClick={goToPrevPage}
          disabled={currentPage === 1 || loading}
          className={`${styles.pageButton} ${compact ? styles.compactPageButton : ""}`}
        >
          Prev
        </button>
        <span
          className={`${styles.pageInfo} ${compact ? styles.compactPageInfo : ""}`}
        >
          {currentPage} / {pagination.totalPages}
        </span>
        <button
          onClick={goToNextPage}
          disabled={currentPage === pagination.totalPages || loading}
          className={`${styles.pageButton} ${compact ? styles.compactPageButton : ""}`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
