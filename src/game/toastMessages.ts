import type { SimulationEvent } from './events'

/** User-facing toast line for a simulation event. */
export function formatSimulationEvent(e: SimulationEvent): string {
  switch (e.type) {
    case 'ate_flake':
      return `${e.name} ate some food`
    case 'prey_eaten':
      return `${e.predatorName} ate ${e.preyName}`
    case 'fish_born':
      return `${e.name} was born`
    case 'fish_died':
      return `${e.name} died`
    case 'fish_hunger': {
      if (e.level === 'hungry') return `${e.name} is hungry`
      if (e.level === 'starving') return `${e.name} is starving`
      return `${e.name} is famished`
    }
  }
}
