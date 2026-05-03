import { describe, expect, it } from 'vitest'
import { runCalendarBoundaries } from '../mechanics/calendarDay'
import { sinkAndPruneDead } from '../mechanics/deadPhysics'
import { resolveFlakeEating } from '../mechanics/flakeEat'
import { applyFlakeSeekVelocities, integrateFishPositions } from '../mechanics/flakeSeek'
import { removeExpiredFood } from '../mechanics/foodLifetime'
import { applySocialSteering } from '../mechanics/movementSocial'
import { resolveCarnivorePredation } from '../mechanics/predation'
import { sinkAndPruneSkeletons } from '../mechanics/skeletonPhysics'
import type { SimulationEvent } from '../events'
import type { Params } from '../params'
import { minimalFish, minimalState, testParams } from '../test/fixtures'
import type { State } from '../types'
import { applySimulationCommands, type SimulationCommand } from './commands'
import type { SimulationStepResult } from './selectors'
import { runSimulationStep, simulationSchedule } from './schedule'

function runLegacyReferenceStep(input: {
  readonly state: State
  readonly params: Params
  readonly deltaMs: number
  readonly commands?: readonly SimulationCommand[]
}): SimulationStepResult {
  const clampedDeltaMs = Math.min(Math.max(input.deltaMs, 0), 250)
  const events: SimulationEvent[] = []
  let state = applySimulationCommands(input.state, input.params, input.commands)

  state = {
    ...state,
    currentDay: state.currentDay + clampedDeltaMs / input.params.dayLengthMs,
  }
  state = removeExpiredFood(state, input.params)
  state = applyFlakeSeekVelocities(state, input.params, clampedDeltaMs)
  state = applySocialSteering(state, input.params, clampedDeltaMs)
  state = integrateFishPositions(state, input.params, clampedDeltaMs)

  const flakeEating = resolveFlakeEating(state, input.params)
  state = flakeEating.state
  events.push(...flakeEating.events)

  const predation = resolveCarnivorePredation(state, input.params)
  state = predation.state
  events.push(...predation.events)

  state = sinkAndPruneSkeletons(state, input.params, clampedDeltaMs)

  const calendar = runCalendarBoundaries(state, input.params)
  state = calendar.state
  events.push(...calendar.events)

  state = sinkAndPruneDead(state, input.params, clampedDeltaMs)

  return { state, events }
}

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
    const state = minimalState({ currentDay: 3 })
    const params = testParams({ dayLengthMs: 1_000 })

    const { state: next } = runSimulationStep({
      state,
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
  })

  it('matches the legacy pipeline for command-driven flake seek, movement, expiry, and eating', () => {
    const params = testParams({
      dayLengthMs: 1_000,
      flakeSeekAcceleration: 10,
      foodLifetimeDays: 0.5,
      foodPickupRadius: 8,
      maxSpeedNormal: 100,
      socialSteerAcceleration: 0,
      wanderStrength: 0,
    })
    const state = minimalState({
      currentDay: 2.45,
      nextEntityId: 10,
      liveFish: [
        minimalFish({
          id: 'hungry',
          lastAte: -1,
          physics: {
            position: { x: 100, y: 100 },
            velocity: { x: 0, y: 0 },
          },
        }),
      ],
      food: [
        {
          id: 'stale-food',
          createdOnDay: 2.19,
          physics: {
            position: { x: 300, y: 100 },
            velocity: { x: 0, y: 0 },
          },
        },
      ],
    })
    const input = {
      state,
      params,
      deltaMs: 250,
      commands: [{ type: 'drop-food', x: 105, y: 100 }],
    } satisfies Parameters<typeof runSimulationStep>[0]

    expect(runSimulationStep(input)).toEqual(runLegacyReferenceStep(input))
  })

  it('matches the legacy pipeline for predation and skeleton pruning', () => {
    const params = testParams({
      dayLengthMs: 1_000,
      flakeSeekAcceleration: 0,
      predationWeightGainFraction: 0.25,
      skeletonLifetimeDays: 2,
      skeletonSinkSpeed: 40,
      socialSteerAcceleration: 0,
      wanderStrength: 0,
    })
    const state = minimalState({
      currentDay: 3.65,
      lastClosedCalendarDayFloor: 2,
      nextEntityId: 20,
      liveFish: [
        minimalFish({
          id: 'carnivore',
          name: 'Hunter',
          species: 'carnivore',
          weightG: 500,
          physics: {
            position: { x: 200, y: 200 },
            velocity: { x: 0, y: 0 },
          },
        }),
        minimalFish({
          id: 'prey',
          name: 'Snack',
          weightG: 100,
          physics: {
            position: { x: 204, y: 200 },
            velocity: { x: 0, y: 0 },
          },
        }),
      ],
      skeletons: [
        {
          id: 'expired-skeleton',
          preyName: 'Old',
          createdOnDay: 1.8,
          physics: {
            position: { x: 40, y: 100 },
            velocity: { x: 2, y: 2 },
          },
        },
      ],
    })
    const input = { state, params, deltaMs: 250 }

    expect(runSimulationStep(input)).toEqual(runLegacyReferenceStep(input))
  })

  it('matches the legacy pipeline for calendar reproduction, starvation death, and dead pruning', () => {
    const params = testParams({
      babySpawnJitterPx: 10,
      carnivoreMutationChance: 0,
      dayLengthMs: 100,
      deadFishLingerDays: 2,
      deadSinkSpeed: 50,
      flakeSeekAcceleration: 0,
      reproductionAgeScaleDays: 1,
      reproductionWeightThresholdG: 300,
      reproduceChanceCap: 1,
      socialSteerAcceleration: 0,
      wanderStrength: 0,
    })
    const state = minimalState({
      currentDay: 1.95,
      lastClosedCalendarDayFloor: -1,
      nextEntityId: 30,
      rngState: 0x12345678,
      liveFish: [
        minimalFish({
          id: 'breeder',
          name: 'Parent',
          ageDays: 5,
          weightG: 300,
          lastAte: 0.75,
          physics: {
            position: { x: 120, y: 100 },
            velocity: { x: 0, y: 0 },
          },
        }),
        minimalFish({
          id: 'famished',
          name: 'Famished',
          health: 1,
          lastAte: -1,
          physics: {
            position: { x: 180, y: 100 },
            velocity: { x: 0, y: 0 },
          },
        }),
      ],
      deadFish: [
        {
          ...minimalFish({
            id: 'old-dead',
            name: 'Old Dead',
            health: 0,
            physics: {
              position: { x: 220, y: 100 },
              velocity: { x: 1, y: 1 },
            },
          }),
          diedOnDay: 0,
        },
      ],
    })
    const input = { state, params, deltaMs: 10 }

    expect(runSimulationStep(input)).toEqual(runLegacyReferenceStep(input))
  })
})
