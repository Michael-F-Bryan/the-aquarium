import { describe, expect, it } from 'vitest'
import { FISH_HALF } from '../../game/constants'
import { fishAnchorPoint, toScenePoint } from './coordinates'

describe('coordinates helpers', () => {
  it('converts viewport point to centered scene coordinates', () => {
    const point = toScenePoint({ x: 200, y: 150 }, { width: 800, height: 500 })
    expect(point).toEqual([-200, 100, 0])
  })

  it('uses explicit z value when provided', () => {
    const point = toScenePoint({ x: 0, y: 0 }, { width: 100, height: 50 }, 7)
    expect(point).toEqual([-50, 25, 7])
  })

  it('returns fish anchor at sprite center', () => {
    const fish = { physics: { position: { x: 12, y: 30 } } }
    expect(fishAnchorPoint(fish)).toEqual({
      x: 12 + FISH_HALF,
      y: 30 + FISH_HALF,
    })
  })
})
