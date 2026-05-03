import { describe, expect, it } from "vitest";
import { createSimulationWorld, foodWithPosition, registerFood } from "../world";
import { FOOD_LIFETIME_SIM_DAYS, despawnExpiredFood } from "./despawnExpiredFood";

describe("despawnExpiredFood", () => {
  it("removes flakes that have reached the configured lifetime", () => {
    const world = createSimulationWorld();
    registerFood(world, { food: { spawnedAtSimDays: 1 }, position: { x: -1, y: 0.4, z: 0 } });
    registerFood(world, { food: { spawnedAtSimDays: 1.5 }, position: { x: 0, y: 0.4, z: 0 } });
    registerFood(world, { food: { spawnedAtSimDays: 1.5001 }, position: { x: 1, y: 0.4, z: 0 } });

    const removed = despawnExpiredFood(world, { simDays: 2 });

    expect(removed).toBe(2);
    const remaining = [...foodWithPosition(world)];
    expect(remaining).toHaveLength(1);
    expect(remaining[0]!.food.spawnedAtSimDays).toBeCloseTo(1.5001, 10);
  });

  it("uses a half-day lifetime per game rules", () => {
    expect(FOOD_LIFETIME_SIM_DAYS).toBe(0.5);
  });
});
