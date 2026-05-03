import { useMemo, type ReactNode } from "react";
import type { World } from "miniplex";
import type { SimulationEntity } from "../sim/types";
import { createNewRunSimulationWorld, DEFAULT_SIMULATION_SEED } from "../sim/newRunWorld";
import { SimulationWorldContext } from "./simulationWorldContext";

export type SimulationWorldProviderProps = {
  children: ReactNode;
  /** Simulation RNG / starter baseline; default is deterministic across loads. */
  runSeed?: number;
  /** When set (e.g. restore), this world is used instead of creating a new run. */
  world?: World<SimulationEntity>;
};

export function SimulationWorldProvider({
  children,
  runSeed = DEFAULT_SIMULATION_SEED,
  world: worldProp,
}: SimulationWorldProviderProps) {
  const value = useMemo((): { world: World<SimulationEntity>; runSeed: number } => {
    const world = worldProp ?? createNewRunSimulationWorld(runSeed);
    return { world, runSeed };
  }, [worldProp, runSeed]);

  return <SimulationWorldContext.Provider value={value}>{children}</SimulationWorldContext.Provider>;
}
