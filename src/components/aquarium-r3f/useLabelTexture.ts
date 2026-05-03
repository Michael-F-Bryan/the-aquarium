import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'

type LabelTextureOptions = {
  readonly fillStyle: string
  readonly strokeStyle: string
  readonly font: string
  readonly lineHeight: number
  readonly paddingX: number
  readonly paddingY: number
}

export type LabelTexture = {
  readonly texture: CanvasTexture
  readonly width: number
  readonly height: number
}

const DEFAULT_OPTIONS: LabelTextureOptions = {
  fillStyle: 'rgba(241, 245, 249, 0.95)',
  strokeStyle: 'rgba(15, 23, 42, 0.65)',
  font: '600 13px system-ui, "Segoe UI", sans-serif',
  lineHeight: 17,
  paddingX: 8,
  paddingY: 5,
}

export function useLabelTexture(
  lines: readonly string[],
  options: Partial<LabelTextureOptions> = {},
): LabelTexture | null {
  const text = lines.join('\n')
  const resolved = { ...DEFAULT_OPTIONS, ...options }

  const label = useMemo(() => {
    if (typeof document === 'undefined') return null
    const textureLines = text.split('\n')

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.font = resolved.font
    const textWidth = Math.max(
      ...textureLines.map((line) => ctx.measureText(line).width),
    )
    const displayWidth = Math.ceil(textWidth + resolved.paddingX * 2)
    const displayHeight = Math.ceil(
      textureLines.length * resolved.lineHeight + resolved.paddingY * 2,
    )
    const dpr = Math.min(2, window.devicePixelRatio || 1)

    canvas.width = Math.max(1, Math.ceil(displayWidth * dpr))
    canvas.height = Math.max(1, Math.ceil(displayHeight * dpr))
    ctx.scale(dpr, dpr)
    ctx.font = resolved.font
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    textureLines.forEach((line, index) => {
      const y =
        resolved.paddingY +
        resolved.lineHeight / 2 +
        index * resolved.lineHeight
      ctx.lineWidth = 3
      ctx.strokeStyle = resolved.strokeStyle
      ctx.strokeText(line, displayWidth / 2, y)
      ctx.fillStyle = resolved.fillStyle
      ctx.fillText(line, displayWidth / 2, y)
    })

    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace
    texture.needsUpdate = true

    return {
      texture,
      width: displayWidth,
      height: displayHeight,
    }
  }, [
    text,
    resolved.fillStyle,
    resolved.font,
    resolved.lineHeight,
    resolved.paddingX,
    resolved.paddingY,
    resolved.strokeStyle,
  ])

  useEffect(() => {
    return () => {
      label?.texture.dispose()
    }
  }, [label])

  return label
}
