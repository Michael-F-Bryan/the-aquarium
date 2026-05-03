import { ListIcon } from "./hudIcons";

export type ToastLogEntry = {
  id: string;
  message: string;
};

type ToastLogShellProps = {
  entries: readonly ToastLogEntry[];
};

/**
 * Read-only toast list shell for the HUD. Simulation code will append entries later;
 * this component only renders the provided list in order inside a capped, scrollable region.
 */
export function ToastLogShell({ entries }: ToastLogShellProps) {
  return (
    <div className="w-full max-w-xs rounded-md border border-neutral-600 bg-neutral-900/90 shadow-sm backdrop-blur-sm">
      <div className="border-b border-neutral-600/80 px-3 py-2 text-xs font-semibold tracking-wide text-neutral-200">
        <span className="inline-flex items-center gap-2">
          <ListIcon className="h-4 w-4 shrink-0 text-neutral-300" />
          <span>Event log</span>
        </span>
      </div>
      <div
        role="log"
        aria-label="Event log"
        aria-live="polite"
        aria-relevant="additions"
        className="max-h-48 overflow-y-auto px-3 py-2 text-left text-sm text-neutral-100"
      >
        <ol className="m-0 flex list-none flex-col gap-1.5 p-0">
          {entries.map((entry) => (
            <li key={entry.id} className="break-words leading-snug">
              {entry.message}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
