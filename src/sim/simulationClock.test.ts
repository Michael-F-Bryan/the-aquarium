import { describe, expect, it } from "vitest";
import {
  MAX_WALL_DELTA_SECONDS_PER_STEP,
  WALL_SECONDS_PER_SIM_DAY,
  advanceClockByWallDelta,
  clampWallDeltaSeconds,
  setPaused,
  togglePause,
  wallDeltaToSimDays,
  type SimulationClockState,
} from "./simulationClock";

describe("simulationClock", () => {
  const running: SimulationClockState = { paused: false, simDays: 0 };
  const paused: SimulationClockState = { paused: true, simDays: 2 };

  it("advances simDays by wall delta when not paused (respects per-step clamp)", () => {
    const wallDt = 0.1;
    const next = advanceClockByWallDelta(running, wallDt);
    expect(next.paused).toBe(false);
    expect(next.simDays).toBeCloseTo(wallDt / WALL_SECONDS_PER_SIM_DAY, 5);
  });

  it("does not advance simDays while paused", () => {
    const next = advanceClockByWallDelta(paused, WALL_SECONDS_PER_SIM_DAY * 10);
    expect(next).toEqual(paused);
  });

  it("resumes advancing from the same simDays after unpause", () => {
    const wallDt = 0.2;
    const mid = advanceClockByWallDelta(running, wallDt);
    expect(mid.simDays).toBeCloseTo(wallDt / WALL_SECONDS_PER_SIM_DAY, 5);
    const frozen = setPaused(mid, true);
    const still = advanceClockByWallDelta(frozen, wallDt * 50);
    expect(still.simDays).toBeCloseTo(mid.simDays, 5);
    const thawed = setPaused(still, false);
    const after = advanceClockByWallDelta(thawed, wallDt);
    expect(after.simDays).toBeCloseTo((2 * wallDt) / WALL_SECONDS_PER_SIM_DAY, 5);
  });

  it("clamps large wall deltas before converting to sim days", () => {
    expect(clampWallDeltaSeconds(999)).toBe(MAX_WALL_DELTA_SECONDS_PER_STEP);
    expect(wallDeltaToSimDays(999)).toBe(
      MAX_WALL_DELTA_SECONDS_PER_STEP / WALL_SECONDS_PER_SIM_DAY,
    );
  });

  it("togglePause flips paused flag without changing simDays", () => {
    const t = togglePause(running);
    expect(t).toEqual({ paused: true, simDays: 0 });
    expect(togglePause(t)).toEqual({ paused: false, simDays: 0 });
  });
});
