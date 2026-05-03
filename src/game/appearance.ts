import { rngNext01 } from './rng'
import type { FishAppearance, FishGender } from './types'

function pickGender(r: number): FishGender {
  if (r < 0.45) return 'female'
  if (r < 0.9) return 'male'
  return 'other'
}

/** Visual variety for fins, tail, eyes; stable given RNG stream. */
export function rollAppearance(rngState: number): {
  appearance: FishAppearance
  rngState: number
} {
  let s = rngState
  const roll = () => {
    const o = rngNext01(s)
    s = o.rngState
    return o.value
  }

  const gender = pickGender(roll())
  const eyelashes = gender === 'female' && roll() < 0.7
  const finScale = 0.88 + roll() * 0.22
  const finShape = (Math.floor(roll() * 3) % 3) as 0 | 1 | 2
  const tailShape = (Math.floor(roll() * 3) % 3) as 0 | 1 | 2
  const hues = ['#38bdf8', '#f472b6', '#facc15', '#4ade80', '#c084fc', '#fb923c', '#e2e8f0']
  const eyeColor = hues[Math.floor(roll() * hues.length) % hues.length] ?? '#e2e8f0'

  return {
    appearance: {
      gender,
      eyelashes,
      finScale,
      finShape,
      tailShape,
      eyeColor,
    },
    rngState: s,
  }
}
