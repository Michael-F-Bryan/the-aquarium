# HUD Icon Baseline (Playable Seed)

This baseline keeps HUD/chrome icons visually consistent while the playable-seed UI is still lightweight.

## Source Strategy

- Use in-repo inline SVG React components (`src/ui/hudIcons.tsx`) for current controls.
- Avoid external icon packages in playable seed unless we need a larger icon surface.
- Export all new icons through the shared module so controls do not invent one-off SVG styles.

## Visual Rules

- Artboard: `24x24`.
- Display size: `16x16` (`h-4 w-4`) inside HUD controls.
- Stroke: `1.75`, round caps, round joins.
- Fill: `none` by default for control/status glyphs.
- Color: inherit text color (`currentColor`), using neutral HUD contrast (`text-neutral-300` on dark chrome).
- Spacing: icon + text use inline row with `gap-2`.

## Usage Rules

- Keep text labels; icons assist recognition and should not replace readable labels.
- Set decorative HUD icons to `aria-hidden="true"` and keep accessible naming on the parent control.
- Reuse the shared icon module for top-level controls (`Day`, `Score`, `Event log`, `Pause/Resume`).

## Export / Review Checklist

- [ ] Icon authored on `24x24` viewBox.
- [ ] Stroke-only path at `1.75` with round caps/joins.
- [ ] Rendered at `16x16` in HUD.
- [ ] Uses `currentColor` and passes dark-background contrast.
- [ ] Added to `src/ui/hudIcons.tsx` (no ad-hoc inline SVG in feature files).
- [ ] Parent control keeps an explicit accessible label.
