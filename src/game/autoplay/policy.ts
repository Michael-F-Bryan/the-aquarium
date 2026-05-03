import { fishWantsFood } from '../satiation'
import { NEVER_ATE } from '../satiation'
import type { Params } from '../params'
import type { Fish, GameSnapshotPayload } from '../types'
import { dist } from '../vec2'

export type AutoplayFoodDropAction = {
  x: number
  y: number
  targetFishId: string
}

function hungerGap(currentDay: number, fish: Fish): number {
  if (fish.lastAte === NEVER_ATE) return Number.POSITIVE_INFINITY
  return Math.max(0, currentDay - fish.lastAte)
}

function compareByFeedingPriority(currentDay: number, a: Fish, b: Fish): number {
  if (a.health !== b.health) return a.health - b.health
  const gapDiff = hungerGap(currentDay, b) - hungerGap(currentDay, a)
  if (Math.abs(gapDiff) > 1e-6) return gapDiff
  return a.id.localeCompare(b.id)
}

function hasNearbyFood(snapshot: GameSnapshotPayload, fish: Fish, params: Params): boolean {
  return snapshot.food.some(
    (piece) =>
      dist(piece.physics.position, fish.physics.position) <=
      params.foodPickupRadius * 1.6,
  )
}

/**
 * Debug autoplay baseline policy:
 * - only feeds fish currently foraging
 * - prioritizes lower health first
 * - avoids dropping duplicate food near already-covered fish
 */
export function chooseAutoplayFoodDrop(
  snapshot: GameSnapshotPayload,
  params: Params,
): AutoplayFoodDropAction | null {
  const hungry = snapshot.liveFish.filter((fish) =>
    fishWantsFood(fish, snapshot.currentDay, params.hungerThresholdDays),
  )
  if (hungry.length === 0) return null
  hungry.sort((a, b) => compareByFeedingPriority(snapshot.currentDay, a, b))
  const candidate = hungry[0]
  if (hasNearbyFood(snapshot, candidate, params)) return null
  return {
    targetFishId: candidate.id,
    x: candidate.physics.position.x,
    y: candidate.physics.position.y,
  }
}
