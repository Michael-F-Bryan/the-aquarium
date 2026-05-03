import { afterEach, describe, expect, it, vi } from "vitest";
import { createNewRunSimulationWorld, DEFAULT_SIMULATION_SEED } from "../sim/newRunWorld";
import { serializeRunSnapshot } from "./runSnapshot";
import {
  RUN_SNAPSHOT_STORAGE_KEY,
  loadRunBootstrapFromLocalStorage,
  saveRunSnapshotToLocalStorage,
} from "./runSnapshotStorage";

const initialClock = { paused: false, simDays: 0 };

function mockLocalStorage() {
  let store: Record<string, string> = {};
  const ls = {
    getItem: vi.fn((k: string) => (k in store ? store[k] : null)),
    setItem: vi.fn((k: string, v: string) => {
      store[k] = v;
    }),
    removeItem: vi.fn((k: string) => {
      delete store[k];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  };
  vi.stubGlobal("localStorage", ls as unknown as Storage);
  return { ls, get store() {
    return store;
  } };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("RUN_SNAPSHOT_STORAGE_KEY", () => {
  it("matches design constant", () => {
    expect(RUN_SNAPSHOT_STORAGE_KEY).toBe("the-aquarium.run.v1");
  });
});

describe("loadRunBootstrapFromLocalStorage", () => {
  it("returns new run when key missing", () => {
    mockLocalStorage();
    const got = loadRunBootstrapFromLocalStorage();
    expect(got.runSeed).toBe(DEFAULT_SIMULATION_SEED);
    expect(got.simClockState).toEqual(initialClock);
    expect(got.world.entities).toHaveLength(1);
  });

  it("restores world and clock from valid snapshot", () => {
    const { ls } = mockLocalStorage();
    const world = createNewRunSimulationWorld(99);
    world.entities[0]!.fish!.hungerDays = 1.5;
    const json = JSON.stringify(
      serializeRunSnapshot({
        world,
        simClockState: { paused: true, simDays: 2.25 },
        runSeed: 99,
      }),
    );
    ls.getItem.mockImplementation((k: string) => (k === RUN_SNAPSHOT_STORAGE_KEY ? json : null));

    const got = loadRunBootstrapFromLocalStorage();
    expect(got.runSeed).toBe(99);
    expect(got.simClockState).toEqual({ paused: true, simDays: 2.25 });
    expect(got.world.entities).toHaveLength(1);
    expect(got.world.entities[0]!.fish!.hungerDays).toBe(1.5);
  });

  it("falls back on invalid JSON without throwing", () => {
    const { ls } = mockLocalStorage();
    ls.getItem.mockImplementation((k: string) => (k === RUN_SNAPSHOT_STORAGE_KEY ? "{not-json" : null));

    expect(() => loadRunBootstrapFromLocalStorage()).not.toThrow();
    const got = loadRunBootstrapFromLocalStorage();
    expect(got.runSeed).toBe(DEFAULT_SIMULATION_SEED);
    expect(got.simClockState).toEqual(initialClock);
  });

  it("falls back on InvalidRunSnapshotError", () => {
    const { ls } = mockLocalStorage();
    ls.getItem.mockImplementation((k: string) =>
      k === RUN_SNAPSHOT_STORAGE_KEY ? JSON.stringify({ formatVersion: 999 }) : null,
    );

    const got = loadRunBootstrapFromLocalStorage();
    expect(got.runSeed).toBe(DEFAULT_SIMULATION_SEED);
  });

  it("falls back on bad entity data inside snapshot", () => {
    const { ls } = mockLocalStorage();
    ls.getItem.mockImplementation((k: string) =>
      k === RUN_SNAPSHOT_STORAGE_KEY
        ? JSON.stringify({
            formatVersion: 1,
            simClock: { paused: false, simDays: 0 },
            world: { version: 2, entities: [{ fish: { not: "a fish" } }] },
          })
        : null,
    );

    const got = loadRunBootstrapFromLocalStorage();
    expect(got.world.entities.length).toBeGreaterThanOrEqual(1);
    expect(got.runSeed).toBe(DEFAULT_SIMULATION_SEED);
  });
});

describe("saveRunSnapshotToLocalStorage", () => {
  it("writes JSON envelope for current world", () => {
    const { store } = mockLocalStorage();
    const world = createNewRunSimulationWorld(7);
    saveRunSnapshotToLocalStorage({
      world,
      simClockState: { paused: false, simDays: 3 },
      runSeed: 7,
    });
    const raw = store[RUN_SNAPSHOT_STORAGE_KEY];
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw!);
    expect(parsed.formatVersion).toBe(1);
    expect(parsed.runSeed).toBe(7);
    expect(parsed.simClock.simDays).toBe(3);
  });
});
