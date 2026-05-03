import { useEffect, useMemo } from 'react'
import { CanvasTexture, LinearFilter } from 'three'
import { waterBackdropPresentation } from '../../game/render/fishPresentation'
import type { AquariumSize } from './pointer'

type TankBackdropProps = {
  readonly aquariumSize: AquariumSize
}

function createWaterTexture(aquariumSize: AquariumSize): CanvasTexture | null {
  if (typeof document === 'undefined') return null

  const presentation = waterBackdropPresentation(
    Math.max(2, Math.ceil(aquariumSize.width)),
    Math.max(2, Math.ceil(aquariumSize.height)),
  )
  const canvas = document.createElement('canvas')
  canvas.width = presentation.width
  canvas.height = presentation.height

  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const gradient = ctx.createLinearGradient(0, 0, 0, presentation.height)
  gradient.addColorStop(0, presentation.topColor)
  gradient.addColorStop(0.45, presentation.middleColor)
  gradient.addColorStop(1, presentation.bottomColor)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, presentation.width, presentation.height)

  ctx.strokeStyle = presentation.gridColor
  ctx.lineWidth = 1
  for (let x = 0.5; x <= presentation.width; x += presentation.gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, presentation.height)
    ctx.stroke()
  }
  for (let y = 0.5; y <= presentation.height; y += presentation.gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(presentation.width, y)
    ctx.stroke()
  }

  const texture = new CanvasTexture(canvas)
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.needsUpdate = true
  return texture
}

function WaterBackdrop({ aquariumSize }: TankBackdropProps) {
  const texture = useMemo(() => createWaterTexture(aquariumSize), [aquariumSize])

  useEffect(() => {
    return () => texture?.dispose()
  }, [texture])

  if (!texture) return null

  return (
    <mesh position={[0, 0, -20]}>
      <planeGeometry args={[aquariumSize.width, aquariumSize.height]} />
      <meshBasicMaterial map={texture} toneMapped={false} depthWrite={false} />
    </mesh>
  )
}

export function TankBackdrop({ aquariumSize }: TankBackdropProps) {
  const floorHeight = Math.max(32, aquariumSize.height * 0.14)
  const floorY = -aquariumSize.height / 2 + floorHeight / 2
  const pebbles = useMemo(() => {
    return Array.from({ length: 55 }, (_, i) => ({
      id: i,
      x: ((i * 7919) % Math.max(1, aquariumSize.width - 8)) + 4,
      y:
        aquariumSize.height -
        floorHeight +
        ((i * 503) % Math.max(1, floorHeight - 4)) +
        2,
      rx: 2 + (i % 4),
      opacity: 0.06 + (i % 7) * 0.025,
      rotation: (i % 5) * 0.35,
    }))
  }, [aquariumSize.height, aquariumSize.width, floorHeight])

  const rocks = [
    { cx: aquariumSize.width * 0.14, rx: 26, ry: 14, rotation: 0.2 },
    { cx: aquariumSize.width * 0.82, rx: 34, ry: 16, rotation: -0.15 },
    { cx: aquariumSize.width * 0.48, rx: 22, ry: 11, rotation: 0.05 },
  ]

  const stems = [0.1, 0.28, 0.44, 0.58, 0.74, 0.9]

  return (
    <group>
      <WaterBackdrop aquariumSize={aquariumSize} />

      <mesh position={[0, floorY, -8]}>
        <planeGeometry args={[aquariumSize.width, floorHeight]} />
        <meshBasicMaterial
          color="#334155"
          opacity={0.55}
          transparent
          toneMapped={false}
        />
      </mesh>

      {pebbles.map((pebble) => (
        <mesh
          key={pebble.id}
          position={[
            pebble.x - aquariumSize.width / 2,
            aquariumSize.height / 2 - pebble.y,
            -6,
          ]}
          rotation={[0, 0, pebble.rotation]}
          scale={[pebble.rx, 1.1, 1]}
        >
          <circleGeometry args={[1, 12]} />
          <meshBasicMaterial
            color="#94a3b8"
            opacity={pebble.opacity}
            transparent
            toneMapped={false}
          />
        </mesh>
      ))}

      {rocks.map((rock) => (
        <mesh
          key={rock.cx}
          position={[
            rock.cx - aquariumSize.width / 2,
            -aquariumSize.height / 2 + floorHeight * 0.55,
            -5,
          ]}
          rotation={[0, 0, rock.rotation]}
          scale={[rock.rx, rock.ry, 1]}
        >
          <circleGeometry args={[1, 28]} />
          <meshBasicMaterial
            color="#64748b"
            opacity={0.42}
            transparent
            toneMapped={false}
          />
        </mesh>
      ))}

      {stems.map((stem) => (
        <group
          key={stem}
          position={[
            aquariumSize.width * stem - aquariumSize.width / 2,
            -aquariumSize.height / 2 + floorHeight,
            -4,
          ]}
        >
          <mesh rotation={[0, 0, -0.16]} position={[-6, 58, 0]}>
            <planeGeometry args={[2.5, 118]} />
            <meshBasicMaterial
              color="#22c55e"
              opacity={0.24}
              transparent
              toneMapped={false}
            />
          </mesh>
          <mesh rotation={[0, 0, 0.18]} position={[8, 50, 0]}>
            <planeGeometry args={[2.5, 96]} />
            <meshBasicMaterial
              color="#22c55e"
              opacity={0.22}
              transparent
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      <mesh
        position={[
          -aquariumSize.width * 0.3,
          aquariumSize.height * 0.24,
          -7,
        ]}
        scale={[aquariumSize.width * 0.35, aquariumSize.height * 0.12, 1]}
      >
        <circleGeometry args={[1, 40]} />
        <meshBasicMaterial color="#38bdf8" opacity={0.04} transparent />
      </mesh>
      <mesh
        position={[
          aquariumSize.width * 0.25,
          aquariumSize.height * 0.15,
          -7,
        ]}
        scale={[aquariumSize.width * 0.22, aquariumSize.height * 0.09, 1]}
        rotation={[0, 0, -0.2]}
      >
        <circleGeometry args={[1, 40]} />
        <meshBasicMaterial color="#38bdf8" opacity={0.04} transparent />
      </mesh>
    </group>
  )
}
