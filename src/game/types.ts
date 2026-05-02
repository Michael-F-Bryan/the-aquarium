export type Species = 'normal' | 'carnivore'

export type Fish = {
  id: string
  name: string
  species: Species
  ageDays: number
  weightG: number
  health: 0 | 1 | 2 | 3
}

export type DeadFish = Fish & {
  diedOnDay: number
}

export type GameHud = {
  day: number
  /** Cumulative weight of all live fish in grams (per README score display). */
  totalWeightG: number
  /** Separate score formula from rules; stub value for UI. */
  score: number
}
