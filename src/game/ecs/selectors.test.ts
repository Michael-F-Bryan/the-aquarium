import { describe, expect, it } from 'vitest'
import type { FishEntity, FoodEntity } from './components'
import { makeTestFish, minimalGameSnapshotPayload, testParams } from '../test/fixtures'
import { hydrateAquariumRuntimeFromPayload } from './world'
import { selectGameSnapshotPayload } from './selectors'

describe('ECS selectors', () => {
  it('projects live world entities back to GameSnapshotPayload', () => {
    const fish = makeTestFish({ id: 'fish-a', health: 3 })
    const snapshot = minimalGameSnapshotPayload({
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

    const runtime = hydrateAquariumRuntimeFromPayload(snapshot, testParams(), 0)
    const fishEntity = runtime.world
      .with(
        'tagLive',
        'fishIdentity',
        'fishBody',
        'fishMetabolism',
        'fishAppearance',
        'fishPhysics',
      )
      .first as FishEntity | undefined
    const foodEntity = runtime.world.with('foodIdentity', 'foodPhysics')
      .first as FoodEntity | undefined

    expect(fishEntity).toBeDefined()
    expect(foodEntity).toBeDefined()

    fishEntity!.fishBody.health = 2
    runtime.world.remove(foodEntity!)

    const projected = selectGameSnapshotPayload(runtime)
    expect(projected.liveFish).toEqual([{ ...fish, health: 2 }])
    expect(projected.food).toEqual([])
  })
})
