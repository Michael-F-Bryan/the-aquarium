import { describe, expect, it } from 'vitest'
import { minimalGameSnapshotPayload, testParams } from '../test/fixtures'
import { runSimulationStep, simulationSchedule } from './schedule'
import { hydrateAquariumRuntimeFromPayload } from './world'

describe('simulationSchedule', () => {
  it('documents the deterministic runtime order', () => {
    expect(simulationSchedule.map((system) => system.id)).toEqual([
      'advance-clock',
      'remove-expired-food',
      'apply-flake-seek-velocities',
      'apply-social-steering',
      'integrate-fish-positions',
      'resolve-flake-eating',
      'resolve-carnivore-predation',
      'sink-and-prune-skeletons',
      'run-calendar-boundaries',
      'sink-and-prune-dead-fish',
    ])
  })

  it('applies commands before scheduled systems', () => {
    const snapshot = minimalGameSnapshotPayload({ currentDay: 3 })
    const params = testParams({ dayLengthMs: 1_000 })
    const runtime = hydrateAquariumRuntimeFromPayload(snapshot, params, 100)

    const { readModel: next } = runSimulationStep({
      runtime,
      params,
      deltaMs: 100,
      commands: [{ type: 'drop-food', x: 20, y: 30 }],
    })

    expect(next.currentDay).toBeCloseTo(3.1)
    expect(next.food).toMatchObject([
      {
        id: 'food-1',
        createdOnDay: 3,
        physics: {
          position: { x: 20, y: 30 },
          velocity: { x: 0, y: 0 },
        },
      },
    ])

    const runtime2 = hydrateAquariumRuntimeFromPayload(snapshot, params, 100)
    expect(
      runSimulationStep({
        runtime: runtime2,
        params,
        deltaMs: 100,
        commands: [{ type: 'drop-food', x: 20, y: 30 }],
      }).commandResults,
    ).toEqual([
      {
        command: { type: 'drop-food', x: 20, y: 30 },
        applied: true,
        reason: 'dropped',
        target: { x: 20, y: 30 },
      },
    ])
  })
})
