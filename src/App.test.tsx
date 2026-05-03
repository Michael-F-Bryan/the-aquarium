import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App shell", () => {
  it("renders the application title so the shell boots visibly", () => {
    render(<App />);
    expect(screen.getByText("The Aquarium")).toBeTruthy();
  });
});
