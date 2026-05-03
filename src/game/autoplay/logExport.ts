import type { Params } from '../params'

export type AutoplayLogEntry = {
  atDay: number
  action: 'drop' | 'skip'
  reason: string
  targetFishId?: string
  liveFishCount: number
  foodCount: number
}

export function buildAutoplayLogJson(options: {
  createdAtIso: string
  params: Params
  entries: readonly AutoplayLogEntry[]
}): string {
  return JSON.stringify(
    {
      createdAt: options.createdAtIso,
      params: options.params,
      entries: options.entries,
    },
    null,
    2,
  )
}
