/** First hunger milestone from `docs/the-game.md` (healthy → hungry, health 3→2). */
export const FIRST_HUNGER_HEALTH_LOSS_THRESHOLD_DAYS = 1.5 as const;

/** Second hunger milestone from `docs/the-game.md` (hungry → starving, health 2→1). */
export const SECOND_HUNGER_HEALTH_LOSS_THRESHOLD_DAYS = 3 as const;

/** Third hunger milestone from `docs/the-game.md` (starving → death, health 1→0). */
export const THIRD_HUNGER_DEATH_THRESHOLD_DAYS = 4.5 as const;
