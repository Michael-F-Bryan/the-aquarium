import { describe, expect, it } from 'vitest'
import { dropFlakeFood } from './foodDrop'
import { minimalState } from '../test/fixtures'
import { testParams } from '../test/fixtures'

describe('dropFlakeFood', () => {
  it('clamps drop position to aquarium margins', () => {
    const state = minimalState({ nextEntityId: 5 })
    const p = testParams({ aquariumWidth: 100, aquariumHeight: 80 })
    const next = dropFlakeFood(state, p, 1000, 1000)
    expect(next.food).toHaveLength(1)
    const piece = next.food[0]
    expect(piece.physics.position.x).toBeLessThanOrEqual(100 - 8)
    expect(piece.physics.position.y).toBeLessThanOrEqual(80 - 8)
    expect(next.nextEntityId).toBe(6)
  })
})
