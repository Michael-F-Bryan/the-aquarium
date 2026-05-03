import { describe, expect, it } from 'vitest'
import { sinkAndPruneSkeletons } from './skeletonPhysics'
import { minimalState, testParams } from '../test/fixtures'

describe('sinkAndPruneSkeletons', () => {
  it('removes skeletons after two simulated days', () => {
    const state = minimalState({
      currentDay: 5,
      skeletons: [
        {
          id: 'sk-1',
          preyName: 'Gone',
          createdOnDay: 2.9,
          physics: {
            position: { x: 50, y: 50 },
            velocity: { x: 0, y: 0 },
          },
        },
      ],
    })
    const next = sinkAndPruneSkeletons(state, testParams(), 16)
    expect(next.skeletons).toHaveLength(0)
  })

  it('keeps young skeletons', () => {
    const state = minimalState({
      currentDay: 3,
      skeletons: [
        {
          id: 'sk-1',
          preyName: 'Here',
          createdOnDay: 2,
          physics: {
            position: { x: 50, y: 10 },
            velocity: { x: 0, y: 0 },
          },
        },
      ],
    })
    const next = sinkAndPruneSkeletons(state, testParams({ aquariumHeight: 200 }), 1000)
    expect(next.skeletons).toHaveLength(1)
    expect(next.skeletons[0].physics.position.y).toBeGreaterThan(10)
  })
})
