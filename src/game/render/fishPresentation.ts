export type FishSpriteKey = 'normal' | 'carnivore' | 'dead'

export const FISH_SPRITE_PATH: Record<FishSpriteKey, string> = {
  normal: '/sprites/fish-normal.svg',
  carnivore: '/sprites/fish-carnivore.svg',
  dead: '/sprites/fish-dead.svg',
}

/** Logarithmic visual scale from weight (100 g baseline). */
export function logWeightScale(weightG: number): number {
  const t = Math.log10(Math.max(40, weightG) / 100)
  return Math.min(1.45, Math.max(0.68, 1 + t * 0.42))
}
