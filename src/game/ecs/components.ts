import type { SimulationEvent } from '../events'
import type { Params } from '../params'
import type { State } from '../types'

export type SimulationClock = {
  readonly deltaMs: number
  readonly clampedDeltaMs: number
  readonly dayAdvance: number
}

export type SimulationComponent = SimulationClock & {
  state: State
  readonly params: Params
}

export type AquariumEntity = {
  simulation?: SimulationComponent
  events?: SimulationEvent[]
}

export type SimulationEntity = AquariumEntity & {
  simulation: SimulationComponent
  events: SimulationEvent[]
}
