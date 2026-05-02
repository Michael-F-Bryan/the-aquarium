import type { Fish } from '../../game/types'

export function speciesLabel(species: Fish['species']): string {
  return species === 'carnivore' ? 'Carnivore' : 'Normal'
}

export function speciesDotClass(species: Fish['species']): string {
  return species === 'carnivore'
    ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
    : 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.45)]'
}
