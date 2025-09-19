import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import PrayerCategoryList from "../pages/SpecialPrayerCategory";
import { useUser } from "../context/UserContext";

jest.mock("../context/UserContext", () => ({
  useUser: jest.fn(),
}));

jest.mock("../components/PageLoader", () => () => <div>Loading...</div>);

beforeEach(() => {
  jest.clearAllMocks();
  useUser.mockReturnValue({ user: { role: 1 } });

  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: async () => ({
        data: {
          categories: [
            {
              id: "28",
              name: "Super Admin Category2",
              deleted_at: null,
              created_at: "2024-12-05T14:15:48.000Z",
              status: "active",
              origanisation: null,
              _count: { pray_requests: 1 },
            },
            {
              id: "26",
              name: "Super Admin Category4",
              deleted_at: null,
              created_at: "2024-11-15T06:09:47.000Z",
              status: "active",
              origanisation: null,
              _count: { pray_requests: 11 },
            },
          ],
          organisations: [],
          totalPages: 1,
        },
      }),
    })
  );
});


global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({
      data: {
        categories: [
          {
            id: "28",
            name: "Super Admin Category2",
            deleted_at: null,
            created_at: "2024-12-05T14:15:48.000Z",
            status: "active",
            origanisation: null,
            _count: { pray_requests: 1 },
          },
          {
            id: "26",
            name: "Super Admin Category4",
            deleted_at: null,
            created_at: "2024-11-15T06:09:47.000Z",
            status: "active",
            origanisation: null,
            _count: { pray_requests: 11 },
          },
        ],
        organisations: [],
        totalPages: 1,
      },
    }),
  })
);

test("renders PrayerCategoryList with categories", async () => {
  render(<PrayerCategoryList />);

  // Wait for loader to disappear
  await waitFor(() =>
    expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument()
  );

  // Wait for category rows to appear
  expect(await screen.findByText(/Super Admin Category2/i)).toBeInTheDocument();
  expect(await screen.findByText(/Super Admin Category4/i)).toBeInTheDocument();
});



test("opens add category dialog on button click", async () => {
  render(<PrayerCategoryList />);

  await waitFor(() =>
    expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument()
  );

  // Click the "Add Category" button
  fireEvent.click(screen.getByText(/Add Category/i, { selector: 'button' }));

  // Scope queries to the dialog
  const dialog = screen.getByRole("dialog");
  const { getByText, getByLabelText } = within(dialog);

  expect(getByText(/Add Category/i)).toBeInTheDocument(); // dialog title
  expect(getByLabelText(/Category Name/i)).toBeInTheDocument();
});

test("opens edit category dialog when edit icon clicked", async () => {
  render(<PrayerCategoryList />);

  // 1️⃣ Wait for the row with the category
  const row = await screen.findByText("Super Admin Category2");

  // 2️⃣ Get the table row container (closest tr)
  const tableRow = row.closest("tr");

  // 3️⃣ Scope queries to this specific row
  const rowQueries = within(tableRow);

  // 4️⃣ Find the edit button only inside this row
  const editButton = rowQueries.getByLabelText("edit category");

  // 5️⃣ Click it
  fireEvent.click(editButton);

  // 6️⃣ Scope queries to the dialog
  const dialog = screen.getByRole("dialog");
  const dialogQueries = within(dialog);

  expect(dialogQueries.getByText(/Edit Category/i)).toBeInTheDocument();
  expect(dialogQueries.getByDisplayValue("Super Admin Category2")).toBeInTheDocument();
});


test("search input updates state", async () => {
  render(<PrayerCategoryList />);

  // ✅ Wait for a category from the mock data
  await screen.findByText("Super Admin Category2");

  // ✅ Get the search input
  const searchInput = screen.getByPlaceholderText(/Search categories by name/i);

  // ✅ Fire change event
  fireEvent.change(searchInput, { target: { value: "Deliverance" } });

  // ✅ Assert the value updated
  expect(searchInput.value).toBe("Deliverance");
});

test("pagination renders correctly", async () => {
  render(<PrayerCategoryList />);

  // ✅ Wait for a category from the mocked API
  await screen.findByText("Super Admin Category2");

  // ✅ Check pagination buttons
  expect(screen.getByRole("button", { name: /1/i })).toBeInTheDocument();
});
