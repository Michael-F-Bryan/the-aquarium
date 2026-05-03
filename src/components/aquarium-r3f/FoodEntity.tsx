import type { Food } from '../../game/types'
import { toScenePoint } from './coordinates'
import type { AquariumSize } from './pointer'

type FoodEntityProps = {
  readonly food: Food
  readonly aquariumSize: AquariumSize
}

export function FoodEntity({ food, aquariumSize }: FoodEntityProps) {
  return (
    <group
      position={toScenePoint(food.physics.position, aquariumSize, 2)}
      rotation={[0, 0, 0.35]}
    >
      <mesh scale={[5.5, 3.75, 1]}>
        <circleGeometry args={[1, 24]} />
        <meshBasicMaterial color="#b45309" toneMapped={false} />
      </mesh>
      <mesh position={[-1.5, 1, 0.1]} scale={[1.2, 1.2, 1]}>
        <circleGeometry args={[1, 12]} />
        <meshBasicMaterial color="#fde68a" opacity={0.7} transparent />
      </mesh>
    </group>
  )
}
