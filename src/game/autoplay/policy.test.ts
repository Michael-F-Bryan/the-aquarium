import { describe, expect, it } from 'vitest'
import { NEVER_ATE } from '../satiation'
import { makeTestFish, minimalState, testParams } from '../test/fixtures'
import { chooseAutoplayFoodDrop } from './policy'

describe('chooseAutoplayFoodDrop', () => {
  it('returns null when no fish currently wants food', () => {
    const state = minimalState({
      currentDay: 10,
      liveFish: [
        makeTestFish({
          id: 'f0',
          health: 3,
          lastAte: 9.6,
          physics: { position: { x: 100, y: 100 }, velocity: { x: 0, y: 0 } },
        }),
      ],
    })
    expect(chooseAutoplayFoodDrop(state, testParams())).toBeNull()
  })

  it('prioritizes hungry fish with lowest health', () => {
    const lowHealth = makeTestFish({
      id: 'f-low',
      health: 1,
      lastAte: NEVER_ATE,
      physics: { position: { x: 220, y: 180 }, velocity: { x: 0, y: 0 } },
    })
    const healthier = makeTestFish({
      id: 'f-high',
      health: 3,
      lastAte: NEVER_ATE,
      physics: { position: { x: 40, y: 50 }, velocity: { x: 0, y: 0 } },
    })
    const state = minimalState({
      currentDay: 2.2,
      liveFish: [healthier, lowHealth],
    })
    const action = chooseAutoplayFoodDrop(state, testParams())
    expect(action).not.toBeNull()
    expect(action?.targetFishId).toBe('f-low')
    expect(action?.x).toBe(220)
    expect(action?.y).toBe(180)
  })

  it('returns null when food is already near the chosen fish', () => {
    const fish = makeTestFish({
      id: 'f0',
      health: 1,
      lastAte: NEVER_ATE,
      physics: { position: { x: 100, y: 100 }, velocity: { x: 0, y: 0 } },
    })
    const state = minimalState({
      currentDay: 3,
      liveFish: [fish],
      food: [
        {
          id: 'food-0',
          createdOnDay: 2.9,
          physics: { position: { x: 102, y: 100 }, velocity: { x: 0, y: 0 } },
        },
      ],
    })
    expect(chooseAutoplayFoodDrop(state, testParams())).toBeNull()
  })
})
