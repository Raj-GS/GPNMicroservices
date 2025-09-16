import { render, screen, fireEvent, waitFor, createEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../pages/login";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import userEvent from "@testing-library/user-event";

// Mock navigate
const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

// Mock fetch globally
beforeAll(() => {
  global.fetch = jest.fn();
});

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
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

// Create a MUI theme that disables ripples
const theme = createTheme({
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
});

// Helper to render with ThemeProvider + Router
const renderWithProviders = (ui) =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>{ui}</MemoryRouter>
    </ThemeProvider>
  );

test("shows validation errors on empty form submit", async () => {
  renderWithProviders(<Login />);
  await userEvent.click(screen.getByRole("button", { name: /login/i }));
  expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  expect(screen.getByText(/password is required/i)).toBeInTheDocument();
});

test("shows error for invalid email format", async () => {
  renderWithProviders(<Login />);
  fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
    target: { value: "invalidemail" },
  });
  fireEvent.change(screen.getByTestId("password-input"), {
    target: { value: "123456" },
  });
  await userEvent.click(screen.getByRole("button", { name: /login/i }));
  expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument();
});

test("shows error for short password", async () => {
  renderWithProviders(<Login />);
  fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
    target: { value: "user@test.com" },
  });
  fireEvent.change(screen.getByTestId("password-input"), { target: { value: "123" } });
  await userEvent.click(screen.getByRole("button", { name: /login/i }));
  expect(screen.getByText(/password must be at least 6/i)).toBeInTheDocument();
});

test("successful login stores token and navigates", async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      token: "abc123",
      user: {
        role: "admin",
        first_name: "John",
        last_name: "Doe",
        origanisation: { org_name: "Org", logo: "logo.png" },
      },
    }),
  });

  renderWithProviders(<Login />);

  fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
    target: { value: "santoshi@naarsoft.com" },
  });
  fireEvent.change(screen.getByTestId("password-input"), {
    target: { value: "Santhoshi@93" },
  });

  await userEvent.click(screen.getByRole("button", { name: /login/i }));

  await waitFor(() => expect(localStorage.getItem("token")).toBe("abc123"));
  expect(mockedNavigate).toHaveBeenCalledWith("/admin/dashboard");
});

test("shows API error on failed login", async () => {
  fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ message: "Invalid credentials" }),
  });

  renderWithProviders(<Login />);
  fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
    target: { value: "santoshi@naarsoft.com" },
  });
  fireEvent.change(screen.getByTestId("password-input"), {
    target: { value: "Santhoshi@94" },
  });

  await userEvent.click(screen.getByRole("button", { name: /login/i }));

  expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
});

test("shows network error when fetch fails", async () => {
  fetch.mockRejectedValueOnce(new Error("Network error"));

  renderWithProviders(<Login />);
  fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
    target: { value: "santoshi@naarsoft.com" },
  });
  fireEvent.change(screen.getByTestId("password-input"), {
    target: { value: "Santhoshi@93" },
  });

  await userEvent.click(screen.getByRole("button", { name: /login/i }));

  expect(await screen.findByText(/network error/i)).toBeInTheDocument();
});

test("toggles password visibility", () => {
  renderWithProviders(<Login />);
  const passwordField = screen.getByTestId("password-input");
  const toggleButton = screen.getByLabelText(/toggle password visibility/i);

  expect(passwordField).toHaveAttribute("type", "password");

  fireEvent.click(toggleButton);
  expect(passwordField).toHaveAttribute("type", "text");
});

test("redirects to dashboard if token already exists", () => {
  localStorage.setItem("token", "abc123");
  renderWithProviders(<Login />);
  expect(mockedNavigate).toHaveBeenCalledWith("/admin/dashboard");
});

test("prevents default on password field mouse down", () => {
  renderWithProviders(<Login />);
  const toggleButton = screen.getByLabelText(/toggle password visibility/i);
  const event = createEvent.mouseDown(toggleButton);
  jest.spyOn(event, "preventDefault");
  fireEvent(toggleButton, event);
  expect(event.preventDefault).toHaveBeenCalled();
});
