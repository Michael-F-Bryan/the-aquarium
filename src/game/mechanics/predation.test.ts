import { describe, expect, it } from 'vitest'
import { CARNIVORE_KILL_RADIUS } from '../constants'
import { resolveCarnivorePredation } from './predation'
import { minimalFish, minimalState } from '../test/fixtures'

describe('resolveCarnivorePredation', () => {
  it('removes smaller overlapping prey', () => {
    const carn = minimalFish({
      id: 'c1',
      species: 'carnivore',
      weightG: 400,
      physics: {
        position: { x: 200, y: 200 },
        velocity: { x: 0, y: 0 },
      },
    })
    const prey = minimalFish({
      id: 'p1',
      species: 'normal',
      weightG: 100,
      physics: {
        position: {
          x: 200 + CARNIVORE_KILL_RADIUS * 0.5,
          y: 200,
        },
        velocity: { x: 0, y: 0 },
      },
    })
    const state = minimalState({
      currentDay: 3,
      liveFish: [carn, prey],
    })
    const { state: next, events } = resolveCarnivorePredation(state)
    expect(next.liveFish.map((f) => f.id)).toEqual(['c1'])
    expect(next.deadFish).toHaveLength(1)
    expect(next.deadFish[0].id).toBe('p1')
    const hunter = next.liveFish[0]
    expect(hunter.lastAte).toBe(3)
    expect(hunter.weightG).toBe(400 + Math.round(100 * 0.1))
    expect(next.skeletons).toHaveLength(1)
    expect(next.skeletons[0].preyName).toBe('Test')
    expect(events).toHaveLength(1)
    expect(events[0].type).toBe('prey_eaten')
  })

  it('does not eat same-size or larger fish', () => {
    const carn = minimalFish({
      id: 'c1',
      species: 'carnivore',
      weightG: 200,
      physics: { position: { x: 100, y: 100 }, velocity: { x: 0, y: 0 } },
    })
    const other = minimalFish({
      id: 'p1',
      species: 'normal',
      weightG: 200,
      physics: {
        position: { x: 100, y: 100 },
        velocity: { x: 0, y: 0 },
      },
    })
    const state = minimalState({ currentDay: 1, liveFish: [carn, other] })
    const { state: next } = resolveCarnivorePredation(state)
    expect(next.liveFish).toHaveLength(2)
  })
})
