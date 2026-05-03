import { createContext, useContext } from "react";
import type { World } from "miniplex";
import type { SimulationEntity } from "../sim/types";

export type SimulationWorldContextValue = {
  world: World<SimulationEntity>;
  runSeed: number;
};

export const SimulationWorldContext = createContext<SimulationWorldContextValue | null>(null);

export function useSimulationWorld(): SimulationWorldContextValue {
  const ctx = useContext(SimulationWorldContext);
  if (!ctx) {
    throw new Error("useSimulationWorld must be used within SimulationWorldProvider");
  }
  return ctx;
}
