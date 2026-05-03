import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, MeshStandardMaterial } from "three";
import { useSimulationWorld } from "../game/simulationWorldContext";
import { fishWithKinematics } from "../sim/world";
import { getFishPalette } from "./tankArtDirection";

/**
 * Renders fish from the authoritative ECS world. Reads transforms each frame so
 * future movement systems stay render-driven without pushing gameplay into R3F.
 */
export function FishMeshesFromWorld() {
  const { world } = useSimulationWorld();
  const rootRef = useRef<Group>(null);
  const bodyMaterialRef = useRef<MeshStandardMaterial>(null);
  const bellyMaterialRef = useRef<MeshStandardMaterial>(null);
  const finMaterialRef = useRef<MeshStandardMaterial>(null);
  const eyeMaterialRef = useRef<MeshStandardMaterial>(null);
  const pupilMaterialRef = useRef<MeshStandardMaterial>(null);

  useFrame(() => {
    const root = rootRef.current;
    if (!root) return;
    const first = [...fishWithKinematics(world)][0];
    if (!first) return;
    root.position.set(first.position.x, first.position.y, first.position.z);
    if (Math.abs(first.velocity.x) > 0.001) {
      root.rotation.y = first.velocity.x >= 0 ? 0 : Math.PI;
    }

    const palette = getFishPalette(first.fish.species, first.fish.hungerStage);
    if (bodyMaterialRef.current) bodyMaterialRef.current.color.set(palette.body);
    if (bellyMaterialRef.current) bellyMaterialRef.current.color.set(palette.belly);
    if (finMaterialRef.current) finMaterialRef.current.color.set(palette.fin);
    if (eyeMaterialRef.current) eyeMaterialRef.current.color.set(palette.eye);
    if (pupilMaterialRef.current) pupilMaterialRef.current.color.set(palette.pupil);
  });

  return (
    <group ref={rootRef} raycast={() => {}}>
      <mesh position={[0.02, 0, 0]} scale={[1.75, 0.88, 0.96]}>
        <sphereGeometry args={[0.12, 24, 18]} />
        <meshStandardMaterial ref={bodyMaterialRef} roughness={0.42} metalness={0.06} />
      </mesh>
      <mesh position={[0.03, -0.045, 0]} scale={[1.4, 0.36, 0.7]}>
        <sphereGeometry args={[0.1, 20, 14]} />
        <meshStandardMaterial ref={bellyMaterialRef} roughness={0.52} metalness={0.03} />
      </mesh>

      <mesh position={[-0.165, 0.002, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.85, 1.05, 0.34]}>
        <coneGeometry args={[0.09, 0.22, 3]} />
        <meshStandardMaterial ref={finMaterialRef} roughness={0.5} metalness={0.04} />
      </mesh>
      <mesh position={[-0.028, 0.102, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.4, 0.62, 0.2]}>
        <coneGeometry args={[0.07, 0.14, 3]} />
        <meshStandardMaterial ref={finMaterialRef} roughness={0.5} metalness={0.04} />
      </mesh>
      <mesh position={[0.032, -0.1, 0]} rotation={[0, 0, -Math.PI / 2]} scale={[0.36, 0.66, 0.2]}>
        <coneGeometry args={[0.064, 0.14, 3]} />
        <meshStandardMaterial ref={finMaterialRef} roughness={0.5} metalness={0.04} />
      </mesh>

      <mesh position={[0.13, 0.04, 0.055]} scale={[0.16, 0.16, 0.16]}>
        <sphereGeometry args={[0.12, 14, 12]} />
        <meshStandardMaterial ref={eyeMaterialRef} roughness={0.35} metalness={0.1} />
      </mesh>
      <mesh position={[0.13, 0.04, -0.055]} scale={[0.16, 0.16, 0.16]}>
        <sphereGeometry args={[0.12, 14, 12]} />
        <meshStandardMaterial ref={eyeMaterialRef} roughness={0.35} metalness={0.1} />
      </mesh>
      <mesh position={[0.148, 0.04, 0.066]} scale={[0.065, 0.065, 0.065]}>
        <sphereGeometry args={[0.12, 10, 8]} />
        <meshStandardMaterial ref={pupilMaterialRef} roughness={0.35} metalness={0.08} />
      </mesh>
      <mesh position={[0.148, 0.04, -0.066]} scale={[0.065, 0.065, 0.065]}>
        <sphereGeometry args={[0.12, 10, 8]} />
        <meshStandardMaterial ref={pupilMaterialRef} roughness={0.35} metalness={0.08} />
      </mesh>
    </group>
  );
}
