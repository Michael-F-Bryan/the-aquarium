import { createContext, useContext } from "react";

export type SimulationClockContextValue = {
  paused: boolean;
  simDays: number;
  togglePause: () => void;
  advanceByWallDelta: (deltaWallSeconds: number) => void;
};

export const SimulationClockContext = createContext<SimulationClockContextValue | null>(null);

export function useSimulationClock(): SimulationClockContextValue {
  const ctx = useContext(SimulationClockContext);
  if (!ctx) {
    throw new Error("useSimulationClock must be used within SimulationClockProvider");
  }
  return ctx;
}
