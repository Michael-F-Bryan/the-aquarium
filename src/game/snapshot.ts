import type { FishAppearance, FishGender, GameSnapshotPayload } from './types'

/** Bump when persisted snapshot payload shape changes (save/load, dev JSON). */
export const GAME_SNAPSHOT_SCHEMA_VERSION = 3 as const

export type GameSnapshotV3 = {
  schemaVersion: typeof GAME_SNAPSHOT_SCHEMA_VERSION
  state: GameSnapshotPayload
}

export type ParseSnapshotResult =
  | { ok: true; payload: GameSnapshotPayload }
  | { ok: false; error: string }

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}

function num(x: unknown, label: string): number {
  if (typeof x !== 'number' || !Number.isFinite(x)) {
    throw new Error(`${label} must be a finite number`)
  }
  return x
}

function int(x: unknown, label: string): number {
  const n = num(x, label)
  if (!Number.isInteger(n)) throw new Error(`${label} must be an integer`)
  return n
}

function str(x: unknown, label: string): string {
  if (typeof x !== 'string') throw new Error(`${label} must be a string`)
  return x
}

function bool(x: unknown, label: string): boolean {
  if (typeof x !== 'boolean') throw new Error(`${label} must be a boolean`)
  return x
}

function physics(x: unknown, label: string): GameSnapshotPayload['liveFish'][0]['physics'] {
  if (!isRecord(x)) throw new Error(`${label} must be an object`)
  const position = x.position
  const velocity = x.velocity
  if (!isRecord(position) || !isRecord(velocity)) {
    throw new Error(`${label}.position and ${label}.velocity must be objects`)
  }
  return {
    position: { x: num(position.x, `${label}.position.x`), y: num(position.y, `${label}.position.y`) },
    velocity: { x: num(velocity.x, `${label}.velocity.x`), y: num(velocity.y, `${label}.velocity.y`) },
  }
}

function parseGender(x: unknown, label: string): FishGender {
  const g = str(x, label)
  if (g !== 'female' && g !== 'male' && g !== 'other') {
    throw new Error(`${label} must be female, male, or other`)
  }
  return g
}

function parseAppearance(x: unknown, label: string): FishAppearance {
  if (!isRecord(x)) throw new Error(`${label} must be an object`)
  const finShape = int(x.finShape, `${label}.finShape`)
  const tailShape = int(x.tailShape, `${label}.tailShape`)
  if (finShape < 0 || finShape > 2) throw new Error(`${label}.finShape must be 0–2`)
  if (tailShape < 0 || tailShape > 2) throw new Error(`${label}.tailShape must be 0–2`)
  return {
    gender: parseGender(x.gender, `${label}.gender`),
    eyelashes: bool(x.eyelashes, `${label}.eyelashes`),
    finScale: num(x.finScale, `${label}.finScale`),
    finShape: finShape as 0 | 1 | 2,
    tailShape: tailShape as 0 | 1 | 2,
    eyeColor: str(x.eyeColor, `${label}.eyeColor`),
  }
}

function fish(x: unknown, label: string): GameSnapshotPayload['liveFish'][0] {
  if (!isRecord(x)) throw new Error(`${label} must be an object`)
  const species = str(x.species, `${label}.species`)
  if (species !== 'normal' && species !== 'carnivore') {
    throw new Error(`${label}.species must be normal or carnivore`)
  }
  const health = int(x.health, `${label}.health`)
  if (health < 0 || health > 3) throw new Error(`${label}.health must be 0–3`)
  return {
    id: str(x.id, `${label}.id`),
    name: str(x.name, `${label}.name`),
    species,
    ageDays: num(x.ageDays, `${label}.ageDays`),
    weightG: num(x.weightG, `${label}.weightG`),
    health: health as 0 | 1 | 2 | 3,
    physics: physics(x.physics, `${label}.physics`),
    appearance: parseAppearance(x.appearance, `${label}.appearance`),
    lastAte: num(x.lastAte, `${label}.lastAte`),
  }
}

function fishDeathCause(x: unknown): GameSnapshotPayload['deadFish'][0]['deathCause'] {
  if (x === 'predation') return 'predation'
  return 'starvation'
}

function deadFish(x: unknown, label: string): GameSnapshotPayload['deadFish'][0] {
  const f = fish(x, label)
  if (!isRecord(x)) throw new Error(`${label} must be an object`)
  return {
    ...f,
    diedOnDay: int(x.diedOnDay, `${label}.diedOnDay`),
    deathCause: fishDeathCause(x.deathCause),
  }
}

function foodPiece(x: unknown, label: string): GameSnapshotPayload['food'][0] {
  if (!isRecord(x)) throw new Error(`${label} must be an object`)
  return {
    id: str(x.id, `${label}.id`),
    createdOnDay: num(x.createdOnDay, `${label}.createdOnDay`),
    physics: physics(x.physics, `${label}.physics`),
  }
}

function fishSkeleton(x: unknown, label: string): GameSnapshotPayload['skeletons'][0] {
  if (!isRecord(x)) throw new Error(`${label} must be an object`)
  return {
    id: str(x.id, `${label}.id`),
    preyName: str(x.preyName, `${label}.preyName`),
    createdOnDay: num(x.createdOnDay, `${label}.createdOnDay`),
    physics: physics(x.physics, `${label}.physics`),
  }
}

function parseSnapshotPayloadInner(raw: unknown): GameSnapshotPayload {
  if (!isRecord(raw)) throw new Error('state must be an object')
  const currentDay = num(raw.currentDay, 'state.currentDay')
  const lastClosedCalendarDayFloor = int(
    raw.lastClosedCalendarDayFloor,
    'state.lastClosedCalendarDayFloor',
  )
  const nextEntityId = int(raw.nextEntityId, 'state.nextEntityId')
  const rngState = num(raw.rngState, 'state.rngState')
  const score = num(raw.score, 'state.score')

  if (!Array.isArray(raw.liveFish)) throw new Error('state.liveFish must be an array')
  if (!Array.isArray(raw.deadFish)) throw new Error('state.deadFish must be an array')
  if (!Array.isArray(raw.skeletons)) throw new Error('state.skeletons must be an array')
  if (!Array.isArray(raw.food)) throw new Error('state.food must be an array')

  return {
    currentDay,
    lastClosedCalendarDayFloor,
    nextEntityId,
    rngState,
    score,
    liveFish: raw.liveFish.map((f, i) => fish(f, `state.liveFish[${i}]`)),
    deadFish: raw.deadFish.map((f, i) => deadFish(f, `state.deadFish[${i}]`)),
    skeletons: raw.skeletons.map((f, i) => fishSkeleton(f, `state.skeletons[${i}]`)),
    food: raw.food.map((f, i) => foodPiece(f, `state.food[${i}]`)),
  }
}

/** Parse dev / save JSON envelope `{ schemaVersion, state }`. */
export function parseGameSnapshot(json: unknown): ParseSnapshotResult {
  try {
    if (!isRecord(json)) return { ok: false, error: 'Root must be an object' }
    const schemaVersion = json.schemaVersion
    if (schemaVersion !== GAME_SNAPSHOT_SCHEMA_VERSION) {
      return {
        ok: false,
        error: `Unsupported schemaVersion ${String(schemaVersion)} (expected ${GAME_SNAPSHOT_SCHEMA_VERSION})`,
      }
    }
    const payload = parseSnapshotPayloadInner(json.state)
    return { ok: true, payload }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { ok: false, error: msg }
  }
}

export function serializeGameSnapshot(snapshot: GameSnapshotPayload): string {
  const envelope: GameSnapshotV3 = {
    schemaVersion: GAME_SNAPSHOT_SCHEMA_VERSION,
    state: snapshot,
  }
  return JSON.stringify(envelope, null, 2)
}
