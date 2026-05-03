import { FIRST_HUNGER_HEALTH_LOSS_THRESHOLD_DAYS } from "./hungerConstants";
import type {
  FishEntity,
  FishHungerStage,
  FishSpeciesTag,
  FishState,
  FoodEntity,
  FoodState,
  Vec3,
} from "./types";

export class InvalidEntityShapeError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(issues.join("; "));
    this.name = "InvalidEntityShapeError";
    this.issues = issues;
  }
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function issueVec3(path: string, v: unknown): string | null {
  if (!isPlainRecord(v)) {
    return `${path} must be an object with x, y, z numbers`;
  }
  for (const k of ["x", "y", "z"] as const) {
    const n = v[k];
    if (typeof n !== "number" || !Number.isFinite(n)) {
      return `${path}.${k} must be a finite number`;
    }
  }
  return null;
}

function parseVec3(path: string, v: unknown): Vec3 | null {
  if (issueVec3(path, v)) {
    return null;
  }
  const o = v as Record<string, unknown>;
  return { x: o.x as number, y: o.y as number, z: o.z as number };
}

function parseSpecies(v: unknown): FishSpeciesTag | null {
  if (!isPlainRecord(v) || v.kind === undefined) {
    return null;
  }
  if (v.kind === "herbivore" || v.kind === "carnivore") {
    return { kind: v.kind };
  }
  return null;
}

function collectFishState(path: string, v: unknown): { state: FishState } | { errors: string[] } {
  const errors: string[] = [];
  if (!isPlainRecord(v)) {
    return { errors: [`${path} must be an object`] };
  }
  if (typeof v.displayName !== "string" || v.displayName.trim().length === 0) {
    errors.push(`${path}.displayName must be a non-empty string`);
  }
  if (typeof v.hungerDays !== "number" || !Number.isFinite(v.hungerDays) || v.hungerDays < 0) {
    errors.push(`${path}.hungerDays must be a finite number >= 0`);
  }
  const h = v.health;
  if (
    typeof h !== "number" ||
    !Number.isInteger(h) ||
    h < 0 ||
    h > 3
  ) {
    errors.push(`${path}.health must be an integer in 0..3`);
  }
  if (typeof v.weightGrams !== "number" || !Number.isFinite(v.weightGrams) || v.weightGrams <= 0) {
    errors.push(`${path}.weightGrams must be a finite number > 0`);
  }
  const species = parseSpecies(v.species);
  if (!species) {
    errors.push(`${path}.species must be { kind: "herbivore" } or { kind: "carnivore" }`);
  }
  const stageRaw = v.hungerStage;
  let hungerStage: FishHungerStage | undefined;
  if (stageRaw === "healthy" || stageRaw === "hungry") {
    hungerStage = stageRaw;
  } else if (stageRaw !== undefined) {
    errors.push(`${path}.hungerStage must be "healthy" or "hungry"`);
  }
  if (errors.length > 0) {
    return { errors };
  }

  let resolvedHealth = h as 0 | 1 | 2 | 3;
  if (hungerStage === undefined) {
    const hungerDays = v.hungerDays as number;
    if (resolvedHealth === 3 && hungerDays >= FIRST_HUNGER_HEALTH_LOSS_THRESHOLD_DAYS) {
      resolvedHealth = 2;
      hungerStage = "hungry";
    } else if (resolvedHealth === 3) {
      hungerStage = "healthy";
    } else {
      hungerStage = "hungry";
    }
  }

  return {
    state: {
      displayName: v.displayName as string,
      hungerDays: v.hungerDays as number,
      health: resolvedHealth,
      hungerStage,
      weightGrams: v.weightGrams as number,
      species: species as FishSpeciesTag,
    },
  };
}

/**
 * Validates unknown input and returns a `FishEntity`, or throws `InvalidEntityShapeError`.
 * Rejects extra `food` so fish and food archetypes stay disjoint at runtime.
 */
export function assertFishEntityShape(input: unknown): FishEntity {
  const errors: string[] = [];
  if (!isPlainRecord(input)) {
    throw new InvalidEntityShapeError(["entity must be a plain object"]);
  }
  if ("food" in input && input.food !== undefined) {
    errors.push("fish entity must not carry a food component");
  }
  for (const key of ["fish", "position", "velocity"] as const) {
    if (!(key in input)) {
      errors.push(`missing required property "${key}"`);
    }
  }
  if (errors.length > 0) {
    throw new InvalidEntityShapeError(errors);
  }

  const fishResult = collectFishState("fish", input.fish);
  if ("errors" in fishResult) {
    throw new InvalidEntityShapeError(fishResult.errors);
  }

  const pos = parseVec3("position", input.position);
  const vel = parseVec3("velocity", input.velocity);
  if (!pos) {
    errors.push(issueVec3("position", input.position)!);
  }
  if (!vel) {
    errors.push(issueVec3("velocity", input.velocity)!);
  }
  if (errors.length > 0) {
    throw new InvalidEntityShapeError(errors);
  }

  return {
    fish: fishResult.state,
    position: pos!,
    velocity: vel!,
  };
}

function collectFoodState(path: string, v: unknown): { state: FoodState } | { errors: string[] } {
  const errors: string[] = [];
  if (!isPlainRecord(v)) {
    return { errors: [`${path} must be an object`] };
  }
  if (
    typeof v.spawnedAtSimDays !== "number" ||
    !Number.isFinite(v.spawnedAtSimDays)
  ) {
    errors.push(`${path}.spawnedAtSimDays must be a finite number`);
  }
  if (errors.length > 0) {
    return { errors };
  }
  return { state: { spawnedAtSimDays: v.spawnedAtSimDays as number } };
}

/**
 * Validates unknown input and returns a `FoodEntity`, or throws `InvalidEntityShapeError`.
 * Rejects `fish` / `velocity` so flakes stay distinct from fish archetypes.
 */
export function assertFoodEntityShape(input: unknown): FoodEntity {
  const errors: string[] = [];
  if (!isPlainRecord(input)) {
    throw new InvalidEntityShapeError(["entity must be a plain object"]);
  }
  if ("fish" in input && input.fish !== undefined) {
    errors.push("food entity must not carry a fish component");
  }
  if ("velocity" in input && input.velocity !== undefined) {
    errors.push("food entity must not carry velocity");
  }
  for (const key of ["food", "position"] as const) {
    if (!(key in input)) {
      errors.push(`missing required property "${key}"`);
    }
  }
  if (errors.length > 0) {
    throw new InvalidEntityShapeError(errors);
  }

  const foodResult = collectFoodState("food", input.food);
  if ("errors" in foodResult) {
    throw new InvalidEntityShapeError(foodResult.errors);
  }

  const pos = parseVec3("position", input.position);
  if (!pos) {
    throw new InvalidEntityShapeError([issueVec3("position", input.position)!]);
  }

  return {
    food: foodResult.state,
    position: pos,
  };
}
