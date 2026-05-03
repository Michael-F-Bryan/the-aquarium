/**
 * jsdom lacks APIs that @react-three/fiber expects (resize measurement).
 */
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

globalThis.ResizeObserver =
  globalThis.ResizeObserver ?? ResizeObserverStub;
