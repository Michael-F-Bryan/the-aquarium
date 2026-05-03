import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createNewRunSimulationWorld } from "../sim/newRunWorld";
import { type SimulationClockState } from "../sim/simulationClock";
import { SimulationClockProvider } from "./SimulationClockProvider";
import { RunSnapshotPersistenceEffect } from "./RunSnapshotPersistenceEffect";
import { useSimulationClock } from "./simulationClockContext";
import { SimulationWorldProvider } from "./SimulationWorldProvider";

vi.mock("../persistence/runSnapshotStorage", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../persistence/runSnapshotStorage")>();
  return {
    ...actual,
    saveRunSnapshotToLocalStorage: vi.fn(),
  };
});

import { saveRunSnapshotToLocalStorage } from "../persistence/runSnapshotStorage";

const mockedSaveRunSnapshotToLocalStorage = vi.mocked(saveRunSnapshotToLocalStorage);

afterEach(() => {
  cleanup();
  mockedSaveRunSnapshotToLocalStorage.mockReset();
});

function RolloverHarness() {
  const { advanceByWallDelta, togglePause } = useSimulationClock();
  return (
    <>
      <RunSnapshotPersistenceEffect />
      <button type="button" aria-label="Advance one simulation step" onClick={() => advanceByWallDelta(0.1)} />
      <button type="button" aria-label="Toggle pause" onClick={togglePause} />
    </>
  );
}

function renderWithProviders(initialClockState: SimulationClockState) {
  const world = createNewRunSimulationWorld(42);
  return render(
    <SimulationClockProvider initialClockState={initialClockState}>
      <SimulationWorldProvider runSeed={42} world={world}>
        <RolloverHarness />
      </SimulationWorldProvider>
    </SimulationClockProvider>,
  );
}

describe("RunSnapshotPersistenceEffect", () => {
  it("does not autosave before simulated day rollover", () => {
    renderWithProviders({ paused: false, simDays: 0.95 });
    fireEvent.click(screen.getByRole("button", { name: /advance one simulation step/i }));
    expect(mockedSaveRunSnapshotToLocalStorage).not.toHaveBeenCalled();
  });

  it("autosaves when simulation day rolls over", () => {
    renderWithProviders({ paused: false, simDays: 0.99 });
    fireEvent.click(screen.getByRole("button", { name: /advance one simulation step/i }));
    expect(mockedSaveRunSnapshotToLocalStorage).toHaveBeenCalledTimes(1);
  });

  it("does not autosave while paused", () => {
    renderWithProviders({ paused: false, simDays: 0.99 });
    fireEvent.click(screen.getByRole("button", { name: /toggle pause/i }));
    fireEvent.click(screen.getByRole("button", { name: /advance one simulation step/i }));
    expect(mockedSaveRunSnapshotToLocalStorage).not.toHaveBeenCalled();
  });
});
