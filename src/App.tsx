import { useCallback, useEffect, useRef, useState } from 'react'
import { AquariumCanvas } from './components/AquariumCanvas'
import { LeftPanel } from './components/LeftPanel'
import { PauseMenuModal } from './components/PauseMenuModal'
import { RightPanel } from './components/RightPanel'
import { ToastStack, type ToastItem } from './components/ToastStack'
import {
  AUTOSAVE_STORAGE_KEY,
  buildAutosaveJson,
  readAutosaveFromStorage,
} from './game/autosave'
import { defaultParams, type Params } from './game/params'
import { newGameState, type State } from './game/types'
import {
  createAppRuntimeCommandQueue,
  mergeRuntimeParams,
  stepAppRuntime,
} from './game/appRuntime'
import {
  buildAutoplayLogJson,
  type AutoplayLogEntry,
} from './game/autoplay/logExport'
import { chooseAutoplayFoodDrop } from './game/autoplay/policy'
import { buildReviewSessionPreset } from './game/reviewPreset'
import { formatSimulationEvent } from './game/toastMessages'

type AppRuntimeCommandMeta = {
  readonly type: 'autoplay-food-drop'
  readonly atDay: number
  readonly targetFishId: string
  readonly liveFishCount: number
  readonly foodCount: number
}

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
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [autoplayEnabled, setAutoplayEnabled] = useState(false)
  const [autoplayIntervalMs, setAutoplayIntervalMs] = useState(400)
  const [autoplayLog, setAutoplayLog] = useState<AutoplayLogEntry[]>([])
  const toastSeq = useRef(0)
  const lastToastDedupe = useRef<{ message: string; at: number }>({
    message: '',
    at: 0,
  })

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
  const commandQueueRef = useRef(
    createAppRuntimeCommandQueue<AppRuntimeCommandMeta>(),
  )

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

  const pushToast = useCallback((message: string) => {
    const t = Date.now()
    const last = lastToastDedupe.current
    if (message === last.message && t - last.at < 1200) return
    lastToastDedupe.current = { message, at: t }
    const id = `${t}-${toastSeq.current++}`
    setToasts((prev) => [...prev.slice(-9), { id, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id))
    }, 6500)
  }, [])

  const appendAutoplayLog = useCallback((entry: AutoplayLogEntry) => {
    setAutoplayLog((prev) => [...prev.slice(-499), entry])
  }, [])

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
      const commands = commandQueueRef.current.drain()
      setGameState((prev) => {
        const result = stepAppRuntime({
          state: prev,
          params: p,
          worldSize: w,
          deltaMs: rawDelta,
          commands,
        })
        if (result.events.length > 0 || result.commandOutcomes.length > 0) {
          const events = [...result.events]
          const autoplayOutcomes = result.commandOutcomes.filter(
            (outcome) => outcome.meta?.type === 'autoplay-food-drop',
          )
          queueMicrotask(() => {
            for (const ev of events) {
              pushToast(formatSimulationEvent(ev))
            }
            for (const outcome of autoplayOutcomes) {
              if (!outcome.meta) continue
              appendAutoplayLog({
                atDay: outcome.meta.atDay,
                action: outcome.applied ? 'drop' : 'skip',
                reason: outcome.applied ? 'policy-drop' : 'drop-rejected',
                targetFishId: outcome.meta.targetFishId,
                liveFishCount: outcome.meta.liveFishCount,
                foodCount: outcome.meta.foodCount,
              })
            }
          })
        }
        return result.state
      })
      if (active) {
        raf = requestAnimationFrame(tick)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => {
      active = false
      cancelAnimationFrame(raf)
    }
  }, [appendAutoplayLog, pushToast])

  useEffect(() => {
    if (!import.meta.env.DEV) return
    if (!autoplayEnabled) return
    if (paused) return
    const delay = Math.min(5000, Math.max(100, autoplayIntervalMs))
    const timer = window.setInterval(() => {
      const snap = gameRef.current
      const decision = chooseAutoplayFoodDrop(
        snap,
        mergeRuntimeParams(paramsRef.current, worldRef.current),
      )
      if (!decision) {
        queueMicrotask(() => {
          appendAutoplayLog({
            atDay: snap.currentDay,
            action: 'skip',
            reason: 'no-target',
            liveFishCount: snap.liveFish.length,
            foodCount: snap.food.length,
          })
        })
        return
      }
      commandQueueRef.current.enqueue({
        command: { type: 'drop-food', x: decision.x, y: decision.y },
        meta: {
          type: 'autoplay-food-drop',
          atDay: snap.currentDay,
          targetFishId: decision.targetFishId,
          liveFishCount: snap.liveFish.length,
          foodCount: snap.food.length,
        },
      })
    }, delay)
    return () => window.clearInterval(timer)
  }, [appendAutoplayLog, autoplayEnabled, autoplayIntervalMs, paused])

  useEffect(() => {
    const snap = gameRef.current
    const closed = snap.lastClosedCalendarDayFloor
    if (closed <= lastClosedRef.current) return
    lastClosedRef.current = closed

    const w = worldRef.current
    const p = paramsRef.current
    const merged = mergeRuntimeParams(p, w)

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

  const handleApplyReviewPreset = useCallback(() => {
    const preset = buildReviewSessionPreset(paramsRef.current)
    setParams(preset.params)
    setAutoplayEnabled(preset.autoplay.enabled)
    setAutoplayIntervalMs(preset.autoplay.intervalMs)
    pushToast('Review preset applied (autoplay enabled)')
  }, [pushToast])

  const handleDropFood = useCallback(
    (x: number, y: number) => {
      if (pausedRef.current) return
      commandQueueRef.current.enqueue({ type: 'drop-food', x, y })
    },
    [],
  )

  const handleReplaceGameState = useCallback((next: State) => {
    commandQueueRef.current.drain()
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

  const handleCopyAutoplayLog = useCallback(async () => {
    const payload = buildAutoplayLogJson({
      createdAtIso: new Date().toISOString(),
      params,
      entries: autoplayLog,
    })
    try {
      await navigator.clipboard.writeText(payload)
      pushToast(`Copied autoplay log (${autoplayLog.length} entries)`)
    } catch {
      pushToast('Clipboard blocked; use Download log')
    }
  }, [autoplayLog, params, pushToast])

  const handleDownloadAutoplayLog = useCallback(() => {
    const payload = buildAutoplayLogJson({
      createdAtIso: new Date().toISOString(),
      params,
      entries: autoplayLog,
    })
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `autoplay-log-day-${Math.floor(gameState.currentDay)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [autoplayLog, gameState.currentDay, params])

  const handleClearAutoplayLog = useCallback(() => {
    setAutoplayLog([])
  }, [])

  const handleLoadAutosave = useCallback(() => {
    const r = readAutosaveFromStorage()
    if (!r.ok) return
    commandQueueRef.current.drain()
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
    commandQueueRef.current.drain()
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
          onApplyReviewPreset={handleApplyReviewPreset}
          autoplayEnabled={autoplayEnabled}
          autoplayIntervalMs={autoplayIntervalMs}
          autoplayLogCount={autoplayLog.length}
          onAutoplayToggle={setAutoplayEnabled}
          onAutoplayIntervalMsChange={setAutoplayIntervalMs}
          onClearAutoplayLog={handleClearAutoplayLog}
          onCopyAutoplayLog={handleCopyAutoplayLog}
          onDownloadAutoplayLog={handleDownloadAutoplayLog}
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

      <ToastStack toasts={toasts} />
    </div>
  )
}

export default App
