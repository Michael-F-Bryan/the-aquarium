import type { World } from "miniplex";
import { compareFoodEntitiesStableTieBreak } from "../targeting/nearestFoodTargeting";
import { resetFishHungerAfterSuccessfulMeal } from "../hungerTimer";
import type { FishAteFoodEvent, SimulationEntity, Vec3 } from "../types";
import { fishWithKinematics, foodWithPosition } from "../world";

/** World-space mouth reach: fish snaps up a flake when centers are within this distance. */
export const HERBIVORE_FOOD_EAT_DISTANCE = 0.12;

const eatDistanceSquared = HERBIVORE_FOOD_EAT_DISTANCE * HERBIVORE_FOOD_EAT_DISTANCE;

/**
 * When `movementTargetPosition` is copied from a flake center, this squared epsilon
 * treats the flake as the intended target even after tiny kinematic drift.
 */
const MOVEMENT_TARGET_MATCH_EPSILON_SQ = 1e-10;

function distanceSquared(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

function compareHerbivoreFishStable(a: SimulationEntity, b: SimulationEntity): number {
  const fa = a.fish!;
  const fb = b.fish!;
  if (fa.displayName !== fb.displayName) {
    return fa.displayName < fb.displayName ? -1 : 1;
  }
  const pa = a.position;
  const pb = b.position;
  if (pa.x !== pb.x) return pa.x - pb.x;
  if (pa.y !== pb.y) return pa.y - pb.y;
  return pa.z - pb.z;
}

function sortedLivingHerbivores(world: World<SimulationEntity>): SimulationEntity[] {
  const out: SimulationEntity[] = [];
  for (const entity of fishWithKinematics(world)) {
    const e = entity as SimulationEntity;
    if (!e.fish?.alive || e.fish.species.kind !== "herbivore") continue;
    out.push(e);
  }
  out.sort(compareHerbivoreFishStable);
  return out;
}

type FoodCandidate = {
  entity: SimulationEntity;
  d2Fish: number;
  rank: number;
  d2Target: number;
};

/**
 * Among flakes within eat distance, prefer the flake matching `movementTargetPosition`
 * (same tie-break ordering as targeting when several match). Otherwise choose closest
 * to the fish, breaking ties by stable food sort rank.
 */
function pickFoodToEat(
  fishPosition: Vec3,
  foodsSorted: SimulationEntity[],
  movementTarget: Vec3 | undefined,
): SimulationEntity | undefined {
  const candidates: FoodCandidate[] = [];
  for (let rank = 0; rank < foodsSorted.length; rank++) {
    const entity = foodsSorted[rank]!;
    const d2Fish = distanceSquared(fishPosition, entity.position);
    if (d2Fish > eatDistanceSquared) continue;
    const d2Target =
      movementTarget === undefined ? Number.POSITIVE_INFINITY : distanceSquared(entity.position, movementTarget);
    candidates.push({ entity, d2Fish, rank, d2Target });
  }
  if (candidates.length === 0) return undefined;

  const onTarget = candidates.filter((c) => c.d2Target <= MOVEMENT_TARGET_MATCH_EPSILON_SQ);
  const pool = onTarget.length > 0 ? onTarget : candidates;

  let best = pool[0]!;
  for (let i = 1; i < pool.length; i++) {
    const c = pool[i]!;
    if (c.d2Fish < best.d2Fish || (c.d2Fish === best.d2Fish && c.rank < best.rank)) {
      best = c;
    }
  }
  return best.entity;
}

/**
 * Interaction phase: living herbivores within eat distance consume one flake each
 * (deterministic fish order, deterministic food tie-break). Clears movement target,
 * resets hunger, removes the food entity, and returns one `fish_ate_food` event per flake.
 * No-op while paused (callers should skip when paused; flag kept for tests and parity with `tryDropFoodAt`).
 */
export function stepHerbivoreEatNearbyFood(
  world: World<SimulationEntity>,
  options: { paused: boolean },
): readonly FishAteFoodEvent[] {
  if (options.paused) return [];

  const events: FishAteFoodEvent[] = [];
  for (const fishEntity of sortedLivingHerbivores(world)) {
    const foods = [...foodWithPosition(world)] as SimulationEntity[];
    foods.sort(compareFoodEntitiesStableTieBreak);
    const chosen = pickFoodToEat(fishEntity.position, foods, fishEntity.movementTargetPosition);
    if (chosen === undefined) continue;

    world.remove(chosen);
    resetFishHungerAfterSuccessfulMeal(fishEntity.fish!);
    delete fishEntity.movementTargetPosition;
    events.push({ kind: "fish_ate_food", displayName: fishEntity.fish!.displayName });
  }
  return events;
}
