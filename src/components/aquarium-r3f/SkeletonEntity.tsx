import type { FishSkeleton } from '../../game/types'
import { toScenePoint } from './coordinates'
import type { AquariumSize } from './pointer'
import { useLabelTexture } from './useLabelTexture'

type SkeletonEntityProps = {
  readonly skeleton: FishSkeleton
  readonly aquariumSize: AquariumSize
}

export function SkeletonEntity({
  skeleton,
  aquariumSize,
}: SkeletonEntityProps) {
  const label = useLabelTexture([skeleton.preyName], {
    fillStyle: 'rgba(226, 232, 240, 0.5)',
    font: '500 10px system-ui, "Segoe UI", sans-serif',
    lineHeight: 12,
    paddingX: 5,
    paddingY: 3,
  })

  return (
    <group
      position={toScenePoint(skeleton.physics.position, aquariumSize, 3)}
      rotation={[0, 0, -0.15]}
    >
      <mesh>
        <planeGeometry args={[36, 1.5]} />
        <meshBasicMaterial
          color="#e2e8f0"
          opacity={0.55}
          transparent
          toneMapped={false}
        />
      </mesh>
      {[-12, -4, 4, 12].map((x) => (
        <group key={x} position={[x, 0, 0.1]}>
          <mesh rotation={[0, 0, 0.32]} position={[-1.5, 4, 0]}>
            <planeGeometry args={[2, 9]} />
            <meshBasicMaterial
              color="#94a3b8"
              opacity={0.38}
              transparent
              toneMapped={false}
            />
          </mesh>
          <mesh rotation={[0, 0, -0.32]} position={[1.5, 4, 0]}>
            <planeGeometry args={[2, 9]} />
            <meshBasicMaterial
              color="#94a3b8"
              opacity={0.38}
              transparent
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
      {label ? (
        <sprite position={[0, -13, 8]} scale={[label.width, label.height, 1]}>
          <spriteMaterial
            map={label.texture}
            transparent
            depthTest={false}
            depthWrite={false}
          />
        </sprite>
      ) : null}
    </group>
  )
}
