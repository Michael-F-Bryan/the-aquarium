import type { World } from "miniplex";
import { wallDeltaToSimDays } from "./simulationClock";
import type { FishState, SimulationEntity } from "./types";
import { fishWithKinematics } from "./world";

/**
 * Vitals-adjacent clock: advances each fish's `hungerDays` by the same in-game day
 * delta the simulation clock uses for this wall step (`wallDeltaToSimDays`).
 */
export function stepHungerTimersWallDelta(
  world: World<SimulationEntity>,
  options: { wallDeltaSeconds: number },
): void {
  const dSim = wallDeltaToSimDays(options.wallDeltaSeconds);
  if (dSim <= 0) return;

  for (const entity of fishWithKinematics(world)) {
    entity.fish.hungerDays += dSim;
  }
}

/** Invoked by interaction systems when a fish successfully eats (food or prey). */
export function resetFishHungerAfterSuccessfulMeal(fish: FishState): void {
  fish.hungerDays = 0;
}
