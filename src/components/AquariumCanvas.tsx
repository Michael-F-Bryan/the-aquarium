import { forwardRef, useEffect, useRef, useState } from 'react'
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
  /** When true, food drops are ignored (e.g. while paused). */
  dropDisabled?: boolean
}

/** Aquarium canvas: water, food, fish (live + dead) with SVG fish sprites. */
export const AquariumCanvas = forwardRef<HTMLCanvasElement, Props>(
  function AquariumCanvas(
    { state, onWorldSize, onDropFood, dropDisabled = false },
    ref,
  ) {
    const innerRef = useRef<HTMLCanvasElement | null>(null)
    const [fishSprites, setFishSprites] = useState<FishSpriteAtlas | null>(null)

    const setRefs = (el: HTMLCanvasElement | null) => {
      innerRef.current = el
      if (typeof ref === 'function') ref(el)
      else if (ref) ref.current = el
    }

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
      const canvas = innerRef.current
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

        drawTankDecorations(ctx, w, h)
        render(ctx, state, fishSprites)
      }

      paint()
      const ro = new ResizeObserver(paint)
      ro.observe(parent)
      return () => ro.disconnect()
    }, [state, onWorldSize, fishSprites])

    return (
      <canvas
        ref={setRefs}
        role="img"
        tabIndex={0}
        className="block h-full w-full cursor-crosshair touch-none outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60"
        aria-label="Aquarium — click to drop fish food"
        onClick={(e) => {
          if (!onDropFood || dropDisabled) return
          const canvas = innerRef.current
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
  },
)

const FOOD_RADIUS = 5

function drawTankDecorations(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): void {
  const floorH = Math.max(32, h * 0.14)
  const g = ctx.createLinearGradient(0, h - floorH, 0, h)
  g.addColorStop(0, 'rgba(30, 41, 59, 0.25)')
  g.addColorStop(0.6, 'rgba(51, 65, 85, 0.55)')
  g.addColorStop(1, 'rgba(15, 23, 42, 0.85)')
  ctx.fillStyle = g
  ctx.fillRect(0, h - floorH, w, floorH)

  for (let i = 0; i < 55; i++) {
    const px = ((i * 7919) % Math.max(1, w - 8)) + 4
    const py = h - floorH + ((i * 503) % Math.max(1, floorH - 4)) + 2
    ctx.fillStyle = `rgba(148, 163, 184, ${0.06 + (i % 7) * 0.025})`
    ctx.beginPath()
    ctx.ellipse(px, py, 2 + (i % 4), 1.1, (i % 5) * 0.35, 0, Math.PI * 2)
    ctx.fill()
  }

  const rocks: { cx: number; rx: number; ry: number; rot: number }[] = [
    { cx: w * 0.14, rx: 26, ry: 14, rot: 0.2 },
    { cx: w * 0.82, rx: 34, ry: 16, rot: -0.15 },
    { cx: w * 0.48, rx: 22, ry: 11, rot: 0.05 },
  ]
  for (const r of rocks) {
    ctx.save()
    ctx.translate(r.cx, h - floorH * 0.55)
    ctx.rotate(r.rot)
    const rg = ctx.createRadialGradient(0, 0, 2, 0, 0, r.rx)
    rg.addColorStop(0, 'rgba(100, 116, 139, 0.55)')
    rg.addColorStop(1, 'rgba(51, 65, 85, 0.35)')
    ctx.fillStyle = rg
    ctx.beginPath()
    ctx.ellipse(0, 0, r.rx, r.ry, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  const baseY = h - floorH + 4
  const stems = [0.1, 0.28, 0.44, 0.58, 0.74, 0.9]
  for (const f of stems) {
    const sx = w * f
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.28)'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(sx, baseY)
    ctx.quadraticCurveTo(sx - 18, baseY - 70, sx - 4, baseY - 130)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(sx, baseY)
    ctx.quadraticCurveTo(sx + 22, baseY - 65, sx + 6, baseY - 110)
    ctx.stroke()
  }

  ctx.fillStyle = 'rgba(56, 189, 248, 0.04)'
  ctx.beginPath()
  ctx.ellipse(w * 0.2, h * 0.25, w * 0.35, h * 0.12, 0.1, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(w * 0.75, h * 0.35, w * 0.22, h * 0.09, -0.2, 0, Math.PI * 2)
  ctx.fill()
}

function drawSkeletons(ctx: CanvasRenderingContext2D, state: State): void {
  for (const sk of state.skeletons) {
    const { x, y } = sk.physics.position
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(0.15)
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.55)'
    ctx.fillStyle = 'rgba(148, 163, 184, 0.35)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(-18, 0)
    ctx.lineTo(18, 0)
    ctx.stroke()
    for (const vx of [-12, -4, 4, 12]) {
      ctx.beginPath()
      ctx.moveTo(vx, 0)
      ctx.lineTo(vx - 2, -8)
      ctx.lineTo(vx + 2, -8)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }
    ctx.font = '9px system-ui, sans-serif'
    ctx.fillStyle = 'rgba(226, 232, 240, 0.5)'
    ctx.textAlign = 'center'
    ctx.fillText(sk.preyName, 0, 12)
    ctx.restore()
  }
}

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

  drawSkeletons(ctx, state)

  deadFish.forEach((fish) => {
    if (atlas) drawDeadFishOnCanvas(ctx, fish, atlas)
    else drawDeadFishPlaceholder(ctx, fish)
  })

  liveFish.forEach((fish) => {
    if (atlas) drawLiveFishOnCanvas(ctx, fish, atlas)
    else drawLiveFishPlaceholder(ctx, fish)
  })
}
