import type { SimulationEvent } from '../events'
import type { Params } from '../params'
import type { DeadFish, Fish, FishSkeleton, Food, State } from '../types'

export type SimulationClock = {
  readonly deltaMs: number
  readonly clampedDeltaMs: number
  readonly dayAdvance: number
}

export type SimulationComponent = SimulationClock & {
  readonly params: Params
  currentDay: State['currentDay']
  lastClosedCalendarDayFloor: State['lastClosedCalendarDayFloor']
  nextEntityId: State['nextEntityId']
  rngState: State['rngState']
  score: State['score']
}

export type FishComponent = Fish
export type DeadFishComponent = DeadFish
export type FishSkeletonComponent = FishSkeleton
export type FoodComponent = Food

export type SimulationStateEntity = {
  simulation: SimulationComponent
  events: SimulationEvent[]
}

export type AquariumEntity = {
  simulation?: SimulationComponent
  events?: SimulationEvent[]
  fish?: FishComponent
  deadFish?: DeadFishComponent
  skeleton?: FishSkeletonComponent
  food?: FoodComponent
}

export type SimulationEntity = AquariumEntity & SimulationStateEntity
export type FishEntity = AquariumEntity & { fish: FishComponent }
export type DeadFishEntity = AquariumEntity & { deadFish: DeadFishComponent }
export type FishSkeletonEntity = AquariumEntity & { skeleton: FishSkeletonComponent }
export type FoodEntity = AquariumEntity & { food: FoodComponent }
