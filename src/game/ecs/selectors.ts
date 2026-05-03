import type { SimulationEvent } from '../events'
import type { DeadFish, Fish, FishSkeleton, Food, State } from '../types'
import type { AquariumRuntime } from './world'

export type SimulationStepResult = {
  readonly state: State
  readonly events: readonly SimulationEvent[]
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
  return runtime.simulationEntity.simulation.state
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

export function selectUpdateResult(runtime: AquariumRuntime): SimulationStepResult {
  return {
    state: selectState(runtime),
    events: selectEvents(runtime),
  }
}
