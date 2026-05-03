import { NEVER_ATE } from '../satiation'
import { defaultParams, type Params } from '../params'
import type { Fish, FishAppearance, GameSnapshotPayload } from '../types'

export const testParams = (over: Partial<Params> = {}): Params => ({
  ...defaultParams,
  aquariumWidth: 800,
  aquariumHeight: 500,
  ...over,
})

export const defaultTestAppearance: FishAppearance = {
  gender: 'other',
  eyelashes: false,
  finScale: 1,
  finShape: 0,
  tailShape: 0,
  eyeColor: '#38bdf8',
}

/** Fish for tests; supplies neutral appearance unless overridden. */
export function makeTestFish(over: Partial<Fish> = {}): Fish {
  const base: Fish = {
    id: 'fish-test',
    name: 'Test',
    species: 'normal',
    ageDays: 10,
    weightG: 100,
    health: 3,
    lastAte: NEVER_ATE,
    appearance: defaultTestAppearance,
    physics: {
      position: { x: 100, y: 100 },
      velocity: { x: 0, y: 0 },
    },
  }
  return {
    ...base,
    ...over,
    appearance: over.appearance ?? base.appearance,
    physics: over.physics ?? base.physics,
  }
}

export const minimalGameSnapshotPayload = (
  over: Partial<GameSnapshotPayload> = {},
): GameSnapshotPayload => ({
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

