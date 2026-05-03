type Props = {
  enabled: boolean
  intervalMs: number
  entriesCount: number
  onToggle: (next: boolean) => void
  onIntervalMsChange: (next: number) => void
  onClear: () => void
  onCopy: () => void
  onDownload: () => void
}

export function AutoplayDebugSection({
  enabled,
  intervalMs,
  entriesCount,
  onToggle,
  onIntervalMsChange,
  onClear,
  onCopy,
  onDownload,
}: Props) {
  if (!import.meta.env.DEV) return null

  return (
    <section className="space-y-2 rounded border border-emerald-900/50 bg-emerald-950/20 p-2">
      <h3 className="text-xs font-medium uppercase tracking-wide text-emerald-200/90">
        Autoplay review
      </h3>

      <label className="flex items-center gap-2 text-xs text-slate-300">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="accent-emerald-500"
        />
        Enable feeding bot
      </label>

      <label className="block text-xs text-slate-400">
        <span className="mb-1 block text-slate-500">Decision interval (ms)</span>
        <input
          type="number"
          min={100}
          max={5000}
          step={50}
          value={intervalMs}
          onChange={(e) => onIntervalMsChange(Number(e.target.value))}
          className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 font-mono text-sm text-slate-200"
        />
      </label>

      <p className="text-[11px] text-slate-400">
        Status:{' '}
        <span className={enabled ? 'text-emerald-300' : 'text-slate-500'}>
          {enabled ? 'active' : 'inactive'}
        </span>
      </p>
      <p className="text-[11px] text-slate-400">Log entries: {entriesCount}</p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCopy}
          className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-100 hover:bg-slate-800"
        >
          Copy log
        </button>
        <button
          type="button"
          onClick={onDownload}
          className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-100 hover:bg-slate-800"
        >
          Download log
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800"
        >
          Clear
        </button>
      </div>
    </section>
  )
}
