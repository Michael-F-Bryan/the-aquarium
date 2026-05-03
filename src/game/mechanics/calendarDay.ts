import { rngNext01 } from '../rng'
import { NEVER_ATE, ateDuringSimDay } from '../satiation'
import type { Params } from '../params'
import type { DeadFish, Fish, State } from '../types'

type Health = 0 | 1 | 2 | 3

function decHealth(h: Health): Health {
  if (h <= 0) return 0
  return (h - 1) as Health
}

function computeReadmeScore(live: Fish[]): number {
  let s = 0
  for (const f of live) {
    if (f.species === 'normal') {
      s += f.weightG / 100
    } else {
      s += (f.weightG / 100) * f.ageDays
    }
  }
  return s
}

function spawnBaby(
  parent: Fish,
  id: string,
  jitterX: number,
  jitterY: number,
): Fish {
  return {
    id,
    name: `Baby-${id}`,
    species: 'normal',
    ageDays: 0,
    weightG: 100,
    health: 3,
    lastAte: NEVER_ATE,
    physics: {
      position: {
        x: parent.physics.position.x + jitterX,
        y: parent.physics.position.y + jitterY,
      },
      velocity: { x: 0, y: 0 },
    },
  }
}

/**
 * One simulated midnight: hunger, mortality, reproduction, mutation, aging.
 * Hunger: no meal during the calendar day that just ended (`completedDayFloor`).
 */
function closeOneCalendarDay(
  state: State,
  params: Params,
  completedDayFloor: number,
): State {
  let rngState = state.rngState
  const roll = () => {
    const r = rngNext01(rngState)
    rngState = r.rngState
    return r.value
  }

  let liveFish = state.liveFish.map((fish) => {
    if (fish.health === 0) return fish
    let h: Health = fish.health
    if (!ateDuringSimDay(fish.lastAte, completedDayFloor)) {
      h = decHealth(h)
    }
    return { ...fish, health: h }
  })

  const newDead: DeadFish[] = []
  const diedOnDay = completedDayFloor + 1
  liveFish = liveFish.filter((fish) => {
    if (fish.health > 0) return true
    newDead.push({ ...fish, diedOnDay })
    return false
  })

  const born: Fish[] = []
  let nextId = state.nextEntityId
  for (const fish of liveFish) {
    if (fish.weightG < 300) continue
    const p = Math.min(fish.ageDays / 100, params.reproduceChanceCap)
    if (roll() < p) {
      const jx = (roll() - 0.5) * 36
      const jy = (roll() - 0.5) * 36
      const id = `fish-${nextId}`
      nextId += 1
      born.push(spawnBaby(fish, id, jx, jy))
    }
  }
  liveFish = [...liveFish, ...born]

  if (liveFish.length >= 5) {
    liveFish = liveFish.map((fish) => {
      if (fish.species === 'carnivore') return fish
      if (roll() < params.carnivoreMutationChance) {
        return { ...fish, species: 'carnivore' as const }
      }
      return fish
    })
  }

  liveFish = liveFish.map((fish) => ({
    ...fish,
    ageDays: fish.ageDays + 1,
  }))

  const score = computeReadmeScore(liveFish)

  return {
    ...state,
    rngState,
    nextEntityId: nextId,
    liveFish,
    deadFish: [...state.deadFish, ...newDead],
    score,
  }
}

/**
 * Run midnight rules when the calendar has entered a **new** integer day
 * (i.e. `floor(currentDay) > lastClosed + 1`). With `lastClosed = -1`, day 0
 * is in progress until `currentDay` reaches 1 — avoids firing end-of-day-0
 * while still at `currentDay ∈ [0, 1)`.
 *
 * At most one midnight per frame; catch up continues on later frames.
 */
export function runCalendarBoundaries(state: State, params: Params): State {
  const floorDay = Math.floor(state.currentDay)
  if (floorDay <= state.lastClosedCalendarDayFloor + 1) return state
  const completedDayFloor = state.lastClosedCalendarDayFloor + 1
  let s = closeOneCalendarDay(state, params, completedDayFloor)
  s = { ...s, lastClosedCalendarDayFloor: s.lastClosedCalendarDayFloor + 1 }
  return s
}
