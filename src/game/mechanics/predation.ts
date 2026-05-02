import { CARNIVORE_KILL_RADIUS } from '../constants'
import type { DeadFish, Fish, State } from '../types'
import { dist } from '../vec2'

/** Carnivores that overlap a strictly smaller fish consume it (README catch). */
export function resolveCarnivorePredation(state: State): State {
  const eaten = new Set<string>()
  const newDead: DeadFish[] = []
  const diedOnDay = Math.floor(state.currentDay) + 1

  const carnivores = state.liveFish
    .filter((f) => f.species === 'carnivore' && f.health > 0)
    .sort((a, b) => a.id.localeCompare(b.id))

  let liveFish = state.liveFish.map((f) => ({ ...f }))

  for (const c of carnivores) {
    if (eaten.has(c.id)) continue
    let best: Fish | null = null
    let bestD = Number.POSITIVE_INFINITY
    for (const p of liveFish) {
      if (p.id === c.id || p.health === 0 || eaten.has(p.id)) continue
      if (p.weightG >= c.weightG) continue
      const d = dist(c.physics.position, p.physics.position)
      if (d <= CARNIVORE_KILL_RADIUS && d < bestD) {
        bestD = d
        best = p
      }
    }
    if (!best) continue
    eaten.add(best.id)
    newDead.push({ ...best, health: 0, diedOnDay })
    liveFish = liveFish.map((f) => {
      if (f.id === c.id) return { ...f, lastAte: state.currentDay }
      return f
    })
  }

  if (eaten.size === 0) return state

  liveFish = liveFish.filter((f) => !eaten.has(f.id))

  return {
    ...state,
    liveFish,
    deadFish: [...state.deadFish, ...newDead],
  }
}
