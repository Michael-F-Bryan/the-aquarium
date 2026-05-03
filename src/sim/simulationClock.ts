/**
 * Wall-clock ↔ in-game day conversion at default speed (see docs/the-game.md).
 * Simulation progression uses this mapping from frame deltas.
 */
export const WALL_SECONDS_PER_SIM_DAY = 6.5;

/** Max wall seconds applied per step to avoid huge leaps after stalls (implementation-decisions.md). */
export const MAX_WALL_DELTA_SECONDS_PER_STEP = 0.25;

export type SimulationClockState = {
  paused: boolean;
  simDays: number;
};

export function clampWallDeltaSeconds(deltaWallSeconds: number): number {
  if (deltaWallSeconds <= 0) return 0;
  return Math.min(deltaWallSeconds, MAX_WALL_DELTA_SECONDS_PER_STEP);
}

export function wallDeltaToSimDays(deltaWallSeconds: number): number {
  return clampWallDeltaSeconds(deltaWallSeconds) / WALL_SECONDS_PER_SIM_DAY;
}

export function advanceClockByWallDelta(
  clock: SimulationClockState,
  deltaWallSeconds: number,
): SimulationClockState {
  if (clock.paused) return clock;
  const simDays = clock.simDays + wallDeltaToSimDays(deltaWallSeconds);
  return { ...clock, simDays };
}

export function togglePause(clock: SimulationClockState): SimulationClockState {
  return { ...clock, paused: !clock.paused };
}

export function setPaused(clock: SimulationClockState, paused: boolean): SimulationClockState {
  if (clock.paused === paused) return clock;
  return { ...clock, paused };
}
