import type { Vec3 } from "./types";

/**
 * Conservative inner volume for starter fish placement, aligned with the visible
 * tank floor mesh in `TankScene` (floor at `TANK_FLOOR_Y` = -0.9, 24×16 plane).
 * Simulation stays independent of the render module; values are duplicated here
 * and should be updated if the scene framing changes materially.
 */
export const STARTER_SPAWN_VOLUME = {
  minX: -5.5,
  maxX: 5.5,
  minY: -0.82,
  maxY: 1.35,
  minZ: -3.5,
  maxZ: 3.5,
} as const;

export function isWithinStarterSpawnVolume(p: Vec3): boolean {
  const { minX, maxX, minY, maxY, minZ, maxZ } = STARTER_SPAWN_VOLUME;
  return p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY && p.z >= minZ && p.z <= maxZ;
}
