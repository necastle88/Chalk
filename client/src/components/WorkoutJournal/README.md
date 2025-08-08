# WorkoutJournal Component

A comprehensive React component for displaying workout data in a tabular journal format, with separate views for strength training and cardio exercises.

## Features

- **Dual Exercise Types**: Separate tables for strength training and cardio workouts
- **Advanced Filtering**: Search, exercise type, category, and date range filters
- **Pagination**: Efficient data loading with numbered page navigation
- **Responsive Design**: Adapts to different screen sizes
- **Detailed Data Display**: Comprehensive workout metrics for both exercise types

## Structure

The WorkoutJournal component is built with a modular architecture:

### Components

- **`WorkoutJournal.tsx`** - Main container component with tabbed interface
- **`JournalFilters.tsx`** - Advanced filter controls
- **`StrengthTable.tsx`** - Table for strength training workouts
- **`CardioTable.tsx`** - Table for cardio workouts
- **`JournalPagination.tsx`** - Enhanced pagination with page numbers

### Utilities

- **`useWorkoutJournal.ts`** - Custom hook for journal logic
- **`types.ts`** - TypeScript type definitions
- **`constants.ts`** - Application constants
- **`utils.ts`** - Utility functions for data formatting

## Usage

```tsx
import WorkoutJournal from './components/WorkoutJournal';

// Basic usage
<WorkoutJournal />

// With custom props
<WorkoutJournal
  limit={20}
  showFilters={true}
  showTitle={true}
  refreshTrigger={refreshCounter}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `limit` | `number` | `20` | Number of entries to display per page |
| `showFilters` | `boolean` | `true` | Whether to show filter controls |
| `showTitle` | `boolean` | `true` | Whether to show the component title |
| `refreshTrigger` | `number` | `0` | Increment to trigger data refresh |

## Data Structure

### Strength Training Entries
- **Date**: Workout date with day of week
- **Exercise**: Exercise name and category
- **Duration**: Total exercise duration
- **Sets**: Number of sets performed
- **Weight/Reps**: Weight lifted and repetitions (lbs/kg support)
- **Rest**: Rest duration between sets
- **Notes**: Additional workout notes
- **Actions**: Link to detailed workout log

### Cardio Entries
- **Date**: Workout date with day of week
- **Exercise**: Cardio exercise description
- **Duration**: Exercise duration in minutes
- **Heart Rate**: Starting and maximum heart rate (bpm)
- **Calories**: Estimated calories burned
- **Effort**: Perceived effort on 1-10 scale
- **Notes**: Additional workout notes
- **Actions**: Link to detailed workout log

## Filtering Options

- **Search**: Filter by exercise name or notes
- **Exercise Type**: All, Strength Training, or Cardio
- **Category**: Chest, Back, Legs, Arms, Shoulders, Core, Cardio, etc.
- **Date Range**: Last 7 days, 30 days, 3 months, 6 months, year, or all time

## Navigation

- **Tabbed Interface**: Switch between All, Strength, and Cardio views
- **Pagination**: Navigate through large datasets with page numbers
- **Workout Links**: Click "View" to navigate to detailed workout logs

## Responsive Design

- **Desktop**: Full table view with all columns
- **Tablet**: Optimized column spacing
- **Mobile**: Stacked layout with horizontal scrolling

## Data Conversion

The component automatically converts `WorkoutLogEntry` data from the workout API into structured journal entries, handling:

- **Time Conversion**: Seconds to minutes for duration display
- **Exercise Classification**: Automatic categorization of cardio vs strength
- **Missing Data Handling**: Graceful display of unavailable metrics
- **Unit Support**: Support for both lbs and kg weight units

## Styling

The component uses CSS modules with a comprehensive design system:

- **Color-coded Categories**: Each exercise category has a distinct color
- **Hover Effects**: Interactive table rows and buttons
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages

## Integration Notes

To fully utilize the cardio features, consider extending the `WorkoutLogEntry` interface to include:

```typescript
interface ExtendedWorkoutLogEntry extends WorkoutLogEntry {
  heartRateStart?: number;
  heartRateMax?: number;
  caloriesBurned?: number;
  perceivedEffort?: number; // 1-10 scale
  weightUnit?: 'lbs' | 'kg';
}
```

This will enable complete cardio metrics tracking and display.
