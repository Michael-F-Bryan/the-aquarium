import type { SimulationEvent } from '../events'
import type { Params } from '../params'
import type {
  FishAppearance,
  GameSnapshotPayload,
  Physics,
} from '../types'
import type {
  DeadFishMeta,
  FishBody,
  FishIdentity,
  FishMetabolism,
  FoodIdentity,
  SkeletonIdentity,
} from './entityAssembly'

export type SimulationClock = {
  deltaMs: number
  clampedDeltaMs: number
  dayAdvance: number
}

export type SimulationComponent = SimulationClock & {
  params: Params
  currentDay: GameSnapshotPayload['currentDay']
  lastClosedCalendarDayFloor: GameSnapshotPayload['lastClosedCalendarDayFloor']
  nextEntityId: GameSnapshotPayload['nextEntityId']
  rngState: GameSnapshotPayload['rngState']
  score: GameSnapshotPayload['score']
}

export type SimulationStateEntity = {
  simulation: SimulationComponent
  events: SimulationEvent[]
}

/** Runtime entity: optional Miniplex component keys (fine-grained). */
export type AquariumEntity = {
  simulation?: SimulationComponent
  events?: SimulationEvent[]
  fishIdentity?: FishIdentity
  fishBody?: FishBody
  fishMetabolism?: FishMetabolism
  fishAppearance?: FishAppearance
  fishPhysics?: Physics
  deadFishMeta?: DeadFishMeta
  foodIdentity?: FoodIdentity
  foodPhysics?: Physics
  skeletonIdentity?: SkeletonIdentity
  skeletonPhysics?: Physics
  /** Live fish only; corpses use `deadFishMeta` without this tag. */
  tagLive?: true
}

export type SimulationEntity = AquariumEntity & SimulationStateEntity

export type FishEntity = AquariumEntity & {
  tagLive: true
  fishIdentity: FishIdentity
  fishBody: FishBody
  fishMetabolism: FishMetabolism
  fishAppearance: FishAppearance
  fishPhysics: Physics
}

export type DeadFishEntity = FishEntity & { deadFishMeta: DeadFishMeta }

export type FishSkeletonEntity = AquariumEntity & {
  skeletonIdentity: SkeletonIdentity
  skeletonPhysics: Physics
}

export type FoodEntity = AquariumEntity & {
  foodIdentity: FoodIdentity
  foodPhysics: Physics
}
