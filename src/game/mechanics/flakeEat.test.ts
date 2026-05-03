import { describe, expect, it } from 'vitest'
import { resolveFlakeEating } from './flakeEat'
import { minimalFish, minimalState, testParams } from '../test/fixtures'

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
    const { state: next } = resolveFlakeEating(state, testParams())
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
    const p = testParams()
    const state = minimalState({
      currentDay: 5,
      liveFish: [fish],
      food: [
        {
          id: 'food-1',
          createdOnDay: 4,
          physics: {
            position: { x: 50 + p.foodPickupRadius * 0.5, y: 50 },
            velocity: { x: 0, y: 0 },
          },
        },
      ],
    })
    const { state: next, events } = resolveFlakeEating(state, p)
    expect(next.food).toHaveLength(0)
    expect(next.liveFish[0].health).toBe(3)
    expect(next.liveFish[0].lastAte).toBe(5)
    expect(events).toEqual([{ type: 'ate_flake', fishId: 'a', name: 'Test' }])
  })
})
