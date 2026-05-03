import type { SimulationEvent } from '../events'
import { hungryWithinLastDay } from '../satiation'
import type { Params } from '../params'
import type { State } from '../types'
import { dist } from '../vec2'

type Health = 0 | 1 | 2 | 3

export type FlakeEatResult = { state: State; events: SimulationEvent[] }

/**
 * Overlap with flakes: only if the fish has not eaten in the last 1.0
 * simulated days. Heal or +100g at full health.
 */
export function resolveFlakeEating(state: State, params: Params): FlakeEatResult {
  const events: SimulationEvent[] = []
  const consumedFood = new Set<string>()
  const updates = new Map<
    string,
    { health: Health; weightG: number; lastAte: number }
  >()

  for (const fish of state.liveFish) {
    if (fish.health === 0) continue
    if (
      !hungryWithinLastDay(state.currentDay, fish.lastAte, params.hungerThresholdDays)
    ) {
      continue
    }
    for (const piece of state.food) {
      if (consumedFood.has(piece.id)) continue
      if (
        dist(fish.physics.position, piece.physics.position) <= params.foodPickupRadius
      ) {
        consumedFood.add(piece.id)
        let health: Health = fish.health
        let weightG = fish.weightG
        if (health < 3) {
          health = (health + 1) as Health
        } else {
          weightG += 100
        }
        updates.set(fish.id, { health, weightG, lastAte: state.currentDay })
        events.push({ type: 'ate_flake', fishId: fish.id, name: fish.name })
        break
      }
    }
  }

  if (updates.size === 0 && consumedFood.size === 0) return { state, events: [] }

  const liveFish = state.liveFish.map((fish) => {
    const u = updates.get(fish.id)
    if (!u) return fish
    return { ...fish, ...u }
  })

  const food = state.food.filter((f) => !consumedFood.has(f.id))

  return { state: { ...state, liveFish, food }, events }
}
