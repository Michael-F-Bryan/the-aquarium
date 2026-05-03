import { describe, expect, it } from 'vitest'
import { FISH_HALF } from '../constants'
import { sinkAndPruneDead } from './deadPhysics'
import { minimalFish, minimalState, testParams } from '../test/fixtures'

describe('sinkAndPruneDead', () => {
  it('sinks corpses toward floor', () => {
    const dead = {
      ...minimalFish({ id: 'd1', health: 0 }),
      diedOnDay: 1,
      physics: {
        position: { x: 100, y: 10 },
        velocity: { x: 0, y: 0 },
      },
    }
    const state = minimalState({
      currentDay: 2,
      deadFish: [dead],
    })
    const p = testParams({ aquariumHeight: 200, deadFishLingerDays: 10 })
    const next = sinkAndPruneDead(state, p, 1000)
    expect(next.deadFish[0].physics.position.y).toBeGreaterThan(
      dead.physics.position.y,
    )
    expect(next.deadFish[0].physics.position.y).toBeLessThanOrEqual(
      p.aquariumHeight - FISH_HALF - 2,
    )
  })

  it('prunes after linger days', () => {
    const dead = {
      ...minimalFish({ id: 'd1', health: 0 }),
      diedOnDay: 0,
      physics: {
        position: { x: 100, y: 100 },
        velocity: { x: 0, y: 0 },
      },
    }
    const state = minimalState({
      currentDay: 15,
      deadFish: [dead],
    })
    const next = sinkAndPruneDead(state, testParams({ deadFishLingerDays: 10 }), 16)
    expect(next.deadFish).toHaveLength(0)
  })
})
