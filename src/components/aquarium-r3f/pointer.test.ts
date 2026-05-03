import { describe, expect, it } from 'vitest'
import { clientPointToAquariumPoint } from './pointer'

describe('clientPointToAquariumPoint', () => {
  it('maps browser pointer coordinates into aquarium CSS-pixel space', () => {
    const point = clientPointToAquariumPoint(
      {
        left: 10,
        top: 20,
        width: 400,
        height: 200,
      },
      {
        clientX: 210,
        clientY: 120,
      },
      {
        width: 800,
        height: 500,
      },
    )

    expect(point).toEqual({ x: 400, y: 250 })
  })
})
