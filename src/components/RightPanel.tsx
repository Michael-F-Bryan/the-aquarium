import type { DeadFish, Fish } from '../game/types'
import { healthFace } from '../game/healthFace'

type Props = {
  liveFish: Fish[]
  deadFish: DeadFish[]
  selectedId: string | null
  onSelect: (id: string) => void
}

function speciesLabel(species: Fish['species']): string {
  return species === 'carnivore' ? 'Carnivore' : 'Normal'
}

function speciesDotClass(species: Fish['species']): string {
  return species === 'carnivore'
    ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
    : 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.45)]'
}

export function RightPanel({
  liveFish,
  deadFish,
  selectedId,
  onSelect,
}: Props) {
  const selected =
    liveFish.find((f) => f.id === selectedId) ??
    deadFish.find((f) => f.id === selectedId) ??
    null

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-slate-800 bg-slate-950/80">
      <section className="flex min-h-0 flex-1 flex-col gap-2 p-4">
        <h2 className="shrink-0 text-xs font-medium uppercase tracking-wide text-slate-500">
          Fish in aquarium
        </h2>
        <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          {liveFish.map((fish) => {
            const active = fish.id === selectedId
            return (
              <li key={fish.id}>
                <button
                  type="button"
                  onClick={() => onSelect(fish.id)}
                  className={`flex w-full items-center gap-2 rounded-md border px-2 py-2 text-left text-sm transition-colors ${active
                      ? 'border-sky-600/80 bg-sky-950/50 text-slate-100'
                      : 'border-transparent bg-slate-900/40 text-slate-300 hover:border-slate-700 hover:bg-slate-900/70'
                    }`}
                >
                  <span
                    className={`size-2 shrink-0 rounded-full ${speciesDotClass(fish.species)}`}
                    title={speciesLabel(fish.species)}
                    aria-hidden
                  />
                  <span className="shrink-0 text-base" title="Health expression">
                    {healthFace(fish.health)}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {fish.name}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-slate-500">
                    {fish.weightG}g
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

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
                <dd className="font-mono text-slate-400">
                  {(selected as DeadFish).diedOnDay}
                </dd>
              </>
            )}
          </dl>
        ) : (
          <p className="text-sm text-slate-500">Select a fish from the lists.</p>
        )}
      </section>

      <section className="max-h-40 shrink-0 border-t border-slate-800 p-4">
        <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Dead fish
        </h2>
        <ul className="max-h-28 space-y-1 overflow-y-auto pr-1">
          {deadFish.length === 0 ? (
            <li className="text-sm text-slate-600">None yet.</li>
          ) : (
            deadFish.map((fish) => {
              const active = fish.id === selectedId
              return (
                <li key={fish.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(fish.id)}
                    className={`flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left text-xs transition-colors ${active
                        ? 'border-slate-600 bg-slate-900 text-slate-200'
                        : 'border-transparent text-slate-500 hover:border-slate-800 hover:bg-slate-900/50 hover:text-slate-400'
                      }`}
                  >
                    <span className="text-sm">{healthFace(0)}</span>
                    <span className="min-w-0 flex-1 truncate">{fish.name}</span>
                    <span className="shrink-0 font-mono text-slate-600">
                      d{fish.diedOnDay}
                    </span>
                  </button>
                </li>
              )
            })
          )}
        </ul>
      </section>
    </aside>
  )
}
