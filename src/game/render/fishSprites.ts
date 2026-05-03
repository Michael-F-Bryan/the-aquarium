export type FishSpriteKey = 'normal' | 'carnivore' | 'dead'

const SPRITE_PATH: Record<FishSpriteKey, string> = {
  normal: '/sprites/fish-normal.svg',
  carnivore: '/sprites/fish-carnivore.svg',
  dead: '/sprites/fish-dead.svg',
}

export type FishSpriteAtlas = Record<FishSpriteKey, HTMLImageElement>

/** Load aquarium fish SVGs once; rejects if any asset fails. */
export function loadFishSprites(): Promise<FishSpriteAtlas> {
  const entries = Object.entries(SPRITE_PATH) as [FishSpriteKey, string][]
  return Promise.all(
    entries.map(
      ([key, src]) =>
        new Promise<[FishSpriteKey, HTMLImageElement]>((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve([key, img])
          img.onerror = () =>
            reject(new Error(`Failed to load fish sprite: ${src}`))
          img.src = src
        }),
    ),
  ).then((pairs) => {
    const atlas = {} as FishSpriteAtlas
    for (const [k, img] of pairs) atlas[k] = img
    return atlas
  })
}
