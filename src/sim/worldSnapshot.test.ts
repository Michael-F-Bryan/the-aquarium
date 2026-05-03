import { describe, expect, it } from "vitest";
import {
  assertFishEntityShape,
  createSimulationWorld,
  fishWithKinematics,
  foodWithPosition,
  registerFish,
  registerFood,
} from "./index";
import type { SimulationEntity } from "./types";
import {
  SIMULATION_WORLD_SNAPSHOT_VERSION,
  SIMULATION_WORLD_SNAPSHOT_VERSION_V1,
  deserializeSimulationWorldSnapshot,
  serializeSimulationWorldSnapshot,
} from "./worldSnapshot";

describe("simulation world snapshot hooks", () => {
  it("round-trips fish hungerDays and preserves food entities", () => {
    const world = createSimulationWorld();
    registerFish(world, {
      fish: {
        alive: true,
        displayName: "Hungry",
        hungerDays: 1.25,
        health: 3,
        hungerStage: "healthy",
        weightGrams: 150,
        species: { kind: "herbivore" },
      },
      position: { x: 0, y: 0.35, z: 0 },
      velocity: { x: 0.01, y: 0, z: 0 },
    });
    registerFish(world, {
      fish: {
        alive: true,
        displayName: "Fed",
        hungerDays: 0,
        health: 3,
        hungerStage: "healthy",
        weightGrams: 300,
        species: { kind: "carnivore" },
      },
      position: { x: 0.2, y: 0.4, z: -0.1 },
      velocity: { x: 0, y: 0, z: 0 },
    });
    registerFood(world, {
      food: { spawnedAtSimDays: 0.5 },
      position: { x: 0.05, y: 0.5, z: 0 },
    });

    const wire = JSON.stringify(serializeSimulationWorldSnapshot(world));
    const restored = deserializeSimulationWorldSnapshot(JSON.parse(wire));

    const fishByName = new Map([...fishWithKinematics(restored)].map((e) => [e.fish.displayName, e.fish]));
    expect(fishByName.get("Hungry")!.hungerDays).toBeCloseTo(1.25, 10);
    expect(fishByName.get("Hungry")!.hungerStage).toBe("healthy");
    expect(fishByName.get("Fed")!.hungerDays).toBe(0);
    expect(fishByName.get("Fed")!.hungerStage).toBe("healthy");
    expect(fishByName.get("Hungry")!.weightGrams).toBe(150);
    expect(fishByName.get("Fed")!.species).toEqual({ kind: "carnivore" });

    const foods = [...foodWithPosition(restored)];
    expect(foods).toHaveLength(1);
    expect(foods[0]!.food.spawnedAtSimDays).toBeCloseTo(0.5, 10);
    expect(foods[0]!.position.y).toBeCloseTo(0.5, 10);
  });

  it("serializes snapshot format version 2", () => {
    const world = createSimulationWorld();
    registerFish(world, {
      fish: {
        alive: true,
        displayName: "V2",
        hungerDays: 0,
        health: 3,
        hungerStage: "healthy",
        weightGrams: 100,
        species: { kind: "herbivore" },
      },
      position: { x: 0, y: 0.35, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    });
    const snap = serializeSimulationWorldSnapshot(world);
    expect(snap.version).toBe(SIMULATION_WORLD_SNAPSHOT_VERSION);
  });

  it("deserializes v1 snapshots without hungerStage using legacy inference", () => {
    const legacy = {
      version: SIMULATION_WORLD_SNAPSHOT_VERSION_V1,
      entities: [
        {
          fish: {
            displayName: "Legacy",
            hungerDays: 2,
            health: 3,
            weightGrams: 100,
            species: { kind: "herbivore" },
          },
          position: { x: 0, y: 0.35, z: 0 },
          velocity: { x: 0, y: 0, z: 0 },
        },
      ],
    };
    const world = deserializeSimulationWorldSnapshot(legacy);
    const [f] = [...fishWithKinematics(world)];
    expect(f!.fish.health).toBe(2);
    expect(f!.fish.hungerStage).toBe("hungry");
    expect(f!.fish.hungerDays).toBe(2);
    expect(f!.fish.alive).toBe(true);
  });

  it("deserializes v1 without hungerStage inferring starving when past second threshold", () => {
    const legacy = {
      version: SIMULATION_WORLD_SNAPSHOT_VERSION_V1,
      entities: [
        {
          fish: {
            displayName: "LegacyStarve",
            hungerDays: 3.5,
            health: 2,
            weightGrams: 100,
            species: { kind: "herbivore" },
          },
          position: { x: 0, y: 0.35, z: 0 },
          velocity: { x: 0, y: 0, z: 0 },
        },
      ],
    };
    const world = deserializeSimulationWorldSnapshot(legacy);
    const [f] = [...fishWithKinematics(world)];
    expect(f!.fish.health).toBe(1);
    expect(f!.fish.hungerStage).toBe("starving");
    expect(f!.fish.hungerDays).toBe(3.5);
    expect(f!.fish.alive).toBe(true);
  });

  it("deserializes v1 without hungerStage inferring starvation death when past third threshold", () => {
    const legacy = {
      version: SIMULATION_WORLD_SNAPSHOT_VERSION_V1,
      entities: [
        {
          fish: {
            displayName: "LegacyDead",
            hungerDays: 5,
            health: 1,
            weightGrams: 100,
            species: { kind: "herbivore" },
          },
          position: { x: 0, y: 0.35, z: 0 },
          velocity: { x: 0, y: 0, z: 0 },
        },
      ],
    };
    const world = deserializeSimulationWorldSnapshot(legacy);
    const [f] = [...fishWithKinematics(world)];
    expect(f!.fish.health).toBe(0);
    expect(f!.fish.alive).toBe(false);
    expect(f!.fish.hungerStage).toBe("starving");
    expect(f!.fish.hungerDays).toBe(5);
  });

  it("round-trips starvation death (alive false, health 0)", () => {
    const world = createSimulationWorld();
    registerFish(world, {
      fish: {
        alive: false,
        displayName: "Floater",
        hungerDays: 4.51,
        health: 0,
        hungerStage: "starving",
        weightGrams: 100,
        species: { kind: "herbivore" },
      },
      position: { x: 0, y: 0.2, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    });
    const restored = deserializeSimulationWorldSnapshot(JSON.parse(JSON.stringify(serializeSimulationWorldSnapshot(world))));
    const [f] = [...fishWithKinematics(restored)];
    expect(f!.fish.alive).toBe(false);
    expect(f!.fish.health).toBe(0);
    expect(f!.fish.hungerDays).toBeCloseTo(4.51, 10);
  });

  it("round-trips optional movementTargetPosition on fish", () => {
    const world = createSimulationWorld();
    const base = assertFishEntityShape({
      fish: {
        alive: true,
        displayName: "Targeted",
        hungerDays: 0.1,
        health: 3,
        hungerStage: "healthy",
        weightGrams: 100,
        species: { kind: "herbivore" },
      },
      position: { x: 0, y: 0.35, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    });
    const withTarget: SimulationEntity = {
      ...base,
      movementTargetPosition: { x: 0.5, y: 0.4, z: 0.2 },
    };
    world.add(withTarget);

    const json = JSON.stringify(serializeSimulationWorldSnapshot(world));
    const restored = deserializeSimulationWorldSnapshot(JSON.parse(json));
    const [fish] = [...fishWithKinematics(restored)];
    expect(fish!.movementTargetPosition).toEqual({ x: 0.5, y: 0.4, z: 0.2 });
  });
});
