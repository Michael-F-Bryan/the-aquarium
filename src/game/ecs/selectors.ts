import type { SimulationEvent } from '../events'
import type { DeadFish, Fish, FishSkeleton, Food, GameSnapshotPayload } from '../types'
import type { SimulationCommandResult } from './commands'
import { buildGameSnapshotPayload } from './snapshotPayload'
import type { AquariumRuntime } from './world'

export type SimulationStepResult = {
  readonly readModel: GameSnapshotPayload
  readonly events: readonly SimulationEvent[]
  readonly commandResults: readonly SimulationCommandResult[]
}

export type AquariumReadModel = {
  readonly currentDay: number
  readonly lastClosedCalendarDayFloor: number
  readonly score: number
  readonly liveFish: readonly Fish[]
  readonly deadFish: readonly DeadFish[]
  readonly skeletons: readonly FishSkeleton[]
  readonly food: readonly Food[]
}

export function selectGameSnapshotPayload(runtime: AquariumRuntime): GameSnapshotPayload {
  return buildGameSnapshotPayload(runtime)
}

export function selectEvents(runtime: AquariumRuntime): readonly SimulationEvent[] {
  return runtime.simulationEntity.events
}

export function selectReadModel(runtime: AquariumRuntime): AquariumReadModel {
  const payload = buildGameSnapshotPayload(runtime)
  return {
    currentDay: payload.currentDay,
    lastClosedCalendarDayFloor: payload.lastClosedCalendarDayFloor,
    score: payload.score,
    liveFish: payload.liveFish,
    deadFish: payload.deadFish,
    skeletons: payload.skeletons,
    food: payload.food,
  }
}

export function selectUpdateResult(
  runtime: AquariumRuntime,
  commandResults: readonly SimulationCommandResult[] = [],
): SimulationStepResult {
  return {
    readModel: buildGameSnapshotPayload(runtime),
    events: selectEvents(runtime),
    commandResults,
  }
}
