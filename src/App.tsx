import { useCallback, useEffect, useRef, useState } from 'react'
import { AquariumRenderer } from './components/aquarium-r3f/AquariumRenderer'
import { LeftPanel } from './components/LeftPanel'
import { PauseMenuModal } from './components/PauseMenuModal'
import { RightPanel } from './components/RightPanel'
import { ToastStack, type ToastItem } from './components/ToastStack'
import {
  AUTOSAVE_STORAGE_KEY,
  buildAutosaveJson,
  readAutosaveFromStorage,
  type LoadAutosaveResult,
} from './game/autosave'
import { defaultParams, type Params } from './game/params'
import type { GameSnapshotPayload } from './game/types'
import {
  createAppRuntimeCommandQueue,
  mergeRuntimeParams,
  stepAppRuntime,
} from './game/appRuntime'
import { buildGameSnapshotPayload } from './game/ecs/snapshotPayload'
import {
  createInitialAquariumRuntime,
  hydrateAquariumRuntimeFromPayload,
  type AquariumRuntime,
} from './game/ecs/world'
import {
  buildAutoplayLogJson,
  type AutoplayLogEntry,
} from './game/autoplay/logExport'
import { buildReviewSessionPreset } from './game/reviewPreset'
import { formatSimulationEvent } from './game/toastMessages'

type AppRuntimeCommandMeta = {
  readonly type: 'autoplay-food-drop'
}

type AppBootstrap = {
  params: Params
  runtime: AquariumRuntime
  gameSnapshot: GameSnapshotPayload
  worldSize: { width: number; height: number }
  selectedId: string | null
  autosaveThumb: string | null
  lastClosedCalendarDayFloor: number
}

function createAppBootstrap(): AppBootstrap {
  const r = readAutosaveFromStorage()
  if (r.ok) {
    const merged = mergeRuntimeParams(r.params, {
      width: r.params.aquariumWidth,
      height: r.params.aquariumHeight,
    })
    const runtime = hydrateAquariumRuntimeFromPayload(r.snapshot, merged, 0)
    const gameSnapshot = buildGameSnapshotPayload(runtime)
    const selectedId = gameSnapshot.liveFish.some((f) => f.id === 'fish-0')
      ? 'fish-0'
      : (gameSnapshot.liveFish[0]?.id ?? null)
    return {
      params: r.params,
      runtime,
      gameSnapshot,
      worldSize: {
        width: r.params.aquariumWidth,
        height: r.params.aquariumHeight,
      },
      selectedId,
      autosaveThumb: r.thumbnailDataUrl,
      lastClosedCalendarDayFloor: gameSnapshot.lastClosedCalendarDayFloor,
    }
  }
  const params = defaultParams
  const merged = mergeRuntimeParams(params, {
    width: params.aquariumWidth,
    height: params.aquariumHeight,
  })
  const runtime = createInitialAquariumRuntime(merged)
  const gameSnapshot = buildGameSnapshotPayload(runtime)
  return {
    params,
    runtime,
    gameSnapshot,
    worldSize: {
      width: params.aquariumWidth,
      height: params.aquariumHeight,
    },
    selectedId: 'fish-0',
    autosaveThumb: null,
    lastClosedCalendarDayFloor: gameSnapshot.lastClosedCalendarDayFloor,
  }
}

const appBootstrap = createAppBootstrap()

function App() {
  const [params, setParams] = useState<Params>(() => appBootstrap.params)
  const [gameState, setGameState] = useState<GameSnapshotPayload>(
    () => appBootstrap.gameSnapshot,
  )
  const [worldSize, setWorldSize] = useState(() => appBootstrap.worldSize)

  const [selectedId, setSelectedId] = useState<string | null>(
    () => appBootstrap.selectedId,
  )
  const [paused, setPaused] = useState(false)
  const [autosaveThumb, setAutosaveThumb] = useState<string | null>(
    () => appBootstrap.autosaveThumb,
  )
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
  const lastClosedRef = useRef(appBootstrap.lastClosedCalendarDayFloor)
  const simulationRef = useRef<AquariumRuntime>(appBootstrap.runtime)
  const gameRef = useRef(appBootstrap.gameSnapshot)
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
      const result = stepAppRuntime({
        runtime: simulationRef.current,
        params: p,
        worldSize: w,
        deltaMs: rawDelta,
        commands,
      })
      gameRef.current = result.readModel
      setGameState(result.readModel)

      for (const ev of result.events) {
        pushToast(formatSimulationEvent(ev))
      }
      for (const outcome of result.commandOutcomes) {
        if (outcome.meta?.type !== 'autoplay-food-drop') continue
        appendAutoplayLog({
          atDay: outcome.atDay ?? result.readModel.currentDay,
          action: outcome.applied ? 'drop' : 'skip',
          reason: outcome.reason ?? (outcome.applied ? 'policy-drop' : 'drop-rejected'),
          targetFishId: outcome.targetFishId,
          liveFishCount: outcome.liveFishCount ?? result.readModel.liveFish.length,
          foodCount: outcome.foodCount ?? result.readModel.food.length,
        })
      }
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
      commandQueueRef.current.enqueue({
        command: { type: 'autoplay-drop-food' },
        meta: { type: 'autoplay-food-drop' },
      })
    }, delay)
    return () => window.clearInterval(timer)
  }, [autoplayEnabled, autoplayIntervalMs, paused])

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
        snapshot: snap,
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

  const applyRestoredAutosave = useCallback(
    (r: Extract<LoadAutosaveResult, { ok: true }>) => {
      commandQueueRef.current.drain()
      const merged = mergeRuntimeParams(r.params, {
        width: r.params.aquariumWidth,
        height: r.params.aquariumHeight,
      })
      simulationRef.current = hydrateAquariumRuntimeFromPayload(r.snapshot, merged, 0)
      const snap = buildGameSnapshotPayload(simulationRef.current)
      gameRef.current = snap
      setGameState(snap)
      setParams(r.params)
      setWorldSize({
        width: r.params.aquariumWidth,
        height: r.params.aquariumHeight,
      })
      lastClosedRef.current = snap.lastClosedCalendarDayFloor
      setSelectedId((prev) => {
        if (prev && snap.liveFish.some((f) => f.id === prev)) return prev
        return snap.liveFish[0]?.id ?? null
      })
      setAutosaveThumb(r.thumbnailDataUrl)
    },
    [],
  )

  const handleReplaceGameState = useCallback((next: GameSnapshotPayload) => {
    commandQueueRef.current.drain()
    const merged = mergeRuntimeParams(paramsRef.current, worldRef.current)
    simulationRef.current = hydrateAquariumRuntimeFromPayload(next, merged, 0)
    const snap = buildGameSnapshotPayload(simulationRef.current)
    gameRef.current = snap
    setGameState(snap)
    lastClosedRef.current = snap.lastClosedCalendarDayFloor
    setSelectedId((prev) => {
      if (prev && snap.liveFish.some((f) => f.id === prev)) return prev
      return snap.liveFish[0]?.id ?? null
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
    applyRestoredAutosave(r)
    setPaused(false)
  }, [applyRestoredAutosave])

  const handleNewGame = useCallback(() => {
    if (!window.confirm('Start a new game? Unsaved progress in the tank will be lost.')) {
      return
    }
    commandQueueRef.current.drain()
    const merged = mergeRuntimeParams(defaultParams, worldRef.current)
    simulationRef.current = createInitialAquariumRuntime(merged)
    const next = buildGameSnapshotPayload(simulationRef.current)
    gameRef.current = next
    setGameState(next)
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
          onReplaceGameState={handleReplaceGameState}
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
          <AquariumRenderer
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

      {paused ? (
        <PauseMenuModal
          open
          hasAutosave={hasAutosave}
          autosavePreviewUrl={autosaveThumb}
          params={params}
          setParams={setParams}
          onApplyReviewPreset={handleApplyReviewPreset}
          onResume={handleResume}
          onLoadAutosave={handleLoadAutosave}
          onNewGame={handleNewGame}
        />
      ) : null}

      <ToastStack toasts={toasts} />
    </div>
  )
}

export default App
