import { FISH_HALF, FISH_SPRITE_H, FISH_SPRITE_W } from '../constants'
import { healthFace } from '../healthFace'
import type { DeadFish, Fish } from '../types'
import type { FishSpriteAtlas } from './fishSprites'

const NAME_FONT = '600 11px system-ui, "Segoe UI", sans-serif'
const FACE_FONT = '14px system-ui, sans-serif'

/** Anchor = center of legacy 10×10 hit box (same as fillRect origin + FISH_HALF). */
function anchor(fish: Fish | DeadFish): { x: number; y: number } {
  return {
    x: fish.physics.position.x + FISH_HALF,
    y: fish.physics.position.y + FISH_HALF,
  }
}

export function drawLiveFishOnCanvas(
  ctx: CanvasRenderingContext2D,
  fish: Fish,
  atlas: FishSpriteAtlas,
): void {
  const { x: ax, y: ay } = anchor(fish)
  const key = fish.species === 'carnivore' ? 'carnivore' : 'normal'
  const img = atlas[key]

  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'

  const nameY = ay - FISH_SPRITE_H / 2 - 18
  ctx.font = NAME_FONT
  ctx.fillStyle = 'rgba(241, 245, 249, 0.95)'
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.55)'
  ctx.lineWidth = 3
  ctx.strokeText(fish.name, ax, nameY)
  ctx.fillText(fish.name, ax, nameY)

  const faceY = ay - FISH_SPRITE_H / 2 - 2
  ctx.font = FACE_FONT
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.4)'
  ctx.lineWidth = 2
  const face = healthFace(fish.health)
  ctx.strokeText(face, ax, faceY)
  ctx.fillText(face, ax, faceY)

  // Sprite art faces right; mirror when swimming left.
  const facingLeft = fish.physics.velocity.x < 0
  ctx.translate(ax, ay)
  if (facingLeft) ctx.scale(-1, 1)
  ctx.drawImage(
    img,
    -FISH_SPRITE_W / 2,
    -FISH_SPRITE_H / 2,
    FISH_SPRITE_W,
    FISH_SPRITE_H,
  )
  ctx.restore()
}

export function drawDeadFishOnCanvas(
  ctx: CanvasRenderingContext2D,
  fish: DeadFish,
  atlas: FishSpriteAtlas,
): void {
  const { x: ax, y: ay } = anchor(fish)
  const img = atlas.dead

  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.globalAlpha = 0.72

  const nameY = ay - FISH_SPRITE_H / 2 - 14
  ctx.font = NAME_FONT
  ctx.fillStyle = 'rgba(148, 163, 184, 0.9)'
  ctx.fillText(fish.name, ax, nameY)

  ctx.drawImage(
    img,
    ax - FISH_SPRITE_W / 2,
    ay - FISH_SPRITE_H / 2,
    FISH_SPRITE_W,
    FISH_SPRITE_H,
  )
  ctx.restore()
}

/** Fallback when sprites are not loaded yet. */
export function drawLiveFishPlaceholder(
  ctx: CanvasRenderingContext2D,
  fish: Fish,
): void {
  const { x: ax, y: ay } = anchor(fish)
  ctx.fillStyle = fish.species === 'normal' ? '#2563eb' : '#dc2626'
  ctx.fillRect(ax - FISH_HALF, ay - FISH_HALF, FISH_HALF * 2, FISH_HALF * 2)
}

export function drawDeadFishPlaceholder(
  ctx: CanvasRenderingContext2D,
  fish: DeadFish,
): void {
  const { x: ax, y: ay } = anchor(fish)
  ctx.fillStyle = '#6b7280'
  ctx.fillRect(ax - FISH_HALF, ay - FISH_HALF, FISH_HALF * 2, FISH_HALF * 2)
}
