import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ScorePlaceholder } from "./ScorePlaceholder";

afterEach(() => {
  cleanup();
});

describe("ScorePlaceholder", () => {
  it("renders the score label and a placeholder value without a simulation provider", () => {
    render(<ScorePlaceholder />);
    const region = screen.getByRole("status", { name: /score/i });
    expect(region.textContent).toMatch(/Score/i);
    expect(region.textContent).toContain("—");
  });
});
