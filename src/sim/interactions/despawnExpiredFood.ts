import type { World } from "miniplex";
import type { SimulationEntity } from "../types";
import { foodWithPosition } from "../world";

/** Flakes despawn after half a simulated day if not eaten (`docs/the-game.md`). */
export const FOOD_LIFETIME_SIM_DAYS = 0.5;

/**
 * Removes stale food flakes whose lifetime has elapsed.
 * Returns number of removed flakes for tests and diagnostics.
 */
export function despawnExpiredFood(
  world: World<SimulationEntity>,
  options: { simDays: number },
): number {
  let removed = 0;
  for (const flake of foodWithPosition(world)) {
    const ageDays = options.simDays - flake.food.spawnedAtSimDays;
    if (ageDays < FOOD_LIFETIME_SIM_DAYS) continue;
    world.remove(flake);
    removed += 1;
  }
  return removed;
}
