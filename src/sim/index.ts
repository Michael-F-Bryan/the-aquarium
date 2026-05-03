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
