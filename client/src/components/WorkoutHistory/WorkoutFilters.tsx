import React from "react";
import type { FilterState } from "./types";
import { CATEGORIES, DATE_OPTIONS } from "./constants";
import styles from "./workout-history.module.css";

interface WorkoutFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
}

const WorkoutFilters: React.FC<WorkoutFiltersProps> = ({
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
          value={filters.categoryFilter}
          onChange={e => onFiltersChange({ categoryFilter: e.target.value })}
          className={styles.filterSelect}
        >
          {CATEGORIES.map(cat => (
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
          {DATE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default WorkoutFilters;
