import type { Fish } from '../../game/types'
import { healthFace } from '../../game/healthFace'
import { fishWantsFood } from '../../game/satiation'
import { HungerGlyph } from './HungerGlyph'
import { speciesDotClass, speciesLabel } from './speciesDisplay'

type Props = {
  currentDay: number
  liveFish: Fish[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function LiveFishListSection({
  currentDay,
  liveFish,
  selectedId,
  onSelect,
}: Props) {
  return (
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
                <span className="flex shrink-0 items-center gap-0.5 text-base">
                  <span title="Health expression">{healthFace(fish.health)}</span>
                  {fishWantsFood(fish, currentDay) ? (
                    <HungerGlyph className="text-xs leading-none text-amber-400/95" />
                  ) : null}
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
  )
}
