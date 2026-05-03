import { useCallback, useEffect, useRef } from "react";
import { saveRunSnapshotToLocalStorage } from "../persistence/runSnapshotStorage";
import { useSimulationClock } from "./simulationClockContext";
import { useSimulationWorld } from "./simulationWorldContext";

/** Best-effort persist of the active run so refresh restores continuity (issue #20). */
export function RunSnapshotPersistenceEffect() {
  const { world, runSeed } = useSimulationWorld();
  const { paused, simDays } = useSimulationClock();
  const lastPersistedDayRollover = useRef(Math.floor(simDays));

  const flush = useCallback(() => {
    saveRunSnapshotToLocalStorage({
      world,
      simClockState: { paused, simDays },
      runSeed,
    });
  }, [world, paused, simDays, runSeed]);

  useEffect(() => {
    const currentDayRollover = Math.floor(simDays);
    if (currentDayRollover > lastPersistedDayRollover.current) {
      flush();
      lastPersistedDayRollover.current = currentDayRollover;
    }
  }, [simDays, flush]);

  useEffect(() => {
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
  }, [flush]);

  return null;
}
