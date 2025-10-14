import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import axios from "axios";

// ✅ Mocks
vi.mock("axios");

// Mock Sidebar
vi.mock("../components/Sidebar", () => ({
  default: ({ onLogout }) => (
    <div data-testid="sidebar">
      <button onClick={onLogout}>Logout</button>
    </div>
  ),
}));

// Mock NoteCard
vi.mock("../components/NoteCard", () => ({
  default: ({ note, onDelete, onEdit }) => (
    <div data-testid="note-card">
      <p>{note.title}</p>
      <button onClick={() => onEdit(note._id)}>Edit</button>
      <button onClick={() => onDelete(note._id)}>Delete</button>
    </div>
  ),
}));

// Mock Button
vi.mock("../components/Button", () => ({
  default: ({ onClick, children }) => (
    <button onClick={onClick} data-testid="mock-button">
      {children}
    </button>
  ),
}));

// ✅ Define mockNavigate here (outside test hooks)
const mockNavigate = vi.fn();

// ✅ Mock react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

describe("Dashboard Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem(
      "user",
      JSON.stringify({ id: "123", fullName: "Test User" })
    );
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("renders welcome text and user name", async () => {
    axios.get.mockResolvedValueOnce({ data: { notes: [] } });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(await screen.findByText(/welcome to notezy/i)).toBeInTheDocument();
    expect(screen.getByText(/test user/i)).toBeInTheDocument();
  });

  test("shows 'No notes found' when no notes exist", async () => {
    axios.get.mockResolvedValueOnce({ data: { notes: [] } });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(await screen.findByText(/no notes found/i)).toBeInTheDocument();
  });

  test("renders notes when fetched successfully", async () => {
    axios.get.mockResolvedValueOnce({
      data: { notes: [{ _id: "1", title: "Test Note", createdAt: "2025-10-10" }] },
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(await screen.findByText("Test Note")).toBeInTheDocument();
  });

  test("handles note deletion", async () => {
    axios.get.mockResolvedValueOnce({
      data: { notes: [{ _id: "1", title: "Delete Me", createdAt: "2025-10-10" }] },
    });
    axios.delete.mockResolvedValueOnce({});

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    const deleteBtn = await screen.findByText("Delete");
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalled();
    });
  });

  test("navigates when edit and add buttons are clicked", async () => {
    axios.get.mockResolvedValueOnce({
      data: { notes: [{ _id: "1", title: "Edit Me", createdAt: "2025-10-10" }] },
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    const editBtn = await screen.findByText("Edit");
    fireEvent.click(editBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/editor/1");

    const addBtn = screen.getByTestId("mock-button");
    fireEvent.click(addBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/noteeditor");
  });
});
