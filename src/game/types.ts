import { createInitialState } from './initial'
import type { Params } from './params'

export type FishSkeleton = {
  id: string
  preyName: string
  physics: Physics
  /** Fractional `currentDay` when the skeleton was created (predation). */
  createdOnDay: number
}

export type State = {
  /** Fractional simulated day; `Math.floor` is the calendar day index in flight. */
  currentDay: number
  /**
   * Index of the last calendar day whose **midnight** has been processed.
   * Starts at -1 (no nights done). End-of-day for day `k` runs when
   * `floor(currentDay)` first exceeds `k + 1`.
   */
  lastClosedCalendarDayFloor: number
  nextEntityId: number
  rngState: number
  score: number
  liveFish: Fish[]
  deadFish: DeadFish[]
  /** Bones left when a carnivore eats live prey; sink and expire after two days. */
  skeletons: FishSkeleton[]
  food: Food[]
}

export type Food = {
  id: string
  physics: Physics
  /** `state.currentDay` when the flake was dropped (fractional). */
  createdOnDay: number
}

export type Species = 'normal' | 'carnivore'

export type FishGender = 'female' | 'male' | 'other'

export type FishAppearance = {
  gender: FishGender
  eyelashes: boolean
  finScale: number
  finShape: 0 | 1 | 2
  tailShape: 0 | 1 | 2
  /** CSS hex colour for the eye highlight. */
  eyeColor: string
}

export type Fish = {
  id: string
  name: string
  species: Species
  ageDays: number
  weightG: number
  health: 0 | 1 | 2 | 3
  physics: Physics
  appearance: FishAppearance
  /**
   * Fractional `currentDay` when this fish last consumed food (flake or prey).
   * Use `NEVER_ATE` (-1) if never fed.
   */
  lastAte: number
}

/** How the fish became a corpse in `deadFish` (drives presentation). */
export type FishDeathCause = 'starvation' | 'predation'

export type DeadFish = Fish & {
  diedOnDay: number
  deathCause: FishDeathCause
}

export type Physics = {
  position: {
    x: number
    y: number
  }
  velocity: {
    x: number
    y: number
  }
}

export function newGameState(params: Params): State {
  return createInitialState(params.aquariumWidth, params.aquariumHeight)
}
