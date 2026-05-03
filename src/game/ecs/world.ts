import { World } from 'miniplex'
import { createInitialGameSnapshotPayload } from '../initial'
import type { Params } from '../params'
import type { DeadFish, Fish, FishSkeleton, Food, GameSnapshotPayload, Physics } from '../types'
import type { AquariumEntity, SimulationEntity } from './components'
import {
  deadFishEntityFromDto,
  foodEntityFromDto,
  liveFishEntityFromDto,
  skeletonEntityFromDto,
} from './entityAssembly'

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

function populateWorldFromPayload(
  world: World<AquariumEntity>,
  payload: GameSnapshotPayload,
): SimulationEntity {
  const simulationEntity = world.add({
    simulation: {
      params: {} as Params,
      deltaMs: 0,
      clampedDeltaMs: 0,
      dayAdvance: 0,
      currentDay: payload.currentDay,
      lastClosedCalendarDayFloor: payload.lastClosedCalendarDayFloor,
      nextEntityId: payload.nextEntityId,
      rngState: payload.rngState,
      score: payload.score,
    },
    events: [],
  }) as SimulationEntity

  for (const fish of payload.liveFish) {
    world.add(liveFishEntityFromDto(cloneFish(fish)))
  }
  for (const deadFish of payload.deadFish) {
    world.add(deadFishEntityFromDto(cloneDeadFish(deadFish)))
  }
  for (const skeleton of payload.skeletons) {
    world.add(skeletonEntityFromDto(cloneSkeleton(skeleton)))
  }
  for (const food of payload.food) {
    world.add(foodEntityFromDto(cloneFood(food)))
  }

  return simulationEntity
}

/** Build a new world from a persisted or read-model payload (load / new game). */
export function hydrateAquariumRuntimeFromPayload(
  payload: GameSnapshotPayload,
  params: Params,
  deltaMs: number,
): AquariumRuntime {
  const world = new World<AquariumEntity>()
  const simulationEntity = populateWorldFromPayload(world, payload)
  syncAquariumRuntimeForStep({ world, simulationEntity }, params, deltaMs)
  return { world, simulationEntity }
}

/** New game from params (starter fish + empty tank). */
export function createInitialAquariumRuntime(params: Params): AquariumRuntime {
  return hydrateAquariumRuntimeFromPayload(
    createInitialGameSnapshotPayload(params.aquariumWidth, params.aquariumHeight),
    params,
    0,
  )
}

/** Update per-frame clock fields on the singleton simulation entity (no entity rebuild). */
export function syncAquariumRuntimeForStep(
  runtime: AquariumRuntime,
  params: Params,
  deltaMs: number,
): void {
  const clampedDeltaMs = Math.min(Math.max(deltaMs, 0), 250)
  const sim = runtime.simulationEntity.simulation
  sim.params = params
  sim.deltaMs = deltaMs
  sim.clampedDeltaMs = clampedDeltaMs
  sim.dayAdvance = clampedDeltaMs / params.dayLengthMs
}
