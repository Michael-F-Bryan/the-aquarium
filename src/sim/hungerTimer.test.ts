import { describe, expect, it } from "vitest";
import {
  dispatchFishHungerMilestoneEvents,
  subscribeFishHungerMilestoneEvents,
} from "./fishHungerEventBridge";
import {
  FIRST_HUNGER_HEALTH_LOSS_THRESHOLD_DAYS,
  SECOND_HUNGER_HEALTH_LOSS_THRESHOLD_DAYS,
} from "./hungerConstants";
import {
  createSimulationWorld,
  fishWithKinematics,
  registerFish,
  wallDeltaToSimDays,
} from "./index";
import {
  resetFishHungerAfterSuccessfulMeal,
  stepHungerTimersSimDayDelta,
  stepHungerTimersWallDelta,
} from "./hungerTimer";

describe("stepHungerTimersWallDelta", () => {
  it("advances hungerDays by the same sim-day delta as the simulation clock for that wall step", () => {
    const world = createSimulationWorld();
    registerFish(world, {
      fish: {
        displayName: "A",
        hungerDays: 0.5,
        health: 3,
        hungerStage: "healthy",
        weightGrams: 100,
        species: { kind: "herbivore" },
      },
      position: { x: 0, y: 0.35, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    });
    const wallDt = 0.1;
    const expectedDelta = wallDeltaToSimDays(wallDt);
    expect(stepHungerTimersWallDelta(world, { wallDeltaSeconds: wallDt })).toEqual([]);
    const [fish] = [...fishWithKinematics(world)];
    expect(fish!.fish.hungerDays).toBeCloseTo(0.5 + expectedDelta, 10);
  });

  it("accumulates independently for multiple fish", () => {
    const world = createSimulationWorld();
    registerFish(world, {
      fish: {
        displayName: "A",
        hungerDays: 0,
        health: 3,
        hungerStage: "healthy",
        weightGrams: 100,
        species: { kind: "herbivore" },
      },
      position: { x: 0, y: 0.35, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    });
    registerFish(world, {
      fish: {
        displayName: "B",
        hungerDays: 2,
        health: 2,
        hungerStage: "hungry",
        weightGrams: 200,
        species: { kind: "herbivore" },
      },
      position: { x: 0.1, y: 0.35, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    });
    const wallDt = 0.2;
    const d = wallDeltaToSimDays(wallDt);
    expect(stepHungerTimersWallDelta(world, { wallDeltaSeconds: wallDt })).toEqual([]);
    const names = new Map([...fishWithKinematics(world)].map((e) => [e.fish.displayName, e.fish.hungerDays]));
    expect(names.get("A")).toBeCloseTo(0 + d, 10);
    expect(names.get("B")).toBeCloseTo(2 + d, 10);
  });

  it("is a no-op for non-positive wall delta", () => {
    const world = createSimulationWorld();
    registerFish(world, {
      fish: {
        displayName: "A",
        hungerDays: 1,
        health: 3,
        hungerStage: "healthy",
        weightGrams: 100,
        species: { kind: "herbivore" },
      },
      position: { x: 0, y: 0.35, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    });
    expect(stepHungerTimersWallDelta(world, { wallDeltaSeconds: 0 })).toEqual([]);
    expect(stepHungerTimersWallDelta(world, { wallDeltaSeconds: -1 })).toEqual([]);
    expect([...fishWithKinematics(world)][0]!.fish.hungerDays).toBe(1);
  });

  it("at the first threshold applies health 3→2, hungerStage hungry, exactly once per crossing", () => {
    const world = createSimulationWorld();
    const startBelow = FIRST_HUNGER_HEALTH_LOSS_THRESHOLD_DAYS - 0.01;
    registerFish(world, {
      fish: {
        displayName: "Crosser",
        hungerDays: startBelow,
        health: 3,
        hungerStage: "healthy",
        weightGrams: 100,
        species: { kind: "herbivore" },
      },
      position: { x: 0, y: 0.35, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    });
    /** 0.065 wall seconds ⇒ 0.01 sim days at default speed (`WALL_SECONDS_PER_SIM_DAY`). */
    const wallDt = 0.065;
    const ev = stepHungerTimersWallDelta(world, { wallDeltaSeconds: wallDt });
    const [fish] = [...fishWithKinematics(world)];
    expect(fish!.fish.health).toBe(2);
    expect(fish!.fish.hungerStage).toBe("hungry");
    expect(ev).toEqual([{ kind: "fish_became_hungry", displayName: "Crosser" }]);
    expect(stepHungerTimersWallDelta(world, { wallDeltaSeconds: wallDt })).toEqual([]);
    expect(fish!.fish.health).toBe(2);
    expect(fish!.fish.hungerStage).toBe("hungry");
  });

  it("at the second threshold applies health 2→1, hungerStage starving, exactly once per crossing", () => {
    const world = createSimulationWorld();
    const startBelow = SECOND_HUNGER_HEALTH_LOSS_THRESHOLD_DAYS - 0.01;
    registerFish(world, {
      fish: {
        displayName: "Starver",
        hungerDays: startBelow,
        health: 2,
        hungerStage: "hungry",
        weightGrams: 100,
        species: { kind: "herbivore" },
      },
      position: { x: 0, y: 0.35, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    });
    const wallDt = 0.065;
    const ev = stepHungerTimersWallDelta(world, { wallDeltaSeconds: wallDt });
    const [fish] = [...fishWithKinematics(world)];
    expect(fish!.fish.health).toBe(1);
    expect(fish!.fish.hungerStage).toBe("starving");
    expect(ev).toEqual([{ kind: "fish_became_starving", displayName: "Starver" }]);
    expect(stepHungerTimersWallDelta(world, { wallDeltaSeconds: wallDt })).toEqual([]);
  });

  it("delivers one event per crossing to a subscribed test double", () => {
    const world = createSimulationWorld();
    registerFish(world, {
      fish: {
        displayName: "Toasty",
        hungerDays: FIRST_HUNGER_HEALTH_LOSS_THRESHOLD_DAYS - 1e-6,
        health: 3,
        hungerStage: "healthy",
        weightGrams: 100,
        species: { kind: "herbivore" },
      },
      position: { x: 0, y: 0.35, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    });
    const batches: { kind: string; displayName: string }[][] = [];
    const unsub = subscribeFishHungerMilestoneEvents((events) => {
      batches.push([...events]);
    });
    try {
      const wallDt = 0.001;
      dispatchFishHungerMilestoneEvents(stepHungerTimersWallDelta(world, { wallDeltaSeconds: wallDt }));
      dispatchFishHungerMilestoneEvents(stepHungerTimersWallDelta(world, { wallDeltaSeconds: wallDt }));
      expect(batches).toHaveLength(1);
      expect(batches[0]).toEqual([{ kind: "fish_became_hungry", displayName: "Toasty" }]);
    } finally {
      unsub();
    }
  });

  it("emits one event per fish when two cross the first threshold in the same step", () => {
    const world = createSimulationWorld();
    const edge = FIRST_HUNGER_HEALTH_LOSS_THRESHOLD_DAYS - 0.01;
    for (const name of ["One", "Two"] as const) {
      registerFish(world, {
        fish: {
          displayName: name,
          hungerDays: edge,
          health: 3,
          hungerStage: "healthy",
          weightGrams: 100,
          species: { kind: "herbivore" },
        },
        position: { x: name === "One" ? 0 : 0.1, y: 0.35, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
      });
    }
    const ev = stepHungerTimersWallDelta(world, { wallDeltaSeconds: 0.065 });
    expect(ev).toHaveLength(2);
    expect(ev.map((e) => e.displayName).sort()).toEqual(["One", "Two"]);
  });
});

describe("stepHungerTimersSimDayDelta", () => {
  it("fires hungry then starving in one step when both thresholds are crossed", () => {
    const world = createSimulationWorld();
    registerFish(world, {
      fish: {
        displayName: "Leap",
        hungerDays: 1.0,
        health: 3,
        hungerStage: "healthy",
        weightGrams: 100,
        species: { kind: "herbivore" },
      },
      position: { x: 0, y: 0.35, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    });
    const ev = stepHungerTimersSimDayDelta(world, 2.1);
    const [fish] = [...fishWithKinematics(world)];
    expect(fish!.fish.hungerDays).toBeCloseTo(3.1, 10);
    expect(fish!.fish.health).toBe(1);
    expect(fish!.fish.hungerStage).toBe("starving");
    expect(ev).toEqual([
      { kind: "fish_became_hungry", displayName: "Leap" },
      { kind: "fish_became_starving", displayName: "Leap" },
    ]);
  });
});

describe("resetFishHungerAfterSuccessfulMeal", () => {
  it("sets hungerDays to zero and hungerStage to healthy from hungry", () => {
    const fish = {
      displayName: "A",
      hungerDays: 3.7,
      health: 2 as const,
      hungerStage: "hungry" as const,
      weightGrams: 100,
      species: { kind: "herbivore" as const },
    };
    resetFishHungerAfterSuccessfulMeal(fish);
    expect(fish.hungerDays).toBe(0);
    expect(fish.hungerStage).toBe("healthy");
  });

  it("sets hungerDays to zero and hungerStage to healthy from starving", () => {
    const fish = {
      displayName: "B",
      hungerDays: 4.2,
      health: 1 as const,
      hungerStage: "starving" as const,
      weightGrams: 100,
      species: { kind: "herbivore" as const },
    };
    resetFishHungerAfterSuccessfulMeal(fish);
    expect(fish.hungerDays).toBe(0);
    expect(fish.hungerStage).toBe("healthy");
  });
});
