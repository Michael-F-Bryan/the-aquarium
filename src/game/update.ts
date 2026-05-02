import {
  applyFlakeSeekVelocities,
  integrateFishPositions,
} from './mechanics/flakeSeek'
import { removeExpiredFood } from './mechanics/foodLifetime'
import type { Params } from './params'
import type { State } from './types'

/**
 * Single entry for the simulation step. Mechanics are applied in order;
 * each stage returns immutable state.
 */
export function update(state: State, params: Params, deltaMs: number): State {
  const clampedDelta = Math.min(Math.max(deltaMs, 0), 250)
  const dayAdvance = clampedDelta / params.dayLengthMs

  let next: State = {
    ...state,
    currentDay: state.currentDay + dayAdvance,
  }

  next = removeExpiredFood(next, params)
  next = applyFlakeSeekVelocities(next, params, clampedDelta)
  next = integrateFishPositions(next, params, clampedDelta)

  return next
}
