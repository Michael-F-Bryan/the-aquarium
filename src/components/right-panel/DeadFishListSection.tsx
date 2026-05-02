import type { DeadFish } from '../../game/types'
import { healthFace } from '../../game/healthFace'

type Props = {
  deadFish: DeadFish[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function DeadFishListSection({
  deadFish,
  selectedId,
  onSelect,
}: Props) {
  return (
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
  )
}
