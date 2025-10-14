import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Profile from "../pages/Profile";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";

// Mock axios and navigate
vi.mock("axios");
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const mockUser = {
  id: "123",
  fullName: "Test User",
  email: "test@example.com",
  image: null,
};

describe("Profile Component", () => {
  beforeEach(() => {
    localStorage.setItem("user", JSON.stringify(mockUser));
    axios.get.mockResolvedValue({ data: mockUser });
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const renderProfile = () =>
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

  test("renders Profile heading correctly", async () => {
    renderProfile();
    // More specific heading match to avoid sidebar duplication
    const heading = await screen.findByRole("heading", { name: /profile/i });
    expect(heading).toBeInTheDocument();
  });

  test("renders full name and email", async () => {
    renderProfile();
    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
      expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
    });
  });

  test("enables editing when Edit Profile clicked", async () => {
    renderProfile();

    const editButton = await screen.findByText((text) => text.includes("Edit Profile"));
    fireEvent.click(editButton);

    await waitFor(() => {
      const saveButton = screen.getByText((text) => text.includes("Save"));
      const cancelButton = screen.getByText((text) => text.includes("Cancel"));
      expect(saveButton).toBeInTheDocument();
      expect(cancelButton).toBeInTheDocument();
    });
  });

  test("calls axios.put when Save is clicked", async () => {
    axios.put.mockResolvedValue({
      data: { user: { ...mockUser, fullName: "Updated User" } },
    });

    renderProfile();

    const editButton = await screen.findByText((text) => text.includes("Edit Profile"));
    fireEvent.click(editButton);

    const nameInput = screen.getByDisplayValue("Test User");
    fireEvent.change(nameInput, { target: { value: "Updated User" } });

    const saveButton = screen.getByText((text) => text.includes("Save"));
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalled();
    });
  });

  test("shows cancel button and restores backup on cancel", async () => {
    renderProfile();

    const editButton = await screen.findByText((text) => text.includes("Edit Profile"));
    fireEvent.click(editButton);

    const nameInput = screen.getByDisplayValue("Test User");
    fireEvent.change(nameInput, { target: { value: "Changed Name" } });

    const cancelButton = screen.getByText((text) => text.includes("Cancel"));
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });
  });
});
