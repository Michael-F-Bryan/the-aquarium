import { useEffect, useState } from "react";
import { RunSnapshotPersistenceEffect } from "./game/RunSnapshotPersistenceEffect";
import { SimulationClockProvider } from "./game/SimulationClockProvider";
import { SimulationWorldProvider } from "./game/SimulationWorldProvider";
import { useSimulationClock } from "./game/simulationClockContext";
import { loadRunBootstrapFromLocalStorage } from "./persistence/runSnapshotStorage";
import { TankScene } from "./tank/TankScene";
import { DayCounter } from "./ui/DayCounter";
import { PauseIcon, PlayIcon } from "./ui/hudIcons";
import { ScorePlaceholder } from "./ui/ScorePlaceholder";
import { ToastLogShell } from "./ui/ToastLogShell";

function GameShell() {
  const { paused, togglePause } = useSimulationClock();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        togglePause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [togglePause]);

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden">
      <div className="pointer-events-auto absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
        <DayCounter />
        <ScorePlaceholder />
        <ToastLogShell entries={[]} />
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-neutral-600 bg-neutral-900/90 px-3 py-1.5 text-sm font-medium text-neutral-100 shadow-sm backdrop-blur-sm hover:bg-neutral-800"
          aria-pressed={paused}
          onClick={togglePause}
        >
          {paused ? (
            <PlayIcon className="h-4 w-4 shrink-0 text-neutral-300" />
          ) : (
            <PauseIcon className="h-4 w-4 shrink-0 text-neutral-300" />
          )}
          <span>{paused ? "Resume simulation" : "Pause simulation"}</span>
        </button>
        {paused ? (
          <div
            role="status"
            aria-live="polite"
            aria-label="Simulation paused"
            className="rounded-md border border-amber-700/80 bg-amber-950/95 px-3 py-2 text-sm font-semibold tracking-wide text-amber-100 shadow-md"
          >
            Paused — world progression is frozen
          </div>
        ) : null}
      </div>
      <TankScene className="h-full min-h-0 w-full flex-1" paused={paused} />
      <p className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-neutral-400 drop-shadow-sm">
        The Aquarium
      </p>
    </div>
  );
}

export default function App() {
  const [bootstrap] = useState(() => loadRunBootstrapFromLocalStorage());
  return (
    <SimulationClockProvider initialClockState={bootstrap.simClockState}>
      <SimulationWorldProvider runSeed={bootstrap.runSeed} world={bootstrap.world}>
        <RunSnapshotPersistenceEffect />
        <GameShell />
      </SimulationWorldProvider>
    </SimulationClockProvider>
  );
}
