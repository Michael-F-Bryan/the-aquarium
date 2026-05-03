import { Canvas } from "@react-three/fiber";
import { Color } from "three";
import {
  TANK_CAMERA_FAR,
  TANK_CAMERA_FOV,
  TANK_CAMERA_NEAR,
  TANK_CAMERA_POSITION,
  TANK_FLOOR_Y,
  TANK_SCENE_BACKGROUND,
} from "./tankCameraConstants";
import { FishMeshesFromWorld } from "./FishMeshesFromWorld";
import { SimulationFrameBridge } from "./SimulationFrameBridge";

const sceneBackground = new Color(TANK_SCENE_BACKGROUND);

export type TankSceneProps = {
  className?: string;
  /** When true, stops the render loop so the tank and simulation clock stay frozen. */
  paused?: boolean;
};

export function TankScene({ className, paused = false }: TankSceneProps) {
  const frameloop = paused ? "never" : "always";
  const rootClass = [className, paused ? "pointer-events-none" : ""].filter(Boolean).join(" ");
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
        <FishMeshesFromWorld />
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 6, 3]} intensity={0.85} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, TANK_FLOOR_Y, 0]}>
          <planeGeometry args={[24, 16]} />
          <meshStandardMaterial
            color="#142a36"
            metalness={0.05}
            roughness={0.95}
          />
        </mesh>
      </Canvas>
    </div>
  );
}
