import { useCallback, useState } from 'react'
import { parseGameSnapshot, serializeGameSnapshot } from '../../game/snapshot'
import type { State } from '../../game/types'

type Props = {
  gameState: State
  onReplaceGameState: (state: State) => void
}

/** Dev-only: load arbitrary game state from JSON for QA and repros. */
export function DevSnapshotControls({ gameState, onReplaceGameState }: Props) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleLoad = useCallback(() => {
    setError(null)
    try {
      const raw: unknown = JSON.parse(text)
      const r = parseGameSnapshot(raw)
      if (!r.ok) {
        setError(r.error)
        return
      }
      onReplaceGameState(r.state)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [text, onReplaceGameState])

  const handleCopy = useCallback(async () => {
    setError(null)
    const payload = serializeGameSnapshot(gameState)
    setText(payload)
    try {
      await navigator.clipboard.writeText(payload)
    } catch {
      /* clipboard optional */
    }
  }, [gameState])

  if (!import.meta.env.DEV) return null

  return (
    <div className="space-y-2 rounded border border-amber-900/50 bg-amber-950/20 p-2">
      <h3 className="text-xs font-medium uppercase tracking-wide text-amber-200/90">
        Dev snapshot
      </h3>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setError(null)
        }}
        rows={6}
        spellCheck={false}
        className="w-full resize-y rounded border border-slate-700 bg-slate-950 px-2 py-1.5 font-mono text-[10px] leading-snug text-slate-200"
        placeholder='{ "schemaVersion": 1, "state": { ... } }'
      />
      {error ? (
        <p className="text-[10px] text-red-300">{error}</p>
      ) : null}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleLoad}
          className="rounded bg-amber-700/80 px-2 py-1 text-xs font-medium text-white hover:bg-amber-600"
        >
          Load state
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800"
        >
          Copy current
        </button>
      </div>
    </div>
  )
}
