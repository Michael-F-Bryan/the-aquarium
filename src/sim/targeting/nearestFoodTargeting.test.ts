import { describe, expect, it } from "vitest";
import { clampWallDeltaSeconds, wallDeltaToSimDays } from "../simulationClock";
import { stepFishKinematicsWallDelta } from "../movement/fishKinematics";
import { createSimulationWorld, fishWithKinematics, registerFish, registerFood } from "../world";
import type { SimulationEntity } from "../types";
import { updateHerbivoreNearestFoodTargets } from "./nearestFoodTargeting";

const herbivoreFish = {
  fish: {
    alive: true,
    displayName: "Pebble",
    hungerDays: 0,
    health: 3 as const,
    hungerStage: "healthy" as const,
    weightGrams: 100,
    species: { kind: "herbivore" as const },
  },
  position: { x: 0, y: 0.35, z: 0 },
  velocity: { x: 0, y: 0, z: 0 },
};

describe("updateHerbivoreNearestFoodTargets", () => {
  it("sets movementTargetPosition to the nearest flake", () => {
    const world = createSimulationWorld();
    const fish = registerFish(world, herbivoreFish);
    registerFood(world, { food: { spawnedAtSimDays: 0 }, position: { x: 2, y: 0.35, z: 0 } });
    registerFood(world, { food: { spawnedAtSimDays: 0 }, position: { x: 0.5, y: 0.35, z: 0 } });

    updateHerbivoreNearestFoodTargets(world);

    expect((fish as SimulationEntity).movementTargetPosition).toEqual({ x: 0.5, y: 0.35, z: 0 });
  });

  it("uses lexicographic flake ordering as a stable tie-break when distances match", () => {
    const world = createSimulationWorld();
    const fish = registerFish(world, herbivoreFish);
    registerFood(world, { food: { spawnedAtSimDays: 1 }, position: { x: 1, y: 0.35, z: 0 } });
    registerFood(world, { food: { spawnedAtSimDays: 0 }, position: { x: -1, y: 0.35, z: 0 } });

    updateHerbivoreNearestFoodTargets(world);

    expect((fish as SimulationEntity).movementTargetPosition).toEqual({ x: -1, y: 0.35, z: 0 });
  });

  it("clears movementTargetPosition when the last flake is removed", () => {
    const world = createSimulationWorld();
    const fish = registerFish(world, herbivoreFish);
    const flake = registerFood(world, { food: { spawnedAtSimDays: 0 }, position: { x: 0.8, y: 0.35, z: 0 } });

    updateHerbivoreNearestFoodTargets(world);
    expect((fish as SimulationEntity).movementTargetPosition).toBeDefined();

    world.remove(flake);
    updateHerbivoreNearestFoodTargets(world);

    expect((fish as SimulationEntity).movementTargetPosition).toBeUndefined();
  });

  it("does not set food targets on carnivores", () => {
    const world = createSimulationWorld();
    const fish = registerFish(world, {
      ...herbivoreFish,
      fish: { ...herbivoreFish.fish, displayName: "Chomper", species: { kind: "carnivore" } },
    });
    registerFood(world, { food: { spawnedAtSimDays: 0 }, position: { x: 0.2, y: 0.35, z: 0 } });

    updateHerbivoreNearestFoodTargets(world);

    expect((fish as SimulationEntity).movementTargetPosition).toBeUndefined();
  });

  it("retargets when a closer flake exists than the previous nearest", () => {
    const world = createSimulationWorld();
    const fish = registerFish(world, herbivoreFish);
    registerFood(world, { food: { spawnedAtSimDays: 0 }, position: { x: 3, y: 0.35, z: 0 } });
    updateHerbivoreNearestFoodTargets(world);
    expect((fish as SimulationEntity).movementTargetPosition?.x).toBeCloseTo(3, 5);

    registerFood(world, { food: { spawnedAtSimDays: 0 }, position: { x: 0.2, y: 0.35, z: 0 } });
    updateHerbivoreNearestFoodTargets(world);
    expect((fish as SimulationEntity).movementTargetPosition?.x).toBeCloseTo(0.2, 5);
  });

  it("skips dead herbivores", () => {
    const world = createSimulationWorld();
    const fish = registerFish(world, {
      ...herbivoreFish,
      fish: { ...herbivoreFish.fish, alive: false, health: 0, hungerStage: "starving" },
    });
    registerFood(world, { food: { spawnedAtSimDays: 0 }, position: { x: 0.2, y: 0.35, z: 0 } });

    updateHerbivoreNearestFoodTargets(world);

    expect([...fishWithKinematics(world)][0]).toBe(fish);
    expect((fish as SimulationEntity).movementTargetPosition).toBeUndefined();
  });

  it("combined with kinematics moves the fish toward the targeted flake", () => {
    const world = createSimulationWorld();
    const fish = registerFish(world, herbivoreFish);
    registerFood(world, { food: { spawnedAtSimDays: 0 }, position: { x: 1.5, y: 0.35, z: 0 } });
    const startX = fish.position.x;
    const wallDt = clampWallDeltaSeconds(1 / 60);
    let simDays = 0;
    for (let i = 0; i < 240; i++) {
      updateHerbivoreNearestFoodTargets(world);
      stepFishKinematicsWallDelta(world, { wallDeltaSeconds: wallDt, simTimeDays: simDays });
      simDays += wallDeltaToSimDays(wallDt);
    }
    expect(fish.position.x).toBeGreaterThan(startX + 0.08);
  });
});
