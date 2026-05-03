import type { rngNext01 } from '../rng'
import type { AquariumRuntime } from './world'

type RngResult = ReturnType<typeof rngNext01>

export function consumeRandom01(
  runtime: AquariumRuntime,
  next: (rngState: number) => RngResult,
): number {
  const simulation = runtime.simulationEntity.simulation
  const result = next(simulation.rngState)
  simulation.rngState = result.rngState
  return result.value
}

export function consumeRandomResult<T>(
  runtime: AquariumRuntime,
  consume: (rngState: number) => T & { rngState: number },
): T {
  const simulation = runtime.simulationEntity.simulation
  const result = consume(simulation.rngState)
  simulation.rngState = result.rngState
  return result
}
