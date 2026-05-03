import { NEVER_ATE } from '../satiation'
import { defaultParams, type Params } from '../params'
import type { Fish, State } from '../types'

export const testParams = (over: Partial<Params> = {}): Params => ({
  ...defaultParams,
  aquariumWidth: 800,
  aquariumHeight: 500,
  ...over,
})

export const minimalFish = (over: Partial<Fish> = {}): Fish => ({
  id: 'fish-test',
  name: 'Test',
  species: 'normal',
  ageDays: 10,
  weightG: 100,
  health: 3,
  lastAte: NEVER_ATE,
  physics: {
    position: { x: 100, y: 100 },
    velocity: { x: 0, y: 0 },
  },
  ...over,
})

export const minimalState = (over: Partial<State> = {}): State => ({
  currentDay: 0,
  lastClosedCalendarDayFloor: -1,
  nextEntityId: 1,
  rngState: 0x9e3779b9,
  score: 0,
  liveFish: [],
  deadFish: [],
  skeletons: [],
  food: [],
  ...over,
})
