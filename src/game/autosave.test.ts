import { describe, expect, it } from 'vitest'
import { buildAutosaveJson, parseAutosaveJson } from './autosave'
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
    if (!r.ok) expect(r.error).toContain('params.aquariumWidth')
  })
})
