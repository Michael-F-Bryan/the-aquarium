import { describe, expect, it } from 'vitest'
import { speciesDotClass, speciesLabel } from './speciesDisplay'

describe('speciesDisplay helpers', () => {
  it('returns the correct label for each species', () => {
    expect(speciesLabel('normal')).toBe('Normal')
    expect(speciesLabel('carnivore')).toBe('Carnivore')
  })

  it('returns the expected dot classes for each species', () => {
    expect(speciesDotClass('normal')).toContain('bg-sky-500')
    expect(speciesDotClass('carnivore')).toContain('bg-red-500')
  })
})
