import { TankScene } from "./tank/TankScene";

export default function App() {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <TankScene className="min-h-dvh w-full flex-1" />
      <p className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-neutral-400 drop-shadow-sm">
        The Aquarium
      </p>
    </div>
  );
}
