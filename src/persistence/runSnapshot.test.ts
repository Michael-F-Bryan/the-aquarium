import { describe, expect, it } from "vitest";
import {
  createSimulationWorld,
  registerFish,
  registerFood,
  fishWithKinematics,
  foodWithPosition,
} from "../sim/index";
import { deserializeRunSnapshot, serializeRunSnapshot } from "./runSnapshot";
import { InvalidRunSnapshotError } from "./runSnapshotErrors";

describe("run snapshot serializer", () => {
  it("produces valid JSON (parseable object)", () => {
    const world = createSimulationWorld();
    registerFish(world, {
      fish: {
        alive: true,
        displayName: "Snap",
        hungerDays: 0.5,
        health: 3,
        hungerStage: "healthy",
        weightGrams: 120,
        species: { kind: "herbivore" },
      },
      position: { x: 0.1, y: 0.35, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    });
    const snap = serializeRunSnapshot({
      world,
      simClockState: { paused: false, simDays: 1.25 },
    });
    const json = JSON.stringify(snap);
    const parsed = JSON.parse(json) as Record<string, unknown>;
    expect(parsed.formatVersion).toBe(1);
    expect(parsed.world).toEqual(expect.objectContaining({ version: 2 }));
  });

  it("round-trips world entities and simulation clock", () => {
    const world = createSimulationWorld();
    registerFish(world, {
      fish: {
        alive: true,
        displayName: "Round",
        hungerDays: 2,
        health: 2,
        hungerStage: "hungry",
        weightGrams: 200,
        species: { kind: "carnivore" },
      },
      position: { x: -0.2, y: 0.4, z: 0.15 },
      velocity: { x: 0.02, y: 0, z: -0.01 },
    });
    registerFood(world, {
      food: { spawnedAtSimDays: 3 },
      position: { x: 0, y: 0.55, z: 0 },
    });

    const clock = { paused: true, simDays: 7.5 };
    const wire = JSON.stringify(
      serializeRunSnapshot({
        world,
        simClockState: clock,
        runSeed: 99,
      }),
    );
    const { world: restored, simClockState, runSeed } = deserializeRunSnapshot(JSON.parse(wire));

    expect(simClockState).toEqual(clock);
    expect(runSeed).toBe(99);

    const [fish] = [...fishWithKinematics(restored)];
    expect(fish!.fish.displayName).toBe("Round");
    expect(fish!.fish.hungerDays).toBe(2);
    expect(fish!.fish.hungerStage).toBe("hungry");
    expect(fish!.fish.species).toEqual({ kind: "carnivore" });
    expect(fish!.position.x).toBeCloseTo(-0.2, 10);

    const foods = [...foodWithPosition(restored)];
    expect(foods).toHaveLength(1);
    expect(foods[0]!.food.spawnedAtSimDays).toBe(3);
  });

  it("round-trips without optional runSeed", () => {
    const world = createSimulationWorld();
    registerFish(world, {
      fish: {
        alive: true,
        displayName: "NoSeed",
        hungerDays: 0,
        health: 3,
        hungerStage: "healthy",
        weightGrams: 100,
        species: { kind: "herbivore" },
      },
      position: { x: 0, y: 0.35, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    });
    const json = JSON.stringify(
      serializeRunSnapshot({
        world,
        simClockState: { paused: false, simDays: 0 },
      }),
    );
    const { runSeed } = deserializeRunSnapshot(JSON.parse(json));
    expect(runSeed).toBeUndefined();
  });

  it("rejects non-object root", () => {
    expect(() => deserializeRunSnapshot(null)).toThrow(InvalidRunSnapshotError);
    expect(() => deserializeRunSnapshot("x")).toThrow(InvalidRunSnapshotError);
  });

  it("rejects unsupported formatVersion", () => {
    expect(() =>
      deserializeRunSnapshot({
        formatVersion: 999,
        world: { version: 2, entities: [] },
        simClock: { paused: false, simDays: 0 },
      }),
    ).toThrow(InvalidRunSnapshotError);
  });

  it("rejects invalid simClock shape", () => {
    expect(() =>
      deserializeRunSnapshot({
        formatVersion: 1,
        world: { version: 2, entities: [] },
        simClock: { paused: "no", simDays: 0 },
      }),
    ).toThrow(InvalidRunSnapshotError);
  });
});
