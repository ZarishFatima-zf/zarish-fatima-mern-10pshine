import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Settings from "../pages/Setting";

// ✅ Mock Sidebar
vi.mock("../components/Sidebar", () => ({
  default: ({ onLogout }) => (
    <div data-testid="mock-sidebar">
      <button onClick={onLogout}>Logout</button>
    </div>
  ),
}));

// ✅ Mock Button
vi.mock("../components/Button", () => ({
  default: ({ children, ...props }) => (
    <button {...props}>{children}</button>
  ),
}));

// ✅ Mock FormField
vi.mock("../components/FormField", () => ({
  default: ({ label, name, type, placeholder, formik }) => (
    <div>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={formik.values[name]}
        onChange={formik.handleChange}
      />
      {formik.errors[name] && formik.touched[name] && (
        <div>{formik.errors[name]}</div>
      )}
    </div>
  ),
}));

describe("Settings Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window.localStorage.__proto__, "getItem").mockReturnValue("123");
    vi.spyOn(window.localStorage.__proto__, "removeItem").mockImplementation(() => {});
  });

  test("renders settings heading and form fields", async () => {
    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );

    expect(screen.getByText(/settings/i)).toBeInTheDocument();

    expect(screen.getByPlaceholderText(/enter old password/i)).toBeInTheDocument();

    // ✅ Fix duplicate placeholder issue
    const newPasswordInputs = screen.getAllByPlaceholderText(/new password/i);
    expect(newPasswordInputs.length).toBeGreaterThan(0);

    // ✅ Specifically check confirm password field separately
    expect(
      screen.getByPlaceholderText(/re-enter new password/i)
    ).toBeInTheDocument();
  });

  test("shows validation errors when submitting empty form", async () => {
    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText(/change password/i));

    await waitFor(() => {
      expect(screen.getByText(/old password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/new password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/confirm password is required/i)).toBeInTheDocument();
    });
  });

  test("opens and closes delete confirmation modal", async () => {
    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );

    // ✅ Use getAllByText to avoid "multiple matches" error
    const deleteButtons = screen.getAllByText(/delete account/i);
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);

    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/cancel/i));

    await waitFor(() =>
      expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument()
    );
  });

  test("calls handleLogout when logout clicked from sidebar", () => {
    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText(/logout/i));
    expect(localStorage.removeItem).toHaveBeenCalled();
  });
});
