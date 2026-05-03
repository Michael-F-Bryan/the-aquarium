import { useEffect, useState } from "react";
import { RunSnapshotPersistenceEffect } from "./game/RunSnapshotPersistenceEffect";
import { SimulationClockProvider } from "./game/SimulationClockProvider";
import { SimulationWorldProvider } from "./game/SimulationWorldProvider";
import { useSimulationClock } from "./game/simulationClockContext";
import { loadRunBootstrapFromLocalStorage } from "./persistence/runSnapshotStorage";
import { TankScene } from "./tank/TankScene";
import { DayCounter } from "./ui/DayCounter";
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
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-neutral-950 text-neutral-100">
      <header
        role="banner"
        aria-label="Aquarium controls"
        className="z-10 flex items-center justify-between gap-3 border-b border-neutral-800/90 bg-neutral-950/95 px-3 py-2.5 backdrop-blur-sm"
      >
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold tracking-wide text-neutral-100 sm:text-base">
            The Aquarium
          </h1>
          <p className="text-xs text-neutral-400">Playable seed shell layout</p>
        </div>
        <div className="flex items-center gap-2">
          <DayCounter />
          <button
            type="button"
            className="rounded-md border border-neutral-600 bg-neutral-900 px-3 py-1.5 text-sm font-medium text-neutral-100 shadow-sm hover:bg-neutral-800"
            aria-pressed={paused}
            onClick={togglePause}
          >
            {paused ? "Resume simulation" : "Pause simulation"}
          </button>
        </div>
      </header>
      <div
        data-testid="app-shell-grid"
        className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden p-3 lg:grid-cols-[18rem_minmax(0,1fr)_20rem]"
      >
        <main
          role="main"
          aria-label="Aquarium tank"
          className="order-1 min-h-[50dvh] min-w-0 overflow-hidden rounded-lg border border-cyan-900/70 bg-neutral-900/60 shadow-sm lg:order-2 lg:min-h-0"
        >
          <TankScene className="h-full min-h-0 w-full flex-1" paused={paused} />
        </main>
        <aside
          role="complementary"
          aria-label="Simulation overview and tuning"
          className="order-2 min-h-0 max-h-72 overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-900/70 p-3 lg:order-1 lg:max-h-none"
        >
          <div className="space-y-3">
            <section aria-label="Simulation stats" className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Simulation
              </h2>
              <DayCounter />
              <ScorePlaceholder />
              <p className="rounded-md border border-neutral-700 bg-neutral-950/70 px-3 py-2 text-sm text-neutral-300">
                Biomass: placeholder until conversion mechanics are wired.
              </p>
            </section>
            <section aria-label="Debug controls" className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Debug</h2>
              <p className="rounded-md border border-neutral-700 bg-neutral-950/70 px-3 py-2 text-sm text-neutral-300">
                Day length, food lifetime, and reproduction sliders appear here.
              </p>
            </section>
          </div>
        </aside>
        <aside
          role="complementary"
          aria-label="Fish and event details"
          className="order-3 min-h-0 max-h-72 overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-900/70 p-3 lg:max-h-none"
        >
          <div className="space-y-3">
            <section aria-label="Live fish list" className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Live Fish</h2>
              <p className="rounded-md border border-neutral-700 bg-neutral-950/70 px-3 py-2 text-sm text-neutral-300">
                Fish roster panel will render active entities.
              </p>
            </section>
            <section aria-label="Selected fish details" className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Selected Fish</h2>
              <p className="rounded-md border border-neutral-700 bg-neutral-950/70 px-3 py-2 text-sm text-neutral-300">
                Click a fish to inspect vitals and lifecycle events.
              </p>
            </section>
            <section aria-label="Dead fish list" className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Dead Fish</h2>
              <p className="rounded-md border border-neutral-700 bg-neutral-950/70 px-3 py-2 text-sm text-neutral-300">
                Dead fish and skeleton history appears here.
              </p>
            </section>
          </div>
        </aside>
      </div>
      <section
        role="region"
        aria-label="Toast notifications"
        className="pointer-events-none absolute bottom-3 left-3 z-20 w-[min(24rem,calc(100%-1.5rem))]"
      >
        <div className="pointer-events-auto">
          <ToastLogShell entries={[]} />
        </div>
      </section>
      {paused ? (
        <div
          role="status"
          aria-live="polite"
          aria-label="Simulation paused"
          className="absolute top-16 right-3 z-30 rounded-md border border-amber-700/80 bg-amber-950/95 px-3 py-2 text-sm font-semibold tracking-wide text-amber-100 shadow-md"
        >
          Paused — world progression is frozen
        </div>
      ) : null}
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
