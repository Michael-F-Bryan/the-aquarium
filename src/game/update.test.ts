import { describe, expect, it } from 'vitest'
import { update } from './update'
import { minimalFish, minimalState, testParams } from './test/fixtures'

describe('update', () => {
  it('advances currentDay proportionally to delta and dayLengthMs', () => {
    const state = minimalState({ currentDay: 0 })
    const p = testParams({ dayLengthMs: 10_000 })
    const { state: next } = update(state, p, 100)
    expect(next.currentDay).toBeCloseTo(0.01)
  })

  it('clamps huge delta', () => {
    const state = minimalState({ currentDay: 0 })
    const { state: next } = update(state, testParams(), 999_999)
    expect(next.currentDay).toBeLessThan(1)
  })

  it('keeps live fish count stable with no interactions', () => {
    const fish = minimalFish({
      lastAte: 99,
      physics: { position: { x: 50, y: 50 }, velocity: { x: 0, y: 0 } },
    })
    const state = minimalState({
      currentDay: 100,
      liveFish: [fish],
    })
    const { state: next } = update(state, testParams(), 16)
    expect(next.liveFish).toHaveLength(1)
  })
})
