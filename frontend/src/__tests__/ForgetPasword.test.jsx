import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, useParams } from "react-router-dom";
import { vi } from "vitest";
import ForgetPassword from "../components/ForgetPassword";

// 🧩 mock navigate and useParams
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: vi.fn(),
  };
});

global.fetch = vi.fn();

describe("ForgetPassword Component", () => {
  beforeEach(() => {
    fetch.mockReset();
    vi.mocked(useParams).mockReturnValue({ token: undefined });
  });

  // 🧪 Forgot Password Page Tests
  test("renders email input in forgot password mode", () => {
    render(
      <MemoryRouter>
        <ForgetPassword />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeInTheDocument();
  });

  test("shows validation error for empty email", async () => {
    render(
      <MemoryRouter>
        <ForgetPassword />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  test("submits valid email and shows success message", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Reset link sent" }),
    });

    render(
      <MemoryRouter>
        <ForgetPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "test@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/reset link sent/i)).toBeInTheDocument();
    });
  });

  // 🧪 Reset Password Page Tests
  test("renders password input in reset password mode", () => {
    vi.mocked(useParams).mockReturnValue({ token: "123abc" });

    render(
      <MemoryRouter>
        <ForgetPassword />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/enter new password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset password/i })).toBeInTheDocument();
  });

  test("shows password validation error for weak password", async () => {
    vi.mocked(useParams).mockReturnValue({ token: "123abc" });

    render(
      <MemoryRouter>
        <ForgetPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/enter new password/i), {
      target: { value: "abc" },
    });

    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/password must be at least 6 characters/i)
      ).toBeInTheDocument();
    });
  });

  test("submits valid new password and shows success message", async () => {
    vi.mocked(useParams).mockReturnValue({ token: "123abc" });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Password reset successful" }),
    });

    render(
      <MemoryRouter>
        <ForgetPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/enter new password/i), {
      target: { value: "StrongPass1" },
    });

    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(screen.getByText(/password reset successful/i)).toBeInTheDocument();
    });
  });
});
