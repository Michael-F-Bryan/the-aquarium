# Issue #165 Review: App Chrome, HUD, and Sprites/Icons

## Scope and method

- Issue: `#165`
- Review mode: **Tier B** (**Browser MCP unavailable—manual only.**)
- Environment: `pnpm dev` on local worktree branch `issue-165-ui-review`
- Evidence sources:
  - Runtime startup and local shell/manual notes
  - Source review of `src/App.tsx`, `src/tank/TankScene.tsx`, `src/tank/FishMeshesFromWorld.tsx`, `src/tank/FoodMeshesFromWorld.tsx`, and HUD shell components

## Desktop and narrow-width notes

- **Desktop width note:** Current shell presents a single full-screen tank surface with a compact top-right HUD stack. The documented four-region layout from `README.md` (header, left sidebar, center canvas, right sidebar) is not yet represented in the shipped shell.
- **Narrow width note:** Because the shell currently uses one overlay cluster and no dedicated sidebars, responsive behavior avoids grid breakage for now, but does not meet intended information hierarchy for playable-seed chrome.
- **Canvas sizing risk note:** The report that canvas can appear around ~150px tall is plausible with the current structure because the shell relies on `min-h-dvh` rather than an explicit fixed-height viewport contract, while the `Canvas` itself depends on parent height (`h-full`).

## Evaluation against criteria

1. **Viewport and canvas dominance** - **Should**
   - Tank is visually dominant today, but sizing contract is fragile and can collapse if parent height is not explicit.
2. **Chrome layout vs. product intent** - **Blocker**
   - `README.md` describes header + two sidebars + center canvas; current UI is an overlay stack instead.
3. **Information hierarchy** - **Should**
   - Day and score are present, but biomass and structured status surfaces are absent in chrome.
4. **Simulation readability** - **Should**
   - Tank remains readable in current minimalist shell, but no structural containment keeps overlays from competing with playfield as HUD grows.
5. **Interaction clarity** - **Should**
   - Pause button and paused status are clear; pointer routing for feed clicks is intentionally isolated (`TankDropFoodSurface`) and consistent with architecture guidance.
6. **Responsive / resize behavior** - **Should**
   - Current simple layout avoids obvious grid collapse but does not satisfy intended regioned composition, especially for future lists/panels.
7. **Consistency with stack decisions** - **Should**
   - Tailwind and pointer capture boundaries are aligned with `docs/implementation-decisions.md`, but product-intent layout in `README.md` is not yet reflected.
8. **Accessibility baseline** - **Should**
   - Existing status surfaces use `role=status`/`aria-live`; event log uses `role=log`. Keyboard pause path (`Escape`) should be validated and documented with the full pause modal flow.
9. **Sprites and icons** - **Blocker** (for playable-seed feel)
   - Fish and food are placeholder primitives (sphere meshes with flat materials), and HUD controls are text-only with no consistent icon language. This is functionally valid but visually below playable-seed goals.

## Prioritized recommendations

### Blockers

- **B1 - Fix canvas sizing contract and viewport ownership**
  - Define explicit viewport height ownership for shell/canvas region.
  - Ensure no path leaves R3F canvas without a concrete parent height.
- **B2 - Introduce playable-seed sprite/icon baseline**
  - Replace primitive fish/food stand-ins with consistent readable sprite forms (or equivalent mesh language) and define a minimal icon set for HUD controls.

### Should

- **S1 - Implement documented chrome regions**
  - Add header + left summary rail + central canvas + right fish/status rail matching `README.md` intent.
- **S2 - Harden responsive behavior**
  - Define desktop vs. narrow breakpoints, panel collapse/stack rules, and explicit scroll ownership.
- **S3 - Formalize interaction/accessibility checks**
  - Validate pause keyboard path, focus movement for overlays/modals, and toast/live-region behavior under rapid events.

### Nice

- **N1 - Add lightweight UI asset/style guide**
  - Document sprite/icon source-of-truth, scale/export rules, and naming so follow-on tickets avoid style drift.

## Keep vs change

- **Keep**
  - Simulation-authoritative render boundary and pointer routing approach.
  - Existing live-region semantics in shell placeholders.
- **Change**
  - Shell structure to match intended four-region chrome.
  - Canvas height contract to eliminate fixed-height regressions.
  - Placeholder sprite/icon presentation to reach playable-seed visual clarity.

## Backlog tracking

All follow-ups were created under milestone **Release 0 - Playable Seed**:

- **Blocker**
  - `#176` - Canvas sizing contract for full-viewport tank stage
  - `#178` - Ship playable-seed sprite pass for fish, food, and tank floor
- **Should**
  - `#177` - Implement README-aligned chrome layout and responsive panel rules
- **Nice**
  - `#179` - Standardize HUD icon set and asset export rules
