export type Params = {
  dayLengthMs: number
  foodLifetimeDays: number
  reproduceChanceCap: number
  carnivoreMutationChance: number
  deadFishLingerDays: number
  aquariumWidth: number
  aquariumHeight: number
}

export const defaultParams: Params = {
  dayLengthMs: 6_500,
  foodLifetimeDays: 0.5,
  reproduceChanceCap: 0.25,
  carnivoreMutationChance: 0.01,
  deadFishLingerDays: 10,
  aquariumWidth: 800,
  aquariumHeight: 500,
}
