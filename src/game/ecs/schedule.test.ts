import { describe, expect, it } from 'vitest'
import { simulationSchedule } from './schedule'

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
})
