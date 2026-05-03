/** Tank-space vector used by fish and food. */
export type Vec3 = { x: number; y: number; z: number };

export type FishSpeciesTag = { kind: "herbivore" } | { kind: "carnivore" };

/**
 * Fish-only simulation fields (movement uses shared `position` / `velocity`).
 * Hunger and health align with `docs/the-game.md` (health 0–3, per-fish hunger clock).
 */
export type FishState = {
  displayName: string;
  /** Days since last meal; 0 means just ate. */
  hungerDays: number;
  health: 0 | 1 | 2 | 3;
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
};
