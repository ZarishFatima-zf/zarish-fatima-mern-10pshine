// src/__tests__/NoteEditor.test.jsx
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, vi, beforeEach } from "vitest";
import NoteEditor from "../pages/NoteEditor";
import { BrowserRouter } from "react-router-dom";

// ✅ Mock react-router-dom useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ noteId: "123" }),
    useLocation: () => ({ state: null }),
  };
});

// ✅ Mock @emoji-mart/react Picker
vi.mock("@emoji-mart/react", () => {
  return {
    default: ({ onEmojiSelect }) => {
      return <div data-testid="emoji-picker">Emoji Picker Mock</div>;
    },
  };
});

describe("NoteEditor Component", () => {
  beforeEach(() => {
    localStorage.clear(); // Reset localStorage before each test
  });

  it("renders correctly with 'New Note'", () => {
    render(
      <BrowserRouter>
        <NoteEditor />
      </BrowserRouter>
    );
    expect(screen.getByPlaceholderText("Note title...")).toBeInTheDocument();
    expect(screen.getByText("New Note")).toBeInTheDocument();
    expect(screen.getByText("Save Note")).toBeInTheDocument();
  });

  it("shows notification when saving without login", async () => {
    render(
      <BrowserRouter>
        <NoteEditor />
      </BrowserRouter>
    );

    await act(async () => {
      fireEvent.click(screen.getByText("Save Note"));
    });

    expect(await screen.findByText("⚠️ Please login first")).toBeInTheDocument();
  });

  it("toggles emoji picker", () => {
    render(
      <BrowserRouter>
        <NoteEditor />
      </BrowserRouter>
    );

    const emojiButton = screen.getByText("😀");
    fireEvent.click(emojiButton);

    expect(screen.getByTestId("emoji-picker")).toBeInTheDocument();
  });

  it("updates title input", () => {
    render(
      <BrowserRouter>
        <NoteEditor />
      </BrowserRouter>
    );

    const titleInput = screen.getByPlaceholderText("Note title...");
    fireEvent.change(titleInput, { target: { value: "My Test Note" } });
    expect(titleInput.value).toBe("My Test Note");
  });
});
