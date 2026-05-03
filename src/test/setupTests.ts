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

// jsdom logs noisy "Not implemented" warnings for 2D canvas contexts.
if (typeof HTMLCanvasElement !== "undefined") {
  Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
    configurable: true,
    value: () => null,
  });
}
