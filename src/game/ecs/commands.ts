import { dropFlakeFood } from '../mechanics/foodDrop'
import type { Params } from '../params'
import type { State } from '../types'

export type SimulationCommand = {
  readonly type: 'drop-food'
  readonly x: number
  readonly y: number
}

export function applySimulationCommands(
  state: State,
  params: Params,
  commands: readonly SimulationCommand[] = [],
): State {
  let next = state
  for (const command of commands) {
    switch (command.type) {
      case 'drop-food':
        next = dropFlakeFood(next, params, command.x, command.y)
        break
    }
  }
  return next
}
