import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "./App";

afterEach(() => {
  cleanup();
});

describe("App shell", () => {
  it("renders README-aligned chrome regions", () => {
    render(<App />);
    expect(screen.getByRole("banner", { name: /aquarium controls/i })).toBeTruthy();
    expect(screen.getByRole("complementary", { name: /simulation overview and tuning/i })).toBeTruthy();
    expect(screen.getByRole("main", { name: /aquarium tank/i })).toBeTruthy();
    expect(screen.getByRole("complementary", { name: /fish and event details/i })).toBeTruthy();
    expect(screen.getByRole("region", { name: /toast notifications/i })).toBeTruthy();
  });

  it("mounts the R3F tank scene container with a canvas", () => {
    const { container } = render(<App />);
    expect(screen.getByTestId("tank-scene-root")).toBeTruthy();
    expect(container.querySelector("canvas")).toBeTruthy();
  });

  it("enforces responsive shell sizing contract for the tank stage", () => {
    const { container } = render(<App />);
    const shellRoot = container.firstElementChild as HTMLElement | null;
    const shellGrid = screen.getByTestId("app-shell-grid");
    const tankSceneRoot = screen.getByTestId("tank-scene-root");

    expect(shellRoot).toBeTruthy();
    expect(shellRoot?.className).toContain("h-dvh");
    expect(shellGrid.className).toContain("lg:grid-cols-[18rem_minmax(0,1fr)_20rem]");
    expect(shellGrid.className).toContain("grid-cols-1");
    expect(tankSceneRoot.className).toContain("h-full");
    expect(tankSceneRoot.className).toContain("min-h-0");
  });

  it("shows the simulation day counter in the HUD", () => {
    render(<App />);
    expect(screen.getAllByRole("status", { name: /current simulation day,\s*1/i }).length).toBeGreaterThan(0);
  });

  it("shows the toast log panel in the HUD", () => {
    render(<App />);
    expect(screen.getByRole("log", { name: /event log/i })).toBeTruthy();
  });

  it("shows paused status after toggling pause and hides it on resume", () => {
    render(<App />);
    expect(screen.queryByRole("status", { name: /simulation paused/i })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /pause simulation/i }));
    expect(screen.getByRole("status", { name: /simulation paused/i })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /resume simulation/i }));
    expect(screen.queryByRole("status", { name: /simulation paused/i })).toBeNull();
  });

  it("toggles pause when pressing Escape", () => {
    render(<App />);
    expect(screen.queryByRole("status", { name: /simulation paused/i })).toBeNull();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.getByRole("status", { name: /simulation paused/i })).toBeTruthy();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("status", { name: /simulation paused/i })).toBeNull();
  });
});
