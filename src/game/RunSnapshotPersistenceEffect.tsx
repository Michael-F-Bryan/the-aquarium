import { useEffect } from "react";
import { saveRunSnapshotToLocalStorage } from "../persistence/runSnapshotStorage";
import { useSimulationClock } from "./simulationClockContext";
import { useSimulationWorld } from "./simulationWorldContext";

/** Best-effort persist of the active run so refresh restores continuity (issue #20). */
export function RunSnapshotPersistenceEffect() {
  const { world, runSeed } = useSimulationWorld();
  const { paused, simDays } = useSimulationClock();

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
