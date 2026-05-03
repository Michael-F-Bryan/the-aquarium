import { describe, expect, it } from 'vitest'
import { dropFlakeFood } from './foodDrop'
import { minimalState } from '../test/fixtures'
import { testParams } from '../test/fixtures'

describe('dropFlakeFood', () => {
  it('rejects drop when another flake is within minFoodSeparation', () => {
    const state = minimalState({
      nextEntityId: 2,
      food: [
        {
          id: 'food-0',
          createdOnDay: 0,
          physics: {
            position: { x: 100, y: 100 },
            velocity: { x: 0, y: 0 },
          },
        },
      ],
    })
    const p = testParams()
    const dx = p.minFoodSeparation * 0.5
    const next = dropFlakeFood(state, p, 100 + dx, 100)
    expect(next.food).toHaveLength(1)
    expect(next.nextEntityId).toBe(2)
  })

  it('allows drop when far enough from existing flakes', () => {
    const state = minimalState({
      nextEntityId: 2,
      food: [
        {
          id: 'food-0',
          createdOnDay: 0,
          physics: {
            position: { x: 100, y: 100 },
            velocity: { x: 0, y: 0 },
          },
        },
      ],
    })
    const p = testParams()
    const next = dropFlakeFood(state, p, 100 + p.minFoodSeparation, 100)
    expect(next.food).toHaveLength(2)
  })

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
