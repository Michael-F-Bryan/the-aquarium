import { describe, expect, it } from 'vitest'
import { pickFishName } from './fishNames'

describe('pickFishName', () => {
  it('is deterministic for a fixed seed', () => {
    expect(pickFishName(42)).toEqual(pickFishName(42))
  })

  it('advances rng state and picks from the name list', () => {
    const a = pickFishName(1)
    const b = pickFishName(a.rngState)
    expect(a.name.length).toBeGreaterThan(0)
    expect(b.rngState).not.toBe(a.rngState)
  })
})
