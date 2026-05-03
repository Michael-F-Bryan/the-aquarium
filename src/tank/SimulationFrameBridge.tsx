import { useFrame } from "@react-three/fiber";
import { useSimulationClock } from "../game/simulationClockContext";
import { useSimulationWorld } from "../game/simulationWorldContext";
import {
  clampWallDeltaSeconds,
  stepFishKinematicsWallDelta,
  stepHungerTimersWallDelta,
} from "../sim";

/**
 * Maps the R3F frame loop to simulation clock advances and authoritative fish
 * kinematics. Paused mode stops the canvas frameloop, so this hook does not run while paused.
 */
export function SimulationFrameBridge() {
  const { paused, advanceByWallDelta, simDays } = useSimulationClock();
  const { world } = useSimulationWorld();

  useFrame((_, delta) => {
    if (paused) return;
    const dt = clampWallDeltaSeconds(delta);
    stepFishKinematicsWallDelta(world, { wallDeltaSeconds: dt, simTimeDays: simDays });
    stepHungerTimersWallDelta(world, { wallDeltaSeconds: dt });
    advanceByWallDelta(dt);
  });
  return null;
}
