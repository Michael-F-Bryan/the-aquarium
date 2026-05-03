import { World } from 'miniplex'
import type { Params } from '../params'
import type { State } from '../types'
import type { AquariumEntity, SimulationEntity } from './components'

export type AquariumRuntime = {
  readonly simulationEntity: SimulationEntity
}

export function createAquariumRuntime(
  state: State,
  params: Params,
  deltaMs: number,
): AquariumRuntime {
  const clampedDeltaMs = Math.min(Math.max(deltaMs, 0), 250)
  const world = new World<AquariumEntity>()
  const simulationEntity = world.add({
    simulation: {
      state,
      params,
      deltaMs,
      clampedDeltaMs,
      dayAdvance: clampedDeltaMs / params.dayLengthMs,
    },
    events: [],
  }) as SimulationEntity

  return {
    simulationEntity,
  }
}
