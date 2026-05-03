import { FISH_HALF } from '../constants'
import type { Params } from '../params'
import type { State } from '../types'

/** Sink skeletons to the floor and remove those older than two simulated days. */
export function sinkAndPruneSkeletons(
  state: State,
  params: Params,
  deltaMs: number,
): State {
  if (state.skeletons.length === 0) return state
  const dt = Math.min(deltaMs / 1000, 0.08)
  const bottomY = params.aquariumHeight - FISH_HALF - 2

  const skeletons = state.skeletons
    .filter((s) => state.currentDay < s.createdOnDay + params.skeletonLifetimeDays)
    .map((s) => ({
      ...s,
      physics: {
        ...s.physics,
        position: {
          x: s.physics.position.x,
          y: Math.min(bottomY, s.physics.position.y + params.skeletonSinkSpeed * dt),
        },
        velocity: { x: 0, y: 0 },
      },
    }))

  return { ...state, skeletons }
}
