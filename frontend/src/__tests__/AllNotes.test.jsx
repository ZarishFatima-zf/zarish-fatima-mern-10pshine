import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import AllNotes from "../pages/AllNotes";

// Mock child components
vi.mock("../components/Sidebar", () => ({
  default: ({ onLogout }) => (
    <div data-testid="sidebar">
      <button onClick={onLogout}>Logout</button>
    </div>
  ),
}));

vi.mock("../components/NoteCard", () => ({
  default: ({ note, onDelete }) => (
    <div data-testid="note-card">
      <h3>{note.title}</h3>
      <p>{note.content}</p>
      <button onClick={onDelete}>Delete</button>
    </div>
  ),
}));

vi.mock("../components/Button", () => ({
  default: ({ onClick, children }) => (
    <button data-testid="add-btn" onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("axios");

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

describe("AllNotes Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders header and basic UI elements", async () => {
    localStorage.setItem("user", JSON.stringify({ id: "user123" }));
    axios.get.mockResolvedValue({ data: { notes: [] } });

    render(
      <MemoryRouter>
        <AllNotes />
      </MemoryRouter>
    );

    expect(await screen.findByText("All Notes")).toBeInTheDocument();
    expect(
      screen.getByText("Your personal space for everything you add & track.")
    ).toBeInTheDocument();
    expect(screen.getByText("Total Notes:")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  it("fetches and displays notes", async () => {
    localStorage.setItem("user", JSON.stringify({ id: "u1" }));
    axios.get.mockResolvedValue({
      data: {
        notes: [
          { _id: "1", title: "Note A", content: "Content A", createdAt: new Date() },
          { _id: "2", title: "Note B", content: "Content B", createdAt: new Date() },
        ],
      },
    });

    render(
      <MemoryRouter>
        <AllNotes />
      </MemoryRouter>
    );

    expect(await screen.findByText("Note A")).toBeInTheDocument();
    expect(screen.getAllByTestId("note-card")).toHaveLength(2);
  });

  it("filters notes by search", async () => {
    localStorage.setItem("user", JSON.stringify({ id: "u2" }));
    axios.get.mockResolvedValue({
      data: {
        notes: [
          { _id: "1", title: "Meeting", content: "Plan the week", createdAt: new Date() },
          { _id: "2", title: "Shopping", content: "Buy milk", createdAt: new Date() },
        ],
      },
    });

    render(
      <MemoryRouter>
        <AllNotes />
      </MemoryRouter>
    );

    await screen.findByText("Meeting");
    const searchInput = screen.getByPlaceholderText("Search notes...");
    fireEvent.change(searchInput, { target: { value: "Shop" } });

    await waitFor(() => {
      expect(screen.getByText("Shopping")).toBeInTheDocument();
    });
  });

  it("deletes a note when delete button clicked", async () => {
    localStorage.setItem("user", JSON.stringify({ id: "u3" }));
    axios.get.mockResolvedValue({
      data: {
        notes: [{ _id: "n1", title: "Delete Me", content: "test", createdAt: new Date() }],
      },
    });
    axios.delete.mockResolvedValue({});

    render(
      <MemoryRouter>
        <AllNotes />
      </MemoryRouter>
    );

    const deleteBtn = await screen.findByText("Delete");
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText("Delete Me")).not.toBeInTheDocument();
    });
  });

  it("shows 'No notes found' when empty", async () => {
    localStorage.setItem("user", JSON.stringify({ id: "u4" }));
    axios.get.mockResolvedValue({ data: { notes: [] } });

    render(
      <MemoryRouter>
        <AllNotes />
      </MemoryRouter>
    );

    expect(await screen.findByText("No notes found.")).toBeInTheDocument();
  });

  it("navigates to /noteeditor when + button clicked", async () => {
    localStorage.setItem("user", JSON.stringify({ id: "u5" }));
    axios.get.mockResolvedValue({ data: { notes: [] } });

    render(
      <MemoryRouter>
        <AllNotes />
      </MemoryRouter>
    );

    const addBtn = await screen.findByTestId("add-btn");
    fireEvent.click(addBtn);

    expect(mockNavigate).toHaveBeenCalledWith("/noteeditor");
  });
});
