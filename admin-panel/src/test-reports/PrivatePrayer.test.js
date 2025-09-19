/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import PrivatePrayers from "../pages/PrivatePrayers";
import { useUser } from '../context/UserContext';


// Mock useUser
jest.mock("../context/UserContext", () => ({
  useUser: jest.fn(),
}));

// Mock PageLoader
jest.mock("../components/PageLoader", () => () => <div>Loading...</div>);

// Mock fetch
global.fetch = jest.fn();

const mockCategoriesData = {
  data: {
    categories: [{ id: 1, name: "Health" }],
    organisations: [{ id: 1, org_name: "Org 1" }],
    activeprayerscount: 10,
    pendingprayerscount: 5,
    answeredprayerscount: 2,
    rejectedprayerscount: 1,
  },
};

const mockPrayerList = {
  data: [
    {
      id: 1,
      title: "Test Prayer",
      description: "Please pray for health",
      is_approved: "0",
      categories: { name: "Health" },
      app_users: { first_name: "John", last_name: "Doe" },
      created_at: "2025-09-18T10:00:00Z",
    },
  ],
  pagination: { totalPages: 1 },
};

describe("PrivatePrayers Component", () => {
  beforeEach(() => {
    useUser.mockReturnValue({ user: { role: 1 } });

    fetch.mockImplementation((url) => {
      if (url.includes("all-prayer-categories")) {
        return Promise.resolve({
          json: () => Promise.resolve(mockCategoriesData),
        });
      }
      if (url.includes("private-prayer-list")) {
        return Promise.resolve({
          json: () => Promise.resolve(mockPrayerList),
        });
      }
      if (url.includes("approve-prayer")) {
        return Promise.resolve({
          json: () => Promise.resolve({ status: 200 }),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

it("renders stat cards with correct counts", async () => {
  render(<PrivatePrayers />);

  await waitFor(() => {
    // Active
    const activeCard = screen.getByText("Active Prayers").closest("div");
    expect(within(activeCard).getByText("10")).toBeInTheDocument();

    // Pending
    const pendingCard = screen.getByText("Pending Prayers").closest("div");
    expect(within(pendingCard).getByText("5")).toBeInTheDocument();

    // Answered
    const answeredCard = screen.getByText("Answered Prayers").closest("div");
    expect(within(answeredCard).getByText("2")).toBeInTheDocument();

    // Cancelled
    const cancelledCard = screen.getByText("Cancelled Prayers").closest("div");
    expect(within(cancelledCard).getByText("1")).toBeInTheDocument();
  });
});

  it("renders prayer request card", async () => {
    render(<PrivatePrayers />);
    await waitFor(() => {
      expect(screen.getByText("Test Prayer")).toBeInTheDocument();
      expect(screen.getByText("Please pray for health")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Health")).toBeInTheDocument();
      expect(screen.getByText("Pending")).toBeInTheDocument();
    });
  });

  it("opens view prayer modal on click", async () => {
    render(<PrivatePrayers />);
    await waitFor(() => screen.getByLabelText("View"));

    fireEvent.click(screen.getByLabelText("View"));

    await waitFor(() => {
      expect(screen.getByText(/Title:/)).toBeInTheDocument();
      expect(screen.getByText(/Description:/)).toBeInTheDocument();
      expect(screen.getByText(/Category:/)).toBeInTheDocument();
    });
  });



  it("approves a pending prayer", async () => {
    render(<PrivatePrayers />);
    await waitFor(() => screen.getByLabelText("Approve"));
    fireEvent.click(screen.getByLabelText("Approve"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("approve-prayer"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: expect.any(String),
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({ id: 1, status: "1" }),
        })
      );
    });
  });

  it("changes page on pagination click", async () => {
    render(<PrivatePrayers />);
    await waitFor(() => screen.getByRole("button", { name: /1/i }));
    fireEvent.click(screen.getByRole("button", { name: /1/i }));
    expect(screen.getByRole("button", { name: /1/i })).toBeInTheDocument();
  });
});
