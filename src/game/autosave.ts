import { defaultParams, type Params } from './params'
import {
  GAME_SNAPSHOT_SCHEMA_VERSION,
  parseGameSnapshot,
  serializeGameSnapshot,
} from './snapshot'
import type { GameSnapshotPayload } from './types'

/** localStorage key for bundled autosave (thumbnail + state + params). */
export const AUTOSAVE_STORAGE_KEY = 'the-aquarium-autosave-v1'

export const AUTOSAVE_BUNDLE_SCHEMA = 1 as const

export type AutosaveBundle = {
  bundleSchema: typeof AUTOSAVE_BUNDLE_SCHEMA
  savedAt: string
  thumbnailDataUrl: string | null
  gameSchemaVersion: typeof GAME_SNAPSHOT_SCHEMA_VERSION
  /** Raw game snapshot `{ schemaVersion, state }` object before stringify. */
  game: unknown
  params: Params
}

export function buildAutosaveJson(options: {
  snapshot: GameSnapshotPayload
  params: Params
  thumbnailDataUrl: string | null
}): string {
  const bundle: AutosaveBundle = {
    bundleSchema: AUTOSAVE_BUNDLE_SCHEMA,
    savedAt: new Date().toISOString(),
    thumbnailDataUrl: options.thumbnailDataUrl,
    gameSchemaVersion: GAME_SNAPSHOT_SCHEMA_VERSION,
    game: JSON.parse(serializeGameSnapshot(options.snapshot)) as unknown,
    params: options.params,
  }
  return JSON.stringify(bundle)
}

export type LoadAutosaveResult =
  | { ok: true; snapshot: GameSnapshotPayload; params: Params; thumbnailDataUrl: string | null }
  | { ok: false; error: string }

function parseSavedParams(raw: unknown): Params {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new Error('params missing')
  }
  const source = raw as Record<string, unknown>
  const merged = { ...defaultParams }
  for (const key of Object.keys(defaultParams) as Array<keyof Params>) {
    const value = source[key]
    if (value === undefined) continue
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new Error(`params.${key} must be a finite number`)
    }
    merged[key] = value
  }
  return merged
}

export function parseAutosaveJson(raw: string): LoadAutosaveResult {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) {
      return { ok: false, error: 'Autosave root must be an object' }
    }
    const o = parsed as Record<string, unknown>
    if (o.bundleSchema !== AUTOSAVE_BUNDLE_SCHEMA) {
      return { ok: false, error: 'Unknown autosave bundle schema' }
    }
    const gameParsed = parseGameSnapshot(o.game)
    if ('error' in gameParsed) return { ok: false, error: gameParsed.error }
    const params = parseSavedParams(o.params)
    const thumb =
      typeof o.thumbnailDataUrl === 'string' || o.thumbnailDataUrl === null
        ? (o.thumbnailDataUrl as string | null)
        : null
    return {
      ok: true,
      snapshot: gameParsed.snapshot,
      params,
      thumbnailDataUrl: thumb,
    }
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    }
  }
}

export function readAutosaveFromStorage(): LoadAutosaveResult {
  if (typeof localStorage === 'undefined') {
    return { ok: false, error: 'localStorage unavailable' }
  }
  let raw: string | null
  try {
    raw = localStorage.getItem(AUTOSAVE_STORAGE_KEY)
  } catch {
    return { ok: false, error: 'localStorage unavailable' }
  }
  if (raw === null) return { ok: false, error: 'No autosave found' }
  return parseAutosaveJson(raw)
}
