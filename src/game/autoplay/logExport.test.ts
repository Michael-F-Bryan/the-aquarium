import { describe, expect, it } from 'vitest'
import { defaultParams } from '../params'
import { buildAutoplayLogJson, type AutoplayLogEntry } from './logExport'

describe('buildAutoplayLogJson', () => {
  it('serializes entries with params and timestamp', () => {
    const entries: AutoplayLogEntry[] = [
      {
        atDay: 2.1,
        action: 'drop',
        reason: 'policy-drop',
        targetFishId: 'fish-2',
        liveFishCount: 4,
        foodCount: 1,
      },
    ]
    const json = buildAutoplayLogJson({
      createdAtIso: '2026-05-03T00:00:00.000Z',
      params: defaultParams,
      entries,
    })
    const parsed = JSON.parse(json) as {
      createdAt: string
      params: { dayLengthMs: number }
      entries: { targetFishId?: string }[]
    }
    expect(parsed.createdAt).toBe('2026-05-03T00:00:00.000Z')
    expect(parsed.params.dayLengthMs).toBe(defaultParams.dayLengthMs)
    expect(parsed.entries).toHaveLength(1)
    expect(parsed.entries[0].targetFishId).toBe('fish-2')
  })
})
