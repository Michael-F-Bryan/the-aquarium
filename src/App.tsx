import { useState } from 'react'
import { AquariumCanvas } from './components/AquariumCanvas'
import { LeftPanel } from './components/LeftPanel'
import { RightPanel } from './components/RightPanel'
import {
  stubDeadFish,
  stubHud,
  stubLiveFish,
} from './game/stubData'

function App() {
  const [selectedId, setSelectedId] = useState<string | null>(
    () => stubLiveFish[0]?.id ?? null,
  )

  return (
    <div className="flex h-dvh min-h-0 flex-col bg-slate-950 text-slate-100">
      <header className="shrink-0 border-b border-slate-800 bg-slate-900/60 px-4 py-3">
        <h1 className="text-lg font-semibold tracking-tight text-slate-100">
          The Aquarium
        </h1>
      </header>

      <div className="flex min-h-0 flex-1">
        <LeftPanel hud={stubHud} />

        <main className="relative min-h-0 min-w-0 flex-1 bg-slate-900">
          <AquariumCanvas />
        </main>

        <RightPanel
          liveFish={stubLiveFish}
          deadFish={stubDeadFish}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>
    </div>
  )
}

export default App
