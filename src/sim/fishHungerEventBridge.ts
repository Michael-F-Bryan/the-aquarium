import type { FishBecameHungryEvent } from "./types";

const listeners = new Set<(events: readonly FishBecameHungryEvent[]) => void>();

/** Register a consumer (e.g. toast shell in #17). Returns an unsubscribe function. */
export function subscribeFishBecameHungryEvents(
  listener: (events: readonly FishBecameHungryEvent[]) => void,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Invoked after each hunger timer step with events from that step only.
 * Multiple transitions in one tick produce multiple events in array order.
 */
export function dispatchFishBecameHungryEvents(events: readonly FishBecameHungryEvent[]): void {
  if (events.length === 0) return;
  for (const listener of [...listeners]) {
    listener(events);
  }
}
