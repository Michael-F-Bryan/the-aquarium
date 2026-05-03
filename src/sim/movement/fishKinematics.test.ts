import { describe, expect, it } from "vitest";
import { clampWallDeltaSeconds, wallDeltaToSimDays } from "../simulationClock";
import { createSimulationWorld, fishWithKinematics, registerFish } from "../world";
import { isWithinStarterSpawnVolume } from "../starterSpawnBounds";
import type { SimulationEntity } from "../types";
import { stepFishKinematicsWallDelta } from "./fishKinematics";

const validFishPayload = {
  fish: {
    displayName: "Pebble",
    hungerDays: 0,
    health: 3 as const,
    weightGrams: 100,
    species: { kind: "herbivore" as const },
  },
  position: { x: 0, y: 0.5, z: 0 },
  velocity: { x: 0, y: 0, z: 0 },
};

function distanceSq(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

describe("stepFishKinematicsWallDelta", () => {
  it("advances idle fish position over time while keeping them inside tank bounds", () => {
    const world = createSimulationWorld();
    registerFish(world, validFishPayload);
    const fish = [...fishWithKinematics(world)][0]!;
    const p0 = { ...fish.position };
    let simDays = 0;
    const wallDt = clampWallDeltaSeconds(1 / 60);
    for (let i = 0; i < 200; i++) {
      stepFishKinematicsWallDelta(world, { wallDeltaSeconds: wallDt, simTimeDays: simDays });
      simDays += wallDeltaToSimDays(wallDt);
      expect(isWithinStarterSpawnVolume(fish.position)).toBe(true);
    }
    expect(distanceSq(fish.position, p0)).toBeGreaterThan(1e-4);
  });

  it("does not idle-wander when movementTargetPosition is set", () => {
    const world = createSimulationWorld();
    const fish = registerFish(world, validFishPayload);
    (fish as SimulationEntity).movementTargetPosition = { x: 2, y: 0.5, z: -1 };
    const p0 = { ...fish.position };
    let simDays = 0;
    const wallDt = clampWallDeltaSeconds(1 / 60);
    for (let i = 0; i < 120; i++) {
      stepFishKinematicsWallDelta(world, { wallDeltaSeconds: wallDt, simTimeDays: simDays });
      simDays += wallDeltaToSimDays(wallDt);
    }
    expect(distanceSq(fish.position, p0)).toBeLessThan(1e-6);
  });

  it("is deterministic for identical step inputs", () => {
    const run = () => {
      const world = createSimulationWorld();
      registerFish(world, validFishPayload);
      const fish = [...fishWithKinematics(world)][0]!;
      let simDays = 0;
      const wallDt = clampWallDeltaSeconds(0.05);
      for (let i = 0; i < 40; i++) {
        stepFishKinematicsWallDelta(world, { wallDeltaSeconds: wallDt, simTimeDays: simDays });
        simDays += wallDeltaToSimDays(wallDt);
      }
      return { ...fish.position, ...fish.velocity };
    };
    const a = run();
    const b = run();
    expect(a).toEqual(b);
  });
});
