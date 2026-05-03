/**
 * HUD slot for score. Displays static placeholder text until scoring ships in a later release.
 */
export function ScorePlaceholder() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Score placeholder"
      className="rounded-md border border-neutral-600 bg-neutral-900/90 px-3 py-1.5 text-sm font-medium tabular-nums tracking-wide text-neutral-100 shadow-sm backdrop-blur-sm"
    >
      <span className="text-neutral-300">Score</span>
      <span className="ml-2 font-semibold text-neutral-100">—</span>
    </div>
  );
}
