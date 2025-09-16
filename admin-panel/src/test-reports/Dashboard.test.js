// src/test-reports/Dashboard.test.js
import React from "react";
import { render, screen, within, waitFor,fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event"; // ✅ Add this
import Dashboard from "../pages/Dashboard";
import { useUser } from "../context/UserContext";
import { MemoryRouter } from "react-router-dom";


// ----------------------
// ✅ Mock PageLoader
// ----------------------
jest.mock("../components/PageLoader", () => {
  return function MockPageLoader(props) {
    return props.open ? <div role="progressbar">Loading...</div> : null;
  };
});

// ----------------------
// ✅ Mock useUser
// ----------------------
jest.mock("../context/UserContext", () => ({
  useUser: jest.fn(),
}));

// ----------------------
// ✅ Mock ResizeObserver
// ----------------------
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserver;

// ----------------------
// ✅ Mock Recharts
// ----------------------
jest.mock("recharts", () => {
  const React = require("react");
  return {
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
    BarChart: ({ children }) => <div>{children}</div>,
    CartesianGrid: () => <div />,
    XAxis: () => <div />,
    YAxis: () => <div />,
    Tooltip: () => <div />,
    Legend: () => <div />,
    Bar: () => <div />,
  };
});

// Suppress noisy warnings unrelated to ripple
beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation((msg, ...args) => {
    if (
      typeof msg === "string" &&
      (msg.includes("React Router Future Flag Warning") ||
       msg.includes("ReactDOM.render is no longer supported") ||
       msg.includes("validateDOMNesting"))
    ) {
      return;
    }
    console.warn(msg, ...args);
  });
});

// ----------------------
// ✅ Mock fetch
// ----------------------
beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      data: {
        counts: {
          totalUsers: 100,
          totalOrganizations: 20,
          approvedPrayers: 50,
          pendingPrayers: 5,
        },
        recent: {
          recentPrayers: [],
          recentTestimonies: [],
          recentSpecialPrayerSubscriptions: [],
        },
        categories: [],
        orgDetails: { short_code: "ORG1" },
        report: {},
      },
    }),
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

// ----------------------
// ✅ Test: Loader visible while fetching
// ----------------------
test("shows loader while fetching data", async () => {
  useUser.mockReturnValue({ user: { role: 2 } });

  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  // Loader should appear
  expect(await screen.findByRole("progressbar")).toBeInTheDocument();

  // Wait for fetch to finish
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
});

// ----------------------
// ✅ Test: Renders summary cards for role 2
// ----------------------
test("renders summary cards for role 2", async () => {
  useUser.mockReturnValue({ user: { role: 2 } });

  // Mock fetch to return sample counts
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      data: {
        counts: {
          totalUsers: 18,
          approvedPrayers: 31,
          pendingPrayers: 2,
        },
        recent: { recentPrayers: [], recentTestimonies: [], recentSpecialPrayerSubscriptions: [] },
         categories: [{ id: 1, name: "Test Category" }],
        orgDetails: { short_code: "6KAO-nrdu" },
        report: {},
      },
    }),
  });

  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  await waitFor(() => {
    // Total Users card
    const usersCard = screen.getByText(/total users/i);
    expect(within(usersCard.closest(".card")).getByRole("link")).toHaveTextContent("18");

    // Active Prayers card
    const activeCard = screen.getByText(/active prayers/i);
    expect(within(activeCard.closest(".card")).getByRole("link")).toHaveTextContent("31");

    // Pending Approvals card
    const pendingCard = screen.getByText(/pending approvals/i);
    expect(within(pendingCard.closest(".card")).getByRole("link")).toHaveTextContent("2");
  });
});


test("opens prayer submission dialog on quick action", async () => {
  useUser.mockReturnValue({ user: { role: 2 } });

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      data: {
        counts: {},
        recent: {},
        categories: [{ id: 1, name: "Test" }],
        report: {},
        orgDetails: {},
      },
    }),
  });

  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  const button = await screen.findByText("Add New Prayer");
  userEvent.click(button);

  expect(await screen.findByText(/submit prayer request/i)).toBeInTheDocument();
});