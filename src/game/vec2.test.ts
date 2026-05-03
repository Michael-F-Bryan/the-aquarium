import { describe, expect, it } from 'vitest'
import { clampToRect, dist, vecAdd, vecNorm, vecScale, vecSub } from './vec2'

describe('vec2', () => {
  it('vecNorm scales to unit length', () => {
    const n = vecNorm({ x: 3, y: 4 })
    expect(n.x).toBeCloseTo(0.6)
    expect(n.y).toBeCloseTo(0.8)
  })

  it('vecNorm returns zero for near-zero vector', () => {
    const n = vecNorm({ x: 0, y: 0 })
    expect(n.x).toBe(0)
    expect(n.y).toBe(0)
  })

  it('dist matches hypot', () => {
    expect(dist({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5)
  })

  it('vecAdd vecSub vecScale', () => {
    expect(vecAdd({ x: 1, y: 2 }, { x: 3, y: 4 })).toEqual({ x: 4, y: 6 })
    expect(vecSub({ x: 3, y: 4 }, { x: 1, y: 2 })).toEqual({ x: 2, y: 2 })
    expect(vecScale({ x: 2, y: 3 }, 2)).toEqual({ x: 4, y: 6 })
  })

  it('clampToRect respects margins', () => {
    expect(clampToRect({ x: -100, y: 500 }, 10, 100, 200)).toEqual({
      x: 10,
      y: 190,
    })
  })
})
