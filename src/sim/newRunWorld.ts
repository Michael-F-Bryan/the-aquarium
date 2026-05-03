import type { World } from "miniplex";
import type { FishEntity, SimulationEntity } from "./types";
import { createSimulationWorld, registerFish } from "./world";

/** Default run seed; same seed ⇒ identical starter fish baseline (name, pose, velocity). */
export const DEFAULT_SIMULATION_SEED = 42;

/**
 * Canonical starter fish for the default seed (middle of tank, 100g herbivore per `docs/the-game.md`).
 * `seed` is reserved for future procedural variance; only the default seed is stability-tested for now.
 */
export function starterFishEntityForRunSeed(seed: number): FishEntity {
  void seed;
  return {
    fish: {
      displayName: "Pebble",
      hungerDays: 0,
      health: 3,
      hungerStage: "healthy",
      weightGrams: 100,
      species: { kind: "herbivore" },
    },
    position: { x: 0, y: 0.35, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
  };
}

/**
 * Creates a Miniplex world for a fresh player run with exactly one starter fish.
 * Starter placement lies inside `STARTER_SPAWN_VOLUME` (`starterSpawnBounds.ts`).
 */
export function createNewRunSimulationWorld(seed: number = DEFAULT_SIMULATION_SEED): World<SimulationEntity> {
  const world = createSimulationWorld();
  registerFish(world, starterFishEntityForRunSeed(seed));
  return world;
}
