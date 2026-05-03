import type {
  DeadFish,
  Fish,
  FishAppearance,
  FishDeathCause,
  FishSkeleton,
  Food,
  Physics,
  Species,
} from '../types'

/** Miniplex component: stable live-fish identity. */
export type FishIdentity = {
  id: string
  name: string
  species: Species
}

/** Miniplex component: mutable body stats. */
export type FishBody = {
  ageDays: number
  weightG: number
  health: 0 | 1 | 2 | 3
}

/** Miniplex component: feeding / satiation. */
export type FishMetabolism = { lastAte: number }

export type FoodIdentity = { id: string; createdOnDay: number }

export type SkeletonIdentity = {
  id: string
  preyName: string
  createdOnDay: number
}

export type DeadFishMeta = {
  diedOnDay: number
  deathCause: FishDeathCause
}

/** Present only on live fish (excludes corpses from live-fish queries). */
export type LiveFishTag = { tagLive: true }

export function liveFishEntityFromDto(fish: Fish): LiveFishTag & {
  fishIdentity: FishIdentity
  fishBody: FishBody
  fishMetabolism: FishMetabolism
  fishAppearance: FishAppearance
  fishPhysics: Physics
} {
  return {
    tagLive: true,
    fishIdentity: { id: fish.id, name: fish.name, species: fish.species },
    fishBody: {
      ageDays: fish.ageDays,
      weightG: fish.weightG,
      health: fish.health,
    },
    fishMetabolism: { lastAte: fish.lastAte },
    fishAppearance: { ...fish.appearance },
    fishPhysics: {
      position: { ...fish.physics.position },
      velocity: { ...fish.physics.velocity },
    },
  }
}

export function deadFishEntityFromDto(d: DeadFish): ReturnType<typeof liveFishEntityFromDto> & {
  deadFishMeta: DeadFishMeta
} {
  return {
    ...liveFishEntityFromDto(d),
    deadFishMeta: { diedOnDay: d.diedOnDay, deathCause: d.deathCause },
  }
}

export function foodEntityFromDto(food: Food): {
  foodIdentity: FoodIdentity
  foodPhysics: Physics
} {
  return {
    foodIdentity: { id: food.id, createdOnDay: food.createdOnDay },
    foodPhysics: {
      position: { ...food.physics.position },
      velocity: { ...food.physics.velocity },
    },
  }
}

export function skeletonEntityFromDto(s: FishSkeleton): {
  skeletonIdentity: SkeletonIdentity
  skeletonPhysics: Physics
} {
  return {
    skeletonIdentity: {
      id: s.id,
      preyName: s.preyName,
      createdOnDay: s.createdOnDay,
    },
    skeletonPhysics: {
      position: { ...s.physics.position },
      velocity: { ...s.physics.velocity },
    },
  }
}

export function fishDtoFromLiveEntity(e: {
  fishIdentity: FishIdentity
  fishBody: FishBody
  fishMetabolism: FishMetabolism
  fishAppearance: FishAppearance
  fishPhysics: Physics
}): Fish {
  return {
    id: e.fishIdentity.id,
    name: e.fishIdentity.name,
    species: e.fishIdentity.species,
    ageDays: e.fishBody.ageDays,
    weightG: e.fishBody.weightG,
    health: e.fishBody.health,
    lastAte: e.fishMetabolism.lastAte,
    appearance: e.fishAppearance,
    physics: e.fishPhysics,
  }
}

export function deadFishDtoFromEntity(e: {
  fishIdentity: FishIdentity
  fishBody: FishBody
  fishMetabolism: FishMetabolism
  fishAppearance: FishAppearance
  fishPhysics: Physics
  deadFishMeta: DeadFishMeta
}): DeadFish {
  return {
    ...fishDtoFromLiveEntity(e),
    diedOnDay: e.deadFishMeta.diedOnDay,
    deathCause: e.deadFishMeta.deathCause,
  }
}

export function foodDtoFromEntity(e: {
  foodIdentity: FoodIdentity
  foodPhysics: Physics
}): Food {
  return {
    id: e.foodIdentity.id,
    createdOnDay: e.foodIdentity.createdOnDay,
    physics: e.foodPhysics,
  }
}

export function skeletonDtoFromEntity(e: {
  skeletonIdentity: SkeletonIdentity
  skeletonPhysics: Physics
}): FishSkeleton {
  return {
    id: e.skeletonIdentity.id,
    preyName: e.skeletonIdentity.preyName,
    createdOnDay: e.skeletonIdentity.createdOnDay,
    physics: e.skeletonPhysics,
  }
}
