/** Hit-box half-size for fish (matches canvas placeholder rect). */
export const FISH_HALF = 5

export const FOOD_PICKUP_RADIUS = 14

/** Carnivore must get this close to a smaller fish to consume it. */
export const CARNIVORE_KILL_RADIUS = 16

/** Max displacement per second for movement integration. */
export const MAX_SPEED_NORMAL = 88

export const MAX_SPEED_CARNIVORE = MAX_SPEED_NORMAL * 1.2
