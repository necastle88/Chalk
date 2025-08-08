import React from "react";
import type { JournalFilterState } from "./types";
import {
  JOURNAL_CATEGORIES,
  JOURNAL_DATE_OPTIONS,
  EXERCISE_TYPE_OPTIONS,
} from "./constants";
import styles from "./workout-journal.module.css";

interface JournalFiltersProps {
  filters: JournalFilterState;
  onFiltersChange: (filters: Partial<JournalFilterState>) => void;
}

const JournalFilters: React.FC<JournalFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  return (
    <div className={styles.filters}>
      <div className={styles.filterRow}>
        <input
          type="text"
          placeholder="Search exercises..."
          value={filters.searchTerm}
          onChange={e => onFiltersChange({ searchTerm: e.target.value })}
          className={styles.searchInput}
        />

        <select
          value={filters.exerciseType}
          onChange={e =>
            onFiltersChange({
              exerciseType: e.target.value as "all" | "strength" | "cardio",
            })
          }
          className={styles.filterSelect}
        >
          {EXERCISE_TYPE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.categoryFilter}
          onChange={e => onFiltersChange({ categoryFilter: e.target.value })}
          className={styles.filterSelect}
        >
          {JOURNAL_CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        <select
          value={filters.dateFilter}
          onChange={e => onFiltersChange({ dateFilter: e.target.value })}
          className={styles.filterSelect}
        >
          {JOURNAL_DATE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default JournalFilters;
