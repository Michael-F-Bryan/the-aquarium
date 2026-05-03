import { useCallback, useEffect, useRef, useState } from 'react'
import { AquariumCanvas } from './components/AquariumCanvas'
import { LeftPanel } from './components/LeftPanel'
import { RightPanel } from './components/RightPanel'
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

  const paramsRef = useRef(params)
  const worldRef = useRef(worldSize)

  useEffect(() => {
    paramsRef.current = params
  }, [params])

  useEffect(() => {
    worldRef.current = worldSize
  }, [worldSize])

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    let active = true

    const tick = (now: number) => {
      if (!active) return
      const rawDelta = now - last
      last = now
      const p = paramsRef.current
      const w = worldRef.current
      const merged: Params = {
        ...p,
        aquariumWidth: w.width,
        aquariumHeight: w.height,
      }
      setGameState((prev) => update(prev, merged, rawDelta))
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

  const handleWorldSize = useCallback((width: number, height: number) => {
    setWorldSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height },
    )
  }, [])

  const handleDropFood = useCallback(
    (x: number, y: number) => {
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
    setSelectedId((prev) => {
      if (prev && next.liveFish.some((f) => f.id === prev)) return prev
      return next.liveFish[0]?.id ?? null
    })
  }, [])

  return (
    <div className="flex h-dvh min-h-0 flex-col bg-slate-950 text-slate-100">
      <header className="shrink-0 border-b border-slate-800 bg-slate-900/60 px-4 py-3">
        <h1 className="text-lg font-semibold tracking-tight text-slate-100">
          The Aquarium
        </h1>
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
            state={gameState}
            onWorldSize={handleWorldSize}
            onDropFood={handleDropFood}
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
    </div>
  )
}

export default App
