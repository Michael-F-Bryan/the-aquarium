import type { FishAppearance } from '../types'

export type FishSpriteKey = 'normal' | 'carnivore' | 'dead'

export const FISH_SPRITE_PATH: Record<FishSpriteKey, string> = {
  normal: '/sprites/fish-normal.svg',
  carnivore: '/sprites/fish-carnivore.svg',
  dead: '/sprites/fish-dead.svg',
}

export type FishFinPresentation = {
  readonly kind: 'triangle' | 'rounded' | 'ribbon'
  readonly color: string
}

export type FishTailPresentation = {
  readonly kind: 'triangle' | 'fan' | 'forked'
  readonly color: string
}

export type FishEyelashPresentation = {
  readonly position: readonly [number, number, number]
  readonly rotation: number
  readonly size: readonly [number, number]
}

export type FishTraitPresentation = {
  readonly fin: FishFinPresentation
  readonly tail: FishTailPresentation
  readonly eyelashes: readonly FishEyelashPresentation[]
}

export type WaterBackdropPresentation = {
  readonly width: number
  readonly height: number
  readonly topColor: string
  readonly middleColor: string
  readonly bottomColor: string
  readonly gridColor: string
  readonly gridSize: number
}

/** Logarithmic visual scale from weight (100 g baseline). */
export function logWeightScale(weightG: number): number {
  const t = Math.log10(Math.max(40, weightG) / 100)
  return Math.min(1.45, Math.max(0.68, 1 + t * 0.42))
}

export function fishTraitPresentation(
  appearance: FishAppearance,
): FishTraitPresentation {
  return {
    fin: {
      kind: ['triangle', 'rounded', 'ribbon'][appearance.finShape] as
        | 'triangle'
        | 'rounded'
        | 'ribbon',
      color: '#7dd3fc',
    },
    tail: {
      kind: ['triangle', 'fan', 'forked'][appearance.tailShape] as
        | 'triangle'
        | 'fan'
        | 'forked',
      color: '#38bdf8',
    },
    eyelashes: appearance.eyelashes
      ? [
          { position: [8.2, 4.1, 0.35], rotation: -0.62, size: [0.7, 4.8] },
          { position: [10.2, 4.6, 0.35], rotation: -0.18, size: [0.7, 5.2] },
          { position: [12.2, 4.1, 0.35], rotation: 0.3, size: [0.7, 4.8] },
        ]
      : [],
  }
}

export function waterBackdropPresentation(
  width: number,
  height: number,
): WaterBackdropPresentation {
  return {
    width,
    height,
    topColor: '#0c4a6e',
    middleColor: '#075985',
    bottomColor: '#164e63',
    gridColor: 'rgba(148, 163, 184, 0.12)',
    gridSize: 48,
  }
}
