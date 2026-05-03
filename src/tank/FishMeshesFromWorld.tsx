import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { useSimulationWorld } from "../game/simulationWorldContext";
import { fishWithKinematics } from "../sim/world";

/**
 * Renders fish from the authoritative ECS world. Reads transforms each frame so
 * future movement systems stay render-driven without pushing gameplay into R3F.
 */
export function FishMeshesFromWorld() {
  const { world } = useSimulationWorld();
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const first = [...fishWithKinematics(world)][0];
    if (!first) return;
    mesh.position.set(first.position.x, first.position.y, first.position.z);
  });

  return (
    <mesh ref={meshRef} raycast={() => {}}>
      <sphereGeometry args={[0.12, 20, 16]} />
      <meshStandardMaterial color="#6eb5d9" roughness={0.45} metalness={0.15} />
    </mesh>
  );
}
