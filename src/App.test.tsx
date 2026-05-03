import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "./App";

afterEach(() => {
  cleanup();
});

describe("App shell", () => {
  it("renders the application title so the shell boots visibly", () => {
    render(<App />);
    expect(screen.getByText("The Aquarium")).toBeTruthy();
  });

  it("mounts the R3F tank scene container with a canvas", () => {
    const { container } = render(<App />);
    expect(screen.getByTestId("tank-scene-root")).toBeTruthy();
    expect(container.querySelector("canvas")).toBeTruthy();
  });

  it("shows paused status after toggling pause and hides it on resume", () => {
    render(<App />);
    expect(screen.queryByRole("status", { name: /simulation paused/i })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /pause simulation/i }));
    expect(screen.getByRole("status", { name: /simulation paused/i })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /resume simulation/i }));
    expect(screen.queryByRole("status", { name: /simulation paused/i })).toBeNull();
  });
});
