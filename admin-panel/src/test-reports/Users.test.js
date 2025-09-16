// __tests__/Users.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Users from "../pages/Users";
import { useUser } from "../context/UserContext";

// ✅ Mock context
jest.mock("../context/UserContext", () => ({
  useUser: jest.fn(),
}));

// ✅ Mock PageLoader
jest.mock("../components/PageLoader", () => () => <div>Loading...</div>);

beforeEach(() => {
  jest.clearAllMocks();
  useUser.mockReturnValue({ user: { role: 1 } }); // admin
});

// ✅ Mock fetch for different endpoints
const mockFetch = (url) => {
  if (url.includes("roles-organizations")) {
    return Promise.resolve({
      ok: true,
      json: async () => ({ roles: [], organizations: [] }),
    });
  }

  if (url.includes("users-list")) {
    return Promise.resolve({
      ok: true,
      json: async () => ({
        users: [
          {
            id: 1,
            app_users: {
              first_name: "Lakshmi",
              last_name: "Monika",
              email: "monika@naarsoft.com",
            },
            origanisation: { org_name: "Ehow Secunderabad" },
            roles: { role: "User" },
            account_status: "Accepted",
          },
        ],
        total: 1,
        totalPages: 1,
      }),
    });
  }

  return Promise.resolve({ ok: true, json: async () => ({}) });
};

global.fetch = jest.fn(mockFetch);

test("renders User Management header", async () => {
  render(<Users />);

  await waitFor(() =>
    expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument()
  );

  expect(screen.getByText(/User Management/i)).toBeInTheDocument();
  expect(
    screen.getByText(/Manage user accounts, approvals/i)
  ).toBeInTheDocument();
});

test("renders table with no users message", async () => {
  // Override fetch to return empty users for this test
  global.fetch = jest.fn((url) => {
    if (url.includes("roles-organizations")) {
      return Promise.resolve({ ok: true, json: async () => ({ roles: [], organizations: [] }) });
    }
    if (url.includes("users-list")) {
      return Promise.resolve({ ok: true, json: async () => ({ users: [], total: 0, totalPages: 1 }) });
    }
    return Promise.resolve({ ok: true, json: async () => ({}) });
  });

  render(<Users />);

  await waitFor(() =>
    expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument()
  );

  expect(await screen.findByText(/No users found/i)).toBeInTheDocument();
});

test("renders table with user and allows select all", async () => {
  global.fetch = jest.fn((url) => {
  if (url.includes("roles-organizations")) {
    return Promise.resolve({
      ok: true,
      json: async () => ({ roles: [], organizations: [] }),
    });
  }
  if (url.includes("users-list")) {
    return Promise.resolve({
      ok: true,
      json: async () => ({
        users: [
          {
            id: 1,
            app_users: {
              first_name: "Lakshmi",
              last_name: "Monika",
              email: "monika@naarsoft.com",
            },
            origanisation: { org_name: "Ehow Secunderabad" },
            roles: { role: "User" },
            account_status: "Accepted",
          },
        ],
        total: 1,
        totalPages: 1,
      }),
    });
  }
  return Promise.resolve({
    ok: true,
    json: async () => ({}),
  });
});


  render(<Users />);

  // Wait for the table row to render
  await screen.findByText((content) =>
    content.includes("Lakshmi") && content.includes("Monika")
  );

  await screen.findByText("monika@naarsoft.com");
  await screen.findByText("Ehow Secunderabad");

  const checkboxes = await screen.findAllByRole("checkbox");
  fireEvent.click(checkboxes[0]); // select all
  checkboxes.forEach((cb) => expect(cb).toBeChecked());
});
