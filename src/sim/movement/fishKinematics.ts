import type { World } from "miniplex";
import { clampWallDeltaSeconds } from "../simulationClock";
import { STARTER_SPAWN_VOLUME } from "../starterSpawnBounds";
import type { SimulationEntity, Vec3 } from "../types";
import { fishWithKinematics, type FishKinematicsEntity } from "../world";

export type StepFishKinematicsOptions = {
  wallDeltaSeconds: number;
  /** Simulation time at the start of this kinematics step (game days), for deterministic wander. */
  simTimeDays: number;
};

const MAX_IDLE_SPEED = 0.32;
/** Slightly faster than idle wander so flakes are visibly chased (`docs/the-game.md` feeding). */
const MAX_TARGET_CHASE_SPEED = 0.42;
const VELOCITY_RESPONSIVENESS = 5.5;

function wanderOffsetFromName(displayName: string): number {
  let h = 0;
  for (let i = 0; i < displayName.length; i++) {
    h = (h + displayName.charCodeAt(i) * (i + 17)) % 997;
  }
  return h * 0.017;
}

function hasActiveMovementTarget(entity: FishKinematicsEntity & SimulationEntity): boolean {
  return entity.movementTargetPosition !== undefined;
}

function clampPositionResolveVelocity(position: Vec3, velocity: Vec3): void {
  const { minX, maxX, minY, maxY, minZ, maxZ } = STARTER_SPAWN_VOLUME;
  if (position.x < minX) {
    position.x = minX;
    if (velocity.x < 0) velocity.x = 0;
  } else if (position.x > maxX) {
    position.x = maxX;
    if (velocity.x > 0) velocity.x = 0;
  }
  if (position.y < minY) {
    position.y = minY;
    if (velocity.y < 0) velocity.y = 0;
  } else if (position.y > maxY) {
    position.y = maxY;
    if (velocity.y > 0) velocity.y = 0;
  }
  if (position.z < minZ) {
    position.z = minZ;
    if (velocity.z < 0) velocity.z = 0;
  } else if (position.z > maxZ) {
    position.z = maxZ;
    if (velocity.z > 0) velocity.z = 0;
  }
}

function desiredIdleVelocity(displayName: string, simTimeDays: number): Vec3 {
  const offset = wanderOffsetFromName(displayName);
  const t = simTimeDays * Math.PI * 2 * 1.2 + offset;
  const ax = Math.sin(t * 1.07);
  const ay = Math.sin(t * 0.63) * 0.45;
  const az = Math.cos(t * 0.98);
  const len = Math.hypot(ax, ay, az) || 1;
  const s = MAX_IDLE_SPEED / len;
  return { x: ax * s, y: ay * s, z: az * s };
}

/**
 * Movement phase: chase `movementTargetPosition` when set, otherwise idle wander.
 * Mutates ECS `position` / `velocity`; clamped to `STARTER_SPAWN_VOLUME` tank bounds.
 */
export function stepFishKinematicsWallDelta(
  world: World<SimulationEntity>,
  options: StepFishKinematicsOptions,
): void {
  const dt = clampWallDeltaSeconds(options.wallDeltaSeconds);
  if (dt <= 0) return;

  const { simTimeDays } = options;
  const blend = 1 - Math.exp(-VELOCITY_RESPONSIVENESS * dt);

  for (const entity of fishWithKinematics(world)) {
    const e = entity as FishKinematicsEntity & SimulationEntity;
    if (!e.fish.alive) continue;

    const v = e.velocity;
    const p = e.position;

    if (hasActiveMovementTarget(e)) {
      const target = e.movementTargetPosition!;
      const toX = target.x - p.x;
      const toY = target.y - p.y;
      const toZ = target.z - p.z;
      const dist = Math.hypot(toX, toY, toZ);
      if (dist > 1e-6) {
        const inv = 1 / dist;
        const desired = {
          x: toX * inv * MAX_TARGET_CHASE_SPEED,
          y: toY * inv * MAX_TARGET_CHASE_SPEED,
          z: toZ * inv * MAX_TARGET_CHASE_SPEED,
        };
        v.x += (desired.x - v.x) * blend;
        v.y += (desired.y - v.y) * blend;
        v.z += (desired.z - v.z) * blend;
      }

      p.x += v.x * dt;
      p.y += v.y * dt;
      p.z += v.z * dt;

      clampPositionResolveVelocity(p, v);
      continue;
    }

    const desired = desiredIdleVelocity(e.fish.displayName, simTimeDays);

    v.x += (desired.x - v.x) * blend;
    v.y += (desired.y - v.y) * blend;
    v.z += (desired.z - v.z) * blend;

    p.x += v.x * dt;
    p.y += v.y * dt;
    p.z += v.z * dt;

    clampPositionResolveVelocity(p, v);
  }
}
