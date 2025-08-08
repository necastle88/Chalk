# WorkoutHistory Component

A modularized React component for displaying and managing workout history with filtering, pagination, and responsive design.

## Structure

The WorkoutHistory component has been broken down into smaller, focused components to improve maintainability and reduce code repetition.

### Components

- **`WorkoutHistory.tsx`** - Main container component
- **`WorkoutFilters.tsx`** - Filter controls (search, category, date range)
- **`WorkoutLogEntry.tsx`** - Individual workout log entry display
- **`WorkoutLogsList.tsx`** - List container for workout entries
- **`Pagination.tsx`** - Pagination controls

### Utilities

- **`useWorkoutHistory.ts`** - Custom hook containing all business logic
- **`types.ts`** - TypeScript type definitions
- **`constants.ts`** - Application constants (categories, date options)
- **`utils.ts`** - Pure utility functions (formatters, calculations)

## Usage

```tsx
import WorkoutHistory from './components/WorkoutHistory';

// Basic usage
<WorkoutHistory />

// With custom props
<WorkoutHistory
  limit={10}
  showFilters={true}
  showTitle={true}
  compact={false}
  refreshTrigger={refreshCounter}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `limit` | `number` | `5` | Number of workouts to display per page |
| `showFilters` | `boolean` | `false` | Whether to show filter controls |
| `showTitle` | `boolean` | `true` | Whether to show the component title |
| `compact` | `boolean` | `false` | Whether to use compact display mode |
| `refreshTrigger` | `number` | `0` | Increment to trigger data refresh |

## Benefits of Modularization

1. **Separation of Concerns**: Each component has a single responsibility
2. **Reusability**: Components can be reused in other parts of the application
3. **Testability**: Smaller components are easier to test in isolation
4. **Maintainability**: Logic is centralized in the custom hook
5. **Code Reduction**: Eliminates repetition and improves readability

## Architecture

```
WorkoutHistory/
├── index.ts                 # Barrel exports
├── WorkoutHistory.tsx       # Main component
├── useWorkoutHistory.ts     # Business logic hook
├── WorkoutFilters.tsx       # Filter controls
├── WorkoutLogEntry.tsx      # Single log entry
├── WorkoutLogsList.tsx      # List container
├── Pagination.tsx           # Pagination controls
├── types.ts                 # Type definitions
├── constants.ts             # App constants
├── utils.ts                 # Pure functions
└── workout-history.module.css
```

## Key Features

- **Responsive Design**: Adapts to different screen sizes
- **Real-time Filtering**: Search, category, and date filters
- **Pagination**: Efficient data loading with page controls
- **Optimistic Updates**: Immediate UI feedback
- **Error Handling**: Graceful error states and messaging
- **Authentication**: Clerk integration for secure data access
