# Implementation Decisions

> [!summary]
> We are building The Aquarium as a browser game with a modern TypeScript + React stack, real-time 3D rendering, and ECS-based simulation logic. These choices prioritize fast iteration, predictable game-state behavior, and long-term maintainability as the simulation grows. This note captures current decisions and the open technical questions we still need to resolve.

## Confirmed stack choices

### 1) `TypeScript` for the whole codebase

We are choosing [[TypeScript]] as the default language for both gameplay logic and UI code.

Why this choice:
- A simulation game accumulates lots of state and rules; static typing catches incorrect assumptions early.
- Shared types between UI and simulation reduce integration bugs as systems evolve.
- Refactoring core systems (feeding, breeding, predation, scoring) is safer when contracts are explicit.

How it helps the game:
- Increases confidence when changing balancing logic and entity behavior.
- Reduces production-only bugs caused by shape mismatches in state objects.
- Makes onboarding easier as the project grows.

### 2) `React` for app and UI composition

We are choosing [[React]] for shell UI, overlays, panels, controls, and game HUD.

Why this choice:
- Component composition maps well to modular game UI (score, toasts, upgrades, pause, save state).
- Strong ecosystem and team familiarity improve delivery speed.
- Declarative state-driven rendering fits dynamic UI updates from the simulation.

How it helps the game:
- Keeps UI changes fast and isolated without coupling deeply to simulation internals.
- Makes it easier to ship new panels/features (e.g., feeder controls, upgrade previews).
- Supports readable boundaries between interface and core game systems.

### 3) `Tailwind CSS` for styling

We are choosing [[Tailwind CSS]] for styling and design tokens in UI layers.

Why this choice:
- Utility classes make it fast to iterate on HUD/UI polish.
- Consistent spacing/color/type scales reduce style drift over time.
- Works well for responsive and layered interfaces over a rendered scene.

How it helps the game:
- Faster visual iteration for gameplay feedback surfaces (toasts, warnings, upgrade affordances).
- Cleaner consistency across panels as the UI footprint expands.
- Lower CSS maintenance overhead.

### 4) `React Three Fiber` for rendering

We are choosing [[React Three Fiber]] as the scene/rendering layer for fish tank visuals.

Why this choice:
- It bridges [[React]] patterns with `three.js` rendering power.
- Easier integration between game state and visual representation.
- Mature ecosystem for cameras, lighting, materials, and animation helpers.

How it helps the game:
- Enables expressive, performant tank visuals while keeping React-native workflows.
- Makes it easier to map ECS state to rendered entities.
- Supports future visual depth (lighting/day-night transitions, effects, richer fish presentation).

### 5) `Vitest` for test-driven development

We are choosing [[Vitest]] as the primary test runner and TDD workflow tool.

Why this choice:
- Fast feedback loop for simulation rule tests and utility tests.
- Native TypeScript support with modern DX.
- Works well for both unit tests and small integration tests around gameplay systems.

How it helps the game:
- Allows balance-sensitive logic (hunger thresholds, breeding rules, scoring) to be protected by tests.
- Prevents regressions when tuning systems and adding upgrades.
- Encourages writing behavior as explicit specifications before implementation.

### 6) `Miniplex` ECS for simulation architecture

We are choosing [[Miniplex]] to implement an [[Entity Component System|ECS]] architecture for core game simulation.

Why this choice:
- Game behavior is naturally entity-driven (fish, food, corpses, effects, timers).
- ECS decomposition encourages clear system boundaries and composable behavior.
- Helps avoid brittle inheritance-heavy models as mechanics expand.

How it helps the game:
- Supports adding new mechanics (mutations, upgrades, behaviors) with less coupling.
- Keeps per-frame/per-tick logic organized by system responsibility.
- Improves maintainability and testability of simulation logic.

---

## Implementation decisions from open questions

### 7) Time model: `variable timestep` simulation

Decision:
- Use a variable timestep (`dt`) simulation loop for core world updates.
- Clamp `dt` to a max threshold per tick to avoid extreme jumps after stalls.

Why:
- Matches your preference to avoid hard coupling simulation speed to frame rate.
- Keeps implementation lightweight in early-stage development.

How it helps the game:
- Runs smoothly across hardware tiers without forcing strict fixed-step plumbing.
- Preserves predictable behavior by clamping large frame spikes.

### 8) ECS scheduling: deterministic phased pipeline

Decision:
- Use a deterministic ordered pipeline with explicit phases each tick:
  1. `input/commands`
  2. `perception/targeting`
  3. `movement`
  4. `interactions` (eat/predation/collisions)
  5. `vitals` (hunger/health/death)
  6. `reproduction`
  7. `scoring/biomass`
  8. `events/toasts`

Why:
- You asked for deterministic behavior that stays maintainable and testable.
- Phase boundaries make causality easy to reason about.

How it helps the game:
- Reduces order-dependent bugs.
- Makes simulation outcomes reproducible and simpler to test.

### 9) Background behavior: pause + bounded catch-up on resume

Decision:
- Do not simulate continuously in background tabs.
- On resume, run a bounded catch-up step for elapsed time with a maximum catch-up budget. Show a progress bar while catching up.

Why:
- Matches your performance and battery preference.
- Prevents huge CPU spikes after long inactivity.

How it helps the game:
- Better laptop/mobile behavior.
- Keeps progression believable without burning resources off-screen.

### 10) Persistence: `localStorage` snapshot first, no migration policy yet

Decision:
- Use `localStorage` JSON snapshots as the initial save system.
- Save at dawn tick and on important lifecycle events (pause/unload).
- Skip versioned migrations for now; allow save resets if schema changes during early development.

Why:
- You prioritized convenience over polish and backward compatibility at this stage.

How it helps the game:
- Fastest path to reliable saves with minimal implementation overhead.
- Keeps focus on gameplay iteration.

### 11) State separation: simulation-authoritative, render-derived

Decision:
- Keep ECS simulation state as the single source of truth.
- Maintain lightweight render state as derived/transient interpolation data only.
- Never write gameplay outcomes from render/interpolation layers back into ECS state.

Why:
- Clear separation prevents visual concerns from corrupting deterministic rules.

How it helps the game:
- Lower jitter risk and fewer feedback-loop bugs.
- Cleaner testability because gameplay logic stays pure.

### 12) Test strategy: simulation unit tests + rendering system tests

Decision:
- Unit tests cover simulation systems and rule boundaries (hunger, feeding, breeding, predation, scoring, biomass).
- System-level tests cover render integration behavior and interaction flow.
- CI required checks: lint + unit tests on every PR; rendering/system tests can run on PRs and nightly if runtime grows.

Why:
- Matches your requested split between simulation-focused unit tests and rendering-focused system tests.

How it helps the game:
- Protects core mechanics from regressions while still validating user-visible behavior.

### 13) Performance targets and instrumentation (initial)

Decision:
- Initial targets:
  - ~200 active fish entities at 60 FPS on a typical laptop.
  - Main thread frame budget under ~16 ms at target load.
  - Avoid unbounded memory growth over 30+ minutes of simulation.
- Instrumentation first:
  - lightweight frame-time and entity-count overlays in dev mode,
  - simple timing around major ECS phases,
  - periodic memory usage sampling where available.

Why:
- Early budgets give guardrails without over-engineering.

How it helps the game:
- Lets us catch performance regressions while mechanics evolve.
- Keeps tuning grounded in data, not guesswork.

### 14) Upgrade definitions: data-driven config in TypeScript

Decision:
- Model upgrades as data-driven definitions (typed config objects), not hardcoded behavior branches spread through systems.
- Systems consume upgrade effects through a small, stable read API.

Why:
- Easier balance iteration and safer expansion as upgrade count grows.

How it helps the game:
- Faster tuning and cleaner diffs.
- Lower risk when adding or adjusting upgrade tiers.

### 15) RNG strategy: seeded deterministic RNG per run

Decision:
- Use a seeded deterministic RNG stream for each run/save.
- Persist seed and RNG state in save snapshots.
- Expose seed in dev tooling for replay/debug reproduction.

Why:
- Matches your explicit replay/debug reproducibility goal.

How it helps the game:
- Reproducible bug reports and deterministic test scenarios.
- More reliable balancing experiments.

### 16) Input architecture: centralized interaction gateway

Decision:
- Route scene clicks through a single interaction gateway that resolves intent by priority:
  1. modal/UI capture,
  2. HUD controls,
  3. world interaction (drop food).
- UI overlays must explicitly declare pointer capture behavior.

Why:
- Prevents conflicting click handling between 3D scene and layered UI.

How it helps the game:
- Fewer edge-case input bugs.
- More predictable controls as UI complexity grows.

### 17) Playable-seed in-tank sprite direction

Decision:
- Keep the in-tank visual pass procedural for Release 0 (R3F primitives + generated textures), with no external art pipeline dependency yet.
- Use consistent silhouette language:
  - fish as layered body + fin + eye forms,
  - food as flattened flake shards,
  - floor as a low-contrast rippled seabed texture.
- Reserve stronger color contrast for fish and food, while floor values stay darker to preserve readability at a glance.

Why:
- The playable seed needs coherent visuals now, but introducing external sprite/atlas tooling this early would slow iteration.
- Procedural assets keep implementation inside the existing TypeScript/R3F stack and make style adjustments cheap.

How it helps the game:
- Improves readability at default camera framing and common entity densities.
- Gives future tickets concrete constraints for visual additions:
  - avoid render-to-sim writes,
  - preserve fish-vs-food silhouette contrast,
  - keep floor/background subdued relative to gameplay entities,
  - prefer reusable palette constants over ad-hoc per-component colors.

