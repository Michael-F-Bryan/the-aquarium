import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SimulationClockProvider } from "../game/SimulationClockProvider";
import { useSimulationClock } from "../game/simulationClockContext";
import {
  MAX_WALL_DELTA_SECONDS_PER_STEP,
  WALL_SECONDS_PER_SIM_DAY,
} from "../sim/simulationClock";
import { DayCounter } from "./DayCounter";

afterEach(() => {
  cleanup();
});

/** One `advanceByWallDelta` applies at most `MAX_WALL_DELTA_SECONDS_PER_STEP` (see simulationClock). */
const ADVANCE_CLICKS_PER_SIM_DAY = Math.ceil(
  WALL_SECONDS_PER_SIM_DAY / MAX_WALL_DELTA_SECONDS_PER_STEP,
);

function DayCounterHarness() {
  const { advanceByWallDelta, togglePause } = useSimulationClock();
  return (
    <>
      <DayCounter />
      <button
        type="button"
        aria-label="Advance one full simulation day"
        onClick={() => {
          for (let i = 0; i < ADVANCE_CLICKS_PER_SIM_DAY; i++) {
            advanceByWallDelta(WALL_SECONDS_PER_SIM_DAY);
          }
        }}
      />
      <button type="button" aria-label="Toggle pause" onClick={togglePause} />
    </>
  );
}

function renderWithClock() {
  return render(
    <SimulationClockProvider>
      <DayCounterHarness />
    </SimulationClockProvider>,
  );
}

describe("DayCounter", () => {
  it("shows day 1 at the start of a new simulation", () => {
    renderWithClock();
    expect(screen.getByRole("status", { name: /current simulation day,\s*1/i })).toBeTruthy();
  });

  it("increments the displayed day when the simulation clock advances", () => {
    renderWithClock();
    fireEvent.click(screen.getByRole("button", { name: /advance one full simulation day/i }));
    expect(screen.getByRole("status", { name: /current simulation day,\s*2/i })).toBeTruthy();
  });

  it("does not advance the displayed day while the simulation is paused", () => {
    renderWithClock();
    fireEvent.click(screen.getByRole("button", { name: /advance one full simulation day/i }));
    expect(screen.getByRole("status", { name: /current simulation day,\s*2/i })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /toggle pause/i }));
    fireEvent.click(screen.getByRole("button", { name: /advance one full simulation day/i }));
    expect(screen.getByRole("status", { name: /current simulation day,\s*2/i })).toBeTruthy();
  });

  it("resumes advancing the displayed day after unpause", () => {
    renderWithClock();
    fireEvent.click(screen.getByRole("button", { name: /advance one full simulation day/i }));
    fireEvent.click(screen.getByRole("button", { name: /toggle pause/i }));
    fireEvent.click(screen.getByRole("button", { name: /advance one full simulation day/i }));
    fireEvent.click(screen.getByRole("button", { name: /toggle pause/i }));
    fireEvent.click(screen.getByRole("button", { name: /advance one full simulation day/i }));
    expect(screen.getByRole("status", { name: /current simulation day,\s*3/i })).toBeTruthy();
  });
});
