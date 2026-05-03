import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import type { Params } from '../game/params'
import { DebugControlsSection } from './left-panel/DebugControlsSection'

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
  const [gameParamsOpen, setGameParamsOpen] = useState(false)

  useEffect(() => {
    if (!open) setGameParamsOpen(false)
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
    >
      <div className="flex w-full max-w-md flex-col items-stretch gap-3">
        <div className="w-full max-w-sm self-center rounded-lg border border-slate-700 bg-slate-900 p-5 shadow-xl">
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
              aria-expanded={gameParamsOpen}
              onClick={() => setGameParamsOpen((v) => !v)}
              className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              {gameParamsOpen ? 'Hide simulation parameters' : 'Simulation parameters…'}
            </button>
          </div>
        </div>

        {gameParamsOpen ? (
          <div
            className="max-h-[min(52dvh,28rem)] w-full overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 p-4 shadow-xl"
            role="region"
            aria-label="Simulation parameters"
          >
            <div className="mb-3 flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-100">
                Simulation parameters
              </h3>
              <button
                type="button"
                onClick={() => setGameParamsOpen(false)}
                className="shrink-0 rounded border border-slate-600 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800"
              >
                Close
              </button>
            </div>
            <DebugControlsSection
              params={params}
              setParams={setParams}
              onApplyReviewPreset={onApplyReviewPreset}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
