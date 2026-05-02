export type Vec2 = { x: number; y: number }

export function vecLen(v: Vec2): number {
  return Math.hypot(v.x, v.y)
}

export function vecNorm(v: Vec2): Vec2 {
  const len = vecLen(v)
  if (len < 1e-8) return { x: 0, y: 0 }
  return { x: v.x / len, y: v.y / len }
}

export function vecAdd(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y }
}

export function vecScale(v: Vec2, s: number): Vec2 {
  return { x: v.x * s, y: v.y * s }
}

export function vecSub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y }
}

export function dist(a: Vec2, b: Vec2): number {
  return vecLen(vecSub(b, a))
}

export function clampToRect(
  p: Vec2,
  margin: number,
  width: number,
  height: number,
): Vec2 {
  return {
    x: Math.min(width - margin, Math.max(margin, p.x)),
    y: Math.min(height - margin, Math.max(margin, p.y)),
  }
}
