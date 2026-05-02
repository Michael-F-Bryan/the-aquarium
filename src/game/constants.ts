/** Hit-box half-size for fish (matches canvas placeholder rect). */
export const FISH_HALF = 5

export const FOOD_PICKUP_RADIUS = 14

/** Carnivore must get this close to a smaller fish to consume it. */
export const CARNIVORE_KILL_RADIUS = 16

/** Max displacement per second for movement integration. */
export const MAX_SPEED_NORMAL = 88

export const MAX_SPEED_CARNIVORE = MAX_SPEED_NORMAL * 1.2

export const BOID_NEIGHBOR_RADIUS = 140
export const BOID_SEPARATION_WEIGHT = 2.2
export const BOID_ALIGNMENT_WEIGHT = 1.0
export const BOID_COHESION_WEIGHT = 0.85

export const HUNT_PERCEPTION = 260
export const FLEE_PERCEPTION = 200

export const WANDER_STRENGTH = 38

export const DEAD_SINK_SPEED = 42
