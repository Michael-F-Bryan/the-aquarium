import { runCalendarBoundaries } from '../../mechanics/calendarDay'
import { sinkAndPruneDead } from '../../mechanics/deadPhysics'
import { resolveFlakeEating } from '../../mechanics/flakeEat'
import {
  applyFlakeSeekVelocities,
  integrateFishPositions,
} from '../../mechanics/flakeSeek'
import { removeExpiredFood } from '../../mechanics/foodLifetime'
import { applySocialSteering } from '../../mechanics/movementSocial'
import { resolveCarnivorePredation } from '../../mechanics/predation'
import { sinkAndPruneSkeletons } from '../../mechanics/skeletonPhysics'
import type { SimulationEvent } from '../../events'
import type { State } from '../../types'
import type { AquariumRuntime } from '../world'

export type SimulationSystemId =
  | 'advance-clock'
  | 'remove-expired-food'
  | 'apply-flake-seek-velocities'
  | 'apply-social-steering'
  | 'integrate-fish-positions'
  | 'resolve-flake-eating'
  | 'resolve-carnivore-predation'
  | 'sink-and-prune-skeletons'
  | 'run-calendar-boundaries'
  | 'sink-and-prune-dead-fish'

export type SimulationSystem = {
  readonly id: SimulationSystemId
  readonly run: (runtime: AquariumRuntime) => void
}

function stateOf(runtime: AquariumRuntime): State {
  return runtime.simulationEntity.simulation.state
}

function setState(runtime: AquariumRuntime, state: State): void {
  runtime.simulationEntity.simulation.state = state
}

function appendEvents(
  runtime: AquariumRuntime,
  events: readonly SimulationEvent[],
): void {
  runtime.simulationEntity.events.push(...events)
}

export const advanceClockSystem: SimulationSystem = {
  id: 'advance-clock',
  run(runtime) {
    const simulation = runtime.simulationEntity.simulation
    setState(runtime, {
      ...simulation.state,
      currentDay: simulation.state.currentDay + simulation.dayAdvance,
    })
  },
}

export const removeExpiredFoodSystem: SimulationSystem = {
  id: 'remove-expired-food',
  run(runtime) {
    const { params } = runtime.simulationEntity.simulation
    setState(runtime, removeExpiredFood(stateOf(runtime), params))
  },
}

export const applyFlakeSeekVelocitiesSystem: SimulationSystem = {
  id: 'apply-flake-seek-velocities',
  run(runtime) {
    const { params, clampedDeltaMs } = runtime.simulationEntity.simulation
    setState(runtime, applyFlakeSeekVelocities(stateOf(runtime), params, clampedDeltaMs))
  },
}

export const applySocialSteeringSystem: SimulationSystem = {
  id: 'apply-social-steering',
  run(runtime) {
    const { params, clampedDeltaMs } = runtime.simulationEntity.simulation
    setState(runtime, applySocialSteering(stateOf(runtime), params, clampedDeltaMs))
  },
}

export const integrateFishPositionsSystem: SimulationSystem = {
  id: 'integrate-fish-positions',
  run(runtime) {
    const { params, clampedDeltaMs } = runtime.simulationEntity.simulation
    setState(runtime, integrateFishPositions(stateOf(runtime), params, clampedDeltaMs))
  },
}

export const resolveFlakeEatingSystem: SimulationSystem = {
  id: 'resolve-flake-eating',
  run(runtime) {
    const { params } = runtime.simulationEntity.simulation
    const result = resolveFlakeEating(stateOf(runtime), params)
    setState(runtime, result.state)
    appendEvents(runtime, result.events)
  },
}

export const resolveCarnivorePredationSystem: SimulationSystem = {
  id: 'resolve-carnivore-predation',
  run(runtime) {
    const { params } = runtime.simulationEntity.simulation
    const result = resolveCarnivorePredation(stateOf(runtime), params)
    setState(runtime, result.state)
    appendEvents(runtime, result.events)
  },
}

export const sinkAndPruneSkeletonsSystem: SimulationSystem = {
  id: 'sink-and-prune-skeletons',
  run(runtime) {
    const { params, clampedDeltaMs } = runtime.simulationEntity.simulation
    setState(runtime, sinkAndPruneSkeletons(stateOf(runtime), params, clampedDeltaMs))
  },
}

export const runCalendarBoundariesSystem: SimulationSystem = {
  id: 'run-calendar-boundaries',
  run(runtime) {
    const { params } = runtime.simulationEntity.simulation
    const result = runCalendarBoundaries(stateOf(runtime), params)
    setState(runtime, result.state)
    appendEvents(runtime, result.events)
  },
}

export const sinkAndPruneDeadFishSystem: SimulationSystem = {
  id: 'sink-and-prune-dead-fish',
  run(runtime) {
    const { params, clampedDeltaMs } = runtime.simulationEntity.simulation
    setState(runtime, sinkAndPruneDead(stateOf(runtime), params, clampedDeltaMs))
  },
}
