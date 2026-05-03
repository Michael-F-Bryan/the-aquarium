export type ToastItem = { id: string; message: string }

const MAX = 10

type Props = {
  toasts: ToastItem[]
}

/** Bottom-left stream of short game notifications. */
export function ToastStack({ toasts }: Props) {
  const visible = toasts.slice(-MAX)

  return (
    <div
      className="pointer-events-none fixed bottom-4 left-4 z-40 flex max-w-sm flex-col gap-2"
      aria-live="polite"
    >
      {visible.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto rounded-md border border-slate-600/80 bg-slate-900/95 px-3 py-2 text-sm text-slate-100 shadow-lg backdrop-blur-sm"
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
