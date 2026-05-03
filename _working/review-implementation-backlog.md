# Review Enablement Backlog

## P0 (Immediate)

- Build deterministic fixed-step simulation runner (no `requestAnimationFrame` dependence).
- Add seed control + scenario presets for reproducible long-run comparisons.
- Emit machine-readable run report (JSON) with:
  - event stream
  - daily summary snapshots
  - survival and growth KPIs
- Add explicit in-UI automation run status (running, paused, completed, failed).

## P1 (High Impact for Fun Tuning)

- Add daily trend widgets in dev panel:
  - live fish, dead fish, biomass, avg health, hunger counts, food count
- Add clear "why fish died" attribution surfaced to reviewer.
- Add visual food lifecycle cues (fresh -> aging -> expiring) for stronger player mental model.
- Add progression pacing controls (early/mid/late presets) to compare engagement curves quickly.

## P2 (Quality and Scalability)

- Add side-by-side run diff viewer (same seed, different params/policies).
- Export run bundle that includes:
  - params
  - automation policy config
  - summary metrics
  - action log
- Add replay timeline scrubber driven by recorded actions + snapshots.
- Add automated scenario assertions (e.g., min survival day, max starvation spikes).

## Fun/Addictive Success Criteria

- New players survive long enough to learn controls before first major failure.
- Feeding cadence creates recurring micro-tension and relief (not constant panic, not idle autopilot).
- Mid-game introduces distinct decisions beyond routine feeding.
- Failures are legible and attributable, encouraging retry instead of confusion.
