import { describe, expect, it } from 'vitest'
import { resolveFlakeEating } from '../../mechanics/flakeEat'
import { applySocialSteering } from '../../mechanics/movementSocial'
import { minimalFish, minimalState, testParams } from '../../test/fixtures'
import { selectUpdateResult } from '../selectors'
import { createAquariumRuntime } from '../world'
import { applySocialSteeringSystem, resolveFlakeEatingSystem } from './currentMechanics'

describe('ECS current mechanics systems', () => {
  it('applies social steering from a stable same-frame snapshot', () => {
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

    const legacy = applySocialSteering(state, params, 50)
    const runtime = createAquariumRuntime(state, params, 50)
    applySocialSteeringSystem.run(runtime)
    const ecs = selectUpdateResult(runtime).state

    for (const legacyFish of legacy.liveFish) {
      const ecsFish = ecs.liveFish.find((fish) => fish.id === legacyFish.id)
      expect(ecsFish).toBeDefined()
      expect(ecsFish?.physics.velocity.x).toBeCloseTo(
        legacyFish.physics.velocity.x,
      )
      expect(ecsFish?.physics.velocity.y).toBeCloseTo(
        legacyFish.physics.velocity.y,
      )
    }
  })

  it('resolves flake eating through ECS world entities and events', () => {
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

    const legacy = resolveFlakeEating(state, params)
    const runtime = createAquariumRuntime(state, params, 0)
    resolveFlakeEatingSystem.run(runtime)
    const ecs = selectUpdateResult(runtime)

    expect(ecs).toEqual(legacy)
  })
})
