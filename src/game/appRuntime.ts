import { runSimulationStep } from './ecs/schedule'
import type {
  SimulationCommand,
  SimulationCommandResult,
} from './ecs/commands'
import type { SimulationStepResult } from './ecs/selectors'
import type { Params } from './params'
import type { State } from './types'

export type WorldSize = {
  readonly width: number
  readonly height: number
}

export type QueuedSimulationCommand<TMeta = never> = {
  readonly command: SimulationCommand
  readonly meta?: TMeta
}

export type AppRuntimeCommandOutcome<TMeta = never> = QueuedSimulationCommand<TMeta> &
  SimulationCommandResult

export type AppRuntimeStepInput<TMeta = never> = {
  readonly state: State
  readonly params: Params
  readonly worldSize: WorldSize
  readonly deltaMs: number
  readonly commands?: readonly QueuedSimulationCommand<TMeta>[]
}

export type AppRuntimeStepResult<TMeta = never> = SimulationStepResult & {
  readonly params: Params
  readonly commandOutcomes: readonly AppRuntimeCommandOutcome<TMeta>[]
}

export function mergeRuntimeParams(params: Params, worldSize: WorldSize): Params {
  return {
    ...params,
    aquariumWidth: worldSize.width,
    aquariumHeight: worldSize.height,
  }
}

export function createAppRuntimeCommandQueue<TMeta = never>() {
  const queued: QueuedSimulationCommand<TMeta>[] = []

  return {
    enqueue(command: SimulationCommand | QueuedSimulationCommand<TMeta>): void {
      if ('command' in command) {
        queued.push(command)
      } else {
        queued.push({ command })
      }
    },
    drain(): readonly QueuedSimulationCommand<TMeta>[] {
      return queued.splice(0, queued.length)
    },
  }
}

export function stepAppRuntime<TMeta = never>(
  input: AppRuntimeStepInput<TMeta>,
): AppRuntimeStepResult<TMeta> {
  const params = mergeRuntimeParams(input.params, input.worldSize)
  const queuedCommands = input.commands ?? []
  const result = runSimulationStep({
    state: input.state,
    params,
    deltaMs: input.deltaMs,
    commands: queuedCommands.map((queued) => queued.command),
  })
  const commandOutcomes = result.commandResults.map((commandResult, index) => ({
    ...queuedCommands[index],
    ...commandResult,
  }))

  return {
    ...result,
    params,
    commandOutcomes,
  }
}
