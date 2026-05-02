/** Small fork-and-knife mark shown when a live fish is foraging for food. */
export function HungerGlyph({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Looking for food"
      title="Looking for food"
      className={className}
    >
      🍽️
    </span>
  )
}
