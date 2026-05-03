import { useEffect, useRef } from "react";
import { saveRunSnapshotToLocalStorage } from "../persistence/runSnapshotStorage";
import { useSimulationClock } from "./simulationClockContext";
import { useSimulationWorld } from "./simulationWorldContext";

function dayIndexFromSimDays(simDays: number): number {
  return Math.floor(Math.max(0, simDays));
}

/** Best-effort persist of the active run so refresh restores continuity (issue #20). */
export function RunSnapshotPersistenceEffect() {
  const { world, runSeed } = useSimulationWorld();
  const { paused, simDays } = useSimulationClock();
  const lastSavedDayIndex = useRef(dayIndexFromSimDays(simDays));

  useEffect(() => {
    const currentDayIndex = dayIndexFromSimDays(simDays);
    if (currentDayIndex <= lastSavedDayIndex.current) return;
    lastSavedDayIndex.current = currentDayIndex;
    saveRunSnapshotToLocalStorage({
      world,
      simClockState: { paused, simDays },
      runSeed,
    });
  }, [paused, runSeed, simDays, world]);

  useEffect(() => {
    const flush = () => {
      saveRunSnapshotToLocalStorage({
        world,
        simClockState: { paused, simDays },
        runSeed,
      });
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [world, paused, simDays, runSeed]);

  return null;
}
