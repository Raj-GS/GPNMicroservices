import { render, screen, fireEvent, waitFor,act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ForgotPassword from "../pages/ForgotPassword";
import userEvent from "@testing-library/user-event";
import { createTheme, ThemeProvider } from "@mui/material/styles";

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

// Create MUI theme that disables all ripples in buttons
const theme = createTheme({
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
});

test("shows validation error on empty email", async () => {
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    </ThemeProvider>
  );

  await userEvent.click(screen.getByRole("button", { name: /send otp/i }));
  expect(screen.getByText(/email is required/i)).toBeInTheDocument();
});

test("shows error for invalid email format", async () => {
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    </ThemeProvider>
  );

  fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
    target: { value: "invalidemail" },
  });

  await userEvent.click(screen.getByRole("button", { name: /send otp/i }));
  expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument();
});

test("successful send OTP goes to step 2", async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ message: "OTP sent!" }),
  });

  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    </ThemeProvider>
  );

  fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
    target: { value: "user@example.com" },
  });

  await userEvent.click(screen.getByRole("button", { name: /send otp/i }));

  expect(await screen.findByText(/otp sent!/i)).toBeInTheDocument();
  expect(await screen.findByRole("button", { name: /verify otp/i })).toBeInTheDocument();
});

test("shows validation error on empty OTP", async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ message: "OTP sent!" }),
  });

  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    </ThemeProvider>
  );

  fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
    target: { value: "user@example.com" },
  });

  await userEvent.click(screen.getByRole("button", { name: /send otp/i }));

  const verifyButton = await screen.findByRole("button", { name: /verify otp/i });
  await userEvent.click(verifyButton);

  expect(await screen.findByText(/otp is required/i)).toBeInTheDocument();
});

test("successful verify OTP goes to step 3", async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ message: "OTP sent!" }),
  });

  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    </ThemeProvider>
  );

  fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
    target: { value: "user@example.com" },
  });
  await userEvent.click(screen.getByRole("button", { name: /send otp/i }));

  const verifyButton = await screen.findByRole("button", { name: /verify otp/i });

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ message: "OTP verified!" }),
  });

  fireEvent.change(screen.getByLabelText(/otp/i), { target: { value: "123456" } });
  await userEvent.click(verifyButton);

  expect(await screen.findByRole("button", { name: /reset password/i })).toBeInTheDocument();
});

test("shows error when passwords do not match", async () => {
  // Mock Send OTP and Verify OTP APIs
  fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ message: "OTP sent!" }) });
  fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ message: "OTP verified!" }) });

  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    </ThemeProvider>
  );

  // Step 1: Send OTP
  fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
    target: { value: "user@example.com" },
  });
  await userEvent.click(screen.getByRole("button", { name: /send otp/i }));

  // Step 2: Verify OTP
  const verifyButton = await screen.findByRole("button", { name: /verify otp/i });
  fireEvent.change(screen.getByLabelText(/otp/i), { target: { value: "123456" } });
  await userEvent.click(verifyButton);

  // Step 3: Wait for Reset Password form to appear
  const resetButton = await screen.findByRole("button", { name: /reset password/i });

  // Now fill passwords
  fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: "Password@123" } });
  fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "Mismatch@123" } });

  await userEvent.click(resetButton);

  expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
});


test("successful reset navigates to login", async () => {
  jest.useFakeTimers(); // handle setTimeout in navigate

  fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) }); // send OTP
  fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) }); // verify OTP
  fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) }); // reset password

  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    </ThemeProvider>
  );

  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
  await userEvent.click(screen.getByRole("button", { name: /send otp/i }));

// Step 2: Verify OTP
const otpInput = await screen.findByLabelText(/otp/i);
fireEvent.change(otpInput, { target: { value: "123456" } });

const verifyButton = await screen.findByRole("button", { name: /verify otp/i });
await userEvent.click(verifyButton);


const newPasswordInput = await screen.findByLabelText(/new password/i);
fireEvent.change(newPasswordInput, { target: { value: "Password@123" } });

const confirmPasswordInput = await screen.findByLabelText(/confirm password/i);
fireEvent.change(confirmPasswordInput, { target: { value: "Password@123" } });

const resetButton = await screen.findByRole("button", { name: /reset password/i });
// Use act to wrap async click + fetch resolution
await act(async () => {
  // Mock fetch for reset password
  fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
  await userEvent.click(resetButton);
});

// Advance timers for navigate
act(() => {
  jest.runAllTimers();
});

expect(await screen.findByText(/password reset successful/i)).toBeInTheDocument();
expect(mockedNavigate).toHaveBeenCalledWith("/login");

});