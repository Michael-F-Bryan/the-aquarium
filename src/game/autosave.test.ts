import { describe, expect, it } from 'vitest'
import { buildAutosaveJson, parseAutosaveJson, readAutosaveFromStorage } from './autosave'
import { defaultParams } from './params'
import { makeTestFish, minimalGameSnapshotPayload } from './test/fixtures'

describe('autosave bundle', () => {
  it('round-trips state and params', () => {
    const snapshot = minimalGameSnapshotPayload({
      liveFish: [makeTestFish({ name: 'Zed' })],
    })
    const params = { ...defaultParams, dayLengthMs: 12345 }
    const raw = buildAutosaveJson({
      snapshot,
      params,
      thumbnailDataUrl: null,
    })
    const r = parseAutosaveJson(raw)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.snapshot.liveFish[0].name).toBe('Zed')
      expect(r.params.dayLengthMs).toBe(12345)
    }
  })

  it('rejects autosaves with non-finite runtime params', () => {
    const raw = buildAutosaveJson({
      snapshot: minimalGameSnapshotPayload(),
      params: { ...defaultParams, aquariumWidth: Number.POSITIVE_INFINITY },
      thumbnailDataUrl: null,
    })

    const r = parseAutosaveJson(raw)

    expect(r.ok).toBe(false)
    if ('error' in r) {
      expect(r.error).toContain('params.aquariumWidth')
    }
  })

  it('returns an error result when storage read throws', () => {
    const original = globalThis.localStorage
    const throwingStorage = {
      getItem: () => {
        throw new Error('denied')
      },
    } as unknown as Storage
    ;(globalThis as { localStorage?: Storage }).localStorage = throwingStorage
    try {
      const r = readAutosaveFromStorage()
      expect(r).toEqual({ ok: false, error: 'localStorage unavailable' })
    } finally {
      ;(globalThis as { localStorage?: Storage }).localStorage = original
    }
  })
})
