import React from "react";
import type { JournalPagination } from "./types";
import styles from "./workout-journal.module.css";

interface JournalPaginationProps {
  pagination: JournalPagination;
  currentPage: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}

const JournalPaginationComponent: React.FC<JournalPaginationProps> = ({
  pagination,
  currentPage,
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
    <div className={styles.paginationContainer}>
      <div className={styles.paginationInfo}>
        Page {currentPage} of {pagination.totalPages} ({pagination.total} total
        entries)
      </div>
      <div className={styles.paginationControls}>
        <button
          onClick={goToPrevPage}
          disabled={currentPage === 1 || loading}
          className={styles.pageButton}
        >
          ← Previous
        </button>

        <div className={styles.pageNumbers}>
          {Array.from(
            { length: Math.min(5, pagination.totalPages) },
            (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  disabled={loading}
                  className={`${styles.pageNumber} ${
                    pageNum === currentPage ? styles.active : ""
                  }`}
                >
                  {pageNum}
                </button>
              );
            }
          )}
        </div>

        <button
          onClick={goToNextPage}
          disabled={currentPage === pagination.totalPages || loading}
          className={styles.pageButton}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default JournalPaginationComponent;
