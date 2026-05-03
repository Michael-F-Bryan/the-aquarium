import type { World } from "miniplex";
import type { SimulationClockState } from "../sim/simulationClock";
import type { SimulationEntity } from "../sim/types";
import type { SimulationWorldSnapshot } from "../sim/worldSnapshot";
import {
  deserializeSimulationWorldSnapshot,
  serializeSimulationWorldSnapshot,
} from "../sim/worldSnapshot";
import { InvalidRunSnapshotError } from "./runSnapshotErrors";

/** Top-level save envelope; distinct from `SIMULATION_WORLD_SNAPSHOT_VERSION` on nested `world`. */
export const RUN_SNAPSHOT_FORMAT_VERSION = 1 as const;

export type RunSnapshot = {
  formatVersion: typeof RUN_SNAPSHOT_FORMAT_VERSION;
  world: SimulationWorldSnapshot;
  simClock: SimulationClockState;
  runSeed?: number;
};

export type SerializeRunSnapshotInput = {
  world: World<SimulationEntity>;
  simClockState: SimulationClockState;
  /** Persisted for reproducibility (implementation-decisions.md RNG strategy). */
  runSeed?: number;
};

export type DeserializedRunSnapshot = {
  world: World<SimulationEntity>;
  simClockState: SimulationClockState;
  runSeed?: number;
};

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseSimClock(value: unknown, path: string): SimulationClockState {
  if (!isPlainRecord(value)) {
    throw new InvalidRunSnapshotError([`${path} must be an object`]);
  }
  const paused = value.paused;
  const simDays = value.simDays;
  if (typeof paused !== "boolean") {
    throw new InvalidRunSnapshotError([`${path}.paused must be a boolean`]);
  }
  if (typeof simDays !== "number" || !Number.isFinite(simDays)) {
    throw new InvalidRunSnapshotError([`${path}.simDays must be a finite number`]);
  }
  return { paused, simDays };
}

function parseOptionalRunSeed(value: unknown, path: string): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new InvalidRunSnapshotError([`${path} must be a finite number when present`]);
  }
  return value;
}

/**
 * Serializes the current run into a JSON-safe structure for `localStorage` or download hooks.
 * Callers persist with `JSON.stringify(serializeRunSnapshot(...))`.
 */
export function serializeRunSnapshot(input: SerializeRunSnapshotInput): RunSnapshot {
  const base: RunSnapshot = {
    formatVersion: RUN_SNAPSHOT_FORMAT_VERSION,
    world: serializeSimulationWorldSnapshot(input.world),
    simClock: {
      paused: input.simClockState.paused,
      simDays: input.simClockState.simDays,
    },
  };
  if (input.runSeed !== undefined) {
    return { ...base, runSeed: input.runSeed };
  }
  return base;
}

/** Restores a run from `JSON.parse` output of a persisted `serializeRunSnapshot` payload. */
export function deserializeRunSnapshot(data: unknown): DeserializedRunSnapshot {
  if (!isPlainRecord(data)) {
    throw new InvalidRunSnapshotError(["run snapshot root must be an object"]);
  }
  if (data.formatVersion !== RUN_SNAPSHOT_FORMAT_VERSION) {
    throw new InvalidRunSnapshotError([
      `unsupported run snapshot formatVersion: ${String(data.formatVersion)}`,
    ]);
  }
  const simClock = parseSimClock(data.simClock, "simClock");
  const world = deserializeSimulationWorldSnapshot(data.world);
  const runSeed = parseOptionalRunSeed(data.runSeed, "runSeed");
  return { world, simClockState: simClock, runSeed };
}
