import { describe, expect, it } from 'vitest'
import {
  GAME_SNAPSHOT_SCHEMA_VERSION,
  parseGameSnapshot,
  serializeGameSnapshot,
} from './snapshot'
import { makeTestFish, minimalGameSnapshotPayload } from './test/fixtures'

describe('parseGameSnapshot', () => {
  it('round-trips valid state', () => {
    const state = minimalGameSnapshotPayload({
      currentDay: 1.5,
      liveFish: [makeTestFish({ id: 'fish-0', name: 'Fin' })],
    })
    const json = JSON.parse(serializeGameSnapshot(state)) as unknown
    const r = parseGameSnapshot(json)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.payload).toEqual(state)
  })

  it('rejects wrong schemaVersion', () => {
    const r = parseGameSnapshot({
      schemaVersion: 999,
      state: minimalGameSnapshotPayload(),
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toContain('Unsupported')
  })

  it('rejects malformed state', () => {
    const r = parseGameSnapshot({
      schemaVersion: GAME_SNAPSHOT_SCHEMA_VERSION,
      state: { bogus: true },
    })
    expect(r.ok).toBe(false)
  })

  it('rejects non-boolean appearance eyelashes', () => {
    const state = minimalGameSnapshotPayload({
      liveFish: [makeTestFish({ id: 'fish-0', name: 'Fin' })],
    })
    const json = JSON.parse(serializeGameSnapshot(state)) as {
      state: {
        liveFish: Array<{ appearance: { eyelashes: unknown } }>
      }
    }
    json.state.liveFish[0].appearance.eyelashes = 'yes'

    const r = parseGameSnapshot(json)

    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toContain('eyelashes')
  })

  it('rejects non-object root', () => {
    expect(parseGameSnapshot(null).ok).toBe(false)
  })
})
