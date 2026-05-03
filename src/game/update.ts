import { runSimulationStep } from './ecs/schedule'
import type { SimulationEvent } from './events'
import type { Params } from './params'
import type { State } from './types'

export type UpdateResult = { state: State; events: readonly SimulationEvent[] }

/** Single entry for the simulation step. Runtime order is owned by ECS schedule. */
export function update(state: State, params: Params, deltaMs: number): UpdateResult {
  return runSimulationStep({ state, params, deltaMs })
}
