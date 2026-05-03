# AGENTS Workflow

> [!summary]
> This repository uses a coordinator-driven workflow where each GitHub issue maps to one implementation task and one PR. Work is executed milestone-by-milestone, honoring issue dependencies, and each completed milestone is released via a Git tag and GitHub Release.

## Source of truth

- GitHub Milestones represent planned releases (`Release 0` through `Release 5`).
- GitHub Issues under each milestone are the task backlog.
- Native issue dependencies determine execution order.
- Issue title and body are the canonical scope for implementation.

## Read docs first

- Read `docs/the-game.md` before gameplay changes; it defines intended player-facing behavior and game feel.
- Read `docs/implementation-decisions.md` before structural changes; it defines key technical constraints and architecture choices.
- If code, issue scope, and docs conflict, do not guess: raise/assign a clarification issue and block dependent implementation until resolved.
- If behavior changes materially, update the relevant document in the same PR when in scope; otherwise create a follow-up docs issue.

## Repo map (working assumptions)

- `src/sim/`: ECS entities, systems, tick pipeline, gameplay rules.
- `src/render/`: scene graph and visual mapping from simulation state.
- `src/ui/`: HUD, toasts, controls, upgrade panels, player-facing overlays.
- `src/persistence/`: save/load serialization and restore plumbing.
- `src/*.tsx` root files may still be in template form early on; create folders above as needed.

## Roles

### Coordinator agent

- Owns planning and orchestration for the current milestone.
- Selects issues that are ready (open + unblocked).
- Dispatches one sub-agent per issue.
- Reviews PRs for scope correctness and completion criteria.
- Merges completed PRs only after checks pass.
- Advances milestone state and triggers release actions when complete.

### Implementation sub-agent

- Receives exactly one issue.
- Implements only that issue's scope in one PR.
- Does not silently expand scope; if blocked, reports and proposes follow-up issues.
- Runs required verification and includes command output summary in PR.
- Links PR to the issue and updates issue status/checklist as needed.

## Execution loop (per milestone)

1. Identify active milestone and list open issues.
2. Filter for unblocked issues (dependencies satisfied).
3. Assign one issue to one sub-agent.
4. Sub-agent implements issue on a feature branch and opens a PR.
5. Coordinator reviews, requests fixes if needed, and merges when ready.
6. Close issue and continue until milestone has no open issues.

## Dependency semantics

- `Depends on` means blocked: do not start implementation until all dependencies are done.
- `Related to` means contextual link only: implementation can proceed independently.
- If a dependency is closed but behavior is missing/regressed, reopen or create a blocker issue before continuing.

## Branch and PR conventions

- Branch naming: `issue-<number>-<short-slug>`.
- PR title should start with issue reference, e.g. `#42 Add day counter tick in HUD`.
- PR description should include:
  - linked issue
  - concise change summary
  - verification commands run and outcomes
  - any follow-up issues created

## Simulation invariants (must not break)

- Simulation state is authoritative; rendering/UI state is derived.
- Rendering code must not write gameplay outcomes back into simulation state.
- Keep deterministic behavior where expected (especially seeded RNG and ordered system phases).
- Preserve stable tick ordering for interaction-heavy systems (targeting -> movement -> interactions -> vitals/events).
- Pause/save/resume paths must not duplicate or skip irreversible gameplay outcomes.

## Scope control rules

- One issue = one PR.
- No opportunistic refactors unless required for the issue.
- If dependency or missing prerequisite is discovered:
  - stop broadening the PR
  - create/propose a new issue
  - mark current issue blocked when appropriate

## When to open a follow-up issue

- A required prerequisite is missing and would substantially expand current PR scope.
- Fixing discovered behavior would touch a different milestone's acceptance criteria.
- A refactor is desirable but not required to complete the current issue.
- Balancing/tuning work emerges that cannot be verified within current ticket boundaries.

## Verification baseline

For implementation issues, run at minimum:

- `pnpm lint`
- targeted tests relevant to changed behavior

If tests are not available for that behavior yet, add them when practical within issue scope.

For gameplay-mechanic tickets, also verify:

- in-game behavior for the changed mechanic (not just unit tests),
- relevant event/toast output when user-facing messaging is impacted,
- no obvious regression in pause/save/resume for affected systems.

## PR review checklist (coordinator)

- Scope matches issue title/body and does not include unrelated work.
- Issue dependencies are satisfied.
- Verification evidence is present and relevant.
- Simulation invariants are preserved for touched systems.
- Follow-up issues were created for intentionally deferred work.

## Milestone completion and release

When a milestone is complete:

1. Verify all milestone issues are closed.
2. Ensure `main` is green.
3. Tag the release commit.
4. Publish a GitHub Release for that tag with milestone notes.

Milestone close checklist:

- Milestone has zero open issues.
- All dependency blockers inside the milestone are resolved.
- GitHub Pages deployment is healthy for the release commit.
- Release notes include shipped player-facing changes and known non-blockers.

Use this pattern:

- Tag: `v<major>.<minor>.<patch>` (default)
- Release title: milestone name
- Release notes: summary of shipped issues, notable fixes, known non-blockers

## Guardrails

- Never push directly to `main`; use PRs.
- Never merge with unresolved blockers.
- Never mark work complete without verification evidence.
