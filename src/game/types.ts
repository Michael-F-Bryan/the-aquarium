import { createInitialState } from './initial'
import type { Params } from './params'

export type State = {
  /** Fractional simulated day; `Math.floor` is the calendar day index in flight. */
  currentDay: number
  /**
   * Greatest calendar day floor for which end-of-day rules have run.
   * Starts at -1 so day 0 is open until `currentDay` reaches 1.
   */
  lastClosedCalendarDayFloor: number
  nextEntityId: number
  rngState: number
  score: number
  liveFish: Fish[]
  deadFish: DeadFish[]
  food: Food[]
}

export type Food = {
  id: string
  physics: Physics
  /** `state.currentDay` when the flake was dropped (fractional). */
  createdOnDay: number
}

export type Species = 'normal' | 'carnivore'

export type Fish = {
  id: string
  name: string
  species: Species
  ageDays: number
  weightG: number
  health: 0 | 1 | 2 | 3
  physics: Physics
  ateFlakeToday: boolean
  /** Carnivores must eat at least one smaller live fish per calendar day. */
  atePreyFishToday: boolean
}

export type DeadFish = Fish & {
  diedOnDay: number
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
