import { describe, expect, it } from 'vitest'
import { formatSimulationEvent } from './toastMessages'

describe('formatSimulationEvent', () => {
  it('formats known events', () => {
    expect(
      formatSimulationEvent({ type: 'ate_flake', fishId: '1', name: 'Jim' }),
    ).toBe('Jim ate some food')
    expect(
      formatSimulationEvent({
        type: 'prey_eaten',
        predatorId: 'a',
        predatorName: 'Bruce',
        preyId: 'b',
        preyName: 'Jim',
        weightGainG: 10,
      }),
    ).toBe('Bruce ate Jim')
    expect(
      formatSimulationEvent({
        type: 'fish_born',
        fishId: 'c',
        name: 'Bobby',
        species: 'normal',
      }),
    ).toBe('Bobby was born')
    expect(
      formatSimulationEvent({
        type: 'fish_died',
        fishId: 'd',
        name: 'Sue',
        reason: 'starvation',
      }),
    ).toBe('Sue died')
    expect(
      formatSimulationEvent({
        type: 'fish_hunger',
        fishId: 'e',
        name: 'Jane',
        level: 'starving',
      }),
    ).toBe('Jane is starving')
  })
})
