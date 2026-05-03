import type { State } from '../../game/types'
import { DeadFishEntity, LiveFishEntity } from './FishEntity'
import { FoodEntity } from './FoodEntity'
import type { AquariumSize } from './pointer'
import { SkeletonEntity } from './SkeletonEntity'
import { TankBackdrop } from './TankBackdrop'

type AquariumSceneProps = {
  readonly state: State
  readonly aquariumSize: AquariumSize
}

export function AquariumScene({ state, aquariumSize }: AquariumSceneProps) {
  return (
    <>
      <TankBackdrop aquariumSize={aquariumSize} />
      {state.food.map((food) => (
        <FoodEntity key={food.id} food={food} aquariumSize={aquariumSize} />
      ))}
      {state.skeletons.map((skeleton) => (
        <SkeletonEntity
          key={skeleton.id}
          skeleton={skeleton}
          aquariumSize={aquariumSize}
        />
      ))}
      {state.deadFish.map((fish) => (
        <DeadFishEntity key={fish.id} fish={fish} aquariumSize={aquariumSize} />
      ))}
      {state.liveFish.map((fish) => (
        <LiveFishEntity key={fish.id} fish={fish} aquariumSize={aquariumSize} />
      ))}
    </>
  )
}
