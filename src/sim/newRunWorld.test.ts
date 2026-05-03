import { describe, expect, it } from "vitest";
import { createNewRunSimulationWorld, DEFAULT_SIMULATION_SEED } from "./newRunWorld";
import { fishWithKinematics } from "./world";
import { isWithinStarterSpawnVolume } from "./starterSpawnBounds";

describe("createNewRunSimulationWorld", () => {
  it("spawns exactly one fish for a new run", () => {
    const world = createNewRunSimulationWorld();
    expect([...fishWithKinematics(world)]).toHaveLength(1);
  });

  it("places the starter fish inside the documented starter spawn volume", () => {
    const world = createNewRunSimulationWorld();
    const [fish] = [...fishWithKinematics(world)];
    expect(fish).toBeDefined();
    expect(isWithinStarterSpawnVolume(fish!.position)).toBe(true);
  });

  it("is deterministic for the default seed (same fish state across runs)", () => {
    const a = createNewRunSimulationWorld(DEFAULT_SIMULATION_SEED);
    const b = createNewRunSimulationWorld(DEFAULT_SIMULATION_SEED);
    const fa = [...fishWithKinematics(a)][0]!;
    const fb = [...fishWithKinematics(b)][0]!;
    expect(fa.fish).toEqual(fb.fish);
    expect(fa.position).toEqual(fb.position);
    expect(fa.velocity).toEqual(fb.velocity);
  });
});
