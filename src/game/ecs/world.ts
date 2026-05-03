import { World } from 'miniplex'
import type { Params } from '../params'
import type { DeadFish, Fish, FishSkeleton, Food, Physics, State } from '../types'
import type { AquariumEntity, SimulationEntity } from './components'

export type AquariumRuntime = {
  readonly world: World<AquariumEntity>
  readonly simulationEntity: SimulationEntity
}

function clonePhysics(physics: Physics): Physics {
  return {
    position: { ...physics.position },
    velocity: { ...physics.velocity },
  }
}

function cloneFish(fish: Fish): Fish {
  return {
    ...fish,
    appearance: { ...fish.appearance },
    physics: clonePhysics(fish.physics),
  }
}

function cloneDeadFish(fish: DeadFish): DeadFish {
  return {
    ...cloneFish(fish),
    diedOnDay: fish.diedOnDay,
    deathCause: fish.deathCause,
  }
}

function cloneSkeleton(skeleton: FishSkeleton): FishSkeleton {
  return {
    ...skeleton,
    physics: clonePhysics(skeleton.physics),
  }
}

function cloneFood(food: Food): Food {
  return {
    ...food,
    physics: clonePhysics(food.physics),
  }
}

export function createAquariumRuntime(
  state: State,
  params: Params,
  deltaMs: number,
): AquariumRuntime {
  const clampedDeltaMs = Math.min(Math.max(deltaMs, 0), 250)
  const world = new World<AquariumEntity>()
  const simulationEntity = world.add({
    simulation: {
      params,
      deltaMs,
      clampedDeltaMs,
      dayAdvance: clampedDeltaMs / params.dayLengthMs,
      currentDay: state.currentDay,
      lastClosedCalendarDayFloor: state.lastClosedCalendarDayFloor,
      nextEntityId: state.nextEntityId,
      rngState: state.rngState,
      score: state.score,
    },
    events: [],
  }) as SimulationEntity

  for (const fish of state.liveFish) {
    world.add({ fish: cloneFish(fish) })
  }
  for (const deadFish of state.deadFish) {
    world.add({ deadFish: cloneDeadFish(deadFish) })
  }
  for (const skeleton of state.skeletons) {
    world.add({ skeleton: cloneSkeleton(skeleton) })
  }
  for (const food of state.food) {
    world.add({ food: cloneFood(food) })
  }

  return {
    world,
    simulationEntity,
  }
}
