type Props = {
  open: boolean
  hasAutosave: boolean
  autosavePreviewUrl: string | null
  onResume: () => void
  onLoadAutosave: () => void
  onNewGame: () => void
}

export function PauseMenuModal({
  open,
  hasAutosave,
  autosavePreviewUrl,
  onResume,
  onLoadAutosave,
  onNewGame,
}: Props) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
    >
      <div className="w-full max-w-sm rounded-lg border border-slate-700 bg-slate-900 p-5 shadow-xl">
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
        </div>
      </div>
    </div>
  )
}
