import type { Fish } from './types'

/** Maps health to a simple face for lists and labels (canvas will use sprites later). */
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
