import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import { FISH_SPRITE_H, FISH_SPRITE_W } from '../../game/constants'
import { healthFace } from '../../game/healthFace'
import {
  FISH_SPRITE_PATH,
  fishTraitPresentation,
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

function FishTail({
  kind,
  color,
  opacity = 0.68,
}: {
  readonly kind: ReturnType<typeof fishTraitPresentation>['tail']['kind']
  readonly color: string
  readonly opacity?: number
}) {
  const material = (
    <meshBasicMaterial
      color={color}
      opacity={opacity}
      transparent
      toneMapped={false}
      depthWrite={false}
    />
  )

  if (kind === 'fan') {
    return (
      <mesh position={[-24, 0, 0.1]} scale={[6.5, 12, 1]}>
        <circleGeometry args={[1, 24, Math.PI / 2, Math.PI]} />
        {material}
      </mesh>
    )
  }

  if (kind === 'forked') {
    return (
      <>
        <mesh position={[-24, 5.2, 0.1]} rotation={[0, 0, -Math.PI / 2.7]}>
          <coneGeometry args={[5.4, 12, 3]} />
          {material}
        </mesh>
        <mesh position={[-24, -5.2, 0.1]} rotation={[0, 0, Math.PI / 2.7]}>
          <coneGeometry args={[5.4, 12, 3]} />
          {material}
        </mesh>
      </>
    )
  }

  return (
    <mesh position={[-24, 0, 0.1]} rotation={[0, 0, Math.PI / 2]}>
      <coneGeometry args={[7.2, 14, 3]} />
      {material}
    </mesh>
  )
}

function FishFins({
  kind,
  color,
  opacity = 0.72,
}: {
  readonly kind: ReturnType<typeof fishTraitPresentation>['fin']['kind']
  readonly color: string
  readonly opacity?: number
}) {
  const material = (
    <meshBasicMaterial
      color={color}
      opacity={opacity}
      transparent
      toneMapped={false}
      depthWrite={false}
    />
  )

  if (kind === 'rounded') {
    return (
      <>
        <mesh position={[-2, 11.5, 0.18]} scale={[7.2, 3.6, 1]}>
          <circleGeometry args={[1, 24]} />
          {material}
        </mesh>
        <mesh position={[-4, -11.5, 0.18]} scale={[6.4, 3.2, 1]}>
          <circleGeometry args={[1, 24]} />
          {material}
        </mesh>
      </>
    )
  }

  if (kind === 'ribbon') {
    return (
      <>
        <mesh position={[-4, 12, 0.18]} rotation={[0, 0, -0.34]}>
          <planeGeometry args={[13, 3.8]} />
          {material}
        </mesh>
        <mesh position={[-6, -12, 0.18]} rotation={[0, 0, 0.28]}>
          <planeGeometry args={[11, 3.4]} />
          {material}
        </mesh>
      </>
    )
  }

  return (
    <>
      <mesh position={[-2, 11.2, 0.18]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[5.8, 10, 3]} />
        {material}
      </mesh>
      <mesh position={[-5, -11.2, 0.18]}>
        <coneGeometry args={[5.2, 9, 3]} />
        {material}
      </mesh>
    </>
  )
}

function FishEyelashes({
  eyelashes,
  opacity = 0.86,
}: {
  readonly eyelashes: ReturnType<typeof fishTraitPresentation>['eyelashes']
  readonly opacity?: number
}) {
  return (
    <>
      {eyelashes.map((lash, index) => (
        <mesh
          key={index}
          position={lash.position}
          rotation={[0, 0, lash.rotation]}
        >
          <planeGeometry args={lash.size} />
          <meshBasicMaterial
            color="#0f172a"
            opacity={opacity}
            transparent
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  )
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
  const traits = fishTraitPresentation(fish.appearance)

  return (
    <group position={toScenePoint(fishAnchorPoint(fish), aquariumSize, 4)}>
      <FishLabel lines={[fish.name, healthFace(fish.health)]} y={labelY} />
      <group scale={[facingLeft ? -scale : scale, scale, 1]}>
        <FishTail kind={traits.tail.kind} color={traits.tail.color} />
        <mesh>
          <planeGeometry args={[FISH_SPRITE_W, FISH_SPRITE_H]} />
          <meshBasicMaterial
            map={texture}
            transparent
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
        <FishFins kind={traits.fin.kind} color={traits.fin.color} />
        <mesh position={[6, 2, 0.2]}>
          <circleGeometry args={[2.2, 18]} />
          <meshBasicMaterial color={fish.appearance.eyeColor} toneMapped={false} />
        </mesh>
        <FishEyelashes eyelashes={traits.eyelashes} />
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
  const traits = fishTraitPresentation(fish.appearance)

  return (
    <group position={toScenePoint(fishAnchorPoint(fish), aquariumSize, 3)}>
      <FishLabel lines={[fish.name]} y={labelY} muted />
      <group scale={[scale, scale, 1]}>
        <FishTail kind={traits.tail.kind} color={traits.tail.color} opacity={0.38} />
        <mesh>
          <planeGeometry args={[FISH_SPRITE_W, FISH_SPRITE_H]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={0.72}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
        <FishFins kind={traits.fin.kind} color={traits.fin.color} opacity={0.4} />
        <FishEyelashes eyelashes={traits.eyelashes} opacity={0.45} />
      </group>
    </group>
  )
}
