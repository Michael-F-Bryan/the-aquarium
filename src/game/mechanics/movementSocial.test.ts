import { describe, expect, it } from 'vitest'
import { applySocialSteering } from './movementSocial'
import { minimalFish, minimalState, testParams } from '../test/fixtures'

describe('applySocialSteering', () => {
  it('applies boid-like steering for normals when neighbors exist', () => {
    const a = minimalFish({
      id: 'a',
      species: 'normal',
      lastAte: 50,
      physics: {
        position: { x: 100, y: 100 },
        velocity: { x: 0, y: 0 },
      },
    })
    const b = minimalFish({
      id: 'b',
      species: 'normal',
      lastAte: 50,
      physics: {
        position: { x: 120, y: 100 },
        velocity: { x: 0, y: 0 },
      },
    })
    const state = minimalState({
      currentDay: 60,
      liveFish: [a, b],
    })
    const next = applySocialSteering(state, testParams(), 50)
    const va = next.liveFish.find((f) => f.id === 'a')!.physics.velocity
    const vb = next.liveFish.find((f) => f.id === 'b')!.physics.velocity
    expect(Math.hypot(va.x, va.y) + Math.hypot(vb.x, vb.y)).toBeGreaterThan(0)
  })

  it('carnivore accelerates toward smaller prey in perception', () => {
    const hunter = minimalFish({
      id: 'c',
      species: 'carnivore',
      weightG: 500,
      lastAte: 50,
      physics: {
        position: { x: 100, y: 100 },
        velocity: { x: 0, y: 0 },
      },
    })
    const prey = minimalFish({
      id: 'p',
      species: 'normal',
      weightG: 100,
      physics: {
        position: { x: 150, y: 100 },
        velocity: { x: 0, y: 0 },
      },
    })
    const state = minimalState({
      currentDay: 60,
      liveFish: [hunter, prey],
    })
    const next = applySocialSteering(state, testParams(), 50)
    const v = next.liveFish.find((f) => f.id === 'c')!.physics.velocity
    expect(v.x).toBeGreaterThan(0)
  })
})
