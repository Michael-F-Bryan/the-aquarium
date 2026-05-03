import { describe, expect, it } from "vitest";
import { createNewRunSimulationWorld } from "./newRunWorld";
import { foodWithPosition, registerFood } from "./world";
import { MIN_FOOD_SPACING, clampFoodDropPosition, tryDropFoodAt } from "./dropFood";

describe("tryDropFoodAt", () => {
  it("rejects when paused and does not add food", () => {
    const world = createNewRunSimulationWorld();
    const before = [...foodWithPosition(world)].length;
    const result = tryDropFoodAt(world, {
      paused: true,
      simDays: 1,
      pickPosition: { x: 0, y: 0, z: 0 },
    });
    expect(result).toEqual({ ok: false, reason: "paused" });
    expect([...foodWithPosition(world)]).toHaveLength(before);
  });

  it("spawns food at clamped position when valid", () => {
    const world = createNewRunSimulationWorld();
    const result = tryDropFoodAt(world, {
      paused: false,
      simDays: 0.25,
      pickPosition: { x: 1, y: 0.2, z: -1 },
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const foods = [...foodWithPosition(world)];
    expect(foods).toHaveLength(1);
    expect(foods[0]!.food.spawnedAtSimDays).toBeCloseTo(0.25, 10);
    expect(foods[0]!.position).toEqual(result.position);
  });

  it("rejects a second flake too close to an existing one", () => {
    const world = createNewRunSimulationWorld();
    registerFood(world, {
      food: { spawnedAtSimDays: 0 },
      position: { x: 0, y: 0.2, z: 0 },
    });
    const result = tryDropFoodAt(world, {
      paused: false,
      simDays: 0.1,
      pickPosition: {
        x: MIN_FOOD_SPACING * 0.5,
        y: 0.2,
        z: 0,
      },
    });
    expect(result).toEqual({ ok: false, reason: "too_close_to_existing_food" });
    expect([...foodWithPosition(world)]).toHaveLength(1);
  });

  it("accepts a second flake beyond minimum spacing", () => {
    const world = createNewRunSimulationWorld();
    registerFood(world, {
      food: { spawnedAtSimDays: 0 },
      position: { x: 0, y: 0.2, z: 0 },
    });
    const result = tryDropFoodAt(world, {
      paused: false,
      simDays: 0.1,
      pickPosition: {
        x: MIN_FOOD_SPACING * 1.1,
        y: 0.2,
        z: 0,
      },
    });
    expect(result.ok).toBe(true);
    expect([...foodWithPosition(world)]).toHaveLength(2);
  });
});

describe("clampFoodDropPosition", () => {
  it("clamps out-of-range picks into the starter volume", () => {
    const clamped = clampFoodDropPosition({ x: 100, y: 100, z: 100 });
    expect(clamped.x).toBeLessThanOrEqual(5.5);
    expect(clamped.y).toBeLessThanOrEqual(1.35);
    expect(clamped.z).toBeLessThanOrEqual(3.5);
    expect(clamped.x).toBeGreaterThanOrEqual(-5.5);
    expect(clamped.y).toBeGreaterThanOrEqual(-0.82);
    expect(clamped.z).toBeGreaterThanOrEqual(-3.5);
  });
});
