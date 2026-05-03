import { describe, expect, it } from 'vitest'
import { NEVER_ATE } from '../satiation'
import { applySocialSteering } from './movementSocial'
import { minimalFish, minimalState, testParams } from '../test/fixtures'

function carnivoreHuntScenario(rngState: number, lastAte: number, currentDay: number) {
  const hunter = minimalFish({
    id: 'c',
    species: 'carnivore',
    weightG: 500,
    lastAte,
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
  return minimalState({
    currentDay,
    rngState,
    liveFish: [hunter, prey],
  })
}

describe('applySocialSteering', () => {
  it('applies boid-like steering for normals when neighbors exist and not hungry', () => {
    const a = minimalFish({
      id: 'a',
      species: 'normal',
      lastAte: 50,
      physics: {
        position: { x: 100, y: 100 },
        velocity: { x: 1, y: 0 },
      },
    })
    const b = minimalFish({
      id: 'b',
      species: 'normal',
      lastAte: 50,
      physics: {
        position: { x: 130, y: 105 },
        velocity: { x: 0, y: 0 },
      },
    })
    const c = minimalFish({
      id: 'c',
      species: 'normal',
      lastAte: 50,
      physics: {
        position: { x: 80, y: 95 },
        velocity: { x: 0, y: 0 },
      },
    })
    const state = minimalState({
      currentDay: 60,
      liveFish: [a, b, c],
    })
    const next = applySocialSteering(state, testParams(), 50)
    const va = next.liveFish.find((f) => f.id === 'a')!.physics.velocity
    const vb = next.liveFish.find((f) => f.id === 'b')!.physics.velocity
    const vc = next.liveFish.find((f) => f.id === 'c')!.physics.velocity
    expect(Math.hypot(va.x, va.y) + Math.hypot(vb.x, vb.y) + Math.hypot(vc.x, vc.y)).toBeGreaterThan(
      0.01,
    )
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

  it('skips boids for hungry normals without a threat', () => {
    const fed = minimalFish({
      id: 'a',
      species: 'normal',
      lastAte: 100,
      physics: { position: { x: 100, y: 100 }, velocity: { x: 0, y: 0 } },
    })
    const hungry = { ...fed, id: 'h', lastAte: -1 }
    const neighbor = minimalFish({
      id: 'b',
      species: 'normal',
      lastAte: 100,
      physics: { position: { x: 108, y: 100 }, velocity: { x: 0, y: 0 } },
    })
    const stateFed = minimalState({
      currentDay: 100,
      rngState: 42,
      liveFish: [fed, neighbor],
    })
    const stateHungry = minimalState({
      currentDay: 100,
      rngState: 42,
      liveFish: [hungry, neighbor],
    })
    const vFed = applySocialSteering(stateFed, testParams(), 50).liveFish.find(
      (f) => f.id === 'a',
    )!.physics.velocity
    const vHungry = applySocialSteering(stateHungry, testParams(), 50).liveFish.find(
      (f) => f.id === 'h',
    )!.physics.velocity
    expect(Math.hypot(vFed.x, vFed.y)).toBeGreaterThan(0.001)
    expect(Math.hypot(vHungry.x, vHungry.y)).toBeLessThan(
      Math.hypot(vFed.x, vFed.y) * 0.5,
    )
  })

  it('hungry carnivores hunt harder toward prey than satiated ones (sampled RNG)', () => {
    let hungryBeats = 0
    const currentDay = 200
    for (let seed = 1; seed < 80; seed++) {
      const hungryState = carnivoreHuntScenario(seed, NEVER_ATE, currentDay)
      const fullState = carnivoreHuntScenario(seed, currentDay - 0.2, currentDay)
      const vh = applySocialSteering(hungryState, testParams(), 40).liveFish.find(
        (f) => f.id === 'c',
      )!.physics.velocity.x
      const vf = applySocialSteering(fullState, testParams(), 40).liveFish.find(
        (f) => f.id === 'c',
      )!.physics.velocity.x
      if (vh > vf) hungryBeats += 1
    }
    expect(hungryBeats).toBeGreaterThan(55)
  })
})
