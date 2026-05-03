import { runSimulationStep } from './ecs/schedule'
import type { SimulationStepResult } from './ecs/selectors'
import type { Params } from './params'
import type { State } from './types'

export type UpdateResult = SimulationStepResult

/** Single entry for the simulation step. Runtime order is owned by ECS schedule. */
export function update(state: State, params: Params, deltaMs: number): UpdateResult {
  return runSimulationStep({ state, params, deltaMs })
}
