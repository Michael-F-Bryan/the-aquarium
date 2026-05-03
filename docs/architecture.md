# Architecture

The app has one production simulation path:

`App` -> `stepAppRuntime` -> `runSimulationStep` -> ECS systems -> R3F render.

## Runtime

`src/App.tsx` owns browser state: React state, animation frames, pause state,
autosave, toasts, and dev-only controls. It holds a stable
`useRef<AquariumRuntime>` for the simulation kernel (Miniplex world + singleton
simulation entity). Each frame drains queued commands and calls `stepAppRuntime`
from `src/game/appRuntime.ts`.

`stepAppRuntime` is the app composition boundary. It merges the current R3F
world size into `Params`, forwards commands into the ECS schedule, and returns
command outcomes with their UI metadata preserved.

## Schedule

`src/game/ecs/schedule.ts` is the authoritative simulation entrypoint. Commands
are applied before scheduled systems, then systems run in a fixed deterministic
order. The order is covered by `src/game/ecs/schedule.test.ts` because changing
it changes gameplay.

The ECS **world is long-lived** for a session. `createInitialAquariumRuntime` and
`hydrateAquariumRuntimeFromPayload` (`src/game/ecs/world.ts`) populate entities
once; each tick calls `syncAquariumRuntimeForStep` to update clock fields on the
simulation entity, clears the per-step `events` buffer, then runs systems.
**GameSnapshotPayload** (`src/game/types.ts`) is the DTO: the same field layout
as snapshot JSON `state`. Selectors such as `selectGameSnapshotPayload` project
the world into that shape for React, dev tools, and persistence—without feeding
that object back into the step function as an alternate authority.

Runtime entities use **fine-grained Miniplex keys** (see `src/game/ecs/components.ts`
and `entityAssembly.ts`): e.g. `fishIdentity`, `fishBody`, `fishMetabolism`,
`fishAppearance`, `fishPhysics`, and `tagLive` for live fish; dead fish add
`deadFishMeta` and omit `tagLive`; food uses `foodIdentity` + `foodPhysics`;
skeletons use `skeletonIdentity` + `skeletonPhysics`. Aggregate `Fish` / `Food`
records exist at the DTO boundary and in assembly helpers, not as a single
`fish` blob on entities.

## Commands

Player input and dev autoplay enqueue `SimulationCommand` values instead of
mutating the read model from the UI. Command application lives in
`src/game/ecs/commands.ts` and operates on `AquariumRuntime` (e.g. flake drops via
`src/game/ecs/applyFoodDrop.ts`). It runs before systems so the rest of the step
sees a coherent world.

## Rendering

`src/components/aquarium-r3f` is the only production renderer. It translates
pointer events into logical aquarium coordinates, publishes the current canvas
size, and renders the per-step read model through React Three Fiber.

`src/game/render/fishPresentation.ts` contains renderer-neutral presentation
math and sprite metadata. It is shared by R3F components and tests; it is not a
simulation boundary.

## Persistence And Dev State

Snapshots use `src/game/snapshot.ts` schema v3: `{ schemaVersion, state }`.
The `state` object is typed as **GameSnapshotPayload**. Snapshots are strict at
the persisted boundary and reject malformed payloads before they reach the
runtime.

Autosaves use `src/game/autosave.ts` bundle schema v1. The bundle stores the
snapshot, merged runtime params, and an optional JPEG thumbnail captured from
the R3F canvas. Loading an autosave hydrates the runtime ref, updates React read
model and params, clears any queued commands, and resumes with the normal app
runtime.

Dev snapshot controls are available only in Vite dev builds. Loading a dev
snapshot goes through the same snapshot parser and hydrate flow as other loads.

## Side Effects

Simulation modules are pure TypeScript and do not touch browser APIs. Browser
side effects stay in React components: animation frames, localStorage,
clipboard, canvas capture, DOM sizing, and toasts. This keeps the simulation
testable and makes persisted-state boundaries explicit.
