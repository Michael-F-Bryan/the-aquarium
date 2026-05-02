import type { DeadFish, Fish, GameHud } from './types'

export const stubHud: GameHud = {
  day: 4,
  totalWeightG: 1_420,
  score: 18,
}

export const stubLiveFish: Fish[] = [
  {
    id: '1',
    name: 'Bubbles',
    species: 'normal',
    ageDays: 3,
    weightG: 280,
    health: 3,
  },
  {
    id: '2',
    name: 'Finn',
    species: 'normal',
    ageDays: 2,
    weightG: 220,
    health: 2,
  },
  {
    id: '3',
    name: 'Gullet',
    species: 'carnivore',
    ageDays: 5,
    weightG: 520,
    health: 3,
  },
  {
    id: '4',
    name: 'Nimbus',
    species: 'normal',
    ageDays: 1,
    weightG: 140,
    health: 1,
  },
]

export const stubDeadFish: DeadFish[] = [
  {
    id: 'd1',
    name: 'Sushi',
    species: 'normal',
    ageDays: 2,
    weightG: 180,
    health: 0,
    diedOnDay: 2,
  },
]

export type DebugParams = {
  dayLengthMs: number
  foodLifetimeDays: number
  reproduceChanceCap: number
  carnivoreMutationChance: number
  deadFishLingerDays: number
}

/** Debug panel keys — values are UI stubs until simulation exists. */
export const stubDebugParams: DebugParams = {
  dayLengthMs: 8000,
  foodLifetimeDays: 0.5,
  reproduceChanceCap: 0.25,
  carnivoreMutationChance: 0.01,
  deadFishLingerDays: 10,
}
