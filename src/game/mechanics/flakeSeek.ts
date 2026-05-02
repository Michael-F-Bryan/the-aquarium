import { FISH_HALF, MAX_SPEED_CARNIVORE, MAX_SPEED_NORMAL } from '../constants'
import { hungryWithinLastDay } from '../satiation'
import type { Params } from '../params'
import type { State } from '../types'

const SEEK_ACCEL = 5.5

/**
 * Fish that have not eaten in the last 1.0 simulated days steer toward the
 * nearest flake (README: unfed fish move toward food).
 */
export function applyFlakeSeekVelocities(
  state: State,
  _params: Params,
  deltaMs: number,
): State {
  const dt = Math.min(deltaMs / 1000, 0.08)
  const liveFish = state.liveFish.map((fish) => {
    if (fish.health === 0 || state.food.length === 0) {
      return fish
    }
    if (!hungryWithinLastDay(state.currentDay, fish.lastAte)) {
      return fish
    }

    let bestD = Number.POSITIVE_INFINITY
    let tx = fish.physics.position.x
    let ty = fish.physics.position.y
    for (const piece of state.food) {
      const dx = piece.physics.position.x - fish.physics.position.x
      const dy = piece.physics.position.y - fish.physics.position.y
      const d = Math.hypot(dx, dy)
      if (d < bestD) {
        bestD = d
        tx = piece.physics.position.x
        ty = piece.physics.position.y
      }
    }

    const cap =
      fish.species === 'carnivore' ? MAX_SPEED_CARNIVORE : MAX_SPEED_NORMAL
    const dx = tx - fish.physics.position.x
    const dy = ty - fish.physics.position.y
    const len = Math.hypot(dx, dy) || 1
    const dir = { x: dx / len, y: dy / len }
    const desired = { x: dir.x * cap, y: dir.y * cap }
    const vx =
      fish.physics.velocity.x +
      (desired.x - fish.physics.velocity.x) * Math.min(1, SEEK_ACCEL * dt)
    const vy =
      fish.physics.velocity.y +
      (desired.y - fish.physics.velocity.y) * Math.min(1, SEEK_ACCEL * dt)
    const speed = Math.hypot(vx, vy)
    const scale = speed > cap && speed > 1e-6 ? cap / speed : 1
    return {
      ...fish,
      physics: {
        ...fish.physics,
        velocity: { x: vx * scale, y: vy * scale },
      },
    }
  })

  return { ...state, liveFish }
}

/** Integrate positions from velocities after all steering passes. */
export function integrateFishPositions(
  state: State,
  params: Params,
  deltaMs: number,
): State {
  const dt = Math.min(deltaMs / 1000, 0.08)
  const margin = FISH_HALF + 2
  const liveFish = state.liveFish.map((fish) => {
    if (fish.health === 0) return fish
    let x = fish.physics.position.x + fish.physics.velocity.x * dt
    let y = fish.physics.position.y + fish.physics.velocity.y * dt
    x = Math.min(params.aquariumWidth - margin, Math.max(margin, x))
    y = Math.min(params.aquariumHeight - margin, Math.max(margin, y))
    return {
      ...fish,
      physics: {
        position: { x, y },
        velocity: { ...fish.physics.velocity },
      },
    }
  })
  return { ...state, liveFish }
}
