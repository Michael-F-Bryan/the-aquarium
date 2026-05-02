import type { Params } from '../params'
import type { State } from '../types'

/** Remove flakes older than `params.foodLifetimeDays` (README: half-day default). */
export function removeExpiredFood(state: State, params: Params): State {
  const maxAge = params.foodLifetimeDays
  const { currentDay, food } = state
  const nextFood = food.filter((piece) => currentDay - piece.createdOnDay < maxAge)
  if (nextFood.length === food.length) return state
  return { ...state, food: nextFood }
}
