import type { FishHungerMilestoneEvent } from "./types";

const listeners = new Set<(events: readonly FishHungerMilestoneEvent[]) => void>();

/** Register a consumer (e.g. toast shell in #17). Returns an unsubscribe function. */
export function subscribeFishHungerMilestoneEvents(
  listener: (events: readonly FishHungerMilestoneEvent[]) => void,
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
export function dispatchFishHungerMilestoneEvents(events: readonly FishHungerMilestoneEvent[]): void {
  if (events.length === 0) return;
  for (const listener of [...listeners]) {
    listener(events);
  }
}
