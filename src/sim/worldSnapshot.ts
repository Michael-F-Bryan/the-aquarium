import type { World } from "miniplex";
import { InvalidEntityShapeError, assertFishEntityShape, assertFoodEntityShape } from "./guards";
import type { SimulationEntity, Vec3 } from "./types";
import { createSimulationWorld } from "./world";

export const SIMULATION_WORLD_SNAPSHOT_VERSION = 2 as const;

/** Legacy snapshots before `FishState.hungerStage` (`#7`). */
export const SIMULATION_WORLD_SNAPSHOT_VERSION_V1 = 1 as const;

export type SimulationWorldSnapshot = {
  version: typeof SIMULATION_WORLD_SNAPSHOT_VERSION | typeof SIMULATION_WORLD_SNAPSHOT_VERSION_V1;
  /** Plain JSON-serializable entity records (fish + food archetypes). */
  entities: unknown[];
};

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseOptionalMovementTarget(path: string, v: unknown): Vec3 | undefined {
  if (v === undefined) return undefined;
  if (!isPlainRecord(v)) {
    throw new InvalidEntityShapeError([`${path} must be an object with x, y, z numbers`]);
  }
  for (const k of ["x", "y", "z"] as const) {
    const n = v[k];
    if (typeof n !== "number" || !Number.isFinite(n)) {
      throw new InvalidEntityShapeError([`${path}.${k} must be a finite number`]);
    }
  }
  return { x: v.x as number, y: v.y as number, z: v.z as number };
}

function parseSnapshotEntity(raw: unknown, index: number): SimulationEntity {
  if (!isPlainRecord(raw)) {
    throw new InvalidEntityShapeError([`entities[${index}] must be a plain object`]);
  }
  if (raw.fish !== undefined) {
    const base = assertFishEntityShape(raw);
    const out: SimulationEntity = { ...base };
    if (raw.movementTargetPosition !== undefined) {
      out.movementTargetPosition = parseOptionalMovementTarget(
        `entities[${index}].movementTargetPosition`,
        raw.movementTargetPosition,
      );
    }
    return out;
  }
  if (raw.food !== undefined) {
    return assertFoodEntityShape(raw);
  }
  throw new InvalidEntityShapeError([`entities[${index}] must be a fish or food entity`]);
}

/**
 * Save hook: returns a JSON-safe snapshot of the world (including each fish's `hungerDays`).
 * Callers may `JSON.stringify` and persist (e.g. localStorage in a later ticket).
 */
export function serializeSimulationWorldSnapshot(world: World<SimulationEntity>): SimulationWorldSnapshot {
  const entities = world.entities.map((e) => JSON.parse(JSON.stringify(e)) as unknown);
  return { version: SIMULATION_WORLD_SNAPSHOT_VERSION, entities };
}

/**
 * Load hook: rebuilds a `World` from `serializeSimulationWorldSnapshot` output.
 */
export function deserializeSimulationWorldSnapshot(data: unknown): World<SimulationEntity> {
  if (!isPlainRecord(data)) {
    throw new InvalidEntityShapeError(["snapshot root must be an object"]);
  }
  if (data.version !== SIMULATION_WORLD_SNAPSHOT_VERSION && data.version !== SIMULATION_WORLD_SNAPSHOT_VERSION_V1) {
    throw new InvalidEntityShapeError([`unsupported snapshot version: ${String(data.version)}`]);
  }
  if (!Array.isArray(data.entities)) {
    throw new InvalidEntityShapeError(["snapshot.entities must be an array"]);
  }
  const entities = data.entities.map((raw, i) => parseSnapshotEntity(raw, i));
  return createSimulationWorld(entities);
}
