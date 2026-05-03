import { rollAppearance } from '../../appearance'
import { FISH_HALF } from '../../constants'
import { pickFishName } from '../../data/fishNames'
import type { SimulationEvent } from '../../events'
import { rngNext01 } from '../../rng'
import {
  NEVER_ATE,
  ateWithinWindowBeforeCalendarClose,
  fishWantsFood,
  hungryWithinLastDay,
} from '../../satiation'
import type { DeadFish, Fish, FishAppearance, Species } from '../../types'
import { dist, vecAdd, vecNorm, vecScale, vecSub } from '../../vec2'
import type {
  DeadFishEntity,
  FishEntity,
  FishSkeletonEntity,
  FoodEntity,
} from '../components'
import { consumeRandom01, consumeRandomResult } from '../random'
import type { AquariumRuntime } from '../world'

export type SimulationSystemId =
  | 'advance-clock'
  | 'remove-expired-food'
  | 'apply-flake-seek-velocities'
  | 'apply-social-steering'
  | 'integrate-fish-positions'
  | 'resolve-flake-eating'
  | 'resolve-carnivore-predation'
  | 'sink-and-prune-skeletons'
  | 'run-calendar-boundaries'
  | 'sink-and-prune-dead-fish'

export type SimulationSystem = {
  readonly id: SimulationSystemId
  readonly run: (runtime: AquariumRuntime) => void
}

type Health = 0 | 1 | 2 | 3

function liveFishEntities(runtime: AquariumRuntime): FishEntity[] {
  return runtime.world.with('fish').entities
}

function deadFishEntities(runtime: AquariumRuntime): DeadFishEntity[] {
  return runtime.world.with('deadFish').entities
}

function snapshotFish(fish: Fish): Fish {
  return {
    ...fish,
    appearance: { ...fish.appearance },
    physics: {
      position: { ...fish.physics.position },
      velocity: { ...fish.physics.velocity },
    },
  }
}

function skeletonEntities(runtime: AquariumRuntime): FishSkeletonEntity[] {
  return runtime.world.with('skeleton').entities
}

function foodEntities(runtime: AquariumRuntime): FoodEntity[] {
  return runtime.world.with('food').entities
}

function appendEvents(
  runtime: AquariumRuntime,
  events: readonly SimulationEvent[],
): void {
  runtime.simulationEntity.events.push(...events)
}

function capSpeed(vx: number, vy: number, cap: number): { x: number; y: number } {
  const s = Math.hypot(vx, vy)
  if (s <= cap || s < 1e-6) return { x: vx, y: vy }
  const k = cap / s
  return { x: vx * k, y: vy * k }
}

function speciesSpeedCap(fish: Fish, runtime: AquariumRuntime): number {
  const { params } = runtime.simulationEntity.simulation
  return fish.species === 'carnivore'
    ? params.maxSpeedNormal * params.maxSpeedCarnivoreMultiplier
    : params.maxSpeedNormal
}

function boidsAcceleration(
  fish: Fish,
  normals: Fish[],
  runtime: AquariumRuntime,
): { x: number; y: number } {
  const { params } = runtime.simulationEntity.simulation
  let sep = { x: 0, y: 0 }
  let align = { x: 0, y: 0 }
  let cohPos = { x: 0, y: 0 }
  let n = 0
  for (const o of normals) {
    if (o.id === fish.id || o.health === 0) continue
    const d = dist(fish.physics.position, o.physics.position)
    if (d >= params.boidNeighborRadius || d < 1e-6) continue
    n += 1
    const away = vecNorm(vecSub(fish.physics.position, o.physics.position))
    sep = vecAdd(sep, vecScale(away, 1 / d))
    align = vecAdd(align, o.physics.velocity)
    cohPos = vecAdd(cohPos, o.physics.position)
  }
  if (n === 0) return { x: 0, y: 0 }
  align = vecScale(align, 1 / n)
  cohPos = vecScale(cohPos, 1 / n)
  const toCoh = vecSub(cohPos, fish.physics.position)
  const aSep = vecScale(sep, params.boidSeparationWeight)
  const aAli = vecScale(
    vecSub(align, fish.physics.velocity),
    params.boidAlignmentWeight,
  )
  const aCoh = vecScale(toCoh, params.boidCohesionWeight * 0.02)
  return vecAdd(vecAdd(aSep, aAli), aCoh)
}

function decHealth(h: Health): Health {
  if (h <= 0) return 0
  return (h - 1) as Health
}

function computeReadmeScore(live: Fish[]): number {
  let score = 0
  for (const fish of live) {
    if (fish.species === 'normal') {
      score += fish.weightG / 100
    } else {
      score += (fish.weightG / 100) * fish.ageDays
    }
  }
  return score
}

function spawnBaby(
  parent: Fish,
  id: string,
  jitterX: number,
  jitterY: number,
  species: Species,
  name: string,
  appearance: FishAppearance,
): Fish {
  return {
    id,
    name,
    species,
    ageDays: 0,
    weightG: 100,
    health: 3,
    lastAte: NEVER_ATE,
    appearance,
    physics: {
      position: {
        x: parent.physics.position.x + jitterX,
        y: parent.physics.position.y + jitterY,
      },
      velocity: { x: 0, y: 0 },
    },
  }
}

export const advanceClockSystem: SimulationSystem = {
  id: 'advance-clock',
  run(runtime) {
    const simulation = runtime.simulationEntity.simulation
    simulation.currentDay += simulation.dayAdvance
  },
}

export const removeExpiredFoodSystem: SimulationSystem = {
  id: 'remove-expired-food',
  run(runtime) {
    const { currentDay, params } = runtime.simulationEntity.simulation
    for (const entity of [...foodEntities(runtime)]) {
      if (currentDay - entity.food.createdOnDay >= params.foodLifetimeDays) {
        runtime.world.remove(entity)
      }
    }
  },
}

export const applyFlakeSeekVelocitiesSystem: SimulationSystem = {
  id: 'apply-flake-seek-velocities',
  run(runtime) {
    const { params, clampedDeltaMs, currentDay } = runtime.simulationEntity.simulation
    const dt = Math.min(clampedDeltaMs / 1000, 0.08)
    const flakes = foodEntities(runtime).map((entity) => entity.food)
    for (const entity of liveFishEntities(runtime)) {
      const fish = entity.fish
      if (fish.health === 0 || flakes.length === 0) continue
      if (!hungryWithinLastDay(currentDay, fish.lastAte, params.hungerThresholdDays)) {
        continue
      }

      let bestD = Number.POSITIVE_INFINITY
      let tx = fish.physics.position.x
      let ty = fish.physics.position.y
      for (const piece of flakes) {
        const dx = piece.physics.position.x - fish.physics.position.x
        const dy = piece.physics.position.y - fish.physics.position.y
        const d = Math.hypot(dx, dy)
        if (d < bestD) {
          bestD = d
          tx = piece.physics.position.x
          ty = piece.physics.position.y
        }
      }

      const cap = speciesSpeedCap(fish, runtime)
      const dx = tx - fish.physics.position.x
      const dy = ty - fish.physics.position.y
      const len = Math.hypot(dx, dy) || 1
      const desired = { x: (dx / len) * cap, y: (dy / len) * cap }
      const vx =
        fish.physics.velocity.x +
        (desired.x - fish.physics.velocity.x) *
          Math.min(1, params.flakeSeekAcceleration * dt)
      const vy =
        fish.physics.velocity.y +
        (desired.y - fish.physics.velocity.y) *
          Math.min(1, params.flakeSeekAcceleration * dt)
      const speed = Math.hypot(vx, vy)
      const scale = speed > cap && speed > 1e-6 ? cap / speed : 1
      fish.physics.velocity = { x: vx * scale, y: vy * scale }
    }
  },
}

export const applySocialSteeringSystem: SimulationSystem = {
  id: 'apply-social-steering',
  run(runtime) {
    const { params, clampedDeltaMs, currentDay } = runtime.simulationEntity.simulation
    const dt = Math.min(clampedDeltaMs / 1000, 0.08)
    const entities = liveFishEntities(runtime)
    const fishSnapshot = entities.map((entity) => snapshotFish(entity.fish))
    const normals = fishSnapshot.filter((fish) => fish.species === 'normal')

    for (let i = 0; i < entities.length; i += 1) {
      const fish = fishSnapshot[i]
      if (fish.health === 0) continue
      const cap = speciesSpeedCap(fish, runtime)
      let ax = 0
      let ay = 0

      if (fish.species === 'carnivore') {
        const wantsFood = fishWantsFood(fish, currentDay, params.hungerThresholdDays)
        let prey: Fish | null = null
        let bestD = Number.POSITIVE_INFINITY
        if (wantsFood) {
          for (const other of fishSnapshot) {
            if (other.id === fish.id || other.health === 0) continue
            if (other.weightG >= fish.weightG) continue
            const d = dist(fish.physics.position, other.physics.position)
            if (d < params.huntPerception && d < bestD) {
              bestD = d
              prey = other
            }
          }
        }
        if (prey) {
          const dir = vecNorm(vecSub(prey.physics.position, fish.physics.position))
          ax += dir.x * params.socialSteerAcceleration * 1.25
          ay += dir.y * params.socialSteerAcceleration * 1.25
        } else {
          ax +=
            (consumeRandom01(runtime, rngNext01) - 0.5) * params.wanderStrength
          ay +=
            (consumeRandom01(runtime, rngNext01) - 0.5) * params.wanderStrength
        }
      } else {
        let threat: Fish | null = null
        let bestD = Number.POSITIVE_INFINITY
        for (const other of fishSnapshot) {
          if (other.species !== 'carnivore' || other.health === 0) continue
          if (other.weightG <= fish.weightG) continue
          const d = dist(fish.physics.position, other.physics.position)
          if (d < params.fleePerception && d < bestD) {
            bestD = d
            threat = other
          }
        }
        if (threat) {
          const away = vecNorm(vecSub(fish.physics.position, threat.physics.position))
          ax += away.x * params.socialSteerAcceleration * 1.4
          ay += away.y * params.socialSteerAcceleration * 1.4
        } else if (!fishWantsFood(fish, currentDay, params.hungerThresholdDays)) {
          const boids = boidsAcceleration(fish, normals, runtime)
          ax += boids.x
          ay += boids.y
        }
      }

      let vx = fish.physics.velocity.x + ax * dt
      let vy = fish.physics.velocity.y + ay * dt
      ;({ x: vx, y: vy } = capSpeed(vx, vy, cap))
      entities[i].fish.physics.velocity = { x: vx, y: vy }
    }
  },
}

export const integrateFishPositionsSystem: SimulationSystem = {
  id: 'integrate-fish-positions',
  run(runtime) {
    const { params, clampedDeltaMs } = runtime.simulationEntity.simulation
    const dt = Math.min(clampedDeltaMs / 1000, 0.08)
    const margin = FISH_HALF + 2
    for (const entity of liveFishEntities(runtime)) {
      const fish = entity.fish
      if (fish.health === 0) continue
      fish.physics.position.x = Math.min(
        params.aquariumWidth - margin,
        Math.max(margin, fish.physics.position.x + fish.physics.velocity.x * dt),
      )
      fish.physics.position.y = Math.min(
        params.aquariumHeight - margin,
        Math.max(margin, fish.physics.position.y + fish.physics.velocity.y * dt),
      )
    }
  },
}

export const resolveFlakeEatingSystem: SimulationSystem = {
  id: 'resolve-flake-eating',
  run(runtime) {
    const { params, currentDay } = runtime.simulationEntity.simulation
    const events: SimulationEvent[] = []
    const consumedFood = new Set<string>()
    const updates = new Map<
      string,
      { health: Health; weightG: number; lastAte: number }
    >()
    const flakes = foodEntities(runtime).map((entity) => entity.food)

    for (const fish of liveFishEntities(runtime).map((entity) => entity.fish)) {
      if (fish.health === 0) continue
      if (!hungryWithinLastDay(currentDay, fish.lastAte, params.hungerThresholdDays)) {
        continue
      }
      for (const piece of flakes) {
        if (consumedFood.has(piece.id)) continue
        if (dist(fish.physics.position, piece.physics.position) <= params.foodPickupRadius) {
          consumedFood.add(piece.id)
          let health: Health = fish.health
          let weightG = fish.weightG
          if (health < 3) {
            health = (health + 1) as Health
          } else {
            weightG += 100
          }
          updates.set(fish.id, { health, weightG, lastAte: currentDay })
          events.push({ type: 'ate_flake', fishId: fish.id, name: fish.name })
          break
        }
      }
    }

    if (updates.size === 0 && consumedFood.size === 0) return

    for (const entity of liveFishEntities(runtime)) {
      const update = updates.get(entity.fish.id)
      if (update) Object.assign(entity.fish, update)
    }
    for (const entity of [...foodEntities(runtime)]) {
      if (consumedFood.has(entity.food.id)) runtime.world.remove(entity)
    }
    appendEvents(runtime, events)
  },
}

export const resolveCarnivorePredationSystem: SimulationSystem = {
  id: 'resolve-carnivore-predation',
  run(runtime) {
    const simulation = runtime.simulationEntity.simulation
    const { params, currentDay } = simulation
    const events: SimulationEvent[] = []
    const eaten = new Set<string>()
    const newDead: DeadFish[] = []
    const skeletons: FishSkeletonEntity['skeleton'][] = []
    const diedOnDay = Math.floor(currentDay) + 1
    const fishById = new Map(liveFishEntities(runtime).map((entity) => [entity.fish.id, entity]))
    const carnivores = liveFishEntities(runtime)
      .map((entity) => entity.fish)
      .filter((fish) => fish.species === 'carnivore' && fish.health > 0)
      .sort((a, b) => a.id.localeCompare(b.id))

    let liveFish = liveFishEntities(runtime).map((entity) => ({ ...entity.fish }))

    for (const carnivore of carnivores) {
      if (eaten.has(carnivore.id)) continue
      let best: Fish | null = null
      let bestD = Number.POSITIVE_INFINITY
      for (const prey of liveFish) {
        if (prey.id === carnivore.id || prey.health === 0 || eaten.has(prey.id)) {
          continue
        }
        if (prey.weightG >= carnivore.weightG) continue
        const d = dist(carnivore.physics.position, prey.physics.position)
        if (d <= params.carnivoreKillRadius && d < bestD) {
          bestD = d
          best = prey
        }
      }
      if (!best) continue

      eaten.add(best.id)
      newDead.push({ ...best, health: 0, diedOnDay })
      const weightGainG = Math.round(best.weightG * params.predationWeightGainFraction)
      liveFish = liveFish.map((fish) => {
        if (fish.id !== carnivore.id) return fish
        return {
          ...fish,
          lastAte: currentDay,
          weightG: fish.weightG + weightGainG,
        }
      })

      const skeletonId = `sk-${simulation.nextEntityId}`
      simulation.nextEntityId += 1
      skeletons.push({
        id: skeletonId,
        preyName: best.name,
        createdOnDay: currentDay,
        physics: {
          position: { ...best.physics.position },
          velocity: { x: 0, y: 0 },
        },
      })
      events.push({
        type: 'prey_eaten',
        predatorId: carnivore.id,
        predatorName: carnivore.name,
        preyId: best.id,
        preyName: best.name,
        weightGainG,
      })
    }

    if (eaten.size === 0) return

    for (const fish of liveFish) {
      const entity = fishById.get(fish.id)
      if (entity) Object.assign(entity.fish, fish)
    }
    for (const entity of [...liveFishEntities(runtime)]) {
      if (eaten.has(entity.fish.id)) runtime.world.remove(entity)
    }
    for (const deadFish of newDead) {
      runtime.world.add({ deadFish })
    }
    for (const skeleton of skeletons) {
      runtime.world.add({ skeleton })
    }
    appendEvents(runtime, events)
  },
}

export const sinkAndPruneSkeletonsSystem: SimulationSystem = {
  id: 'sink-and-prune-skeletons',
  run(runtime) {
    const { params, clampedDeltaMs, currentDay } = runtime.simulationEntity.simulation
    const dt = Math.min(clampedDeltaMs / 1000, 0.08)
    const bottomY = params.aquariumHeight - FISH_HALF - 2
    for (const entity of [...skeletonEntities(runtime)]) {
      if (currentDay >= entity.skeleton.createdOnDay + params.skeletonLifetimeDays) {
        runtime.world.remove(entity)
        continue
      }
      entity.skeleton.physics.position.y = Math.min(
        bottomY,
        entity.skeleton.physics.position.y + params.skeletonSinkSpeed * dt,
      )
      entity.skeleton.physics.velocity = { x: 0, y: 0 }
    }
  },
}

export const runCalendarBoundariesSystem: SimulationSystem = {
  id: 'run-calendar-boundaries',
  run(runtime) {
    const simulation = runtime.simulationEntity.simulation
    const { params } = simulation
    const floorDay = Math.floor(simulation.currentDay)
    if (floorDay <= simulation.lastClosedCalendarDayFloor + 1) return

    const events: SimulationEvent[] = []
    const completedDayFloor = simulation.lastClosedCalendarDayFloor + 1
    const closeSimTime = completedDayFloor + 1
    const starvationGraceActive = closeSimTime <= params.starvationGraceDays
    const diedOnDay = completedDayFloor + 1
    const dead: DeadFish[] = []

    for (const entity of liveFishEntities(runtime)) {
      const fish = entity.fish
      if (fish.health === 0) continue
      const oldHealth = fish.health
      if (
        !starvationGraceActive &&
        !ateWithinWindowBeforeCalendarClose(
          fish.lastAte,
          completedDayFloor,
          params.midnightMealWindowDays,
        )
      ) {
        fish.health = decHealth(fish.health)
        if (oldHealth === 3 && fish.health === 2) {
          events.push({
            type: 'fish_hunger',
            fishId: fish.id,
            name: fish.name,
            level: 'hungry',
          })
        } else if (oldHealth === 2 && fish.health === 1) {
          events.push({
            type: 'fish_hunger',
            fishId: fish.id,
            name: fish.name,
            level: 'starving',
          })
        } else if (oldHealth === 1 && fish.health === 0) {
          events.push({
            type: 'fish_hunger',
            fishId: fish.id,
            name: fish.name,
            level: 'famished',
          })
        }
      }
    }

    for (const entity of [...liveFishEntities(runtime)]) {
      if (entity.fish.health > 0) continue
      dead.push({ ...entity.fish, diedOnDay })
      events.push({
        type: 'fish_died',
        fishId: entity.fish.id,
        name: entity.fish.name,
        reason: 'starvation',
      })
      runtime.world.remove(entity)
    }

    const born: Fish[] = []
    for (const entity of liveFishEntities(runtime)) {
      const fish = entity.fish
      if (fish.weightG < params.reproductionWeightThresholdG) continue
      const probability = Math.min(
        fish.ageDays / Math.max(1, params.reproductionAgeScaleDays),
        params.reproduceChanceCap,
      )
      if (consumeRandom01(runtime, rngNext01) < probability) {
        const jitterX =
          (consumeRandom01(runtime, rngNext01) - 0.5) * params.babySpawnJitterPx
        const jitterY =
          (consumeRandom01(runtime, rngNext01) - 0.5) * params.babySpawnJitterPx
        const id = `fish-${simulation.nextEntityId}`
        simulation.nextEntityId += 1
        const namePick = consumeRandomResult(runtime, pickFishName)
        const app = consumeRandomResult(runtime, rollAppearance)
        const species: Species =
          consumeRandom01(runtime, rngNext01) < params.carnivoreMutationChance
            ? 'carnivore'
            : 'normal'
        const baby = spawnBaby(
          fish,
          id,
          jitterX,
          jitterY,
          species,
          namePick.name,
          app.appearance,
        )
        born.push(baby)
        events.push({
          type: 'fish_born',
          fishId: baby.id,
          name: baby.name,
          species: baby.species,
        })
      }
    }

    for (const deadFish of dead) {
      runtime.world.add({ deadFish })
    }
    for (const baby of born) {
      runtime.world.add({ fish: baby })
    }
    for (const entity of liveFishEntities(runtime)) {
      entity.fish.ageDays += 1
    }

    simulation.score = computeReadmeScore(
      liveFishEntities(runtime).map((entity) => entity.fish),
    )
    simulation.lastClosedCalendarDayFloor += 1
    appendEvents(runtime, events)
  },
}

export const sinkAndPruneDeadFishSystem: SimulationSystem = {
  id: 'sink-and-prune-dead-fish',
  run(runtime) {
    const { params, clampedDeltaMs, currentDay } = runtime.simulationEntity.simulation
    const dt = Math.min(clampedDeltaMs / 1000, 0.08)
    const bottomY = params.aquariumHeight - FISH_HALF - 2
    const dayFloor = Math.floor(currentDay)
    for (const entity of [...deadFishEntities(runtime)]) {
      if (dayFloor >= entity.deadFish.diedOnDay + params.deadFishLingerDays) {
        runtime.world.remove(entity)
        continue
      }
      entity.deadFish.physics.position.y = Math.min(
        bottomY,
        entity.deadFish.physics.position.y + params.deadSinkSpeed * dt,
      )
      entity.deadFish.physics.velocity = { x: 0, y: 0 }
    }
  },
}
