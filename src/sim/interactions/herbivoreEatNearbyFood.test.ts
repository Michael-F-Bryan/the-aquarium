import { describe, expect, it, vi } from "vitest";
import { createSimulationWorld, registerFish, registerFood } from "../world";
import { dispatchFishAteFoodEvents, subscribeFishAteFoodEvents } from "../fishEatFoodEventBridge";
import { HERBIVORE_FOOD_EAT_DISTANCE, stepHerbivoreEatNearbyFood } from "./herbivoreEatNearbyFood";

const herbivoreFish = {
  fish: {
    displayName: "Seed",
    alive: true,
    hungerDays: 1.2,
    health: 3 as const,
    hungerStage: "healthy" as const,
    weightGrams: 100,
    species: { kind: "herbivore" as const },
  },
  position: { x: 0, y: 0.35, z: 0 },
  velocity: { x: 0, y: 0, z: 0 },
};

describe("stepHerbivoreEatNearbyFood", () => {
  it("returns no events and mutates nothing when paused", () => {
    const world = createSimulationWorld();
    const fish = registerFish(world, herbivoreFish);
    registerFood(world, { food: { spawnedAtSimDays: 0 }, position: { x: 0, y: 0.35, z: 0 } });
    const ev = stepHerbivoreEatNearbyFood(world, { paused: true });
    expect(ev).toEqual([]);
    expect([...world.with("food", "position").connect()]).toHaveLength(1);
    expect((fish as { hungerDays: number }).fish.hungerDays).toBeCloseTo(1.2, 5);
  });

  it("removes food, resets hunger, clears movement target, and emits one event per flake", () => {
    const world = createSimulationWorld();
    const fish = registerFish(world, herbivoreFish);
    (fish as { movementTargetPosition?: { x: number; y: number; z: number } }).movementTargetPosition = {
      x: 0.05,
      y: 0.35,
      z: 0,
    };
    registerFood(world, { food: { spawnedAtSimDays: 0 }, position: { x: 0.05, y: 0.35, z: 0 } });

    const ev = stepHerbivoreEatNearbyFood(world, { paused: false });
    expect(ev).toEqual([{ kind: "fish_ate_food", displayName: "Seed" }]);
    expect([...world.with("food", "position").connect()]).toHaveLength(0);
    expect(fish.fish.hungerDays).toBe(0);
    expect(fish.fish.hungerStage).toBe("healthy");
    expect((fish as { movementTargetPosition?: unknown }).movementTargetPosition).toBeUndefined();
  });

  it("fires eat dispatch exactly once per returned event", () => {
    const world = createSimulationWorld();
    registerFish(world, herbivoreFish);
    registerFood(world, { food: { spawnedAtSimDays: 0 }, position: { x: 0, y: 0.35, z: 0 } });
    const spy = vi.fn();
    const unsub = subscribeFishAteFoodEvents(spy);
    dispatchFishAteFoodEvents(stepHerbivoreEatNearbyFood(world, { paused: false }));
    unsub();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]![0]).toEqual([{ kind: "fish_ate_food", displayName: "Seed" }]);
  });

  it("does not emit when dispatch receives an empty list", () => {
    const spy = vi.fn();
    const unsub = subscribeFishAteFoodEvents(spy);
    dispatchFishAteFoodEvents([]);
    unsub();
    expect(spy).not.toHaveBeenCalled();
  });

  it("when two flakes are in range, prefers the one matching movementTargetPosition", () => {
    const world = createSimulationWorld();
    const fish = registerFish(world, herbivoreFish);
    (fish as { movementTargetPosition?: { x: number; y: number; z: number } }).movementTargetPosition = {
      x: 0.08,
      y: 0.35,
      z: 0,
    };
    registerFood(world, { food: { spawnedAtSimDays: 0 }, position: { x: 0.08, y: 0.35, z: 0 } });
    registerFood(world, { food: { spawnedAtSimDays: 1 }, position: { x: 0.06, y: 0.35, z: 0 } });

    stepHerbivoreEatNearbyFood(world, { paused: false });
    const remaining = [...world.with("food", "position").connect()];
    expect(remaining).toHaveLength(1);
    expect(remaining[0]!.position.x).toBeCloseTo(0.06, 5);
  });

  it("when no movement target, picks closest flake with stable food tie-break", () => {
    const world = createSimulationWorld();
    registerFish(world, {
      ...herbivoreFish,
      position: { x: 0, y: 0.35, z: 0 },
    });
    registerFood(world, { food: { spawnedAtSimDays: 1 }, position: { x: 0.1, y: 0.35, z: 0 } });
    registerFood(world, { food: { spawnedAtSimDays: 0 }, position: { x: -0.1, y: 0.35, z: 0 } });
    stepHerbivoreEatNearbyFood(world, { paused: false });
    const remaining = [...world.with("food", "position").connect()];
    expect(remaining).toHaveLength(1);
    expect(remaining[0]!.food.spawnedAtSimDays).toBe(1);
  });

  it("two fish and one flake: deterministic fish order — only one eats", () => {
    const world = createSimulationWorld();
    registerFish(world, {
      ...herbivoreFish,
      fish: { ...herbivoreFish.fish, displayName: "B" },
      position: { x: 0, y: 0.35, z: 0 },
    });
    registerFish(world, {
      ...herbivoreFish,
      fish: { ...herbivoreFish.fish, displayName: "A" },
      position: { x: 0.02, y: 0.35, z: 0 },
    });
    registerFood(world, { food: { spawnedAtSimDays: 0 }, position: { x: 0.01, y: 0.35, z: 0 } });
    const ev = stepHerbivoreEatNearbyFood(world, { paused: false });
    expect(ev).toHaveLength(1);
    expect(ev[0]!.displayName).toBe("A");
    expect([...world.with("food", "position").connect()]).toHaveLength(0);
  });

  it("skips dead herbivores and carnivores", () => {
    const world = createSimulationWorld();
    registerFish(world, {
      ...herbivoreFish,
      fish: { ...herbivoreFish.fish, alive: false, health: 0, hungerStage: "starving" },
    });
    registerFish(world, {
      ...herbivoreFish,
      fish: { ...herbivoreFish.fish, displayName: "Chomper", species: { kind: "carnivore" } },
    });
    registerFood(world, { food: { spawnedAtSimDays: 0 }, position: { x: 0, y: 0.35, z: 0 } });
    expect(stepHerbivoreEatNearbyFood(world, { paused: false })).toEqual([]);
    expect([...world.with("food", "position").connect()]).toHaveLength(1);
  });

  it("does not eat when just outside threshold", () => {
    const world = createSimulationWorld();
    registerFish(world, herbivoreFish);
    const dx = HERBIVORE_FOOD_EAT_DISTANCE + 0.02;
    registerFood(world, { food: { spawnedAtSimDays: 0 }, position: { x: dx, y: 0.35, z: 0 } });
    expect(stepHerbivoreEatNearbyFood(world, { paused: false })).toEqual([]);
    expect([...world.with("food", "position").connect()]).toHaveLength(1);
  });
});
