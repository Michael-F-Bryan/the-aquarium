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
  MAX_WALL_DELTA_SECONDS_PER_STEP,
  WALL_SECONDS_PER_SIM_DAY,
  advanceClockByWallDelta,
  clampWallDeltaSeconds,
  setPaused,
  togglePause,
  wallDeltaToSimDays,
} from "./simulationClock";
export type { SimulationClockState } from "./simulationClock";
