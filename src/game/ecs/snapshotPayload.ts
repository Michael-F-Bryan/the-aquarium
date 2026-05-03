import type { GameSnapshotPayload } from '../types'
import {
  deadFishDtoFromEntity,
  fishDtoFromLiveEntity,
  foodDtoFromEntity,
  skeletonDtoFromEntity,
} from './entityAssembly'
import type { AquariumEntity } from './components'
import type { AquariumRuntime } from './world'

const liveFishQuery = [
  'fishIdentity',
  'fishBody',
  'fishMetabolism',
  'fishAppearance',
  'fishPhysics',
] as const

function isLiveFishEntity(
  e: AquariumEntity,
): e is Parameters<typeof fishDtoFromLiveEntity>[0] {
  return Boolean(
    e.fishIdentity &&
      e.fishBody &&
      e.fishMetabolism &&
      e.fishAppearance &&
      e.fishPhysics &&
      !e.deadFishMeta,
  )
}

/** Project the live ECS world into a serializable snapshot DTO (same shape as persistence). */
export function buildGameSnapshotPayload(runtime: AquariumRuntime): GameSnapshotPayload {
  const simulation = runtime.simulationEntity.simulation
  const liveFish = runtime.world
    .with(...liveFishQuery)
    .entities.filter(isLiveFishEntity)
    .map((e) =>
      fishDtoFromLiveEntity(
        e as Parameters<typeof fishDtoFromLiveEntity>[0],
      ),
    )

  return {
    currentDay: simulation.currentDay,
    lastClosedCalendarDayFloor: simulation.lastClosedCalendarDayFloor,
    nextEntityId: simulation.nextEntityId,
    rngState: simulation.rngState,
    score: simulation.score,
    liveFish,
    deadFish: runtime.world
      .with('deadFishMeta')
      .entities.map((e) =>
        deadFishDtoFromEntity(
          e as Parameters<typeof deadFishDtoFromEntity>[0],
        ),
      ),
    skeletons: runtime.world
      .with('skeletonIdentity', 'skeletonPhysics')
      .entities.map((e) =>
        skeletonDtoFromEntity(
          e as Parameters<typeof skeletonDtoFromEntity>[0],
        ),
      ),
    food: runtime.world
      .with('foodIdentity', 'foodPhysics')
      .entities.map((e) =>
        foodDtoFromEntity(e as Parameters<typeof foodDtoFromEntity>[0]),
      ),
  }
}
