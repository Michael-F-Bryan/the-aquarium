import {
  BOID_ALIGNMENT_WEIGHT,
  BOID_COHESION_WEIGHT,
  BOID_NEIGHBOR_RADIUS,
  BOID_SEPARATION_WEIGHT,
  FLEE_PERCEPTION,
  HUNT_PERCEPTION,
  MAX_SPEED_CARNIVORE,
  MAX_SPEED_NORMAL,
  WANDER_STRENGTH,
} from '../constants'
import { rngNext01 } from '../rng'
import { fishWantsFood } from '../satiation'
import type { Params } from '../params'
import type { Fish, State } from '../types'
import { dist, vecAdd, vecNorm, vecScale, vecSub } from '../vec2'

const STEER_ACCEL = 4.2

function capSpeed(vx: number, vy: number, cap: number): { x: number; y: number } {
  const s = Math.hypot(vx, vy)
  if (s <= cap || s < 1e-6) return { x: vx, y: vy }
  const k = cap / s
  return { x: vx * k, y: vy * k }
}

function boidsAcceleration(fish: Fish, normals: Fish[]): { x: number; y: number } {
  let sep = { x: 0, y: 0 }
  let align = { x: 0, y: 0 }
  let cohPos = { x: 0, y: 0 }
  let n = 0
  for (const o of normals) {
    if (o.id === fish.id || o.health === 0) continue
    const d = dist(fish.physics.position, o.physics.position)
    if (d >= BOID_NEIGHBOR_RADIUS || d < 1e-6) continue
    n += 1
    const away = vecNorm(vecSub(fish.physics.position, o.physics.position))
    sep = vecAdd(sep, vecScale(away, 1 / d))
    align = vecAdd(align, o.physics.velocity)
    cohPos = vecAdd(cohPos, o.physics.position)
  }
  if (n === 0) return { x: 0, y: 0 }
  align = vecScale(align, 1 / n)
  cohPos = vecScale(cohPos, 1 / n)
  const toCoh = vecSub(cohPos, fish.physics.position)
  const aSep = vecScale(sep, BOID_SEPARATION_WEIGHT)
  const aAli = vecScale(
    vecSub(align, fish.physics.velocity),
    BOID_ALIGNMENT_WEIGHT,
  )
  const aCoh = vecScale(toCoh, BOID_COHESION_WEIGHT * 0.02)
  return vecAdd(vecAdd(aSep, aAli), aCoh)
}

/** Hunt, flee, boids, wander — adjusts velocities before integration. */
export function applySocialSteering(
  state: State,
  _params: Params,
  deltaMs: number,
): State {
  const dt = Math.min(deltaMs / 1000, 0.08)
  let rngState = state.rngState
  const roll = () => {
    const r = rngNext01(rngState)
    rngState = r.rngState
    return r.value
  }

  const normals = state.liveFish.filter((f) => f.species === 'normal')
  const liveFish = state.liveFish.map((fish) => {
    if (fish.health === 0) return fish
    const cap =
      fish.species === 'carnivore' ? MAX_SPEED_CARNIVORE : MAX_SPEED_NORMAL

    let ax = 0
    let ay = 0

    if (fish.species === 'carnivore') {
      const wantsFood = fishWantsFood(fish, state.currentDay)
      let prey: Fish | null = null
      let bestD = Number.POSITIVE_INFINITY
      if (wantsFood) {
        for (const o of state.liveFish) {
          if (o.id === fish.id || o.health === 0) continue
          if (o.weightG >= fish.weightG) continue
          const d = dist(fish.physics.position, o.physics.position)
          if (d < HUNT_PERCEPTION && d < bestD) {
            bestD = d
            prey = o
          }
        }
      }
      if (prey) {
        const dir = vecNorm(vecSub(prey.physics.position, fish.physics.position))
        ax += dir.x * STEER_ACCEL * 1.25
        ay += dir.y * STEER_ACCEL * 1.25
      } else {
        const wx = (roll() - 0.5) * WANDER_STRENGTH
        const wy = (roll() - 0.5) * WANDER_STRENGTH
        ax += wx
        ay += wy
      }
    } else {
      let threat: Fish | null = null
      let bestD = Number.POSITIVE_INFINITY
      for (const o of state.liveFish) {
        if (o.species !== 'carnivore' || o.health === 0) continue
        if (o.weightG <= fish.weightG) continue
        const d = dist(fish.physics.position, o.physics.position)
        if (d < FLEE_PERCEPTION && d < bestD) {
          bestD = d
          threat = o
        }
      }
      if (threat) {
        const away = vecNorm(vecSub(fish.physics.position, threat.physics.position))
        ax += away.x * STEER_ACCEL * 1.4
        ay += away.y * STEER_ACCEL * 1.4
      } else if (!fishWantsFood(fish, state.currentDay)) {
        const b = boidsAcceleration(fish, normals)
        ax += b.x
        ay += b.y
      }
    }

    let vx = fish.physics.velocity.x + ax * dt
    let vy = fish.physics.velocity.y + ay * dt
    ;({ x: vx, y: vy } = capSpeed(vx, vy, cap))

    return {
      ...fish,
      physics: {
        position: { ...fish.physics.position },
        velocity: { x: vx, y: vy },
      },
    }
  })

  return { ...state, liveFish, rngState }
}
