# AGENTS Workflow

> [!summary]
> [This repository](https://github.com/Michael-F-Bryan/the-aquarium) uses a coordinator-driven workflow where each GitHub issue maps to one implementation task and one PR. Work is executed milestone-by-milestone, honoring issue dependencies, and each completed milestone is released via a Git tag and GitHub Release.

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
- Dispatches **one implementation sub-agent per issue**, each on its **own git worktree** (never two agents mutating the same worktree). Multiple issues may run in parallel only when each has an isolated worktree and the coordinator can still review/merge safely.
- Reviews PRs for scope correctness and completion criteria.
- Merges completed PRs only after checks pass, then **tidies local git state** (see [Coordinator: merge, `main`, and worktrees](#coordinator-merge-main-and-worktrees)).
- **Improves handoffs over time**: capture recurring sub-agent mistakes (weak verification, missing push, wrong merge order) and fold the smallest effective prompt or checklist change into this file or the next dispatch template—avoid repeating the same blind dispatch cycle.
- Advances milestone state and triggers release actions when complete.

### Implementation sub-agent

- Receives exactly one issue.
- Implements only that issue's scope in one PR.
- Does not silently expand scope; if blocked **on issue scope**, reports and proposes follow-up issues. **Infra failures** (SSH to GitHub, missing MCP) are not scope blockers: finish the branch locally and return a **host unblock** handoff (commit SHA, branch name, exact `git push` / `gh pr create` commands).
- Runs required verification and includes command output summary in PR.
- Ends every run with the **[Sub-agent return contract](#sub-agent-return-contract)** fields in the coordinator thread (and mirrors the same in the PR body where practical).
- Links PR to the issue and updates issue status/checklist as needed.

## Execution loop (per milestone)

1. Identify active milestone and list open issues.
2. Filter for unblocked issues (dependencies satisfied).
3. Assign one issue to one sub-agent **on its own worktree** (see [Coordinator: merge, `main`, and worktrees](#coordinator-merge-main-and-worktrees)).
4. Sub-agent implements issue on a feature branch and opens a PR.
5. Coordinator reviews, requests fixes if needed, and merges when ready.
6. Close issue; **fast-forward `main` and remove the issue’s worktree** after merge; continue until the milestone has no open issues.

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
  - verification commands run and outcomes (paste real output, not “green locally”)
  - **Visual / interaction verification** per [tiered rules](#visual-and-interaction-verification-tiered) when the issue touches UI, 3D, or input
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

See [Visual and interaction verification (tiered)](#visual-and-interaction-verification-tiered) for what counts as adequate proof for HUD, tank, and pointer work.

## Sub-agent return contract

Implementation sub-agents must close every handoff to the coordinator with this structure (unknowns explicit, no vague “done”):

1. **Worktree path** (absolute) and **branch name**
2. **Commit SHA** at handoff time
3. Either **PR URL** (preferred) **or** “not pushed” plus **exact commands** for the coordinator/host to run (`git push -u origin …`, `gh pr create …`), when Git auth from the agent environment is unavailable
4. **`pnpm test` / `pnpm lint` / `pnpm build`** (or scoped equivalents)—paste real output in the PR body, not a paraphrase
5. **Blockers**: only for issue-scope problems; **infra** (SSH, MCP missing) belongs under “Host unblock” with commands, not as a fake blocker

Coordinators should reject handoffs that omit (3) when there is no PR URL.

## Visual and interaction verification (tiered)

Sub-agents must pick an honest **tier** in the PR and coordinator message. **HTTP checks alone** (e.g. `curl` to the dev server) are **not** sufficient for UI, 3D, or input tickets.

| Tier  | When                                                                   | Requirement                                                                                                                                                                                           |
| ----- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A** | Cursor **IDE Browser** (or equivalent) MCP is available in the session | Read MCP tool schemas, then `navigate` → `snapshot` (and a minimal interaction: pause, click tank, etc. as relevant). Summarize what the snapshot showed.                                             |
| **B** | No browser MCP for this workspace                                      | **Manual** pass: run `pnpm dev`, list what was checked, and state clearly **“Browser MCP unavailable—manual only.”** Prefer a short checklist (HUD, tank framing, pointer/pause behavior) over prose. |
| **C** | Pure logic / no player-visible surface                                 | Unit tests alone are acceptable; state **“Tier C”** so reviewers know nothing visual was claimed.                                                                                                     |

**Counterproductive pattern to avoid:** claiming “visual QA” when only a dev-server HTTP status was checked.

**Project setup:** enabling **Cursor IDE Browser** MCP for this repository gives sub-agents a path to Tier A; without it, Tier B must be explicit.

## Coordinator: merge, `main`, and worktrees

After a PR merges:

1. **Confirm on GitHub** the PR is `MERGED` (do not assume from local `git` output alone).
2. **Update local `main`**: `git fetch origin main && git merge --ff-only origin/main` (or equivalent).
3. **Remove the feature worktree** when that issue’s work is integrated: `git worktree remove .worktrees/issue-<n>-<slug> --force` from the primary clone, then delete the local branch if nothing else references it.

**Gotcha:** `gh pr merge … --delete-branch` often exits **non-zero** when the branch is checked out in a **worktree** (remote branch may still be deleted). Treat merge success and local cleanup as **separate steps**: if `gh` reports failure, still verify PR state on GitHub, then run fetch/ff-only and `git worktree remove` in a follow-up shell invocation—do not chain `gh pr merge && git merge` in a way that skips cleanup when `gh` exits 1 only for local branch deletion.

## Continual improvement (coordinators and prompts)

- After each merge (or failed cycle), note **one** concrete sub-agent miss (e.g. “curl passed for visual QA”, “no push recipe”) and add the **smallest** prompt or `AGENTS.md` tweak that would have prevented it.
- Prefer **one variable per iteration** (return contract, tier label, merge checklist) so you know what changed outcomes.
- When the same mistake repeats twice, promote it from dispatch prose into **this file** or a PR template checklist.
- Optional: ask implementers for a single line: *“What one sentence should the next dispatch include?”* and fold good answers into the coordinator template.

## PR review checklist (coordinator)

- Scope matches issue title/body and does not include unrelated work.
- Issue dependencies are satisfied.
- Verification evidence is present and relevant (including **visual tier A/B/C** when UI, 3D, or input changed).
- Sub-agent **return contract** satisfied (PR URL or explicit host push commands + SHA).
- Simulation invariants are preserved for touched systems.
- Follow-up issues were created for intentionally deferred work.
- Post-merge: **`main` fast-forwarded** and **worktree removed** for the merged issue (see [Coordinator: merge, `main`, and worktrees](#coordinator-merge-main-and-worktrees)).

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
