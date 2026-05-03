import { chooseAutoplayFoodDrop } from '../autoplay/policy'
import { dropFlakeFoodWithResult } from '../mechanics/foodDrop'
import type { Params } from '../params'
import type { State } from '../types'

export type DropFoodCommand = {
  readonly type: 'drop-food'
  readonly x: number
  readonly y: number
}

export type AutoplayDropFoodCommand = {
  readonly type: 'autoplay-drop-food'
}

export type SimulationCommand = DropFoodCommand | AutoplayDropFoodCommand

export type SimulationCommandResultReason =
  | 'dropped'
  | 'policy-drop'
  | 'drop-rejected'
  | 'no-target'

export type SimulationCommandResult = {
  readonly command: SimulationCommand
  readonly applied: boolean
  readonly reason?: SimulationCommandResultReason
  readonly target?: {
    readonly x: number
    readonly y: number
  }
  readonly targetFishId?: string
  readonly atDay?: number
  readonly liveFishCount?: number
  readonly foodCount?: number
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
    switch (command.type) {
      case 'drop-food': {
        const drop = dropFlakeFoodWithResult(next, params, command.x, command.y)
        next = drop.state
        commandResults.push({
          command,
          applied: drop.applied,
          reason: drop.applied ? 'dropped' : 'drop-rejected',
          target: drop.target,
        })
        break
      }
      case 'autoplay-drop-food': {
        const atDay = next.currentDay
        const liveFishCount = next.liveFish.length
        const foodCount = next.food.length
        const decision = chooseAutoplayFoodDrop(next, params)
        if (!decision) {
          commandResults.push({
            command,
            applied: false,
            reason: 'no-target',
            atDay,
            liveFishCount,
            foodCount,
          })
          break
        }
        const drop = dropFlakeFoodWithResult(next, params, decision.x, decision.y)
        next = drop.state
        commandResults.push({
          command,
          applied: drop.applied,
          reason: drop.applied ? 'policy-drop' : 'drop-rejected',
          target: drop.target,
          targetFishId: decision.targetFishId,
          atDay,
          liveFishCount,
          foodCount,
        })
        break
      }
    }
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
