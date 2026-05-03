import { describe, expect, it } from 'vitest'
import { rollAppearance } from './appearance'

describe('rollAppearance', () => {
  it('is deterministic for a fixed seed', () => {
    expect(rollAppearance(99)).toEqual(rollAppearance(99))
  })

  it('advances rng state', () => {
    const a = rollAppearance(5)
    const b = rollAppearance(a.rngState)
    expect(b.rngState).not.toBe(a.rngState)
  })
})
