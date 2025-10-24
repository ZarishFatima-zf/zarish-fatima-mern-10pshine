import '@testing-library/jest-dom'; // 👈 enables toBeInTheDocument etc.

// Optional: silence React Router warnings
beforeAll(() => {
  vi.spyOn(console, "warn").mockImplementation((msg) => {
    if (
      msg.includes("React Router Future Flag Warning") ||
      msg.includes("Relative route resolution within Splat")
    )
      return;
    console.warn(msg);
  });
});
