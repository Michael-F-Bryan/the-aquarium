import { describe, expect, expectTypeOf, it } from "vitest";
import {
  InvalidEntityShapeError,
  assertFishEntityShape,
  assertFoodEntityShape,
  createSimulationWorld,
  fishWithKinematics,
  foodWithPosition,
  registerFish,
  registerFood,
} from "./index";
import type { FishEntity, FoodEntity, SimulationEntity } from "./index";

const validFishPayload = {
  fish: {
    displayName: "Pebble",
    hungerDays: 0,
    health: 3 as const,
    weightGrams: 100,
    species: { kind: "herbivore" as const },
  },
  position: { x: 0, y: 0.5, z: 0 },
  velocity: { x: 0, y: 0, z: 0 },
};

const validFoodPayload = {
  food: { spawnedAtSimDays: 1.25 },
  position: { x: 0.1, y: 0.4, z: 0 },
};

describe("simulation ECS entity shapes", () => {
  it("accepts a complete fish payload and exposes it on a kinematics query", () => {
    const world = createSimulationWorld();
    const q = fishWithKinematics(world);
    registerFish(world, validFishPayload);
    const entities = [...q];
    expect(entities).toHaveLength(1);
    expect(entities[0]!.fish.displayName).toBe("Pebble");
    expect(entities[0]!.position.y).toBe(0.5);
  });

  it("accepts a complete food payload and exposes it on a food query", () => {
    const world = createSimulationWorld();
    const q = foodWithPosition(world);
    registerFood(world, validFoodPayload);
    expect([...q]).toHaveLength(1);
  });

  it("rejects fish missing velocity with InvalidEntityShapeError", () => {
    const bad = {
      fish: validFishPayload.fish,
      position: validFishPayload.position,
    };
    expect(() => assertFishEntityShape(bad)).toThrow(InvalidEntityShapeError);
    try {
      assertFishEntityShape(bad);
    } catch (e) {
      expect(e).toBeInstanceOf(InvalidEntityShapeError);
      expect((e as InvalidEntityShapeError).issues.some((m) => m.includes("velocity"))).toBe(
        true,
      );
    }
  });

  it("rejects fish that incorrectly include food", () => {
    const bad = { ...validFishPayload, food: { spawnedAtSimDays: 0 } };
    expect(() => assertFishEntityShape(bad)).toThrow(InvalidEntityShapeError);
  });

  it("rejects food missing spawnedAtSimDays", () => {
    const bad = {
      food: {},
      position: validFoodPayload.position,
    };
    expect(() => assertFoodEntityShape(bad)).toThrow(InvalidEntityShapeError);
  });

  it("rejects food that incorrectly include fish state", () => {
    const bad = { ...validFoodPayload, fish: validFishPayload.fish };
    expect(() => assertFoodEntityShape(bad)).toThrow(InvalidEntityShapeError);
  });

  it("rejects food that incorrectly include velocity", () => {
    const bad = { ...validFoodPayload, velocity: { x: 0, y: 0, z: 0 } };
    expect(() => assertFoodEntityShape(bad)).toThrow(InvalidEntityShapeError);
  });

  it("narrows fish query entities to fish + kinematics components", () => {
    const world = createSimulationWorld();
    const q = fishWithKinematics(world);
    registerFish(world, validFishPayload);
    const entity = [...q][0]!;
    expectTypeOf(entity.fish).toMatchTypeOf(validFishPayload.fish);
    expectTypeOf(entity.position).toMatchTypeOf(validFishPayload.position);
    expectTypeOf(entity.velocity).toMatchTypeOf(validFishPayload.velocity);
  });

  it("keeps FishEntity and FoodEntity disjoint at the type level", () => {
    expectTypeOf({} as FishEntity).not.toMatchTypeOf({} as FoodEntity);
    expectTypeOf({} as SimulationEntity).toMatchTypeOf({} as FishEntity);
    expectTypeOf({} as SimulationEntity).toMatchTypeOf({} as FoodEntity);
  });
});
