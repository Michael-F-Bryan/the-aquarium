import type { Params } from '../params'
import type { State } from '../types'

const FOOD_MARGIN = 8

/** Player click: drop a new flake at logical canvas coordinates. */
export function dropFlakeFood(
  state: State,
  params: Params,
  x: number,
  y: number,
): State {
  const px = Math.min(
    params.aquariumWidth - FOOD_MARGIN,
    Math.max(FOOD_MARGIN, x),
  )
  const py = Math.min(
    params.aquariumHeight - FOOD_MARGIN,
    Math.max(FOOD_MARGIN, y),
  )
  const id = `food-${state.nextEntityId}`
  return {
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
  }
}
