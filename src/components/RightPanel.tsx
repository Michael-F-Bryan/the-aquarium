import type { DeadFish, Fish } from '../game/types'
import { DeadFishListSection } from './right-panel/DeadFishListSection'
import { LiveFishListSection } from './right-panel/LiveFishListSection'
import { SelectedFishSection } from './right-panel/SelectedFishSection'

type Props = {
  currentDay: number
  liveFish: Fish[]
  deadFish: DeadFish[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function RightPanel({
  currentDay,
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
      <LiveFishListSection
        currentDay={currentDay}
        liveFish={liveFish}
        selectedId={selectedId}
        onSelect={onSelect}
      />
      <SelectedFishSection currentDay={currentDay} selected={selected} />
      <DeadFishListSection
        deadFish={deadFish}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    </aside>
  )
}
