import { useCallback, useEffect, useRef, useState } from 'react'
import { AquariumCanvas } from './components/AquariumCanvas'
import { LeftPanel } from './components/LeftPanel'
import { PauseMenuModal } from './components/PauseMenuModal'
import { RightPanel } from './components/RightPanel'
import {
  AUTOSAVE_STORAGE_KEY,
  buildAutosaveJson,
  readAutosaveFromStorage,
} from './game/autosave'
import { defaultParams, type Params } from './game/params'
import { newGameState, type State } from './game/types'
import { dropFlakeFood } from './game/mechanics/foodDrop'
import { update } from './game/update'

function App() {
  const [params, setParams] = useState<Params>(() => defaultParams)
  const [gameState, setGameState] = useState<State>(() =>
    newGameState(defaultParams),
  )
  const [worldSize, setWorldSize] = useState({
    width: defaultParams.aquariumWidth,
    height: defaultParams.aquariumHeight,
  })

  const [selectedId, setSelectedId] = useState<string | null>('fish-0')
  const [paused, setPaused] = useState(false)
  const [autosaveThumb, setAutosaveThumb] = useState<string | null>(null)
  const [hasAutosave, setHasAutosave] = useState(() => {
    try {
      return (
        typeof localStorage !== 'undefined' &&
        localStorage.getItem(AUTOSAVE_STORAGE_KEY) !== null
      )
    } catch {
      return false
    }
  })

  const paramsRef = useRef(params)
  const worldRef = useRef(worldSize)
  const pausedRef = useRef(paused)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const lastClosedRef = useRef(gameState.lastClosedCalendarDayFloor)
  const gameRef = useRef(gameState)

  useEffect(() => {
    gameRef.current = gameState
  }, [gameState])

  useEffect(() => {
    paramsRef.current = params
  }, [params])

  useEffect(() => {
    worldRef.current = worldSize
  }, [worldSize])

  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    let active = true

    const tick = (now: number) => {
      if (!active) return
      if (pausedRef.current) {
        last = now
        raf = requestAnimationFrame(tick)
        return
      }
      const rawDelta = now - last
      last = now
      const p = paramsRef.current
      const w = worldRef.current
      const merged: Params = {
        ...p,
        aquariumWidth: w.width,
        aquariumHeight: w.height,
      }
      setGameState((prev) => update(prev, merged, rawDelta).state)
      if (active) {
        raf = requestAnimationFrame(tick)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => {
      active = false
      cancelAnimationFrame(raf)
    }
  }, [])

  useEffect(() => {
    const snap = gameRef.current
    const closed = snap.lastClosedCalendarDayFloor
    if (closed <= lastClosedRef.current) return
    lastClosedRef.current = closed

    const w = worldRef.current
    const p = paramsRef.current
    const merged: Params = {
      ...p,
      aquariumWidth: w.width,
      aquariumHeight: w.height,
    }

    const thumb = (() => {
      try {
        return canvasRef.current?.toDataURL('image/jpeg', 0.55) ?? null
      } catch {
        return null
      }
    })()

    try {
      const json = buildAutosaveJson({
        state: snap,
        params: merged,
        thumbnailDataUrl: thumb,
      })
      localStorage.setItem(AUTOSAVE_STORAGE_KEY, json)
      queueMicrotask(() => {
        setHasAutosave(true)
        setAutosaveThumb(thumb)
      })
    } catch {
      /* quota or private mode */
    }
  }, [gameState.lastClosedCalendarDayFloor])

  const refreshAutosavePreview = useCallback(() => {
    const r = readAutosaveFromStorage()
    if (r.ok && r.thumbnailDataUrl) setAutosaveThumb(r.thumbnailDataUrl)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const t = e.target
      if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) return
      e.preventDefault()
      if (pausedRef.current) {
        setPaused(false)
      } else {
        refreshAutosavePreview()
        setPaused(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [refreshAutosavePreview])

  const handleWorldSize = useCallback((width: number, height: number) => {
    setWorldSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height },
    )
  }, [])

  const handleDropFood = useCallback(
    (x: number, y: number) => {
      if (pausedRef.current) return
      const w = worldRef.current
      const p = paramsRef.current
      const merged: Params = {
        ...p,
        aquariumWidth: w.width,
        aquariumHeight: w.height,
      }
      setGameState((prev) => dropFlakeFood(prev, merged, x, y))
    },
    [],
  )

  const handleReplaceGameState = useCallback((next: State) => {
    setGameState(next)
    lastClosedRef.current = next.lastClosedCalendarDayFloor
    setSelectedId((prev) => {
      if (prev && next.liveFish.some((f) => f.id === prev)) return prev
      return next.liveFish[0]?.id ?? null
    })
  }, [])

  const handleResume = useCallback(() => {
    setPaused(false)
  }, [])

  const handleLoadAutosave = useCallback(() => {
    const r = readAutosaveFromStorage()
    if (!r.ok) return
    setGameState(r.state)
    setParams(r.params)
    lastClosedRef.current = r.state.lastClosedCalendarDayFloor
    setSelectedId((prev) => {
      if (prev && r.state.liveFish.some((f) => f.id === prev)) return prev
      return r.state.liveFish[0]?.id ?? null
    })
    setAutosaveThumb(r.thumbnailDataUrl)
    setPaused(false)
  }, [])

  const handleNewGame = useCallback(() => {
    if (!window.confirm('Start a new game? Unsaved progress in the tank will be lost.')) {
      return
    }
    setGameState(newGameState(defaultParams))
    setParams(defaultParams)
    lastClosedRef.current = -1
    setSelectedId('fish-0')
    setPaused(false)
  }, [])

  return (
    <div className="flex h-dvh min-h-0 flex-col bg-slate-950 text-slate-100">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/60 px-4 py-3">
        <h1 className="text-lg font-semibold tracking-tight text-slate-100">
          The Aquarium
        </h1>
        <button
          type="button"
          onClick={() => {
            refreshAutosavePreview()
            setPaused(true)
          }}
          className="rounded-md border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800"
        >
          Pause
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        <LeftPanel
          state={gameState}
          params={params}
          setParams={setParams}
          onReplaceGameState={handleReplaceGameState}
        />

        <main className="relative min-h-0 min-w-0 flex-1 bg-slate-900">
          <AquariumCanvas
            ref={canvasRef}
            state={gameState}
            onWorldSize={handleWorldSize}
            onDropFood={handleDropFood}
            dropDisabled={paused}
          />
        </main>

        <RightPanel
          currentDay={gameState.currentDay}
          liveFish={gameState.liveFish}
          deadFish={gameState.deadFish}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      <PauseMenuModal
        open={paused}
        hasAutosave={hasAutosave}
        autosavePreviewUrl={autosaveThumb}
        onResume={handleResume}
        onLoadAutosave={handleLoadAutosave}
        onNewGame={handleNewGame}
      />
    </div>
  )
}

export default App
