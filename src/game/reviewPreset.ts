import type { Params } from './params'

export type ReviewSessionPreset = {
  params: Params
  autoplay: {
    enabled: boolean
    intervalMs: number
  }
}

export function buildReviewSessionPreset(params: Params): ReviewSessionPreset {
  return {
    params: {
      ...params,
      dayLengthMs: 20_000,
      foodLifetimeDays: 2,
      starvationGraceDays: 5,
    },
    autoplay: {
      enabled: true,
      intervalMs: 400,
    },
  }
}
