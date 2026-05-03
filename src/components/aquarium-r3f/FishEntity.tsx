import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import { FISH_SPRITE_H, FISH_SPRITE_W } from '../../game/constants'
import { healthFace } from '../../game/healthFace'
import {
  FISH_SPRITE_PATH,
  logWeightScale,
} from '../../game/render/fishPresentation'
import type { DeadFish, Fish } from '../../game/types'
import { fishAnchorPoint, toScenePoint } from './coordinates'
import type { AquariumSize } from './pointer'
import { useLabelTexture } from './useLabelTexture'

type FishEntityProps = {
  readonly fish: Fish
  readonly aquariumSize: AquariumSize
}

type DeadFishEntityProps = {
  readonly fish: DeadFish
  readonly aquariumSize: AquariumSize
}

function useSpriteTexture(src: string) {
  return useLoader(TextureLoader, src)
}

function FishLabel({
  lines,
  y,
  muted = false,
}: {
  readonly lines: readonly string[]
  readonly y: number
  readonly muted?: boolean
}) {
  const label = useLabelTexture(
    lines,
    muted ? { fillStyle: 'rgba(148, 163, 184, 0.9)' } : {},
  )
  if (!label) return null

  return (
    <sprite position={[0, y, 12]} scale={[label.width, label.height, 1]}>
      <spriteMaterial
        map={label.texture}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </sprite>
  )
}

export function LiveFishEntity({ fish, aquariumSize }: FishEntityProps) {
  const texture = useSpriteTexture(
    fish.species === 'carnivore'
      ? FISH_SPRITE_PATH.carnivore
      : FISH_SPRITE_PATH.normal,
  )
  const scale = logWeightScale(fish.weightG) * fish.appearance.finScale
  const facingLeft = fish.physics.velocity.x < 0
  const labelY = (FISH_SPRITE_H * scale) / 2 + 25

  return (
    <group position={toScenePoint(fishAnchorPoint(fish), aquariumSize, 4)}>
      <FishLabel lines={[fish.name, healthFace(fish.health)]} y={labelY} />
      <group scale={[facingLeft ? -scale : scale, scale, 1]}>
        <mesh>
          <planeGeometry args={[FISH_SPRITE_W, FISH_SPRITE_H]} />
          <meshBasicMaterial
            map={texture}
            transparent
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[6, 2, 0.2]}>
          <circleGeometry args={[2.2, 18]} />
          <meshBasicMaterial color={fish.appearance.eyeColor} toneMapped={false} />
        </mesh>
        {fish.species === 'carnivore' ? (
          <>
            <mesh position={[14, 4.5, 0.25]} rotation={[0, 0, Math.PI]}>
              <coneGeometry args={[3.2, 6, 3]} />
              <meshBasicMaterial color="#fef9c3" toneMapped={false} />
            </mesh>
            <mesh position={[14, -4.5, 0.25]}>
              <coneGeometry args={[3.2, 6, 3]} />
              <meshBasicMaterial color="#fef9c3" toneMapped={false} />
            </mesh>
          </>
        ) : null}
      </group>
    </group>
  )
}

export function DeadFishEntity({ fish, aquariumSize }: DeadFishEntityProps) {
  const texture = useSpriteTexture(FISH_SPRITE_PATH.dead)
  const scale = logWeightScale(fish.weightG) * fish.appearance.finScale
  const labelY = (FISH_SPRITE_H * scale) / 2 + 20

  return (
    <group position={toScenePoint(fishAnchorPoint(fish), aquariumSize, 3)}>
      <FishLabel lines={[fish.name]} y={labelY} muted />
      <mesh scale={[scale, scale, 1]}>
        <planeGeometry args={[FISH_SPRITE_W, FISH_SPRITE_H]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={0.72}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
