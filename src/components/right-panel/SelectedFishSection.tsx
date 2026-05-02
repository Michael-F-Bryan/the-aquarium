import type { DeadFish, Fish } from '../../game/types'
import { healthFace } from '../../game/healthFace'
import { speciesDotClass, speciesLabel } from './speciesDisplay'

type Props = {
  selected: Fish | DeadFish | null
}

export function SelectedFishSection({ selected }: Props) {
  return (
    <section className="shrink-0 border-t border-slate-800 p-4">
      <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        Selected fish
      </h2>
      {selected ? (
        <dl className="grid grid-cols-[5.5rem_1fr] gap-x-2 gap-y-1.5 text-sm">
          <dt className="text-slate-500">Name</dt>
          <dd className="truncate font-medium text-slate-100">{selected.name}</dd>
          <dt className="text-slate-500">Species</dt>
          <dd className="flex items-center gap-2 text-slate-200">
            <span
              className={`size-2 shrink-0 rounded-full ${speciesDotClass(selected.species)}`}
              aria-hidden
            />
            {speciesLabel(selected.species)}
          </dd>
          <dt className="text-slate-500">Age</dt>
          <dd className="font-mono text-slate-200">
            {selected.ageDays} day{selected.ageDays === 1 ? '' : 's'}
          </dd>
          <dt className="text-slate-500">Weight</dt>
          <dd className="font-mono text-slate-200">
            {selected.weightG.toLocaleString()} g
          </dd>
          <dt className="text-slate-500">Health</dt>
          <dd className="flex items-center gap-2 text-slate-200">
            <span className="text-lg">{healthFace(selected.health)}</span>
            <span className="font-mono text-slate-400">({selected.health}/3)</span>
          </dd>
          {'diedOnDay' in selected && (
            <>
              <dt className="text-slate-500">Died (day)</dt>
              <dd className="font-mono text-slate-400">{selected.diedOnDay}</dd>
            </>
          )}
        </dl>
      ) : (
        <p className="text-sm text-slate-500">Select a fish from the lists.</p>
      )}
    </section>
  )
}
