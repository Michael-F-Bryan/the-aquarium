import { NEVER_ATE } from './satiation'
import type { Fish, State } from './types'

function phys(x: number, y: number, vx = 0, vy = 0) {
  return {
    position: { x, y },
    velocity: { x: vx, y: vy },
  }
}

/** One baby normal fish per README; centered in the tank. */
export function createInitialState(
  aquariumWidth: number,
  aquariumHeight: number,
): State {
  const cx = aquariumWidth / 2
  const cy = aquariumHeight / 2
  const baby: Fish = {
    id: 'fish-0',
    name: 'Fin',
    species: 'normal',
    ageDays: 0,
    weightG: 100,
    health: 3,
    physics: phys(cx, cy, 0, 0),
    lastAte: NEVER_ATE,
  }

  return {
    currentDay: 0,
    lastClosedCalendarDayFloor: -1,
    nextEntityId: 1,
    rngState: 0x9e3779b9,
    score: 0,
    liveFish: [baby],
    deadFish: [],
    skeletons: [],
    food: [],
  }
}
