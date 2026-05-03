import { describe, expect, it } from 'vitest'
import { applyFlakeSeekVelocities, integrateFishPositions } from './flakeSeek'
import { minimalFish, minimalState, testParams } from '../test/fixtures'

describe('applyFlakeSeekVelocities', () => {
  it('leaves velocity when not hungry', () => {
    const fish = minimalFish({
      lastAte: 100,
      physics: {
        position: { x: 10, y: 10 },
        velocity: { x: 5, y: 0 },
      },
    })
    const state = minimalState({
      currentDay: 100.5,
      liveFish: [fish],
      food: [
        {
          id: 'f',
          createdOnDay: 0,
          physics: { position: { x: 200, y: 10 }, velocity: { x: 0, y: 0 } },
        },
      ],
    })
    const next = applyFlakeSeekVelocities(state, testParams(), 16)
    expect(next.liveFish[0].physics.velocity).toEqual(fish.physics.velocity)
  })

  it('steers hungry fish toward nearest flake', () => {
    const fish = minimalFish({
      lastAte: -1,
      physics: {
        position: { x: 100, y: 100 },
        velocity: { x: 0, y: 0 },
      },
    })
    const state = minimalState({
      currentDay: 1,
      liveFish: [fish],
      food: [
        {
          id: 'f',
          createdOnDay: 0,
          physics: { position: { x: 200, y: 100 }, velocity: { x: 0, y: 0 } },
        },
      ],
    })
    const next = applyFlakeSeekVelocities(state, testParams(), 100)
    expect(next.liveFish[0].physics.velocity.x).toBeGreaterThan(0)
  })
})

describe('integrateFishPositions', () => {
  it('clamps fish inside tank', () => {
    const fish = minimalFish({
      physics: {
        position: { x: 400, y: 250 },
        velocity: { x: 9999, y: 0 },
      },
    })
    const state = minimalState({ liveFish: [fish] })
    const next = integrateFishPositions(state, testParams(), 1000)
    expect(next.liveFish[0].physics.position.x).toBeLessThanOrEqual(
      testParams().aquariumWidth - 7,
    )
  })
})
