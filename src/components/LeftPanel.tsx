import type { Dispatch, SetStateAction } from 'react'
import { AutoplayDebugSection } from './left-panel/AutoplayDebugSection'
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
  onApplyReviewPreset: () => void
  autoplayEnabled: boolean
  autoplayIntervalMs: number
  autoplayLogCount: number
  onAutoplayToggle: (next: boolean) => void
  onAutoplayIntervalMsChange: (next: number) => void
  onClearAutoplayLog: () => void
  onCopyAutoplayLog: () => void
  onDownloadAutoplayLog: () => void
}

export function LeftPanel({
  state,
  params,
  setParams,
  onReplaceGameState,
  onApplyReviewPreset,
  autoplayEnabled,
  autoplayIntervalMs,
  autoplayLogCount,
  onAutoplayToggle,
  onAutoplayIntervalMsChange,
  onClearAutoplayLog,
  onCopyAutoplayLog,
  onDownloadAutoplayLog,
}: Props) {
  return (
    <aside className="flex w-72 shrink-0 flex-col gap-4 border-r border-slate-800 bg-slate-950/80 p-4">
      <GameInfoSection state={state} />
      <DebugControlsSection
        params={params}
        setParams={setParams}
        onApplyReviewPreset={onApplyReviewPreset}
      />
      <AutoplayDebugSection
        enabled={autoplayEnabled}
        intervalMs={autoplayIntervalMs}
        entriesCount={autoplayLogCount}
        onToggle={onAutoplayToggle}
        onIntervalMsChange={onAutoplayIntervalMsChange}
        onClear={onClearAutoplayLog}
        onCopy={onCopyAutoplayLog}
        onDownload={onDownloadAutoplayLog}
      />
      <DevSnapshotControls gameState={state} onReplaceGameState={onReplaceGameState} />
    </aside>
  )
}
