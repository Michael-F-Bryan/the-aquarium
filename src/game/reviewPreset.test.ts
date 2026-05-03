import { describe, expect, it } from 'vitest'
import { defaultParams } from './params'
import { buildReviewSessionPreset } from './reviewPreset'

describe('buildReviewSessionPreset', () => {
  it('sets slower pacing and enables autoplay by default', () => {
    const preset = buildReviewSessionPreset(defaultParams)
    expect(preset.params.dayLengthMs).toBe(20_000)
    expect(preset.params.foodLifetimeDays).toBe(2)
    expect(preset.params.starvationGraceDays).toBe(5)
    expect(preset.autoplay.enabled).toBe(true)
    expect(preset.autoplay.intervalMs).toBe(400)
  })
})
