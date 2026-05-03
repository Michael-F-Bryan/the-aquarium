import { describe, expect, it } from 'vitest'
import { minimalGameSnapshotPayload, testParams } from './test/fixtures'
import { createAppRuntimeCommandQueue, stepAppRuntime } from './appRuntime'
import { hydrateAquariumRuntimeFromPayload } from './ecs/world'

describe('app runtime orchestration', () => {
  it('drains queued commands through the ECS runtime with merged world params', () => {
    const queue = createAppRuntimeCommandQueue()
    const snapshot = minimalGameSnapshotPayload({ currentDay: 4, nextEntityId: 7 })
    const params = testParams({
      aquariumWidth: 800,
      aquariumHeight: 500,
      dayLengthMs: 1_000,
    })
    const runtime = hydrateAquariumRuntimeFromPayload(snapshot, params, 100)

    queue.enqueue({ type: 'drop-food', x: 999, y: 999 })
    const result = stepAppRuntime({
      runtime,
      params,
      worldSize: { width: 120, height: 90 },
      deltaMs: 100,
      commands: queue.drain(),
    })

    expect(queue.drain()).toEqual([])
    expect(result.readModel.currentDay).toBeCloseTo(4.1)
    expect(result.readModel.food).toMatchObject([
      {
        id: 'food-7',
        createdOnDay: 4,
        physics: {
          position: { x: 112, y: 82 },
          velocity: { x: 0, y: 0 },
        },
      },
    ])
  })
})
