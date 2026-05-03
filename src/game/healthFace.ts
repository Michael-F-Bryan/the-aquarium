import type { Fish } from './types'

/** Maps health to a face emoji for lists, HUD, and canvas labels above fish sprites. */
export function healthFace(health: Fish['health']): string {
  switch (health) {
    case 3:
      return '😊'
    case 2:
      return '😐'
    case 1:
      return '🙁'
    case 0:
      return '💀'
    default:
      return '💀'
  }
}
