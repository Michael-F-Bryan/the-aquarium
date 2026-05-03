import { FISH_HALF } from '../../game/constants'
import type { AquariumSize } from './pointer'

export type ScenePoint = readonly [number, number, number]

export function toScenePoint(
  point: { readonly x: number; readonly y: number },
  aquariumSize: AquariumSize,
  z = 0,
): ScenePoint {
  return [
    point.x - aquariumSize.width / 2,
    aquariumSize.height / 2 - point.y,
    z,
  ]
}

export function fishAnchorPoint(fish: {
  readonly physics: { readonly position: { readonly x: number; readonly y: number } }
}): { readonly x: number; readonly y: number } {
  return {
    x: fish.physics.position.x + FISH_HALF,
    y: fish.physics.position.y + FISH_HALF,
  }
}
