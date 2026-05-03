import { chooseAutoplayFoodDrop } from '../autoplay/policy'
import type { Params } from '../params'
import { dropFlakeFoodOnRuntime } from './applyFoodDrop'
import { buildGameSnapshotPayload } from './snapshotPayload'
import type { AquariumRuntime } from './world'

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
  readonly commandResults: readonly SimulationCommandResult[]
}

export function applySimulationCommandsWithResults(
  runtime: AquariumRuntime,
  params: Params,
  commands: readonly SimulationCommand[] = [],
): ApplySimulationCommandsResult {
  const commandResults: SimulationCommandResult[] = []
  for (const command of commands) {
    switch (command.type) {
      case 'drop-food': {
        const drop = dropFlakeFoodOnRuntime(runtime, params, command.x, command.y)
        commandResults.push({
          command,
          applied: drop.applied,
          reason: drop.applied ? 'dropped' : 'drop-rejected',
          target: drop.target,
        })
        break
      }
      case 'autoplay-drop-food': {
        const snap = buildGameSnapshotPayload(runtime)
        const atDay = snap.currentDay
        const liveFishCount = snap.liveFish.length
        const foodCount = snap.food.length
        const decision = chooseAutoplayFoodDrop(snap, params)
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
        const drop = dropFlakeFoodOnRuntime(runtime, params, decision.x, decision.y)
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
  return { commandResults }
}
