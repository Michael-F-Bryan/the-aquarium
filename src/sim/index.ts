export type {
  FishBecameHungryEvent,
  FishBecameStarvingEvent,
  FishDiedStarvationEvent,
  FishEntity,
  FishHungerMilestoneEvent,
  FishHungerStage,
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
  MIN_FOOD_SPACING,
  clampFoodDropPosition,
  tryDropFoodAt,
} from "./dropFood";
export type { DropFoodRejectReason, DropFoodResult } from "./dropFood";
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
export {
  FIRST_HUNGER_HEALTH_LOSS_THRESHOLD_DAYS,
  SECOND_HUNGER_HEALTH_LOSS_THRESHOLD_DAYS,
  THIRD_HUNGER_DEATH_THRESHOLD_DAYS,
} from "./hungerConstants";
export {
  dispatchFishHungerMilestoneEvents,
  subscribeFishHungerMilestoneEvents,
} from "./fishHungerEventBridge";
export { resetFishHungerAfterSuccessfulMeal, stepHungerTimersWallDelta } from "./hungerTimer";
export {
  SIMULATION_WORLD_SNAPSHOT_VERSION,
  SIMULATION_WORLD_SNAPSHOT_VERSION_V1,
  deserializeSimulationWorldSnapshot,
  serializeSimulationWorldSnapshot,
} from "./worldSnapshot";
export type { SimulationWorldSnapshot } from "./worldSnapshot";
