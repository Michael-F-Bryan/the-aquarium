import { describe, expect, it } from 'vitest'
import { NEVER_ATE } from '../satiation'
import { makeTestFish, minimalGameSnapshotPayload, testParams } from '../test/fixtures'
import { buildGameSnapshotPayload } from './snapshotPayload'
import { applySimulationCommandsWithResults } from './commands'
import { hydrateAquariumRuntimeFromPayload } from './world'

describe('applySimulationCommandsWithResults', () => {
  it('reports rejected food drops with an explicit command outcome', () => {
    const snapshot = minimalGameSnapshotPayload({
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
    const runtime = hydrateAquariumRuntimeFromPayload(snapshot, params, 0)

    const result = applySimulationCommandsWithResults(runtime, params, [
      { type: 'drop-food', x: 120, y: 100 },
    ])

    const out = buildGameSnapshotPayload(runtime)
    expect(out.food).toHaveLength(1)
    expect(out.nextEntityId).toBe(2)
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
    const snapshot = minimalGameSnapshotPayload({
      currentDay: 4,
      nextEntityId: 10,
      liveFish: [hungryFish],
    })
    const params = testParams({
      foodPickupRadius: 20,
      minFoodSeparation: 5,
    })
    const runtime = hydrateAquariumRuntimeFromPayload(snapshot, params, 0)

    const result = applySimulationCommandsWithResults(runtime, params, [
      { type: 'drop-food', x: 200, y: 120 },
      { type: 'autoplay-drop-food' },
    ])

    expect(buildGameSnapshotPayload(runtime).food).toHaveLength(1)
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
