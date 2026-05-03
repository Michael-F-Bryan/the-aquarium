import { describe, expect, it } from 'vitest'
import {
  NEVER_ATE,
  ateWithinWindowBeforeCalendarClose,
  fishWantsFood,
  hungryWithinLastDay,
} from './satiation'
import { minimalFish } from './test/fixtures'

describe('satiation', () => {
  it('hungryWithinLastDay is true when never ate', () => {
    expect(hungryWithinLastDay(5, NEVER_ATE, 1)).toBe(true)
  })

  it('hungryWithinLastDay when gap >= 1 day', () => {
    expect(hungryWithinLastDay(3, 1.9, 1)).toBe(true)
    expect(hungryWithinLastDay(3, 2, 1)).toBe(true)
    expect(hungryWithinLastDay(3, 2.1, 1)).toBe(false)
  })

  it('ateWithinWindowBeforeCalendarClose', () => {
    expect(ateWithinWindowBeforeCalendarClose(NEVER_ATE, 0, 1.5)).toBe(false)
    // closeSimTime for completedDayFloor 0 is 1; window [1-1.5, 1] = [-0.5, 1]
    expect(ateWithinWindowBeforeCalendarClose(0.5, 0, 1.5)).toBe(true)
    expect(ateWithinWindowBeforeCalendarClose(2, 0, 1.5)).toBe(false)
  })

  it('fishWantsFood respects health', () => {
    const dead = minimalFish({ health: 0 })
    expect(fishWantsFood(dead, 10, 1)).toBe(false)
    expect(fishWantsFood(minimalFish({ health: 1 }), 10, 1)).toBe(true)
  })
})
