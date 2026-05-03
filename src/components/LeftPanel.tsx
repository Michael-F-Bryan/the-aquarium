import type { Dispatch, SetStateAction } from 'react'
import { DebugControlsSection } from './left-panel/DebugControlsSection'
import { GameInfoSection } from './left-panel/GameInfoSection'
import type { State } from '../game/types'
import type { Params } from '../game/params'
import { DevSnapshotControls } from './left-panel/DevSnapshotControls'

type Props = {
  state: State
  params: Params
  setParams: Dispatch<SetStateAction<Params>>
  onReplaceGameState: (state: State) => void
}

export function LeftPanel({ state, params, setParams, onReplaceGameState }: Props) {
  return (
    <aside className="flex w-72 shrink-0 flex-col gap-4 border-r border-slate-800 bg-slate-950/80 p-4">
      <GameInfoSection state={state} />
      <DebugControlsSection params={params} setParams={setParams} />
      <DevSnapshotControls gameState={state} onReplaceGameState={onReplaceGameState} />
    </aside>
  )
}
