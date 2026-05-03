import { describe, expect, test } from "vitest";
import { createFloorTextureCanvas, getFishPalette, getFoodFlakeColor } from "./tankArtDirection";

describe("getFishPalette", () => {
  test("uses species palette as baseline", () => {
    const herbivore = getFishPalette({ kind: "herbivore" }, "healthy");
    const carnivore = getFishPalette({ kind: "carnivore" }, "healthy");
    expect(herbivore.body).toBe("#6bc0dd");
    expect(carnivore.body).toBe("#d67667");
  });

  test("darkens fish colors as hunger worsens", () => {
    const healthy = getFishPalette({ kind: "herbivore" }, "healthy");
    const starving = getFishPalette({ kind: "herbivore" }, "starving");
    expect(starving.body).not.toBe(healthy.body);
    expect(starving.fin).not.toBe(healthy.fin);
  });
});

describe("getFoodFlakeColor", () => {
  test("cycles through deterministic color choices", () => {
    expect(getFoodFlakeColor(0)).toBe("#dcb775");
    expect(getFoodFlakeColor(3)).toBe("#be8850");
    expect(getFoodFlakeColor(4)).toBe("#dcb775");
  });
});

describe("createFloorTextureCanvas", () => {
  test("creates a square canvas with requested size", () => {
    const canvas = createFloorTextureCanvas(192);
    expect(canvas.width).toBe(192);
    expect(canvas.height).toBe(192);
  });
});
