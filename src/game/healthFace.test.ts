import { describe, expect, it } from 'vitest'
import { healthFace } from './healthFace'

describe('healthFace', () => {
  it('maps each supported health value to the expected face', () => {
    expect(healthFace(3)).toBe('😊')
    expect(healthFace(2)).toBe('😐')
    expect(healthFace(1)).toBe('🙁')
    expect(healthFace(0)).toBe('💀')
  })

  it('falls back to skull for unexpected health values', () => {
    expect(healthFace(-1 as 0)).toBe('💀')
    expect(healthFace(99 as 3)).toBe('💀')
  })
})
