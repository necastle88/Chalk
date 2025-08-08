import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import WorkoutJournal from "./WorkoutJournal";

// Mock the auth hook
vi.mock("@clerk/clerk-react", () => ({
  useAuth: () => ({
    getToken: vi.fn().mockResolvedValue("mock-token"),
  }),
}));

// Mock workout data
const mockWorkoutLogs = [
  {
    id: "1",
    exerciseName: "Bench Press",
    category: "CHEST",
    sets: 3,
    reps: 10,
    weight: 185,
    duration: 1800, // 30 minutes in seconds
    restDuration: 90,
    notes: "Good form, felt strong",
    date: "2025-08-07T10:00:00Z",
    aiConfidence: 0.95,
  },
  {
    id: "2",
    exerciseName: "Running",
    category: "CARDIO",
    sets: 1,
    reps: 1,
    weight: 0,
    duration: 1800, // 30 minutes in seconds
    notes: "Morning run, felt good",
    date: "2025-08-06T07:00:00Z",
    aiConfidence: 0.88,
  },
];

// Mock the workout API
vi.mock("../../services/workoutApi", () => ({
  workoutApi: {
    getWorkoutLogs: vi.fn().mockResolvedValue({
      data: mockWorkoutLogs,
      pagination: {
        limit: 20,
        offset: 0,
        total: 2,
        hasMore: false,
      },
    }),
  },
}));

describe("WorkoutJournal", () => {
  it("renders the component with title", () => {
    render(<WorkoutJournal />);
    expect(screen.getByText("Workout Journal")).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    render(<WorkoutJournal />);
    expect(screen.getByText("Loading workout journal...")).toBeInTheDocument();
  });

  it("shows filters by default", async () => {
    render(<WorkoutJournal />);

    // Wait for the component to load and show filters
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Search exercises...")
      ).toBeInTheDocument();
    });
  });

  it("can hide filters when showFilters is false", async () => {
    render(<WorkoutJournal showFilters={false} />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(
        screen.queryByText("Loading workout journal...")
      ).not.toBeInTheDocument();
    });

    expect(
      screen.queryByPlaceholderText("Search exercises...")
    ).not.toBeInTheDocument();
  });

  it("displays exercise type tabs after loading", async () => {
    render(<WorkoutJournal />);

    // Wait for the component to load and display tabs
    await waitFor(() => {
      expect(screen.getByText(/All Exercises/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Strength Training/)).toBeInTheDocument();
    expect(screen.getByText(/Cardio/)).toBeInTheDocument();
  });

  it("shows View buttons in tables after loading", async () => {
    render(<WorkoutJournal />);

    // Wait for data to load and tables to appear
    await waitFor(() => {
      const viewButtons = screen.getAllByText("View");
      expect(viewButtons.length).toBeGreaterThan(0);
    });
  });

  it("opens modal when View button is clicked", async () => {
    render(<WorkoutJournal />);

    // Wait for data to load
    await waitFor(() => {
      const viewButtons = screen.getAllByText("View");
      expect(viewButtons.length).toBeGreaterThan(0);
    });

    // Click the first View button
    const viewButtons = screen.getAllByText("View");
    fireEvent.click(viewButtons[0]);

    // Check if modal opens
    await waitFor(() => {
      expect(screen.getByText("Workout Details")).toBeInTheDocument();
    });
  });

  it("closes modal when close button is clicked", async () => {
    render(<WorkoutJournal />);

    // Wait for data to load and click View button
    await waitFor(() => {
      const viewButtons = screen.getAllByText("View");
      fireEvent.click(viewButtons[0]);
    });

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByText("Workout Details")).toBeInTheDocument();
    });

    // Click close button
    const closeButton = screen.getByLabelText("Close modal");
    fireEvent.click(closeButton);

    // Check if modal closes
    await waitFor(() => {
      expect(screen.queryByText("Workout Details")).not.toBeInTheDocument();
    });
  });

  it("displays strength training details in modal", async () => {
    render(<WorkoutJournal />);

    // Wait for data to load and click View button for strength exercise
    await waitFor(() => {
      const viewButtons = screen.getAllByText("View");
      fireEvent.click(viewButtons[0]); // First exercise is Bench Press (strength)
    });

    // Check if strength training details are displayed
    await waitFor(() => {
      expect(screen.getByText("Strength Training Details")).toBeInTheDocument();
      expect(screen.getByText("Bench Press")).toBeInTheDocument();
      expect(screen.getByText("185 lbs")).toBeInTheDocument();
    });
  });
});
