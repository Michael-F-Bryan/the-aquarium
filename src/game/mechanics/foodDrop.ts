import type { Params } from '../params'
import type { State } from '../types'
import { dist } from '../vec2'

const FOOD_MARGIN = 8

export type DropFlakeFoodResult = {
  readonly state: State
  readonly applied: boolean
  readonly target?: {
    readonly x: number
    readonly y: number
  }
}

function tooCloseToExisting(
  x: number,
  y: number,
  food: State['food'],
  minFoodSeparation: number,
): boolean {
  for (const piece of food) {
    if (dist({ x, y }, piece.physics.position) < minFoodSeparation) {
      return true
    }
  }
  return false
}

/** Player click: drop a new flake at logical canvas coordinates. */
export function dropFlakeFoodWithResult(
  state: State,
  params: Params,
  x: number,
  y: number,
): DropFlakeFoodResult {
  const px = Math.min(
    params.aquariumWidth - FOOD_MARGIN,
    Math.max(FOOD_MARGIN, x),
  )
  const py = Math.min(
    params.aquariumHeight - FOOD_MARGIN,
    Math.max(FOOD_MARGIN, y),
  )
  if (tooCloseToExisting(px, py, state.food, params.minFoodSeparation)) {
    return { state, applied: false }
  }
  const id = `food-${state.nextEntityId}`
  return {
    applied: true,
    target: { x: px, y: py },
    state: {
      ...state,
      nextEntityId: state.nextEntityId + 1,
      food: [
        ...state.food,
        {
          id,
          createdOnDay: state.currentDay,
          physics: {
            position: { x: px, y: py },
            velocity: { x: 0, y: 0 },
          },
        },
      ],
    },
  }
}

/** Player click: drop a new flake at logical canvas coordinates. */
export function dropFlakeFood(
  state: State,
  params: Params,
  x: number,
  y: number,
): State {
  return dropFlakeFoodWithResult(state, params, x, y).state
}
