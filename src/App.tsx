import { useEffect, useState } from 'react'
import { AquariumCanvas } from './components/AquariumCanvas'
import { LeftPanel } from './components/LeftPanel'
import { RightPanel } from './components/RightPanel'
import { newGameState, type State } from './game/types'
import { defaultParams, type Params } from './game/params'
import { update } from './game/update'

function App() {
  const [gameState, setGameState] = useState<State>(() => newGameState())
  const [params, setParams] = useState<Params>(() => defaultParams)

  const [lastTimeMs, setLastTimeMs] = useState<number>(0)

  const [selectedId, setSelectedId] = useState<string | null>(
    () => gameState.liveFish[0]?.id ?? null,
  )

  // Set up the animation loop using requestAnimationFrame
  useEffect(() => {
    const id = requestAnimationFrame((timeMs) => {
      setLastTimeMs(timeMs)
      const deltaMs = timeMs - lastTimeMs
      const newState = update(gameState, params, deltaMs)
      setGameState(newState)
    })
    return () => cancelAnimationFrame(id)
  }, [gameState, params, lastTimeMs])

  return (
    <div className="flex h-dvh min-h-0 flex-col bg-slate-950 text-slate-100">
      <header className="shrink-0 border-b border-slate-800 bg-slate-900/60 px-4 py-3">
        <h1 className="text-lg font-semibold tracking-tight text-slate-100">
          The Aquarium
        </h1>
      </header>

      <div className="flex min-h-0 flex-1">
        <LeftPanel state={gameState} params={params} setParams={setParams} />

        <main className="relative min-h-0 min-w-0 flex-1 bg-slate-900">
          <AquariumCanvas state={gameState} />
        </main>

        <RightPanel
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
