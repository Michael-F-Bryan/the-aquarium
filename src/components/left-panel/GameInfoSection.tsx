import type { GameSnapshotPayload } from '../../game/types'

type Props = {
  state: GameSnapshotPayload
}

export function GameInfoSection({ state }: Props) {
  return (
    <section className="space-y-1">
      <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">
        Game
      </h2>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="text-slate-500">Day</dt>
        <dd className="font-mono text-slate-200">
          {Math.round(state.currentDay * 10) / 10}
        </dd>
        <dt className="text-slate-500">Live biomass</dt>
        <dd className="font-mono text-slate-200">
          {liveBiomassG(state).toLocaleString()} g
        </dd>
        <dt className="text-slate-500">Rule score</dt>
        <dd className="font-mono text-slate-200">
          {Math.round(state.score * 10) / 10}
        </dd>
      </dl>
    </section>
  )
}

function liveBiomassG(state: GameSnapshotPayload): number {
  return state.liveFish.reduce((acc, fish) => acc + fish.weightG, 0)
}
