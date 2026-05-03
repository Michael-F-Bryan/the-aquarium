import type { FishAteFoodEvent } from "./types";

const listeners = new Set<(events: readonly FishAteFoodEvent[]) => void>();

/** Register a consumer (e.g. toast shell). Returns an unsubscribe function. */
export function subscribeFishAteFoodEvents(
  listener: (events: readonly FishAteFoodEvent[]) => void,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Invoked after each eat step with events from that step only (one per flake consumed). */
export function dispatchFishAteFoodEvents(events: readonly FishAteFoodEvent[]): void {
  if (events.length === 0) return;
  for (const listener of [...listeners]) {
    listener(events);
  }
}
