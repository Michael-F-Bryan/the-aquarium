import type { World } from "miniplex";
import type { SimulationEntity, Vec3 } from "../types";
import { fishWithKinematics, foodWithPosition } from "../world";

function distanceSquared(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

/**
 * Deterministic ordering when two flakes are equally far: lexicographic `position`,
 * then `spawnedAtSimDays` (mirrors stable array / id tie-break intent in issue #11).
 */
function compareFoodTieBreak(a: SimulationEntity, b: SimulationEntity): number {
  const pa = a.position;
  const pb = b.position;
  if (pa.x !== pb.x) return pa.x - pb.x;
  if (pa.y !== pb.y) return pa.y - pb.y;
  if (pa.z !== pb.z) return pa.z - pb.z;
  return (a.food?.spawnedAtSimDays ?? 0) - (b.food?.spawnedAtSimDays ?? 0);
}

/**
 * Sets `movementTargetPosition` on living herbivores to the nearest food flake,
 * or clears it when no food exists. Carnivores are left untouched (prey targeting is separate).
 * Call each tick while unpaused, after food positions are authoritative and before kinematics.
 */
export function updateHerbivoreNearestFoodTargets(world: World<SimulationEntity>): void {
  const foods = [...foodWithPosition(world)] as SimulationEntity[];
  foods.sort(compareFoodTieBreak);

  for (const entity of fishWithKinematics(world)) {
    const e = entity as SimulationEntity;
    if (!e.fish?.alive) continue;
    if (e.fish.species.kind !== "herbivore") continue;

    if (foods.length === 0) {
      delete e.movementTargetPosition;
      continue;
    }

    let bestD2 = Infinity;
    let bestRank = Infinity;
    let best: Vec3 | undefined;

    const fp = e.position;
    for (let rank = 0; rank < foods.length; rank++) {
      const food = foods[rank]!;
      const d2 = distanceSquared(fp, food.position);
      if (d2 < bestD2 || (d2 === bestD2 && rank < bestRank)) {
        bestD2 = d2;
        bestRank = rank;
        best = food.position;
      }
    }

    const chosen = best!;
    e.movementTargetPosition = { x: chosen.x, y: chosen.y, z: chosen.z };
  }
}
