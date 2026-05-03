import { describe, expect, it } from 'vitest'
import { minimalFish, minimalState, testParams } from '../test/fixtures'
import { createAquariumRuntime } from './world'
import { selectState } from './selectors'

describe('ECS selectors', () => {
  it('projects live world entities back to State', () => {
    const fish = minimalFish({ id: 'fish-a', health: 3 })
    const state = minimalState({
      liveFish: [fish],
      food: [
        {
          id: 'food-a',
          createdOnDay: 0,
          physics: {
            position: { x: 100, y: 100 },
            velocity: { x: 0, y: 0 },
          },
        },
      ],
    })

    const runtime = createAquariumRuntime(state, testParams(), 0)
    const fishEntity = runtime.world.with('fish').first
    const foodEntity = runtime.world.with('food').first

    expect(fishEntity).toBeDefined()
    expect(foodEntity).toBeDefined()

    fishEntity!.fish.health = 2
    runtime.world.remove(foodEntity!)

    const projected = selectState(runtime)
    expect(projected.liveFish).toEqual([{ ...fish, health: 2 }])
    expect(projected.food).toEqual([])
  })
})
