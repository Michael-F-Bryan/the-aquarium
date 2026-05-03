import type { World } from "miniplex";
import { foodWithPosition } from "./world";
import type { SimulationEntity } from "./types";

/** Default flake lifetime from `docs/the-game.md`: half a simulated day. */
export const DEFAULT_FOOD_LIFETIME_SIM_DAYS = 0.5;

/**
 * Removes food flakes whose age has reached the configured lifetime.
 * Returns the number of flakes removed during this simulation step.
 */
export function stepExpireFoodByAge(
  world: World<SimulationEntity>,
  options: { simDays: number; lifetimeSimDays?: number },
): number {
  const lifetimeSimDays = options.lifetimeSimDays ?? DEFAULT_FOOD_LIFETIME_SIM_DAYS;
  let removed = 0;
  for (const entity of foodWithPosition(world)) {
    if (options.simDays - entity.food.spawnedAtSimDays < lifetimeSimDays) continue;
    world.remove(entity);
    removed += 1;
  }
  return removed;
}
