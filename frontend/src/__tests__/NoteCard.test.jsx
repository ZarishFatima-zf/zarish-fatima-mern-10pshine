import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import NoteCard from "../components/NoteCard";

// 🧠 Step 1: Create a mock navigate function
const mockNavigate = vi.fn();

// 🧠 Step 2: Mock react-router-dom BEFORE imports useNavigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate, // ✅ fixed mock
  };
});

describe("NoteCard Component", () => {
  const mockDelete = vi.fn();

  const note = {
    _id: "1",
    title: "Test Note",
    content: "<p>This is a short note content.</p>",
    updatedAt: "2025-10-14T12:00:00Z",
    url: "https://example.com",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders note title, content, and URL", () => {
    render(
      <MemoryRouter>
        <NoteCard note={note} onDelete={mockDelete} />
      </MemoryRouter>
    );

    expect(screen.getByText("Test Note")).toBeInTheDocument();
    expect(screen.getByText("This is a short note content.")).toBeInTheDocument();
    expect(screen.getByText("https://example.com")).toBeInTheDocument();
  });

  test("calls navigate when edit button is clicked", () => {
    render(
      <MemoryRouter>
        <NoteCard note={note} onDelete={mockDelete} />
      </MemoryRouter>
    );

    const editButton = screen.getAllByRole("button")[0];
    fireEvent.click(editButton);
    expect(mockNavigate).toHaveBeenCalledWith(`/editor/${note._id}`, { state: { note } });
  });

  test("calls onDelete when delete button is clicked", () => {
    render(
      <MemoryRouter>
        <NoteCard note={note} onDelete={mockDelete} />
      </MemoryRouter>
    );

    const deleteButton = screen.getAllByRole("button")[1];
    fireEvent.click(deleteButton);
    expect(mockDelete).toHaveBeenCalledWith(note._id);
  });

  test("shows Read More button when content is long", async () => {
    const longNote = {
      ...note,
      content: "<p>" + "a".repeat(200) + "</p>",
    };

    render(
      <MemoryRouter>
        <NoteCard note={longNote} onDelete={mockDelete} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/read more/i)).toBeInTheDocument();
    });
  });

  test("opens and closes modal when Read More is clicked", async () => {
    const longNote = {
      ...note,
      content: "<p>" + "a".repeat(200) + "</p>",
    };

    render(
      <MemoryRouter>
        <NoteCard note={longNote} onDelete={mockDelete} />
      </MemoryRouter>
    );

    const readMoreButton = await screen.findByText(/read more/i);
    fireEvent.click(readMoreButton);

expect(screen.getAllByText("Test Note")[0]).toBeInTheDocument();

    /// Close modal
const closeButton = screen.getAllByRole("button").find((btn) =>
  btn.className.includes("absolute top-4 right-4")
);
expect(closeButton).toBeInTheDocument();
fireEvent.click(closeButton);
  });

  test("renders formatted date", () => {
    render(
      <MemoryRouter>
        <NoteCard note={note} onDelete={mockDelete} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Oct/i)).toBeInTheDocument();
  });
});
