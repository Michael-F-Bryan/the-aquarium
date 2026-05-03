import { describe, expect, it } from 'vitest'
import { pickFishName } from './fishNames'

describe('pickFishName', () => {
  it('is deterministic for a fixed seed', () => {
    expect(pickFishName(42)).toEqual(pickFishName(42))
  })

  it('advances rng state', () => {
    const a = pickFishName(1)
    const b = pickFishName(a.rngState)
    expect(a.name).toMatch(/^Fish-\d+$/)
    expect(b.rngState).not.toBe(a.rngState)
  })
})
