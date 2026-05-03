import { describe, expect, it } from 'vitest'
import { removeExpiredFood } from './foodLifetime'
import { testParams } from '../test/fixtures'
import { minimalState } from '../test/fixtures'

describe('removeExpiredFood', () => {
  it('keeps fresh food', () => {
    const state = minimalState({
      currentDay: 1,
      food: [
        {
          id: 'f1',
          createdOnDay: 0.9,
          physics: {
            position: { x: 1, y: 1 },
            velocity: { x: 0, y: 0 },
          },
        },
      ],
    })
    const p = testParams({ foodLifetimeDays: 0.5 })
    const next = removeExpiredFood(state, p)
    expect(next.food).toHaveLength(1)
  })

  it('removes stale food', () => {
    const state = minimalState({
      currentDay: 2,
      food: [
        {
          id: 'f1',
          createdOnDay: 0,
          physics: {
            position: { x: 1, y: 1 },
            velocity: { x: 0, y: 0 },
          },
        },
      ],
    })
    const p = testParams({ foodLifetimeDays: 0.5 })
    const next = removeExpiredFood(state, p)
    expect(next.food).toHaveLength(0)
  })
})
