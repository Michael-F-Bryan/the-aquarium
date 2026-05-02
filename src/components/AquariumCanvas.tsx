import { useEffect, useRef } from 'react'

/**
 * Aquarium: full-size canvas (per README). Stub draws water only;
 * fish sprites and names belong here once the sim is wired up.
 */
export function AquariumCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const paint = () => {
      const dpr = window.devicePixelRatio ?? 1
      const w = parent.clientWidth
      const h = parent.clientHeight
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

      ctx.fillStyle = 'rgba(148, 163, 184, 0.35)'
      ctx.font = '13px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Aquarium canvas (stub)', w / 2, h / 2)
    }

    paint()
    const ro = new ResizeObserver(paint)
    ro.observe(parent)
    return () => ro.disconnect()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="block h-full w-full touch-none"
      aria-label="Aquarium"
    />
  )
}
