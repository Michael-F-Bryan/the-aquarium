import type { SimulationEvent } from '../events'
import type { Params } from '../params'
import type { DeadFish, Fish, FishSkeleton, State } from '../types'
import { dist } from '../vec2'

export type PredationResult = { state: State; events: SimulationEvent[] }

/** Carnivores that overlap a strictly smaller fish consume it (README catch). */
export function resolveCarnivorePredation(
  state: State,
  params: Params,
): PredationResult {
  const events: SimulationEvent[] = []
  const eaten = new Set<string>()
  const newDead: DeadFish[] = []
  const newSkeletons: FishSkeleton[] = [...state.skeletons]
  const diedOnDay = Math.floor(state.currentDay) + 1

  const carnivores = state.liveFish
    .filter((f) => f.species === 'carnivore' && f.health > 0)
    .sort((a, b) => a.id.localeCompare(b.id))

  let liveFish = state.liveFish.map((f) => ({ ...f }))
  let nextEntityId = state.nextEntityId

  for (const c of carnivores) {
    if (eaten.has(c.id)) continue
    let best: Fish | null = null
    let bestD = Number.POSITIVE_INFINITY
    for (const p of liveFish) {
      if (p.id === c.id || p.health === 0 || eaten.has(p.id)) continue
      if (p.weightG >= c.weightG) continue
      const d = dist(c.physics.position, p.physics.position)
      if (d <= params.carnivoreKillRadius && d < bestD) {
        bestD = d
        best = p
      }
    }
    if (!best) continue
    eaten.add(best.id)
    newDead.push({ ...best, health: 0, diedOnDay, deathCause: 'predation' })
    const weightGainG = Math.round(best.weightG * params.predationWeightGainFraction)
    liveFish = liveFish.map((f) => {
      if (f.id !== c.id) return f
      return {
        ...f,
        lastAte: state.currentDay,
        weightG: f.weightG + weightGainG,
      }
    })
    const skId = `sk-${nextEntityId}`
    nextEntityId += 1
    newSkeletons.push({
      id: skId,
      preyName: best.name,
      createdOnDay: state.currentDay,
      physics: {
        position: { ...best.physics.position },
        velocity: { x: 0, y: 0 },
      },
    })
    events.push({
      type: 'prey_eaten',
      predatorId: c.id,
      predatorName: c.name,
      preyId: best.id,
      preyName: best.name,
      weightGainG,
    })
  }

  if (eaten.size === 0) return { state, events: [] }

  liveFish = liveFish.filter((f) => !eaten.has(f.id))

  return {
    state: {
      ...state,
      liveFish,
      deadFish: [...state.deadFish, ...newDead],
      skeletons: newSkeletons,
      nextEntityId,
    },
    events,
  }
}
