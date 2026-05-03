import { describe, expect, it } from 'vitest'
import {
  fishTraitPresentation,
  waterBackdropPresentation,
} from './fishPresentation'
import { defaultTestAppearance } from '../test/fixtures'

describe('fishTraitPresentation', () => {
  it('maps fin and tail shape traits to distinct visible variants', () => {
    const base = {
      ...defaultTestAppearance,
      eyelashes: true,
      eyeColor: '#fef08a',
    }

    const compact = fishTraitPresentation({
      ...base,
      finShape: 0,
      tailShape: 0,
    })
    const rounded = fishTraitPresentation({
      ...base,
      finShape: 1,
      tailShape: 1,
    })
    const forked = fishTraitPresentation({
      ...base,
      finShape: 2,
      tailShape: 2,
    })

    expect(new Set([compact.fin.kind, rounded.fin.kind, forked.fin.kind])).toEqual(
      new Set(['triangle', 'rounded', 'ribbon']),
    )
    expect(
      new Set([compact.tail.kind, rounded.tail.kind, forked.tail.kind]),
    ).toEqual(new Set(['triangle', 'fan', 'forked']))
    expect(compact.eyelashes).toHaveLength(3)
  })

  it('omits eyelash geometry when the trait is disabled', () => {
    expect(fishTraitPresentation(defaultTestAppearance).eyelashes).toEqual([])
  })
})

describe('waterBackdropPresentation', () => {
  it('describes the aquarium water layer captured by WebGL thumbnails', () => {
    expect(waterBackdropPresentation(800, 500)).toMatchObject({
      width: 800,
      height: 500,
      topColor: '#0c4a6e',
      middleColor: '#075985',
      bottomColor: '#164e63',
      gridSize: 48,
    })
  })
})
