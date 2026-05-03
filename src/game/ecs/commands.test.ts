import { describe, expect, it } from 'vitest'
import { NEVER_ATE } from '../satiation'
import { makeTestFish, minimalState, testParams } from '../test/fixtures'
import { applySimulationCommandsWithResults } from './commands'

describe('applySimulationCommandsWithResults', () => {
  it('reports rejected food drops with an explicit command outcome', () => {
    const state = minimalState({
      nextEntityId: 2,
      food: [
        {
          id: 'food-1',
          createdOnDay: 0,
          physics: {
            position: { x: 100, y: 100 },
            velocity: { x: 0, y: 0 },
          },
        },
      ],
    })
    const params = testParams({ minFoodSeparation: 50 })

    const result = applySimulationCommandsWithResults(state, params, [
      { type: 'drop-food', x: 120, y: 100 },
    ])

    expect(result.state.food).toHaveLength(1)
    expect(result.state.nextEntityId).toBe(2)
    expect(result.commandResults).toEqual([
      {
        command: { type: 'drop-food', x: 120, y: 100 },
        applied: false,
        reason: 'drop-rejected',
      },
    ])
  })

  it('resolves autoplay food drops against command-mutated step state', () => {
    const hungryFish = makeTestFish({
      id: 'hungry',
      lastAte: NEVER_ATE,
      physics: {
        position: { x: 200, y: 120 },
        velocity: { x: 0, y: 0 },
      },
    })
    const state = minimalState({
      currentDay: 4,
      nextEntityId: 10,
      liveFish: [hungryFish],
    })
    const params = testParams({
      foodPickupRadius: 20,
      minFoodSeparation: 5,
    })

    const result = applySimulationCommandsWithResults(state, params, [
      { type: 'drop-food', x: 200, y: 120 },
      { type: 'autoplay-drop-food' },
    ])

    expect(result.state.food).toHaveLength(1)
    expect(result.commandResults).toEqual([
      {
        command: { type: 'drop-food', x: 200, y: 120 },
        applied: true,
        reason: 'dropped',
        target: { x: 200, y: 120 },
      },
      {
        command: { type: 'autoplay-drop-food' },
        applied: false,
        reason: 'no-target',
        atDay: 4,
        liveFishCount: 1,
        foodCount: 1,
      },
    ])
  })
})
