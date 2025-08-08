import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClerkProvider } from "@clerk/clerk-react";
import WorkoutHistory from "./WorkoutHistory";

// Mock the workoutApi
vi.mock("../../services/workoutApi", () => ({
  workoutApi: {
    getWorkoutLogs: vi.fn(() => Promise.resolve([])),
    deleteWorkoutLog: vi.fn(() => Promise.resolve()),
  },
}));

// Mock Clerk hooks
vi.mock("@clerk/clerk-react", async () => {
  const actual = await vi.importActual("@clerk/clerk-react");
  return {
    ...actual,
    useAuth: () => ({
      getToken: vi.fn(() => Promise.resolve("mock-token")),
    }),
    useUser: () => ({
      user: { id: "test-user" },
    }),
  };
});

const mockClerkProviderProps = {
  publishableKey: "test-key",
};

const renderWithClerk = (component: React.ReactElement) => {
  return render(
    <ClerkProvider {...mockClerkProviderProps}>{component}</ClerkProvider>
  );
};

describe("WorkoutHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the component with title", () => {
    renderWithClerk(
      <WorkoutHistory
        limit={5}
        showFilters={false}
        showTitle={true}
        compact={true}
        refreshTrigger={0}
      />
    );

    expect(screen.getByText("Recent Workouts")).toBeInTheDocument();
  });

  it("renders in compact mode", () => {
    const { container } = renderWithClerk(
      <WorkoutHistory
        limit={5}
        showFilters={false}
        showTitle={false}
        compact={true}
        refreshTrigger={0}
      />
    );

    const workoutHistoryContainer = container.querySelector(".container");
    expect(workoutHistoryContainer).toHaveClass("compact");
  });

  it("shows filters when showFilters is true", () => {
    renderWithClerk(
      <WorkoutHistory
        limit={5}
        showFilters={true}
        showTitle={true}
        compact={false}
        refreshTrigger={0}
      />
    );

    expect(
      screen.getByPlaceholderText("Search workouts...")
    ).toBeInTheDocument();
  });

  it("does not show filters when showFilters is false", () => {
    renderWithClerk(
      <WorkoutHistory
        limit={5}
        showFilters={false}
        showTitle={true}
        compact={false}
        refreshTrigger={0}
      />
    );

    expect(
      screen.queryByPlaceholderText("Search workouts...")
    ).not.toBeInTheDocument();
  });
});
