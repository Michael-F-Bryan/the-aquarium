import type { Dispatch, SetStateAction } from 'react'
import type { Params } from '../../game/params'

type Props = {
  params: Params
  setParams: Dispatch<SetStateAction<Params>>
  onApplyReviewPreset: () => void
}

export function DebugControlsSection({
  params,
  setParams,
  onApplyReviewPreset,
}: Props) {
  const setNumber = <K extends keyof Params>(key: K, value: number) => {
    setParams((p) => ({ ...p, [key]: value }))
  }

  const numberInputClass =
    'mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 font-mono text-sm text-slate-200'

  return (
    <section className="min-h-0 flex-1 space-y-3 overflow-y-auto">
      <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">
        Debug
      </h2>
      <button
        type="button"
        onClick={onApplyReviewPreset}
        className="rounded border border-sky-700/60 bg-sky-950/40 px-2 py-1.5 text-xs text-sky-200 hover:bg-sky-900/40"
      >
        Apply review preset (auto-bot)
      </button>
      <label className="block text-xs text-slate-400">
        <span className="mb-1 block text-slate-500">Day length (ms)</span>
        <input
          type="range"
          min={2000}
          max={20000}
          step={500}
          value={params.dayLengthMs}
          onChange={(e) => setNumber('dayLengthMs', Number(e.target.value))}
          className="w-full accent-sky-500"
        />
        <span className="mt-0.5 block font-mono text-slate-300">
          {params.dayLengthMs}
        </span>
      </label>

      <label className="block text-xs text-slate-400">
        <span className="mb-1 block text-slate-500">Food lifetime (days)</span>
        <input
          type="number"
          min={0.1}
          max={2}
          step={0.1}
          value={params.foodLifetimeDays}
          onChange={(e) => setNumber('foodLifetimeDays', Number(e.target.value))}
          className={numberInputClass}
        />
      </label>

      <label className="block text-xs text-slate-400">
        <span className="mb-1 block text-slate-500">Starvation grace (days)</span>
        <input
          type="number"
          min={0}
          max={30}
          step={1}
          value={params.starvationGraceDays}
          onChange={(e) => setNumber('starvationGraceDays', Number(e.target.value))}
          className={numberInputClass}
        />
      </label>

      <label className="block text-xs text-slate-400">
        <span className="mb-1 block text-slate-500">Reproduce chance cap</span>
        <input
          type="range"
          min={0.05}
          max={0.5}
          step={0.01}
          value={params.reproduceChanceCap}
          onChange={(e) => setNumber('reproduceChanceCap', Number(e.target.value))}
          className="w-full accent-sky-500"
        />
        <span className="mt-0.5 block font-mono text-slate-300">
          {(params.reproduceChanceCap * 100).toFixed(0)}%
        </span>
      </label>

      <label className="block text-xs text-slate-400">
        <span className="mb-1 block text-slate-500">
          Carnivore chance (per baby)
        </span>
        <input
          type="range"
          min={0}
          max={0.05}
          step={0.001}
          value={params.carnivoreMutationChance}
          onChange={(e) => setNumber('carnivoreMutationChance', Number(e.target.value))}
          className="w-full accent-sky-500"
        />
        <span className="mt-0.5 block font-mono text-slate-300">
          {(params.carnivoreMutationChance * 100).toFixed(1)}%
        </span>
      </label>

      <label className="block text-xs text-slate-400">
        <span className="mb-1 block text-slate-500">Dead fish linger (days)</span>
        <input
          type="number"
          min={1}
          max={30}
          step={1}
          value={params.deadFishLingerDays}
          onChange={(e) => setNumber('deadFishLingerDays', Number(e.target.value))}
          className={numberInputClass}
        />
      </label>

      <details className="rounded border border-slate-800 bg-slate-900/40 p-2 text-xs text-slate-400">
        <summary className="cursor-pointer select-none text-slate-300">
          Feeding and starvation knobs
        </summary>
        <div className="mt-2 space-y-2">
          <label className="block">
            <span className="mb-1 block text-slate-500">Hunger threshold (days)</span>
            <input
              type="number"
              min={0.1}
              max={5}
              step={0.1}
              value={params.hungerThresholdDays}
              onChange={(e) => setNumber('hungerThresholdDays', Number(e.target.value))}
              className={numberInputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-slate-500">Midnight meal window (days)</span>
            <input
              type="number"
              min={0.1}
              max={4}
              step={0.1}
              value={params.midnightMealWindowDays}
              onChange={(e) =>
                setNumber('midnightMealWindowDays', Number(e.target.value))
              }
              className={numberInputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-slate-500">Food pickup radius</span>
            <input
              type="number"
              min={2}
              max={80}
              step={1}
              value={params.foodPickupRadius}
              onChange={(e) => setNumber('foodPickupRadius', Number(e.target.value))}
              className={numberInputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-slate-500">Min food separation</span>
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={params.minFoodSeparation}
              onChange={(e) => setNumber('minFoodSeparation', Number(e.target.value))}
              className={numberInputClass}
            />
          </label>
        </div>
      </details>

      <details className="rounded border border-slate-800 bg-slate-900/40 p-2 text-xs text-slate-400">
        <summary className="cursor-pointer select-none text-slate-300">
          Movement and steering knobs
        </summary>
        <div className="mt-2 space-y-2">
          <label className="block">
            <span className="mb-1 block text-slate-500">Max speed (normal)</span>
            <input
              type="number"
              min={10}
              max={240}
              step={1}
              value={params.maxSpeedNormal}
              onChange={(e) => setNumber('maxSpeedNormal', Number(e.target.value))}
              className={numberInputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-slate-500">
              Carnivore speed multiplier
            </span>
            <input
              type="number"
              min={0.5}
              max={3}
              step={0.05}
              value={params.maxSpeedCarnivoreMultiplier}
              onChange={(e) =>
                setNumber('maxSpeedCarnivoreMultiplier', Number(e.target.value))
              }
              className={numberInputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-slate-500">Flake seek acceleration</span>
            <input
              type="number"
              min={0}
              max={20}
              step={0.1}
              value={params.flakeSeekAcceleration}
              onChange={(e) => setNumber('flakeSeekAcceleration', Number(e.target.value))}
              className={numberInputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-slate-500">Social steer acceleration</span>
            <input
              type="number"
              min={0}
              max={20}
              step={0.1}
              value={params.socialSteerAcceleration}
              onChange={(e) => setNumber('socialSteerAcceleration', Number(e.target.value))}
              className={numberInputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-slate-500">Boid neighbor radius</span>
            <input
              type="number"
              min={10}
              max={400}
              step={5}
              value={params.boidNeighborRadius}
              onChange={(e) => setNumber('boidNeighborRadius', Number(e.target.value))}
              className={numberInputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-slate-500">Boid separation weight</span>
            <input
              type="number"
              min={0}
              max={8}
              step={0.05}
              value={params.boidSeparationWeight}
              onChange={(e) => setNumber('boidSeparationWeight', Number(e.target.value))}
              className={numberInputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-slate-500">Boid alignment weight</span>
            <input
              type="number"
              min={0}
              max={4}
              step={0.05}
              value={params.boidAlignmentWeight}
              onChange={(e) => setNumber('boidAlignmentWeight', Number(e.target.value))}
              className={numberInputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-slate-500">Boid cohesion weight</span>
            <input
              type="number"
              min={0}
              max={4}
              step={0.05}
              value={params.boidCohesionWeight}
              onChange={(e) => setNumber('boidCohesionWeight', Number(e.target.value))}
              className={numberInputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-slate-500">Hunt perception radius</span>
            <input
              type="number"
              min={20}
              max={500}
              step={5}
              value={params.huntPerception}
              onChange={(e) => setNumber('huntPerception', Number(e.target.value))}
              className={numberInputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-slate-500">Flee perception radius</span>
            <input
              type="number"
              min={20}
              max={500}
              step={5}
              value={params.fleePerception}
              onChange={(e) => setNumber('fleePerception', Number(e.target.value))}
              className={numberInputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-slate-500">Wander strength</span>
            <input
              type="number"
              min={0}
              max={120}
              step={1}
              value={params.wanderStrength}
              onChange={(e) => setNumber('wanderStrength', Number(e.target.value))}
              className={numberInputClass}
            />
          </label>
        </div>
      </details>

      <details className="rounded border border-slate-800 bg-slate-900/40 p-2 text-xs text-slate-400">
        <summary className="cursor-pointer select-none text-slate-300">
          Reproduction and predation knobs
        </summary>
        <div className="mt-2 space-y-2">
          <label className="block">
            <span className="mb-1 block text-slate-500">
              Reproduction weight threshold (g)
            </span>
            <input
              type="number"
              min={50}
              max={1200}
              step={10}
              value={params.reproductionWeightThresholdG}
              onChange={(e) =>
                setNumber('reproductionWeightThresholdG', Number(e.target.value))
              }
              className={numberInputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-slate-500">Reproduction age scale (days)</span>
            <input
              type="number"
              min={1}
              max={500}
              step={1}
              value={params.reproductionAgeScaleDays}
              onChange={(e) =>
                setNumber('reproductionAgeScaleDays', Number(e.target.value))
              }
              className={numberInputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-slate-500">Baby spawn jitter (px)</span>
            <input
              type="number"
              min={0}
              max={200}
              step={1}
              value={params.babySpawnJitterPx}
              onChange={(e) => setNumber('babySpawnJitterPx', Number(e.target.value))}
              className={numberInputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-slate-500">Carnivore kill radius</span>
            <input
              type="number"
              min={2}
              max={120}
              step={1}
              value={params.carnivoreKillRadius}
              onChange={(e) => setNumber('carnivoreKillRadius', Number(e.target.value))}
              className={numberInputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-slate-500">Predation weight gain fraction</span>
            <input
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={params.predationWeightGainFraction}
              onChange={(e) =>
                setNumber('predationWeightGainFraction', Number(e.target.value))
              }
              className={numberInputClass}
            />
          </label>
        </div>
      </details>

      <details className="rounded border border-slate-800 bg-slate-900/40 p-2 text-xs text-slate-400">
        <summary className="cursor-pointer select-none text-slate-300">
          Dead fish and skeleton knobs
        </summary>
        <div className="mt-2 space-y-2">
          <label className="block">
            <span className="mb-1 block text-slate-500">Dead fish sink speed</span>
            <input
              type="number"
              min={0}
              max={200}
              step={1}
              value={params.deadSinkSpeed}
              onChange={(e) => setNumber('deadSinkSpeed', Number(e.target.value))}
              className={numberInputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-slate-500">Skeleton sink speed</span>
            <input
              type="number"
              min={0}
              max={200}
              step={1}
              value={params.skeletonSinkSpeed}
              onChange={(e) => setNumber('skeletonSinkSpeed', Number(e.target.value))}
              className={numberInputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-slate-500">Skeleton lifetime (days)</span>
            <input
              type="number"
              min={0.1}
              max={30}
              step={0.1}
              value={params.skeletonLifetimeDays}
              onChange={(e) => setNumber('skeletonLifetimeDays', Number(e.target.value))}
              className={numberInputClass}
            />
          </label>
        </div>
      </details>
    </section>
  )
}
