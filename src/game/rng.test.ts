import { describe, expect, it } from 'vitest'
import { rngNext01 } from './rng'

describe('rngNext01', () => {
  it('returns value in [0,1) and advances state', () => {
    const a = rngNext01(1)
    expect(a.value).toBeGreaterThanOrEqual(0)
    expect(a.value).toBeLessThan(1)
    expect(a.rngState).not.toBe(1)
    const b = rngNext01(a.rngState)
    expect(b.value).toBeGreaterThanOrEqual(0)
    expect(b.value).toBeLessThan(1)
  })

  it('is deterministic for same seed', () => {
    const s = 0x9e3779b9
    expect(rngNext01(s)).toEqual(rngNext01(s))
  })
})
