import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest"; // <-- use vi instead of jest
import Sidebar from "../components/Sidebar";

describe("Sidebar Component", () => {
  it("renders all menu items and calls logout", () => {
    const onLogout = vi.fn(); // <-- vi.fn() instead of jest.fn()
    
    render(
      <BrowserRouter>
        <Sidebar onLogout={onLogout} />
      </BrowserRouter>
    );

    // Check menu items
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Add Note")).toBeInTheDocument();
    expect(screen.getByText("All Notes")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();

    // Click logout button
    fireEvent.click(screen.getAllByText("Logout")[0]);
    expect(onLogout).toHaveBeenCalled();
  });
});
