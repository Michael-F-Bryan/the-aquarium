import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { InstancedMesh } from "three";
import { MeshStandardMaterial, Object3D, SphereGeometry } from "three";
import { useSimulationWorld } from "../game/simulationWorldContext";
import type { SimulationEntity } from "../sim/types";
import { foodWithPosition } from "../sim/world";

/** Upper bound on concurrent flakes (instancing); drop rules keep this comfortably small. */
const MAX_FOOD_INSTANCES = 128;

const dummy = new Object3D();

/**
 * Renders food flakes from ECS positions. Updates instance transforms each frame; no
 * simulation writes from R3F. Raycast is a no-op so picks still hit `TankDropFoodSurface`.
 */
export function FoodMeshesFromWorld() {
  const { world } = useSimulationWorld();
  const meshRef = useRef<InstancedMesh>(null);

  const [geometry, material] = useMemo(() => {
    const geom = new SphereGeometry(0.048, 12, 10);
    const mat = new MeshStandardMaterial({
      color: "#c4a060",
      roughness: 0.7,
      metalness: 0.06,
    });
    return [geom, mat] as const;
  }, []);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (mesh) mesh.count = 0;
  }, []);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const foods = [...foodWithPosition(world)] as SimulationEntity[];
    const n = Math.min(foods.length, MAX_FOOD_INSTANCES);
    mesh.count = n;
    for (let i = 0; i < n; i++) {
      const p = foods[i].position;
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1.35, 0.28, 1.05);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, MAX_FOOD_INSTANCES]}
      frustumCulled={false}
      raycast={() => {}}
    />
  );
}
