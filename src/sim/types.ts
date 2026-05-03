/** Tank-space vector used by fish and food. */
export type Vec3 = { x: number; y: number; z: number };

export type FishSpeciesTag = { kind: "herbivore" } | { kind: "carnivore" };

/** Hunger vitals label; milestones extend per `docs/the-game.md` (`#7`, `#8`, …). */
export type FishHungerStage = "healthy" | "hungry" | "starving";

/** Emitted once when a fish crosses the first hunger threshold (healthy → hungry). */
export type FishBecameHungryEvent = {
  kind: "fish_became_hungry";
  displayName: string;
};

/** Emitted once when a fish crosses the second hunger threshold (hungry → starving). */
export type FishBecameStarvingEvent = {
  kind: "fish_became_starving";
  displayName: string;
};

/** Toasts / UI: one entry per hunger milestone crossing in a single hunger step. */
export type FishHungerMilestoneEvent = FishBecameHungryEvent | FishBecameStarvingEvent;

/**
 * Fish-only simulation fields (movement uses shared `position` / `velocity`).
 * Hunger and health align with `docs/the-game.md` (health 0–3, per-fish hunger clock).
 */
export type FishState = {
  displayName: string;
  /** Days since last meal; 0 means just ate. */
  hungerDays: number;
  health: 0 | 1 | 2 | 3;
  /** Player-facing hunger band; updated on threshold crossings (see `docs/the-game.md`). */
  hungerStage: FishHungerStage;
  weightGrams: number;
  species: FishSpeciesTag;
};

/**
 * Strict fish archetype: always has kinematics + `fish` state.
 * (Miniplex `World` uses one component record; `SimulationEntity` is the widened bag.)
 */
export type FishEntity = {
  fish: FishState;
  position: Vec3;
  velocity: Vec3;
};

/** Food flake metadata (decay uses spawn time vs sim days). */
export type FoodState = {
  spawnedAtSimDays: number;
};

/** Strict food archetype: positioned flake with no velocity. */
export type FoodEntity = {
  food: FoodState;
  position: Vec3;
};

/**
 * Component superset stored in the Miniplex world. Fish carry `fish` + `velocity`;
 * food carries `food` only (guards reject `velocity` on flakes). `keyof` must list
 * every component name so `.with("fish", …)` type-checks.
 */
export type SimulationEntity = {
  position: Vec3;
  velocity?: Vec3;
  fish?: FishState;
  food?: FoodState;
  /**
   * When set, higher-level targeting owns steering; idle wander is skipped.
   * Not validated by `assertFishEntityShape` (runtime-only / save-roundtrip optional).
   */
  movementTargetPosition?: Vec3;
};
