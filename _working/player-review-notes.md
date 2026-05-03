# Aquarium Player Review Notes

## Session Setup

- Date: 2026-05-03
- Reviewer: Codex (player-perspective pass)
- Goal: evaluate believability and player experience over time
- Runtime: use existing Vite dev server at `http://localhost:5174/`

## Planned Passes

1. Baseline real-time play (first-time player feel)
2. Slow-time inspection (behavioral believability)
3. Stress pass (underfeeding / overfeeding edge behavior)
4. Accelerated-time drift pass (long-run coherence)

## Live Observations

### Pass 1 - Baseline Real-Time

- Fish survival window is very short at default pacing (`dayLengthMs=6500`): repeated deaths in roughly 20-40 seconds of real time.
- Emotional-state progression is readable and believable over time: happy -> neutral -> sad -> dead.
- Status/event messaging tracks temporal changes clearly (hungry, starving, died).
- Core motion looks smooth and plausible at glance-level player observation.
- Major concern: food interaction feedback is unclear from player perspective (hard to tell whether food was eaten or simply disappeared).
- Major concern: starvation pressure appears too aggressive relative to interaction latency.
- Debug controls appeared present but not effectively usable in the browser pass (observed as read-only in pass output), limiting temporal inspection.

### Pass 2 - Food/Behavior Stress

- Confirmed at least one successful eat event in live play (`ate some food`), so fish can seek and consume flakes.
- Even with active feeding, fish frequently returns to starvation quickly and can still die within a short real-time window.
- Temporal loop is understandable (hungry -> starving -> death), but pacing feels punishing relative to player reaction bandwidth.
- Food age/expiry is hard to perceive visually; flakes appear/disappear without obvious lifetime cue.
- The moment-to-moment behavior appears plausible, while the macro survival curve feels overly compressed.

### Pass 3 - First-Time Player UX

- Core action discoverability is weak: no explicit instruction that clicking the aquarium drops food.
- Debug/dev-facing sections are visible in main UX, which competes with player guidance and polish.
- Early failure arrives before players can confidently form a mental model of controls/goals.
- Fish mood/status indicators are visible but not fully self-explanatory for first-time players.
- Pause control is discoverable and useful for inspection.

## Mechanics Cross-Check (Code)

- Starvation pressure is expected from current rules: fish start at health 3 and lose one health at each qualifying midnight without recent meal window coverage.
- Current calendar/hunger setup implies early deaths around the first few simulated days for unfed fish.
- Default pacing (`dayLengthMs=6500`) compresses those day-boundary health checks into short real-time intervals.
- Food lifetime default (`foodLifetimeDays=0.5`) further narrows practical feeding margin.

## Emerging Findings

- Believable: local movement, state transitions, and event stream readability.
- Not yet believable as a player loop: sustainable caretaking is too fragile at default calibration.
- Primary blocker for comprehensive temporal review: default starvation cadence is faster than tool-mediated decision loops.

## New Direction (Requested): AI-Friendly Review + Debug Autoplay

- Scope chosen: **debug-only** autoplay/review tooling (not player-facing yet).
- Design brief written: `_working/ai-review-autoplay-design.md`.
- Recommendation: hybrid deterministic harness with programmable policy + structured telemetry + optional replay.
- Reasoning: this preserves player gameplay while enabling fast reproducible temporal review.

## Implementation Progress (This Session)

- Added `starvationGraceDays` param (default `0`) and wired it into calendar starvation checks.
- Added debug control: **Starvation grace (days)**.
- Added **Apply review preset** button (currently sets: day length 20000 ms, food lifetime 2 days, starvation grace 5 days).
- Added debug autoplay baseline policy (`src/game/autoplay/policy.ts`) with tests.
- Added dev-only **Autoplay review** panel:
  - enable feeding bot
  - decision interval control
  - log count + clear
  - copy JSON log to clipboard
- Autoplay currently performs policy-driven food drops and records action logs for later analysis.

## Immediate Impact on Reviewability

- Agent-driven review no longer depends solely on rapid manual clicking cadence.
- Early starvation pressure can be relaxed without changing production defaults.
- We now have lightweight run artifacts (autoplay logs) to inspect decisions and temporal outcomes.

## Bug Investigation: "Autoplay log = 0"

- Investigated via browser pass and traced behavior to activation workflow confusion, not policy logic failure.
- Root cause: review preset did not guarantee autoplay activation, so runs could start in a non-automated state.
- Fix implemented:
  - review preset now enables autoplay automatically
  - review preset enforces known interval default (400 ms)
  - debug panel now shows explicit autoplay status (`active` / `inactive`)
- Post-fix validation pass:
  - status shows active
  - log entries increment rapidly
  - food appears in tank under autoplay decisions

## Suggestions for "Fun, Addictive" Tuning

- Improve first-session survivability so learning happens before punishment.
- Increase feeding clarity (stronger eat feedback + clearer food lifecycle cues).
- Make progression tension ramp gradually (from care basics -> growth/reproduction -> predator dynamics).
- Use harness metrics to tune pacing objectively (time to first death, save opportunities, event density, growth slope).
