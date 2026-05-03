import { describe, expect, it } from 'vitest'
import { FOOD_PICKUP_RADIUS } from '../constants'
import { resolveFlakeEating } from './flakeEat'
import { minimalFish, minimalState } from '../test/fixtures'

describe('resolveFlakeEating', () => {
  it('does not eat when not hungry', () => {
    const fish = minimalFish({
      id: 'a',
      lastAte: 10,
      health: 2,
      physics: { position: { x: 50, y: 50 }, velocity: { x: 0, y: 0 } },
    })
    const state = minimalState({
      currentDay: 10.5,
      liveFish: [fish],
      food: [
        {
          id: 'food-1',
          createdOnDay: 10,
          physics: { position: { x: 50, y: 50 }, velocity: { x: 0, y: 0 } },
        },
      ],
    })
    const next = resolveFlakeEating(state)
    expect(next.food).toHaveLength(1)
    expect(next.liveFish[0].health).toBe(2)
  })

  it('eats overlapping flake when hungry and heals', () => {
    const fish = minimalFish({
      id: 'a',
      lastAte: -1,
      health: 2,
      physics: { position: { x: 50, y: 50 }, velocity: { x: 0, y: 0 } },
    })
    const state = minimalState({
      currentDay: 5,
      liveFish: [fish],
      food: [
        {
          id: 'food-1',
          createdOnDay: 4,
          physics: {
            position: { x: 50 + FOOD_PICKUP_RADIUS * 0.5, y: 50 },
            velocity: { x: 0, y: 0 },
          },
        },
      ],
    })
    const next = resolveFlakeEating(state)
    expect(next.food).toHaveLength(0)
    expect(next.liveFish[0].health).toBe(3)
    expect(next.liveFish[0].lastAte).toBe(5)
  })
})
