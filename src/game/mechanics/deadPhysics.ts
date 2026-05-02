import { DEAD_SINK_SPEED, FISH_HALF } from '../constants'
import type { Params } from '../params'
import type { State } from '../types'

/** Sink corpses toward the floor and remove them after the linger period. */
export function sinkAndPruneDead(
  state: State,
  params: Params,
  deltaMs: number,
): State {
  const dt = Math.min(deltaMs / 1000, 0.08)
  const bottomY = params.aquariumHeight - FISH_HALF - 2
  const dayFloor = Math.floor(state.currentDay)

  const deadFish = state.deadFish
    .filter((d) => dayFloor < d.diedOnDay + params.deadFishLingerDays)
    .map((d) => ({
      ...d,
      physics: {
        ...d.physics,
        position: {
          x: d.physics.position.x,
          y: Math.min(bottomY, d.physics.position.y + DEAD_SINK_SPEED * dt),
        },
        velocity: { x: 0, y: 0 },
      },
    }))

  return { ...state, deadFish }
}
