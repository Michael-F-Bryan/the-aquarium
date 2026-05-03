import { runCalendarBoundaries } from './mechanics/calendarDay'
import { sinkAndPruneDead } from './mechanics/deadPhysics'
import { resolveFlakeEating } from './mechanics/flakeEat'
import {
  applyFlakeSeekVelocities,
  integrateFishPositions,
} from './mechanics/flakeSeek'
import { removeExpiredFood } from './mechanics/foodLifetime'
import { applySocialSteering } from './mechanics/movementSocial'
import { resolveCarnivorePredation } from './mechanics/predation'
import { sinkAndPruneSkeletons } from './mechanics/skeletonPhysics'
import type { SimulationEvent } from './events'
import type { Params } from './params'
import type { State } from './types'

export type UpdateResult = { state: State; events: readonly SimulationEvent[] }

/**
 * Single entry for the simulation step. Mechanics are applied in order;
 * each stage returns immutable state.
 */
export function update(state: State, params: Params, deltaMs: number): UpdateResult {
  const clampedDelta = Math.min(Math.max(deltaMs, 0), 250)
  const dayAdvance = clampedDelta / params.dayLengthMs

  let next: State = {
    ...state,
    currentDay: state.currentDay + dayAdvance,
  }
  const events: SimulationEvent[] = []

  next = removeExpiredFood(next, params)
  next = applyFlakeSeekVelocities(next, params, clampedDelta)
  next = applySocialSteering(next, params, clampedDelta)
  next = integrateFishPositions(next, params, clampedDelta)

  const flake = resolveFlakeEating(next)
  next = flake.state
  events.push(...flake.events)

  const pred = resolveCarnivorePredation(next)
  next = pred.state
  events.push(...pred.events)

  next = sinkAndPruneSkeletons(next, params, clampedDelta)

  const cal = runCalendarBoundaries(next, params)
  next = cal.state
  events.push(...cal.events)

  next = sinkAndPruneDead(next, params, clampedDelta)

  return { state: next, events }
}
