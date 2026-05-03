import type { World } from "miniplex";
import { createNewRunSimulationWorld, DEFAULT_SIMULATION_SEED } from "../sim/newRunWorld";
import type { SimulationClockState } from "../sim/simulationClock";
import type { SimulationEntity } from "../sim/types";
import { deserializeRunSnapshot, serializeRunSnapshot, type SerializeRunSnapshotInput } from "./runSnapshot";

/** Stable `localStorage` key for run snapshot JSON (implementation-decisions.md). */
export const RUN_SNAPSHOT_STORAGE_KEY = "the-aquarium.run.v1" as const;

const defaultClock: SimulationClockState = { paused: false, simDays: 0 };

export type RunBootstrapSnapshot = {
  world: World<SimulationEntity>;
  simClockState: SimulationClockState;
  runSeed: number;
};

function newRunBootstrap(): RunBootstrapSnapshot {
  const runSeed = DEFAULT_SIMULATION_SEED;
  return {
    world: createNewRunSimulationWorld(runSeed),
    simClockState: { ...defaultClock },
    runSeed,
  };
}

/**
 * Reads persisted run state from `localStorage`. On missing, corrupt JSON, or invalid snapshot
 * shape, returns a fresh run (never throws to the caller).
 */
export function loadRunBootstrapFromLocalStorage(): RunBootstrapSnapshot {
  if (typeof localStorage === "undefined") {
    return newRunBootstrap();
  }
  let raw: string | null;
  try {
    raw = localStorage.getItem(RUN_SNAPSHOT_STORAGE_KEY);
  } catch {
    return newRunBootstrap();
  }
  if (raw == null || raw === "") {
    return newRunBootstrap();
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return newRunBootstrap();
  }
  try {
    const { world, simClockState, runSeed } = deserializeRunSnapshot(parsed);
    return {
      world,
      simClockState,
      runSeed: runSeed ?? DEFAULT_SIMULATION_SEED,
    };
  } catch {
    return newRunBootstrap();
  }
}

/** Persists the current run for restore on next load (best-effort; ignores quota / access errors). */
export function saveRunSnapshotToLocalStorage(input: SerializeRunSnapshotInput): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  try {
    localStorage.setItem(RUN_SNAPSHOT_STORAGE_KEY, JSON.stringify(serializeRunSnapshot(input)));
  } catch {
    // QuotaExceededError, SecurityError, etc.
  }
}
