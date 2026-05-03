import { rollAppearance } from './appearance'
import { pickFishName } from './data/fishNames'
import { NEVER_ATE } from './satiation'
import type { Fish, State } from './types'

function phys(x: number, y: number, vx = 0, vy = 0) {
  return {
    position: { x, y },
    velocity: { x: vx, y: vy },
  }
}

/** One baby fish; centered in the tank with randomised name and appearance. */
export function createInitialState(
  aquariumWidth: number,
  aquariumHeight: number,
): State {
  const cx = aquariumWidth / 2
  const cy = aquariumHeight / 2
  let rngState = 0x9e3779b9
  const namePick = pickFishName(rngState)
  rngState = namePick.rngState
  const app = rollAppearance(rngState)
  rngState = app.rngState

  const baby: Fish = {
    id: 'fish-0',
    name: namePick.name,
    species: 'normal',
    ageDays: 0,
    weightG: 100,
    health: 3,
    physics: phys(cx, cy, 0, 0),
    appearance: app.appearance,
    lastAte: NEVER_ATE,
  }

  return {
    currentDay: 0,
    lastClosedCalendarDayFloor: -1,
    nextEntityId: 1,
    rngState,
    score: 0,
    liveFish: [baby],
    deadFish: [],
    skeletons: [],
    food: [],
  }
}
