import type { World } from "miniplex";
import { FIRST_HUNGER_HEALTH_LOSS_THRESHOLD_DAYS } from "./hungerConstants";
import { wallDeltaToSimDays } from "./simulationClock";
import type { FishBecameHungryEvent, FishState, SimulationEntity } from "./types";
import { fishWithKinematics } from "./world";

/**
 * Vitals-adjacent clock: advances each fish's `hungerDays` by the same in-game day
 * delta the simulation clock uses for this wall step (`wallDeltaToSimDays`).
 *
 * When a fish first crosses {@link FIRST_HUNGER_HEALTH_LOSS_THRESHOLD_DAYS} while still
 * `healthy`, health drops 3→2, `hungerStage` becomes `"hungry"`, and one event is returned.
 */
export function stepHungerTimersWallDelta(
  world: World<SimulationEntity>,
  options: { wallDeltaSeconds: number },
): readonly FishBecameHungryEvent[] {
  const dSim = wallDeltaToSimDays(options.wallDeltaSeconds);
  if (dSim <= 0) return [];

  const events: FishBecameHungryEvent[] = [];
  const threshold = FIRST_HUNGER_HEALTH_LOSS_THRESHOLD_DAYS;

  for (const entity of fishWithKinematics(world)) {
    const fish = entity.fish;
    const before = fish.hungerDays;
    fish.hungerDays += dSim;
    const after = fish.hungerDays;

    if (
      before < threshold &&
      after >= threshold &&
      fish.hungerStage === "healthy" &&
      fish.health === 3
    ) {
      fish.health = 2;
      fish.hungerStage = "hungry";
      events.push({ kind: "fish_became_hungry", displayName: fish.displayName });
    }
  }

  return events;
}

/** Invoked by interaction systems when a fish successfully eats (food or prey). */
export function resetFishHungerAfterSuccessfulMeal(fish: FishState): void {
  fish.hungerDays = 0;
  fish.hungerStage = "healthy";
}
