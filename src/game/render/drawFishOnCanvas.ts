import { FISH_HALF, FISH_SPRITE_H, FISH_SPRITE_W } from '../constants'
import { healthFace } from '../healthFace'
import type { DeadFish, Fish } from '../types'
import type { FishSpriteAtlas } from './fishSprites'

const NAME_FONT = '600 11px system-ui, "Segoe UI", sans-serif'
const FACE_FONT = '14px system-ui, sans-serif'

/** Logarithmic visual scale from weight (100 g baseline). */
export function logWeightScale(weightG: number): number {
  const t = Math.log10(Math.max(40, weightG) / 100)
  return Math.min(1.45, Math.max(0.68, 1 + t * 0.42))
}

/** Anchor = center of legacy 10×10 hit box (same as fillRect origin + FISH_HALF). */
function anchor(fish: Fish | DeadFish): { x: number; y: number } {
  return {
    x: fish.physics.position.x + FISH_HALF,
    y: fish.physics.position.y + FISH_HALF,
  }
}

function drawCarnivoreTeeth(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = 'rgba(254, 249, 195, 0.95)'
  ctx.beginPath()
  ctx.moveTo(14, 3)
  ctx.lineTo(18, 8)
  ctx.lineTo(10, 8)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(14, -3)
  ctx.lineTo(18, -8)
  ctx.lineTo(10, -8)
  ctx.closePath()
  ctx.fill()
}

function drawEyelashes(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.55)'
  ctx.lineWidth = 1.1
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath()
    ctx.moveTo(-6 + i * 5, -10)
    ctx.quadraticCurveTo(-4 + i * 5, -14, -2 + i * 5, -11)
    ctx.stroke()
  }
}

function drawEyeTint(ctx: CanvasRenderingContext2D, color: string): void {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(6, -2, 2.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(15, 23, 42, 0.35)'
  ctx.beginPath()
  ctx.arc(6.4, -2.4, 0.9, 0, Math.PI * 2)
  ctx.fill()
}

function drawTailVariant(ctx: CanvasRenderingContext2D, tailShape: 0 | 1 | 2): void {
  ctx.fillStyle = 'rgba(30, 58, 138, 0.35)'
  ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)'
  ctx.lineWidth = 1
  if (tailShape === 0) {
    ctx.beginPath()
    ctx.moveTo(-22, 0)
    ctx.lineTo(-38, -6)
    ctx.lineTo(-36, 6)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  } else if (tailShape === 1) {
    ctx.beginPath()
    ctx.moveTo(-20, 0)
    ctx.quadraticCurveTo(-34, -10, -40, 0)
    ctx.quadraticCurveTo(-34, 10, -20, 0)
    ctx.fill()
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.moveTo(-18, 0)
    ctx.lineTo(-36, -3)
    ctx.lineTo(-34, 0)
    ctx.lineTo(-36, 3)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
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
  const { appearance } = fish
  const wScale = logWeightScale(fish.weightG) * appearance.finScale
  const finSkew = appearance.finShape * 0.04

  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'

  const nameY = ay - (FISH_SPRITE_H * wScale) / 2 - 18
  ctx.font = NAME_FONT
  ctx.fillStyle = 'rgba(241, 245, 249, 0.95)'
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.55)'
  ctx.lineWidth = 3
  ctx.strokeText(fish.name, ax, nameY)
  ctx.fillText(fish.name, ax, nameY)

  const faceY = ay - (FISH_SPRITE_H * wScale) / 2 - 2
  ctx.font = FACE_FONT
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.4)'
  ctx.lineWidth = 2
  const face = healthFace(fish.health)
  ctx.strokeText(face, ax, faceY)
  ctx.fillText(face, ax, faceY)

  const facingLeft = fish.physics.velocity.x < 0
  ctx.translate(ax, ay)
  if (facingLeft) ctx.scale(-1, 1)
  ctx.scale(wScale, wScale)
  ctx.transform(1, finSkew, 0, 1, 0, 0)

  drawTailVariant(ctx, appearance.tailShape)

  ctx.drawImage(
    img,
    -FISH_SPRITE_W / 2,
    -FISH_SPRITE_H / 2,
    FISH_SPRITE_W,
    FISH_SPRITE_H,
  )

  drawEyeTint(ctx, appearance.eyeColor)
  if (appearance.eyelashes) drawEyelashes(ctx)
  if (fish.species === 'carnivore') drawCarnivoreTeeth(ctx)

  ctx.restore()
}

export function drawDeadFishOnCanvas(
  ctx: CanvasRenderingContext2D,
  fish: DeadFish,
  atlas: FishSpriteAtlas,
): void {
  const { x: ax, y: ay } = anchor(fish)
  const img = atlas.dead
  const wScale = logWeightScale(fish.weightG) * fish.appearance.finScale

  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.globalAlpha = 0.72

  const nameY = ay - (FISH_SPRITE_H * wScale) / 2 - 14
  ctx.font = NAME_FONT
  ctx.fillStyle = 'rgba(148, 163, 184, 0.9)'
  ctx.fillText(fish.name, ax, nameY)

  ctx.translate(ax, ay)
  ctx.scale(wScale, wScale)
  ctx.drawImage(
    img,
    -FISH_SPRITE_W / 2,
    -FISH_SPRITE_H / 2,
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
  const s = logWeightScale(fish.weightG) * fish.appearance.finScale
  const r = FISH_HALF * s * 2
  ctx.fillStyle = fish.species === 'normal' ? '#2563eb' : '#dc2626'
  ctx.fillRect(ax - r / 2, ay - r / 2, r, r)
}

export function drawDeadFishPlaceholder(
  ctx: CanvasRenderingContext2D,
  fish: DeadFish,
): void {
  const { x: ax, y: ay } = anchor(fish)
  const s = logWeightScale(fish.weightG) * fish.appearance.finScale
  const r = FISH_HALF * s * 2
  ctx.fillStyle = '#6b7280'
  ctx.fillRect(ax - r / 2, ay - r / 2, r, r)
}
