import type { SimulationEvent } from '../events'
import type { DeadFish, Fish, FishSkeleton, Food, State } from '../types'
import type { SimulationCommandResult } from './commands'
import type { AquariumRuntime } from './world'

export type SimulationStepResult = {
  readonly state: State
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

export function selectState(runtime: AquariumRuntime): State {
  const simulation = runtime.simulationEntity.simulation
  return {
    currentDay: simulation.currentDay,
    lastClosedCalendarDayFloor: simulation.lastClosedCalendarDayFloor,
    nextEntityId: simulation.nextEntityId,
    rngState: simulation.rngState,
    score: simulation.score,
    liveFish: runtime.world.with('fish').entities.map((entity) => entity.fish),
    deadFish: runtime.world.with('deadFish').entities.map((entity) => entity.deadFish),
    skeletons: runtime.world.with('skeleton').entities.map((entity) => entity.skeleton),
    food: runtime.world.with('food').entities.map((entity) => entity.food),
  }
}

export function selectEvents(runtime: AquariumRuntime): readonly SimulationEvent[] {
  return runtime.simulationEntity.events
}

export function selectReadModel(runtime: AquariumRuntime): AquariumReadModel {
  const state = selectState(runtime)
  return {
    currentDay: state.currentDay,
    lastClosedCalendarDayFloor: state.lastClosedCalendarDayFloor,
    score: state.score,
    liveFish: state.liveFish,
    deadFish: state.deadFish,
    skeletons: state.skeletons,
    food: state.food,
  }
}

export function selectUpdateResult(
  runtime: AquariumRuntime,
  commandResults: readonly SimulationCommandResult[] = [],
): SimulationStepResult {
  return {
    state: selectState(runtime),
    events: selectEvents(runtime),
    commandResults,
  }
}
