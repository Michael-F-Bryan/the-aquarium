# AI-Friendly Review and Autoplay Design (Debug-Only)

## Context and Problem

The current game loop is real-time (`requestAnimationFrame` driven) with starvation/feeding windows tuned tightly enough that tool-mediated play and inspection can miss critical events. This makes deep temporal review hard, even when mechanics are functioning.

From player-review passes:

- The local behavior loop (movement, hunger states, events) is understandable.
- Survival pacing feels compressed under default values.
- First-time UX and feedback clarity are weaker than simulation fidelity.
- Review quality is limited by "interaction latency vs game clock."

## Objectives

1. Make simulation review deterministic and automatable in debug mode.
2. Remove real-time pressure from agent-based evaluation.
3. Produce evidence artifacts (logs, summaries, optional replay events) for post-run analysis.
4. Preserve player-facing gameplay semantics; debug tools must not alter production behavior by accident.
5. Feed insights back into "fun/addictive" tuning (engagement loops, clarity, pacing).

## Non-Goals

- Do not ship autoplay as a player-facing feature now.
- Do not replace current input/render architecture for normal play.
- Do not overfit the game to AI-only success metrics.

## Approaches

### Approach A: Parameter-Only Accessibility Pass

Add a debug preset that slows time and extends food lifetime (plus optional temporary starvation grace).

Pros:

- Very fast to build.
- Immediate review improvement.

Cons:

- Still tied to realtime and click timing.
- No reproducible scripted runs.
- Weak long-horizon analysis and regression detection.

### Approach B: Fully Headless Simulator Harness

Create a Node/Vitest-style simulation runner that executes `update()` in fixed ticks and drives actions via policy code (drop food decisions).

Pros:

- Deterministic, fast, repeatable.
- Great for batch scenarios and regression tracking.

Cons:

- Harder to connect directly to "what looked believable" in visuals.
- Requires additional tooling to inspect outputs.

### Approach C (Recommended): Hybrid Debug Harness + Event Recorder

Keep normal game loop unchanged. Add a debug-only "review harness" that can:

1) run fixed-step simulation with policy-driven actions,
2) collect structured metrics/events, and
3) optionally replay action timeline in UI for visual inspection.

Pros:

- Deterministic automation and visual validation.
- Minimal risk to production gameplay loop.
- Best fit for iterative "review -> tune -> rerun" workflow.

Cons:

- More work than A.
- Requires clear boundaries between game core and debug harness.

## Recommended Architecture (Approach C)

### 1) Policy Boundary (Programmable "Bot Brain")

Create a small interface in debug tooling:

- `AutoplayPolicy.decide(input) -> Action[]`
- Input includes current state snapshot, recent events, and elapsed tick/day.
- Actions initially support:
  - `drop_food_at({x, y})`
  - `drop_food_near_fish({fishId, radius})`
  - `no_op`

Start with 2 built-in policies:

- `nearestHungryFishPolicy` (simple baseline)
- `riskAwarePolicy` (prioritizes low-health hungry fish; throttles spam)

### 2) Fixed-Step Runner

Add debug runner module that:

- Advances sim in fixed `deltaMs` slices (for example 100 ms).
- Applies policy actions on a separate cadence (for example every 250-500 ms).
- Uses existing mechanics (`update`, `dropFlakeFood`) to avoid logic forks.
- Can run for N simulated days rapidly without UI interaction.

### 3) Structured Telemetry

Emit run artifacts under `_working/` or debug export:

- Run metadata (seed, params, policy, tick sizes, duration).
- Time-series snapshots every K ticks:
  - live fish count
  - dead fish count
  - average health
  - hunger-state counts
  - biomass and score
  - food count
- Event ledger:
  - `ate_flake`, `fish_hunger`, `fish_died`, `fish_born`, `prey_eaten`
- Derived KPIs:
  - survival curve
  - mean time to first death
  - meals per fish/day
  - starvation events per day
  - reproduction cadence

### 4) Replay-Friendly Action Log

Store each policy action with simulation timestamp:

- Enables deterministic rerun and optional UI replay mode.
- Lets reviewers inspect "why fish died" with exact context.

### 5) Debug UI Additions (Dev Only)

Add a compact panel gated by `import.meta.env.DEV`:

- Toggle autoplay on/off
- Select policy
- Configure run horizon (sim days)
- Configure tick sizes
- Start/Stop run
- Export log JSON
- Optional "playback mode" toggle

Do not expose these controls in production builds.

## Implementation Plan (For Next Agent)

### Phase 1: Immediate Review Unblock

1. Add "Review Preset" button:
   - slower day length
   - longer food lifetime
   - optional initial starvation grace (first X days)
2. Add one-click reset to defaults.

Outcome: humans/agents can inspect behavior without rapid collapse.

Status update (implemented):

- `starvationGraceDays` is now part of params and starvation checks.
- Debug panel includes starvation grace control.
- A one-click review preset is available in debug controls.

### Phase 2: Deterministic Autoplay Harness

1. Add `autoplay/` debug modules:
   - policy interface
   - baseline policies
   - fixed-step runner
   - telemetry collector
2. Add deterministic seed control in runner inputs.
3. Add JSON export for run artifacts.

Outcome: repeatable non-realtime evaluation.

Status update (partially implemented):

- Baseline policy module exists (`chooseAutoplayFoodDrop`) with tests.
- Dev-only autoplay controls now run policy decisions on a configurable interval.
- Action logs can be copied to JSON from the UI.
- Review preset now auto-enables autoplay and sets a stable decision interval.
- Remaining gap: true fixed-step offline runner and seed-controlled scenario batches.

### Phase 3: Replay and Review Workflow

1. Add optional replay timeline in dev UI.
2. Add scenario presets:
   - underfeeding stress
   - overfeeding clutter
   - reproduction growth
   - carnivore pressure
3. Add "compare two runs" utility (same seed, different params/policy).

Outcome: evidence-based tuning loop.

## Suggested File/Module Boundaries

- `src/game/autoplay/types.ts` - policy/action/input contracts
- `src/game/autoplay/policies/*.ts` - built-in policies
- `src/game/autoplay/runner.ts` - fixed-step execution
- `src/game/autoplay/telemetry.ts` - metric/event capture
- `src/components/left-panel/AutoplayDebugSection.tsx` - dev controls
- `src/game/autoplay/scenarios.ts` - scenario presets

Keep core mechanics files unchanged except for small safe extension points.

## Validation Strategy

1. Unit-test policy decisions for representative states.
2. Determinism test: same seed + params + policy yields identical event stream.
3. Sanity KPI tests for each scenario (for example first-death window expected range).
4. Manual replay check: sampled run should visually match logged transitions.

## Player-Fun Tuning Guidance (Using Harness Outputs)

Target outcomes for a fun/addictive loop:

- Early game should teach before punishing (no abrupt unavoidable early death).
- Feeding should feel rewarding and legible (clear consume feedback + predictable effect).
- Mid-game should create escalating but fair tension (more fish, reproduction choices, carnivore tradeoffs).
- Failures should feel attributable (player can explain why fish died).

Metrics to watch while tuning:

- Time-to-first-failure distribution for new-game runs.
- Number of "near-miss saves" (low health fish recovered by timely feeding).
- Event readability density (not too sparse, not spammy).
- Growth trajectory (biomass/score over first 10-20 simulated days).

## Risks and Mitigations

- Risk: debug harness diverges from real gameplay.
  - Mitigation: route all state transitions through existing `update` and mechanics.
- Risk: AI policy optimizes non-fun behavior.
  - Mitigation: keep policy debug-only and evaluate against player-centric KPIs.
- Risk: debug UI clutter leaks into player UX.
  - Mitigation: strict dev gating and isolated panel.
