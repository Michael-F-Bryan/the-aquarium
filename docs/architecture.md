# Architecture

The app has one production simulation path:

`App` -> `stepAppRuntime` -> `runSimulationStep` -> ECS systems -> R3F render.

## Runtime

`src/App.tsx` owns browser state: React state, animation frames, pause state,
autosave, toasts, and dev-only controls. It does not run mechanics directly.
Each frame drains queued commands and calls `stepAppRuntime` from
`src/game/appRuntime.ts`.

`stepAppRuntime` is the app composition boundary. It merges the current R3F
world size into `Params`, forwards commands into the ECS schedule, and returns
command outcomes with their UI metadata preserved.

## Schedule

`src/game/ecs/schedule.ts` is the authoritative simulation entrypoint. Commands
are applied before scheduled systems, then systems run in a fixed deterministic
order. The order is covered by `src/game/ecs/schedule.test.ts` because changing
it changes gameplay.

ECS state is short-lived. `createAquariumRuntime` clones the persisted `State`
into a Miniplex world for one step. Selectors project the world back into the
serializable `State` shape used by React, snapshots, and autosave.

## Commands

Player input and dev autoplay enqueue `SimulationCommand` values instead of
mutating state from the UI. Command application lives in
`src/game/ecs/commands.ts`; it is intentionally small and runs before systems so
the rest of the step sees a coherent world.

## Rendering

`src/components/aquarium-r3f` is the only production renderer. It translates
pointer events into logical aquarium coordinates, publishes the current canvas
size, and renders the serializable game state through React Three Fiber.

`src/game/render/fishPresentation.ts` contains renderer-neutral presentation
math and sprite metadata. It is shared by R3F components and tests; it is not a
simulation boundary.

## Persistence And Dev State

Snapshots use `src/game/snapshot.ts` schema v3: `{ schemaVersion, state }`.
Snapshots are strict at the persisted-state boundary and reject malformed state
before it reaches the runtime.

Autosaves use `src/game/autosave.ts` bundle schema v1. The bundle stores the
snapshot, merged runtime params, and an optional JPEG thumbnail captured from
the R3F canvas. Loading an autosave replaces React state and params, clears any
queued commands, and resumes with the normal app runtime.

Dev snapshot controls are available only in Vite dev builds. Loading a dev
snapshot goes through the same snapshot parser and replacement flow as other
state loads.

## Legacy Mechanics

`src/game/mechanics` contains pre-ECS reference mechanics. Except for
`foodDrop.ts`, which is still used as the command boundary for player food
drops, those modules are retained only for parity tests while the migration is
settled. Production code should enter through `src/game/appRuntime.ts` or
`src/game/ecs/schedule.ts`; ESLint blocks production imports from the parity
modules.

## Side Effects

Simulation modules are pure TypeScript and do not touch browser APIs. Browser
side effects stay in React components: animation frames, localStorage,
clipboard, canvas capture, DOM sizing, and toasts. This keeps mechanics testable
and makes persisted-state boundaries explicit.
