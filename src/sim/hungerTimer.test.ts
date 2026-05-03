import { describe, expect, it } from "vitest";
import { createSimulationWorld, fishWithKinematics, registerFish, wallDeltaToSimDays } from "./index";
import { resetFishHungerAfterSuccessfulMeal, stepHungerTimersWallDelta } from "./hungerTimer";

describe("stepHungerTimersWallDelta", () => {
  it("advances hungerDays by the same sim-day delta as the simulation clock for that wall step", () => {
    const world = createSimulationWorld();
    registerFish(world, {
      fish: {
        displayName: "A",
        hungerDays: 0.5,
        health: 3,
        weightGrams: 100,
        species: { kind: "herbivore" },
      },
      position: { x: 0, y: 0.35, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    });
    const wallDt = 0.1;
    const expectedDelta = wallDeltaToSimDays(wallDt);
    stepHungerTimersWallDelta(world, { wallDeltaSeconds: wallDt });
    const [fish] = [...fishWithKinematics(world)];
    expect(fish!.fish.hungerDays).toBeCloseTo(0.5 + expectedDelta, 10);
  });

  it("accumulates independently for multiple fish", () => {
    const world = createSimulationWorld();
    registerFish(world, {
      fish: {
        displayName: "A",
        hungerDays: 0,
        health: 3,
        weightGrams: 100,
        species: { kind: "herbivore" },
      },
      position: { x: 0, y: 0.35, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    });
    registerFish(world, {
      fish: {
        displayName: "B",
        hungerDays: 2,
        health: 2,
        weightGrams: 200,
        species: { kind: "herbivore" },
      },
      position: { x: 0.1, y: 0.35, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    });
    const wallDt = 0.2;
    const d = wallDeltaToSimDays(wallDt);
    stepHungerTimersWallDelta(world, { wallDeltaSeconds: wallDt });
    const names = new Map([...fishWithKinematics(world)].map((e) => [e.fish.displayName, e.fish.hungerDays]));
    expect(names.get("A")).toBeCloseTo(0 + d, 10);
    expect(names.get("B")).toBeCloseTo(2 + d, 10);
  });

  it("is a no-op for non-positive wall delta", () => {
    const world = createSimulationWorld();
    registerFish(world, {
      fish: {
        displayName: "A",
        hungerDays: 1,
        health: 3,
        weightGrams: 100,
        species: { kind: "herbivore" },
      },
      position: { x: 0, y: 0.35, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    });
    stepHungerTimersWallDelta(world, { wallDeltaSeconds: 0 });
    stepHungerTimersWallDelta(world, { wallDeltaSeconds: -1 });
    expect([...fishWithKinematics(world)][0]!.fish.hungerDays).toBe(1);
  });
});

describe("resetFishHungerAfterSuccessfulMeal", () => {
  it("sets hungerDays to zero", () => {
    const fish = {
      displayName: "A",
      hungerDays: 3.7,
      health: 2 as const,
      weightGrams: 100,
      species: { kind: "herbivore" as const },
    };
    resetFishHungerAfterSuccessfulMeal(fish);
    expect(fish.hungerDays).toBe(0);
  });
});
