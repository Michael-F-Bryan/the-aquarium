import type { World } from "miniplex";
import {
  FIRST_HUNGER_HEALTH_LOSS_THRESHOLD_DAYS,
  SECOND_HUNGER_HEALTH_LOSS_THRESHOLD_DAYS,
  THIRD_HUNGER_DEATH_THRESHOLD_DAYS,
} from "./hungerConstants";
import { wallDeltaToSimDays } from "./simulationClock";
import type { FishHungerMilestoneEvent, FishState, SimulationEntity } from "./types";
import { fishWithKinematics } from "./world";

/**
 * Advances each fish's `hungerDays` by `dSim` in-game days and applies hunger
 * milestones in order (healthy→hungry at 1.5d, hungry→starving at 3d,
 * starving→death at 4.5d per `docs/the-game.md`). Each crossing fires at most
 * once, in deterministic order per fish.
 */
export function stepHungerTimersSimDayDelta(
  world: World<SimulationEntity>,
  dSim: number,
): readonly FishHungerMilestoneEvent[] {
  if (dSim <= 0) return [];

  const events: FishHungerMilestoneEvent[] = [];
  const firstThreshold = FIRST_HUNGER_HEALTH_LOSS_THRESHOLD_DAYS;
  const secondThreshold = SECOND_HUNGER_HEALTH_LOSS_THRESHOLD_DAYS;
  const thirdThreshold = THIRD_HUNGER_DEATH_THRESHOLD_DAYS;

  for (const entity of fishWithKinematics(world)) {
    const fish = entity.fish;
    if (!fish.alive) continue;

    const before = fish.hungerDays;
    fish.hungerDays += dSim;
    const after = fish.hungerDays;

    if (
      before < firstThreshold &&
      after >= firstThreshold &&
      fish.hungerStage === "healthy" &&
      fish.health === 3
    ) {
      fish.health = 2;
      fish.hungerStage = "hungry";
      events.push({ kind: "fish_became_hungry", displayName: fish.displayName });
    }

    if (
      before < secondThreshold &&
      after >= secondThreshold &&
      fish.hungerStage === "hungry" &&
      fish.health === 2
    ) {
      fish.health = 1;
      fish.hungerStage = "starving";
      events.push({ kind: "fish_became_starving", displayName: fish.displayName });
    }

    if (
      before < thirdThreshold &&
      after >= thirdThreshold &&
      fish.hungerStage === "starving" &&
      fish.health === 1
    ) {
      fish.health = 0;
      fish.alive = false;
      events.push({ kind: "fish_died_starvation", displayName: fish.displayName });
      const v = entity.velocity;
      if (v) {
        v.x = 0;
        v.y = 0;
        v.z = 0;
      }
    }
  }

  return events;
}

/**
 * Vitals-adjacent clock: advances each fish's `hungerDays` by the same in-game day
 * delta the simulation clock uses for this wall step (`wallDeltaToSimDays`).
 */
export function stepHungerTimersWallDelta(
  world: World<SimulationEntity>,
  options: { wallDeltaSeconds: number },
): readonly FishHungerMilestoneEvent[] {
  return stepHungerTimersSimDayDelta(world, wallDeltaToSimDays(options.wallDeltaSeconds));
}

/** Invoked by interaction systems when a fish successfully eats (food or prey). */
export function resetFishHungerAfterSuccessfulMeal(fish: FishState): void {
  if (!fish.alive) return;
  fish.hungerDays = 0;
  fish.hungerStage = "healthy";
}
