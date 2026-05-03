import { useState, type Dispatch, type SetStateAction } from 'react'
import type { Params } from '../game/params'
import { DebugControlsSection } from './left-panel/DebugControlsSection'

type PausePanel = 'main' | 'gameSettings'

type Props = {
  open: boolean
  hasAutosave: boolean
  autosavePreviewUrl: string | null
  params: Params
  setParams: Dispatch<SetStateAction<Params>>
  onApplyReviewPreset: () => void
  onResume: () => void
  onLoadAutosave: () => void
  onNewGame: () => void
}

export function PauseMenuModal({
  open,
  hasAutosave,
  autosavePreviewUrl,
  params,
  setParams,
  onApplyReviewPreset,
  onResume,
  onLoadAutosave,
  onNewGame,
}: Props) {
  const [panel, setPanel] = useState<PausePanel>('main')

  if (!open) return null

  const titleId = panel === 'main' ? 'pause-title' : 'pause-game-settings-title'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="flex w-full max-w-md min-h-0 max-h-[min(85dvh,36rem)] flex-col rounded-lg border border-slate-700 bg-slate-900 shadow-xl">
        {panel === 'main' ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
            <h2 id="pause-title" className="text-lg font-semibold text-slate-100">
              Paused
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Simulation is frozen. Resume, load your last autosave (saved at each new
              simulated day), or start a new tank.
            </p>
            {autosavePreviewUrl ? (
              <div className="mt-3 overflow-hidden rounded border border-slate-700">
                <img
                  src={autosavePreviewUrl}
                  alt="Last autosave thumbnail"
                  className="h-28 w-full object-cover object-bottom"
                />
              </div>
            ) : null}
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={onResume}
                className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500"
              >
                Resume
              </button>
              <button
                type="button"
                disabled={!hasAutosave}
                onClick={onLoadAutosave}
                className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Load autosave
              </button>
              <button
                type="button"
                onClick={onNewGame}
                className="rounded-lg border border-amber-900/60 px-3 py-2 text-sm text-amber-100/90 hover:bg-amber-950/40"
              >
                New game…
              </button>
              <button
                type="button"
                onClick={() => setPanel('gameSettings')}
                className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
              >
                Game settings…
              </button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 border-b border-slate-800 p-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPanel('main')}
                  className="rounded border border-slate-600 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Back
                </button>
                <h2
                  id="pause-game-settings-title"
                  className="text-lg font-semibold text-slate-100"
                >
                  Game settings
                </h2>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Simulation parameters and debug tuning.
              </p>
            </div>
            <div
              className="min-h-0 flex-1 overflow-y-auto p-4 pt-2"
              role="region"
              aria-label="Simulation parameters"
            >
              <DebugControlsSection
                params={params}
                setParams={setParams}
                onApplyReviewPreset={onApplyReviewPreset}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
