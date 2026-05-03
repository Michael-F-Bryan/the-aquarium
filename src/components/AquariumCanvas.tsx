import { useEffect, useRef, useState } from 'react'
import type { State } from '../game/types'
import {
  drawDeadFishOnCanvas,
  drawDeadFishPlaceholder,
  drawLiveFishOnCanvas,
  drawLiveFishPlaceholder,
} from '../game/render/drawFishOnCanvas'
import type { FishSpriteAtlas } from '../game/render/fishSprites'
import { loadFishSprites } from '../game/render/fishSprites'

type Props = {
  state: State
  onWorldSize?: (width: number, height: number) => void
  /** Logical canvas coordinates (CSS pixels, same space as fish positions). */
  onDropFood?: (x: number, y: number) => void
}

/** Aquarium canvas: water, food, fish (live + dead) with SVG fish sprites. */
export function AquariumCanvas({ state, onWorldSize, onDropFood }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fishSprites, setFishSprites] = useState<FishSpriteAtlas | null>(null)

  useEffect(() => {
    let cancelled = false
    loadFishSprites()
      .then((atlas) => {
        if (!cancelled) setFishSprites(atlas)
      })
      .catch((err) => {
        console.error(err)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const paint = () => {
      const dpr = window.devicePixelRatio ?? 1
      const w = parent.clientWidth
      const h = parent.clientHeight
      onWorldSize?.(w, h)
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`

      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, '#0c4a6e')
      g.addColorStop(0.45, '#075985')
      g.addColorStop(1, '#164e63')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)'
      ctx.lineWidth = 1
      const step = 48
      for (let x = 0; x < w; x += step) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }

      render(ctx, state, fishSprites)
    }

    paint()
    const ro = new ResizeObserver(paint)
    ro.observe(parent)
    return () => ro.disconnect()
  }, [state, onWorldSize, fishSprites])

  return (
    <canvas
      ref={canvasRef}
      role="img"
      tabIndex={0}
      className="block h-full w-full cursor-crosshair touch-none outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60"
      aria-label="Aquarium — click to drop fish food"
      onClick={(e) => {
        if (!onDropFood) return
        const canvas = canvasRef.current
        if (!canvas) return
        const r = canvas.getBoundingClientRect()
        const scaleX = canvas.clientWidth / r.width || 1
        const scaleY = canvas.clientHeight / r.height || 1
        const x = (e.clientX - r.left) * scaleX
        const y = (e.clientY - r.top) * scaleY
        onDropFood(x, y)
      }}
    />
  )
}

const FOOD_RADIUS = 5

function render(
  ctx: CanvasRenderingContext2D,
  state: State,
  atlas: FishSpriteAtlas | null,
) {
  const { food, liveFish, deadFish } = state

  food.forEach((piece) => {
    const { x, y } = piece.physics.position
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(0.35)

    ctx.beginPath()
    ctx.ellipse(0, 0, FOOD_RADIUS * 1.1, FOOD_RADIUS * 0.75, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#b45309'
    ctx.fill()
    ctx.strokeStyle = 'rgba(254, 243, 199, 0.45)'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(-1.5, -1, 1.2, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(253, 230, 138, 0.7)'
    ctx.fill()

    ctx.restore()
  })

  deadFish.forEach((fish) => {
    if (atlas) drawDeadFishOnCanvas(ctx, fish, atlas)
    else drawDeadFishPlaceholder(ctx, fish)
  })

  liveFish.forEach((fish) => {
    if (atlas) drawLiveFishOnCanvas(ctx, fish, atlas)
    else drawLiveFishPlaceholder(ctx, fish)
  })
}
