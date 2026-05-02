import { useState } from 'react'
import type { GameHud } from '../game/types'
import { stubDebugParams, type DebugParams } from '../game/stubData'

type Props = {
  hud: GameHud
}

export function LeftPanel({ hud }: Props) {
  const [params, setParams] = useState<DebugParams>(() => ({
    ...stubDebugParams,
  }))

  return (
    <aside className="flex w-72 shrink-0 flex-col gap-4 border-r border-slate-800 bg-slate-950/80 p-4">
      <section className="space-y-1">
        <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Game
        </h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="text-slate-500">Day</dt>
          <dd className="font-mono text-slate-200">{hud.day}</dd>
          <dt className="text-slate-500">Total weight</dt>
          <dd className="font-mono text-slate-200">
            {hud.totalWeightG.toLocaleString()} g
          </dd>
          <dt className="text-slate-500">Score</dt>
          <dd className="font-mono text-slate-200">{hud.score}</dd>
        </dl>
      </section>

      <section className="min-h-0 flex-1 space-y-3 overflow-y-auto">
        <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Debug
        </h2>
        <label className="block text-xs text-slate-400">
          <span className="mb-1 block text-slate-500">Day length (ms)</span>
          <input
            type="range"
            min={2000}
            max={20000}
            step={500}
            value={params.dayLengthMs}
            onChange={(e) =>
              setParams((p) => ({ ...p, dayLengthMs: Number(e.target.value) }))
            }
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
            onChange={(e) =>
              setParams((p) => ({
                ...p,
                foodLifetimeDays: Number(e.target.value),
              }))
            }
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 font-mono text-sm text-slate-200"
          />
        </label>

        <label className="block text-xs text-slate-400">
          <span className="mb-1 block text-slate-500">
            Reproduce chance cap
          </span>
          <input
            type="range"
            min={0.05}
            max={0.5}
            step={0.01}
            value={params.reproduceChanceCap}
            onChange={(e) =>
              setParams((p) => ({
                ...p,
                reproduceChanceCap: Number(e.target.value),
              }))
            }
            className="w-full accent-sky-500"
          />
          <span className="mt-0.5 block font-mono text-slate-300">
            {(params.reproduceChanceCap * 100).toFixed(0)}%
          </span>
        </label>

        <label className="block text-xs text-slate-400">
          <span className="mb-1 block text-slate-500">
            Carnivore mutation (per fish / day)
          </span>
          <input
            type="range"
            min={0}
            max={0.05}
            step={0.001}
            value={params.carnivoreMutationChance}
            onChange={(e) =>
              setParams((p) => ({
                ...p,
                carnivoreMutationChance: Number(e.target.value),
              }))
            }
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
            onChange={(e) =>
              setParams((p) => ({
                ...p,
                deadFishLingerDays: Number(e.target.value),
              }))
            }
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 font-mono text-sm text-slate-200"
          />
        </label>
      </section>
    </aside>
  )
}
