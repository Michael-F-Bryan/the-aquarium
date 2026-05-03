import { Canvas } from '@react-three/fiber'
import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ForwardedRef,
  type MouseEvent,
} from 'react'
import { defaultParams } from '../../game/params'
import type { GameSnapshotPayload } from '../../game/types'
import { AquariumScene } from './AquariumScene'
import {
  clientPointToAquariumPoint,
  type AquariumSize,
} from './pointer'

type AquariumRendererProps = {
  readonly state: GameSnapshotPayload
  readonly onWorldSize?: (width: number, height: number) => void
  /** Logical aquarium coordinates (CSS pixels, same space as fish positions). */
  readonly onDropFood?: (x: number, y: number) => void
  /** When true, food drops are ignored (e.g. while paused). */
  readonly dropDisabled?: boolean
}

const aquariumBackground: CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(0deg, rgba(148, 163, 184, 0.12) 0 1px, transparent 1px 48px), repeating-linear-gradient(90deg, rgba(148, 163, 184, 0.12) 0 1px, transparent 1px 48px), linear-gradient(180deg, #0c4a6e 0%, #075985 45%, #164e63 100%)',
}

function assignCanvasRef(
  ref: ForwardedRef<HTMLCanvasElement>,
  canvas: HTMLCanvasElement | null,
): void {
  if (typeof ref === 'function') {
    ref(canvas)
  } else if (ref) {
    ref.current = canvas
  }
}

/** R3F aquarium renderer with canvas capture and CSS-pixel input semantics. */
export const AquariumRenderer = forwardRef<
  HTMLCanvasElement,
  AquariumRendererProps
>(function AquariumRenderer(
  { state, onWorldSize, onDropFood, dropDisabled = false },
  ref,
) {
  const shellRef = useRef<HTMLDivElement | null>(null)
  const [aquariumSize, setAquariumSize] = useState<AquariumSize>({
    width: defaultParams.aquariumWidth,
    height: defaultParams.aquariumHeight,
  })

  useEffect(() => {
    const shell = shellRef.current
    if (!shell) return

    const publishSize = () => {
      const width = shell.clientWidth
      const height = shell.clientHeight
      if (width <= 0 || height <= 0) return

      setAquariumSize((prev) =>
        prev.width === width && prev.height === height
          ? prev
          : { width, height },
      )
      onWorldSize?.(width, height)
    }

    publishSize()
    const observer = new ResizeObserver(publishSize)
    observer.observe(shell)

    return () => observer.disconnect()
  }, [onWorldSize])

  useEffect(() => {
    return () => assignCanvasRef(ref, null)
  }, [ref])

  const handleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!onDropFood || dropDisabled) return
      const shell = shellRef.current
      if (!shell) return

      const point = clientPointToAquariumPoint(
        shell.getBoundingClientRect(),
        event,
        aquariumSize,
      )
      onDropFood(point.x, point.y)
    },
    [aquariumSize, dropDisabled, onDropFood],
  )

  return (
    <div
      ref={shellRef}
      role="img"
      tabIndex={0}
      aria-label="Aquarium - click to drop fish food"
      className={`relative h-full w-full touch-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 ${
        dropDisabled ? 'cursor-not-allowed' : 'cursor-crosshair'
      }`}
      style={aquariumBackground}
      onClick={handleClick}
    >
      <Canvas
        className="absolute inset-0 block h-full w-full"
        orthographic
        frameloop="demand"
        camera={{ position: [0, 0, 100], zoom: 1, near: 0.1, far: 200 }}
        dpr={[1, 2]}
        gl={{
          alpha: true,
          antialias: true,
          preserveDrawingBuffer: true,
        }}
        onCreated={({ gl }) => assignCanvasRef(ref, gl.domElement)}
      >
        <AquariumScene state={state} aquariumSize={aquariumSize} />
      </Canvas>
    </div>
  )
})
