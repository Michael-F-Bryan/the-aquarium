import { useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Color } from "three";
import { CanvasTexture, RepeatWrapping } from "three";
import {
  TANK_CAMERA_FAR,
  TANK_CAMERA_FOV,
  TANK_CAMERA_NEAR,
  TANK_CAMERA_POSITION,
  TANK_FLOOR_Y,
  TANK_SCENE_BACKGROUND,
} from "./tankCameraConstants";
import { FishMeshesFromWorld } from "./FishMeshesFromWorld";
import { FoodMeshesFromWorld } from "./FoodMeshesFromWorld";
import { SimulationFrameBridge } from "./SimulationFrameBridge";
import { TankDropFoodSurface } from "./TankDropFoodSurface";
import { createFloorTextureCanvas } from "./tankArtDirection";

const sceneBackground = new Color(TANK_SCENE_BACKGROUND);

export type TankSceneProps = {
  className?: string;
  /** When true, stops the render loop so the tank and simulation clock stay frozen. */
  paused?: boolean;
};

export function TankScene({ className, paused = false }: TankSceneProps) {
  const frameloop = paused ? "never" : "always";
  const rootClass = [className, paused ? "pointer-events-none" : ""].filter(Boolean).join(" ");
  const floorTexture = useMemo(() => {
    const texture = new CanvasTexture(createFloorTextureCanvas(384));
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(3, 2);
    return texture;
  }, []);
  useEffect(() => () => floorTexture.dispose(), [floorTexture]);

  return (
    <div className={rootClass} data-testid="tank-scene-root">
      <Canvas
        className="h-full w-full touch-none"
        frameloop={frameloop}
        gl={{ antialias: true, alpha: false }}
        camera={{
          position: TANK_CAMERA_POSITION,
          fov: TANK_CAMERA_FOV,
          near: TANK_CAMERA_NEAR,
          far: TANK_CAMERA_FAR,
        }}
        onCreated={({ scene }) => {
          scene.background = sceneBackground;
        }}
      >
        <SimulationFrameBridge />
        <TankDropFoodSurface />
        <FoodMeshesFromWorld />
        <FishMeshesFromWorld />
        <ambientLight intensity={0.58} />
        <directionalLight position={[4, 6, 3]} intensity={0.9} />
        <directionalLight position={[-3, 2.8, -4]} intensity={0.28} color="#7ec9ff" />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, TANK_FLOOR_Y, 0]}>
          <planeGeometry args={[24, 16]} />
          <meshStandardMaterial
            map={floorTexture}
            color="#9ccce7"
            metalness={0.04}
            roughness={0.9}
          />
        </mesh>
      </Canvas>
    </div>
  );
}
