import { dropFlakeFood } from '../mechanics/foodDrop'
import type { Params } from '../params'
import type { State } from '../types'

export type SimulationCommand = {
  readonly type: 'drop-food'
  readonly x: number
  readonly y: number
}

export type SimulationCommandResult = {
  readonly command: SimulationCommand
  readonly applied: boolean
}

export type ApplySimulationCommandsResult = {
  readonly state: State
  readonly commandResults: readonly SimulationCommandResult[]
}

export function applySimulationCommandsWithResults(
  state: State,
  params: Params,
  commands: readonly SimulationCommand[] = [],
): ApplySimulationCommandsResult {
  let next = state
  const commandResults: SimulationCommandResult[] = []
  for (const command of commands) {
    const before = next
    switch (command.type) {
      case 'drop-food':
        next = dropFlakeFood(next, params, command.x, command.y)
        break
    }
    commandResults.push({ command, applied: next !== before })
  }
  return { state: next, commandResults }
}

export function applySimulationCommands(
  state: State,
  params: Params,
  commands: readonly SimulationCommand[] = [],
): State {
  return applySimulationCommandsWithResults(state, params, commands).state
}
