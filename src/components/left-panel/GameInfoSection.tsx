import type { State } from '../../game/types'

type Props = {
  state: State
}

export function GameInfoSection({ state }: Props) {
  return (
    <section className="space-y-1">
      <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">
        Game
      </h2>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="text-slate-500">Day</dt>
        <dd className="font-mono text-slate-200">{state.currentDay}</dd>
        <dt className="text-slate-500">Score</dt>
        <dd className="font-mono text-slate-200">{score(state)}</dd>
      </dl>
    </section>
  )
}

function score(state: State) {
  const { liveFish, deadFish } = state
  return liveFish.reduce((acc, fish) => acc + fish.weightG, 0) + deadFish.reduce((acc, fish) => acc + fish.weightG, 0)
}
