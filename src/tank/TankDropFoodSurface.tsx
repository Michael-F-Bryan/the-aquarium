import { useCallback } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { DoubleSide } from "three";
import { useSimulationClock } from "../game/simulationClockContext";
import { useSimulationWorld } from "../game/simulationWorldContext";
import { tryDropFoodAt } from "../sim/dropFood";

/**
 * Invisible hit surface for pointer picks; forwards world-space hits into `tryDropFoodAt`.
 * Simulation rules stay in `src/sim/dropFood.ts` (unit-tested without R3F).
 */
export function TankDropFoodSurface() {
  const { paused, simDays } = useSimulationClock();
  const { world } = useSimulationWorld();

  const onPointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      event.stopPropagation();
      tryDropFoodAt(world, {
        paused,
        simDays,
        pickPosition: { x: event.point.x, y: event.point.y, z: event.point.z },
      });
    },
    [paused, simDays, world],
  );

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.22, 0]}
      onPointerDown={onPointerDown}
    >
      {/* Match floor plane footprint (`TankScene` floor 24×16) so picks align with the whole tank. */}
      <planeGeometry args={[24, 16]} />
      <meshBasicMaterial
        transparent
        opacity={0}
        depthWrite={false}
        side={DoubleSide}
      />
    </mesh>
  );
}
