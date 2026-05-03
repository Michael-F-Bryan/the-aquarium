import { cleanup, render, screen } from "@testing-library/react";
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
});
