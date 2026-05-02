import type { Fish } from './types'

/** Sentinel: fish has never eaten (always hungry for calendar checks). */
export const NEVER_ATE = -1

/** Ate at least once during simulated calendar day `[dayIndex, dayIndex + 1)`. */
export function ateDuringSimDay(
  lastAte: number,
  dayIndex: number,
): boolean {
  if (lastAte < 0) return false
  return lastAte >= dayIndex && lastAte < dayIndex + 1
}

/**
 * Rolling window: no meal in the last 1.0 units of `currentDay` (one simulated day).
 */
export function hungryWithinLastDay(currentDay: number, lastAte: number): boolean {
  if (lastAte < 0) return true
  return currentDay - lastAte >= 1
}

/** Live fish actively foraging (matches flake-seek / flake-eat hunger rule). */
export function fishWantsFood(fish: Fish, currentDay: number): boolean {
  if (fish.health === 0) return false
  return hungryWithinLastDay(currentDay, fish.lastAte)
}
