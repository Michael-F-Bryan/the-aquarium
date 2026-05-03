import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ToastLogShell } from "./ToastLogShell";

afterEach(() => {
  cleanup();
});

describe("ToastLogShell", () => {
  it("renders a toast log panel for HUD use", () => {
    render(<ToastLogShell entries={[]} />);
    expect(screen.getByRole("log", { name: /event log/i })).toBeTruthy();
  });

  it("lists entries in append order (oldest first, newest last)", () => {
    render(
      <ToastLogShell
        entries={[
          { id: "1", message: "First toast" },
          { id: "2", message: "Second toast" },
          { id: "3", message: "Third toast" },
        ]}
      />,
    );
    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(3);
    expect(rows[0]?.textContent).toContain("First toast");
    expect(rows[1]?.textContent).toContain("Second toast");
    expect(rows[2]?.textContent).toContain("Third toast");
  });

  it("uses a scrollable container so overflow is handled gracefully", () => {
    render(<ToastLogShell entries={[]} />);
    const log = screen.getByRole("log", { name: /event log/i });
    const classes = log.className;
    expect(classes.includes("max-h-48")).toBe(true);
    expect(classes.includes("overflow-y-auto")).toBe(true);
  });
});
