export type ClientRectLike = Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>

export type ClientPoint = {
  readonly clientX: number
  readonly clientY: number
}

export type AquariumPoint = {
  readonly x: number
  readonly y: number
}

export type AquariumSize = {
  readonly width: number
  readonly height: number
}

export function clientPointToAquariumPoint(
  rect: ClientRectLike,
  point: ClientPoint,
  aquariumSize: AquariumSize,
): AquariumPoint {
  const rectWidth = rect.width || 1
  const rectHeight = rect.height || 1

  return {
    x: ((point.clientX - rect.left) / rectWidth) * aquariumSize.width,
    y: ((point.clientY - rect.top) / rectHeight) * aquariumSize.height,
  }
}
