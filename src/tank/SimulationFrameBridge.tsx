import { useFrame } from "@react-three/fiber";
import { useSimulationClock } from "../game/simulationClockContext";

/**
 * Maps the R3F frame loop to simulation clock advances. Paused mode stops the
 * canvas frameloop, so this hook does not run while paused.
 */
export function SimulationFrameBridge() {
  const { paused, advanceByWallDelta } = useSimulationClock();
  useFrame((_, delta) => {
    if (paused) return;
    advanceByWallDelta(delta);
  });
  return null;
}
