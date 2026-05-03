import { AutoplayDebugSection } from './left-panel/AutoplayDebugSection'
import { GameInfoSection } from './left-panel/GameInfoSection'
import type { GameSnapshotPayload } from '../game/types'
import { DevSnapshotControls } from './left-panel/DevSnapshotControls'

type Props = {
  state: GameSnapshotPayload
  onReplaceGameState: (state: GameSnapshotPayload) => void
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
  onReplaceGameState,
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
