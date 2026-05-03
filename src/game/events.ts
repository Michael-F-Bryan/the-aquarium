import type { Species } from './types'

export type SimulationEvent =
  | { type: 'ate_flake'; fishId: string; name: string }
  | {
      type: 'prey_eaten'
      predatorId: string
      predatorName: string
      preyId: string
      preyName: string
      weightGainG: number
    }
  | { type: 'fish_born'; fishId: string; name: string; species: Species }
  | { type: 'fish_died'; fishId: string; name: string; reason: 'starvation' }
  | {
      type: 'fish_hunger'
      fishId: string
      name: string
      level: 'hungry' | 'starving' | 'famished'
    }
