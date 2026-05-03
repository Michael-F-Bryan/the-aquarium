import type { Params } from '../params'
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
import { syncAquariumRuntimeForStep, type AquariumRuntime } from './world'

export type SimulationStepInput = {
  readonly runtime: AquariumRuntime
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
  syncAquariumRuntimeForStep(input.runtime, input.params, input.deltaMs)
  input.runtime.simulationEntity.events.length = 0
  const commandApplication = applySimulationCommandsWithResults(
    input.runtime,
    input.params,
    input.commands,
  )
  for (const system of simulationSchedule) {
    system.run(input.runtime)
  }

  return selectUpdateResult(input.runtime, commandApplication.commandResults)
}
