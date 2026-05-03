import type { Fish } from './types'

/** Sentinel: fish has never eaten (always hungry for calendar checks). */
export const NEVER_ATE = -1

/**
 * When simulated calendar day `completedDayFloor` closes, sim time is
 * `completedDayFloor + 1`. Fish skip starvation damage if `lastAte` falls in
 * `[that instant - windowDays, that instant]` (inclusive).
 */
export function ateWithinWindowBeforeCalendarClose(
  lastAte: number,
  completedDayFloor: number,
  windowDays: number,
): boolean {
  if (lastAte < 0) return false
  const closeSimTime = completedDayFloor + 1
  return lastAte >= closeSimTime - windowDays && lastAte <= closeSimTime
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
