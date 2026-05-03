import { useMemo } from 'react'
import type { AquariumSize } from './pointer'

type TankBackdropProps = {
  readonly aquariumSize: AquariumSize
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
