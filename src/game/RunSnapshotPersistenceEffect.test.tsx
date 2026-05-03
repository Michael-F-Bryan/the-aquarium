import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createNewRunSimulationWorld } from "../sim/newRunWorld";
import { RunSnapshotPersistenceEffect } from "./RunSnapshotPersistenceEffect";
import { SimulationClockContext, type SimulationClockContextValue } from "./simulationClockContext";
import { SimulationWorldContext } from "./simulationWorldContext";

const saveRunSnapshotToLocalStorage = vi.fn();

vi.mock("../persistence/runSnapshotStorage", () => ({
  saveRunSnapshotToLocalStorage: (...args: unknown[]) => saveRunSnapshotToLocalStorage(...args),
}));

afterEach(() => {
  cleanup();
  saveRunSnapshotToLocalStorage.mockReset();
});

function renderWithContexts(simDays: number) {
  const world = createNewRunSimulationWorld(123);
  const clock: SimulationClockContextValue = {
    paused: false,
    simDays,
    togglePause: () => {},
    advanceByWallDelta: () => {},
  };

  return render(
    <SimulationWorldContext.Provider value={{ world, runSeed: 123 }}>
      <SimulationClockContext.Provider value={clock}>
        <RunSnapshotPersistenceEffect />
      </SimulationClockContext.Provider>
    </SimulationWorldContext.Provider>,
  );
}

describe("RunSnapshotPersistenceEffect", () => {
  it("does not autosave before crossing a whole-day boundary", () => {
    const app = renderWithContexts(0.2);
    app.rerender(
      <SimulationWorldContext.Provider value={{ world: createNewRunSimulationWorld(123), runSeed: 123 }}>
        <SimulationClockContext.Provider
          value={{ paused: false, simDays: 0.95, togglePause: () => {}, advanceByWallDelta: () => {} }}
        >
          <RunSnapshotPersistenceEffect />
        </SimulationClockContext.Provider>
      </SimulationWorldContext.Provider>,
    );
    expect(saveRunSnapshotToLocalStorage).not.toHaveBeenCalled();
  });

  it("autosaves exactly once when simDays crosses into a new day", () => {
    const app = renderWithContexts(0.95);
    app.rerender(
      <SimulationWorldContext.Provider value={{ world: createNewRunSimulationWorld(123), runSeed: 123 }}>
        <SimulationClockContext.Provider
          value={{ paused: false, simDays: 1.01, togglePause: () => {}, advanceByWallDelta: () => {} }}
        >
          <RunSnapshotPersistenceEffect />
        </SimulationClockContext.Provider>
      </SimulationWorldContext.Provider>,
    );
    expect(saveRunSnapshotToLocalStorage).toHaveBeenCalledTimes(1);
  });
});
