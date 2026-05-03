import { describe, expect, it } from "vitest";
import { foodWithPosition, createSimulationWorld, registerFood } from "./world";
import { DEFAULT_FOOD_LIFETIME_SIM_DAYS, stepExpireFoodByAge } from "./foodExpiry";

describe("stepExpireFoodByAge", () => {
  it("removes flakes once their age reaches the default lifetime", () => {
    const world = createSimulationWorld();
    registerFood(world, { food: { spawnedAtSimDays: 1 }, position: { x: 0, y: 0.35, z: 0 } });

    const removed = stepExpireFoodByAge(world, { simDays: 1 + DEFAULT_FOOD_LIFETIME_SIM_DAYS });

    expect(removed).toBe(1);
    expect([...foodWithPosition(world)]).toHaveLength(0);
  });

  it("keeps flakes younger than the default lifetime", () => {
    const world = createSimulationWorld();
    registerFood(world, { food: { spawnedAtSimDays: 4 }, position: { x: 0, y: 0.35, z: 0 } });

    const removed = stepExpireFoodByAge(world, { simDays: 4 + DEFAULT_FOOD_LIFETIME_SIM_DAYS - 1e-9 });

    expect(removed).toBe(0);
    expect([...foodWithPosition(world)]).toHaveLength(1);
  });

  it("removes only expired flakes and leaves newer ones", () => {
    const world = createSimulationWorld();
    registerFood(world, { food: { spawnedAtSimDays: 0 }, position: { x: -0.2, y: 0.35, z: 0 } });
    registerFood(world, { food: { spawnedAtSimDays: 2 }, position: { x: 0.2, y: 0.35, z: 0 } });

    const removed = stepExpireFoodByAge(world, { simDays: 2.2 });

    expect(removed).toBe(1);
    const remaining = [...foodWithPosition(world)];
    expect(remaining).toHaveLength(1);
    expect(remaining[0]!.food.spawnedAtSimDays).toBe(2);
  });
});
