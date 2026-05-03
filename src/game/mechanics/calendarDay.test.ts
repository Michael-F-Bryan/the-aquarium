import { describe, expect, it } from 'vitest'
import { runCalendarBoundaries } from './calendarDay'
import { NEVER_ATE } from '../satiation'
import { minimalFish, minimalState, testParams } from '../test/fixtures'

function bigParent(id: string, weightG: number) {
  return minimalFish({
    id,
    weightG,
    ageDays: 100,
    health: 3,
    lastAte: 5,
    physics: { position: { x: 100, y: 100 }, velocity: { x: 0, y: 0 } },
  })
}

describe('runCalendarBoundaries', () => {
  it('returns unchanged when floor has not crossed next boundary', () => {
    const state = minimalState({ currentDay: 0.5, lastClosedCalendarDayFloor: -1 })
    const { state: next } = runCalendarBoundaries(state, testParams())
    expect(next).toBe(state)
  })

  it('applies midnight when floor advances past lastClosed+1', () => {
    const fish = minimalFish({
      ageDays: 0,
      lastAte: NEVER_ATE,
      health: 3,
      physics: { position: { x: 50, y: 50 }, velocity: { x: 0, y: 0 } },
    })
    const state = minimalState({
      currentDay: 1.2,
      lastClosedCalendarDayFloor: -1,
      liveFish: [fish],
      rngState: 1,
    })
    const { state: next } = runCalendarBoundaries(state, testParams())
    expect(next.lastClosedCalendarDayFloor).toBe(0)
    expect(next.liveFish[0].health).toBe(2)
    expect(next.liveFish[0].ageDays).toBe(1)
  })

  it('does not mutate adults to carnivores when population >= 5', () => {
    const fish = [
      bigParent('f0', 400),
      bigParent('f1', 400),
      bigParent('f2', 400),
      bigParent('f3', 400),
      bigParent('f4', 400),
    ].map((f, i) => ({
      ...f,
      id: `fish-${i}`,
      lastAte: 5,
    }))
    const state = minimalState({
      currentDay: 2,
      lastClosedCalendarDayFloor: 0,
      liveFish: fish,
      rngState: 0x11111111,
    })
    const { state: next } = runCalendarBoundaries(
      state,
      testParams({ carnivoreMutationChance: 1, reproduceChanceCap: 0 }),
    )
    expect(next.liveFish.filter((f) => f.id.startsWith('fish-')).length).toBe(5)
    expect(next.liveFish.every((f) => f.species === 'normal')).toBe(true)
  })
})
