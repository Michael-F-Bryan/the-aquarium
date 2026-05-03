import { World } from 'miniplex'
import type { Params } from '../params'
import type { State } from '../types'
import type { AquariumEntity, SimulationEntity } from './components'

export type AquariumWorld = World<AquariumEntity>

export type AquariumRegistries = ReturnType<typeof createRegistries>

export type AquariumRuntime = {
  readonly world: AquariumWorld
  readonly registries: AquariumRegistries
  readonly simulationEntity: SimulationEntity
}

function createRegistries(world: AquariumWorld) {
  return {
    simulations: world.with('simulation', 'events'),
    liveFish: world.with('liveFish', 'fish', 'physics'),
    deadFish: world.with('deadFish', 'fish', 'physics'),
    food: world.with('food', 'physics'),
    skeletons: world.with('skeleton', 'physics'),
  }
}

export function createAquariumRuntime(
  state: State,
  params: Params,
  deltaMs: number,
): AquariumRuntime {
  const clampedDeltaMs = Math.min(Math.max(deltaMs, 0), 250)
  const world = new World<AquariumEntity>()
  const simulationEntity = world.add({
    simulation: {
      state,
      params,
      deltaMs,
      clampedDeltaMs,
      dayAdvance: clampedDeltaMs / params.dayLengthMs,
    },
    events: [],
  }) as SimulationEntity

  for (const fish of state.liveFish) {
    world.add({ liveFish: true, fish, physics: fish.physics })
  }
  for (const fish of state.deadFish) {
    world.add({ deadFish: true, fish, physics: fish.physics })
  }
  for (const food of state.food) {
    world.add({ food, physics: food.physics })
  }
  for (const skeleton of state.skeletons) {
    world.add({ skeleton, physics: skeleton.physics })
  }

  return {
    world,
    registries: createRegistries(world),
    simulationEntity,
  }
}
