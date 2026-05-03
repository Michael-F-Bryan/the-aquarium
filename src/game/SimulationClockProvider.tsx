import { useCallback, useMemo, useState, type ReactNode } from "react";
import { advanceClockByWallDelta, togglePause, type SimulationClockState } from "../sim/simulationClock";
import { SimulationClockContext, type SimulationClockContextValue } from "./simulationClockContext";

const initialClock: SimulationClockState = { paused: false, simDays: 0 };

export function SimulationClockProvider({ children }: { children: ReactNode }) {
  const [clock, setClock] = useState<SimulationClockState>(initialClock);

  const advanceByWallDelta = useCallback((deltaWallSeconds: number) => {
    setClock((c) => advanceClockByWallDelta(c, deltaWallSeconds));
  }, []);

  const handleTogglePause = useCallback(() => {
    setClock((c) => togglePause(c));
  }, []);

  const value = useMemo(
    (): SimulationClockContextValue => ({
      paused: clock.paused,
      simDays: clock.simDays,
      togglePause: handleTogglePause,
      advanceByWallDelta,
    }),
    [clock.paused, clock.simDays, handleTogglePause, advanceByWallDelta],
  );

  return <SimulationClockContext.Provider value={value}>{children}</SimulationClockContext.Provider>;
}
