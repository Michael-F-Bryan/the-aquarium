import type { Params } from '../params'
import type { State } from '../types'
import {
  applySimulationCommandsWithResults,
  type SimulationCommand,
} from './commands'
import { selectUpdateResult } from './selectors'
import {
  advanceClockSystem,
  applyFlakeSeekVelocitiesSystem,
  applySocialSteeringSystem,
  integrateFishPositionsSystem,
  removeExpiredFoodSystem,
  resolveCarnivorePredationSystem,
  resolveFlakeEatingSystem,
  runCalendarBoundariesSystem,
  sinkAndPruneDeadFishSystem,
  sinkAndPruneSkeletonsSystem,
  type SimulationSystem,
} from './systems'
import { createAquariumRuntime } from './world'

export type SimulationStepInput = {
  readonly state: State
  readonly params: Params
  readonly deltaMs: number
  readonly commands?: readonly SimulationCommand[]
}

export const simulationSchedule: readonly SimulationSystem[] = [
  advanceClockSystem,
  removeExpiredFoodSystem,
  applyFlakeSeekVelocitiesSystem,
  applySocialSteeringSystem,
  integrateFishPositionsSystem,
  resolveFlakeEatingSystem,
  resolveCarnivorePredationSystem,
  sinkAndPruneSkeletonsSystem,
  runCalendarBoundariesSystem,
  sinkAndPruneDeadFishSystem,
]

export function runSimulationStep(input: SimulationStepInput) {
  const commandApplication = applySimulationCommandsWithResults(
    input.state,
    input.params,
    input.commands,
  )
  const runtime = createAquariumRuntime(
    commandApplication.state,
    input.params,
    input.deltaMs,
  )

  for (const system of simulationSchedule) {
    system.run(runtime)
  }

  return selectUpdateResult(runtime, commandApplication.commandResults)
}
