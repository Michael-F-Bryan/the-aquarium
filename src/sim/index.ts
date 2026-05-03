export type {
  FishEntity,
  FishSpeciesTag,
  FishState,
  FoodEntity,
  FoodState,
  SimulationEntity,
  Vec3,
} from "./types";
export { InvalidEntityShapeError, assertFishEntityShape, assertFoodEntityShape } from "./guards";
export {
  createSimulationWorld,
  fishWithKinematics,
  foodWithPosition,
  registerFish,
  registerFood,
} from "./world";
export type { FishKinematicsEntity, FoodPositionEntity } from "./world";
export {
  createNewRunSimulationWorld,
  DEFAULT_SIMULATION_SEED,
  starterFishEntityForRunSeed,
} from "./newRunWorld";
export { STARTER_SPAWN_VOLUME, isWithinStarterSpawnVolume } from "./starterSpawnBounds";
export {
  MAX_WALL_DELTA_SECONDS_PER_STEP,
  WALL_SECONDS_PER_SIM_DAY,
  advanceClockByWallDelta,
  clampWallDeltaSeconds,
  setPaused,
  togglePause,
  wallDeltaToSimDays,
} from "./simulationClock";
export type { SimulationClockState } from "./simulationClock";
export { stepFishKinematicsWallDelta } from "./movement/fishKinematics";
export type { StepFishKinematicsOptions } from "./movement/fishKinematics";
export { resetFishHungerAfterSuccessfulMeal, stepHungerTimersWallDelta } from "./hungerTimer";
export {
  SIMULATION_WORLD_SNAPSHOT_VERSION,
  deserializeSimulationWorldSnapshot,
  serializeSimulationWorldSnapshot,
} from "./worldSnapshot";
export type { SimulationWorldSnapshot } from "./worldSnapshot";
