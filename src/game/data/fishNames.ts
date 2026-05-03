import { rngNext01 } from '../rng'

/** Placeholder until M5 name list; deterministic per RNG stream. */
export function pickFishName(rngState: number): { name: string; rngState: number } {
  const r = rngNext01(rngState)
  const n = Math.floor(r.value * 1_000_000)
  return { name: `Fish-${n}`, rngState: r.rngState }
}
