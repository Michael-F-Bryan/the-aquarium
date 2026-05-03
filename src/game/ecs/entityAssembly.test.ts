import { describe, expect, it } from 'vitest'
import { deadFishEntityFromDto, liveFishEntityFromDto } from './entityAssembly'
import { makeTestFish } from '../test/fixtures'

describe('entityAssembly fish tagging', () => {
  it('adds tagLive only for live fish entities', () => {
    const live = liveFishEntityFromDto(makeTestFish({ id: 'live-1' }))
    expect(live.tagLive).toBe(true)

    const deadDto = {
      ...makeTestFish({ id: 'dead-1', health: 0 }),
      diedOnDay: 3,
      deathCause: 'starvation' as const,
    }
    const dead = deadFishEntityFromDto(deadDto)
    expect('tagLive' in dead).toBe(false)
    expect(dead.deadFishMeta.deathCause).toBe('starvation')
  })
})
