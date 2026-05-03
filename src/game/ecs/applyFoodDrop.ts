import type { Food } from '../types'
import type { Params } from '../params'
import { foodDtoFromEntity, foodEntityFromDto } from './entityAssembly'
import type { FoodEntity } from './components'
import type { AquariumRuntime } from './world'
import { dist } from '../vec2'

const FOOD_MARGIN = 8

export type DropFlakeOnRuntimeResult = {
  readonly applied: boolean
  readonly target?: {
    readonly x: number
    readonly y: number
  }
}

function tooCloseToExisting(
  x: number,
  y: number,
  runtime: AquariumRuntime,
  minFoodSeparation: number,
): boolean {
  for (const entity of runtime.world.with('foodIdentity', 'foodPhysics').entities) {
    const piece = foodDtoFromEntity(entity as FoodEntity)
    if (dist({ x, y }, piece.physics.position) < minFoodSeparation) {
      return true
    }
  }
  return false
}

/** Player click: drop a new flake at logical canvas coordinates (mutates `runtime`). */
export function dropFlakeFoodOnRuntime(
  runtime: AquariumRuntime,
  params: Params,
  x: number,
  y: number,
): DropFlakeOnRuntimeResult {
  const px = Math.min(
    params.aquariumWidth - FOOD_MARGIN,
    Math.max(FOOD_MARGIN, x),
  )
  const py = Math.min(
    params.aquariumHeight - FOOD_MARGIN,
    Math.max(FOOD_MARGIN, y),
  )
  if (tooCloseToExisting(px, py, runtime, params.minFoodSeparation)) {
    return { applied: false }
  }
  const sim = runtime.simulationEntity.simulation
  const id = `food-${sim.nextEntityId}`
  sim.nextEntityId += 1
  const food: Food = {
    id,
    createdOnDay: sim.currentDay,
    physics: {
      position: { x: px, y: py },
      velocity: { x: 0, y: 0 },
    },
  }
  runtime.world.add(foodEntityFromDto(food))
  return {
    applied: true,
    target: { x: px, y: py },
  }
}
