import { describe, expect, it } from 'vitest'
import { minimalFish, minimalState, testParams } from '../../test/fixtures'
import { selectUpdateResult } from '../selectors'
import { hydrateAquariumRuntimeFromPayload } from '../world'
import { applySocialSteeringSystem, resolveFlakeEatingSystem } from './currentMechanics'

describe('ECS current mechanics systems', () => {
  it('applies social steering without NaN velocities', () => {
    const state = minimalState({
      currentDay: 60,
      liveFish: [
        minimalFish({
          id: 'a',
          species: 'normal',
          lastAte: 59.5,
          physics: {
            position: { x: 100, y: 100 },
            velocity: { x: 10, y: 0 },
          },
        }),
        minimalFish({
          id: 'b',
          species: 'normal',
          lastAte: 59.5,
          physics: {
            position: { x: 130, y: 100 },
            velocity: { x: 0, y: 0 },
          },
        }),
      ],
    })
    const params = testParams({
      boidAlignmentWeight: 10,
      boidCohesionWeight: 0,
      boidNeighborRadius: 100,
      boidSeparationWeight: 0,
      maxSpeedNormal: 100,
    })

    const runtime = hydrateAquariumRuntimeFromPayload(state, params, 50)
    applySocialSteeringSystem.run(runtime)
    const ecs = selectUpdateResult(runtime).readModel

    for (const fish of ecs.liveFish) {
      expect(Number.isFinite(fish.physics.velocity.x)).toBe(true)
      expect(Number.isFinite(fish.physics.velocity.y)).toBe(true)
    }
  })

  it('resolves flake eating: hungry fish near food gains health and food is removed', () => {
    const params = testParams()
    const state = minimalState({
      currentDay: 5,
      liveFish: [
        minimalFish({
          id: 'a',
          lastAte: -1,
          health: 2,
          physics: { position: { x: 50, y: 50 }, velocity: { x: 0, y: 0 } },
        }),
      ],
      food: [
        {
          id: 'food-1',
          createdOnDay: 4,
          physics: {
            position: { x: 50 + params.foodPickupRadius * 0.5, y: 50 },
            velocity: { x: 0, y: 0 },
          },
        },
      ],
    })

    const runtime = hydrateAquariumRuntimeFromPayload(state, params, 0)
    resolveFlakeEatingSystem.run(runtime)
    const ecs = selectUpdateResult(runtime)

    expect(ecs.readModel.liveFish[0]?.health).toBe(3)
    expect(ecs.readModel.food).toHaveLength(0)
    expect(ecs.events.some((e) => e.type === 'ate_flake' && e.fishId === 'a')).toBe(true)
  })
})
