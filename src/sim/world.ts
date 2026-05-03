import { World, type With } from "miniplex";
import type { FishEntity, FoodEntity, SimulationEntity } from "./types";
import { assertFishEntityShape, assertFoodEntityShape } from "./guards";

export function createSimulationWorld(entities: SimulationEntity[] = []): World<SimulationEntity> {
  return new World<SimulationEntity>(entities);
}

export function registerFish(world: World<SimulationEntity>, candidate: unknown): FishEntity {
  const fish = assertFishEntityShape(candidate);
  world.add(fish);
  return fish;
}

export function registerFood(world: World<SimulationEntity>, candidate: unknown): FoodEntity {
  const food = assertFoodEntityShape(candidate);
  world.add(food);
  return food;
}

/** Fish that can participate in movement / targeting systems. */
export function fishWithKinematics(world: World<SimulationEntity>) {
  return world.with("fish", "position", "velocity").connect();
}

/** Food flakes positioned in the tank. */
export function foodWithPosition(world: World<SimulationEntity>) {
  return world.with("food", "position").connect();
}

export type FishKinematicsEntity = With<SimulationEntity, "fish" | "position" | "velocity">;
export type FoodPositionEntity = With<SimulationEntity, "food" | "position">;
