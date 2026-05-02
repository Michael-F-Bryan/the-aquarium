/** Mulberry32: fast, decent quality, easy to snapshot via state.rngState. */
export function rngNext01(rngState: number): { value: number; rngState: number } {
  let t = (rngState + 0x6d2b79f5) | 0
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  const u = (t ^ (t >>> 14)) >>> 0
  return { value: u / 4294967296, rngState: t }
}
