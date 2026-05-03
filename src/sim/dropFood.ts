import type { World } from "miniplex";
import type { SimulationEntity, Vec3 } from "./types";
import { foodWithPosition, registerFood } from "./world";
import { STARTER_SPAWN_VOLUME } from "./starterSpawnBounds";

/** Minimum world-space distance between flake centers (see `docs/the-game.md`). */
export const MIN_FOOD_SPACING = 0.35;

export type DropFoodRejectReason = "paused" | "too_close_to_existing_food";

export type DropFoodResult =
  | { ok: true; position: Vec3 }
  | { ok: false; reason: DropFoodRejectReason };

function distanceSquared(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

function minSquaredDistanceToExistingFood(world: World<SimulationEntity>, position: Vec3): number {
  let minSq = Infinity;
  for (const entity of foodWithPosition(world)) {
    const d2 = distanceSquared(position, entity.position);
    if (d2 < minSq) minSq = d2;
  }
  return minSq;
}

/**
 * Clamps a raw pick (e.g. ray hit) into the same inner volume used for starter fish
 * (`STARTER_SPAWN_VOLUME` / `docs/the-game.md` tank bounds).
 */
export function clampFoodDropPosition(position: Vec3): Vec3 {
  const { minX, maxX, minY, maxY, minZ, maxZ } = STARTER_SPAWN_VOLUME;
  return {
    x: Math.min(maxX, Math.max(minX, position.x)),
    y: Math.min(maxY, Math.max(minY, position.y)),
    z: Math.min(maxZ, Math.max(minZ, position.z)),
  };
}

const minSpacingSq = MIN_FOOD_SPACING * MIN_FOOD_SPACING;

/**
 * Authoritative player drop-food command: mutates `world` when the drop is accepted.
 * Call from UI after resolving pointer position to tank space; keep `paused` in sync
 * with `SimulationClockContext` so behavior matches `docs/the-game.md`.
 */
export function tryDropFoodAt(
  world: World<SimulationEntity>,
  params: { paused: boolean; simDays: number; pickPosition: Vec3 },
): DropFoodResult {
  if (params.paused) {
    return { ok: false, reason: "paused" };
  }
  const position = clampFoodDropPosition(params.pickPosition);
  if (minSquaredDistanceToExistingFood(world, position) < minSpacingSq) {
    return { ok: false, reason: "too_close_to_existing_food" };
  }
  registerFood(world, {
    food: { spawnedAtSimDays: params.simDays },
    position,
  });
  return { ok: true, position };
}
