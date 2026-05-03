import { useSimulationClock } from "../game/simulationClockContext";
import { CalendarIcon } from "./hudIcons";

function calendarDayFromSimDays(simDays: number): number {
  // Guard against float dust (e.g. 26 × 0.25/6.5) landing just below the next integer.
  return Math.floor(simDays + 1e-9) + 1;
}

export function DayCounter() {
  const { simDays } = useSimulationClock();
  const day = calendarDayFromSimDays(simDays);
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Current simulation day, ${day}`}
      className="rounded-md border border-neutral-600 bg-neutral-900/90 px-3 py-1.5 text-sm font-medium tabular-nums tracking-wide text-neutral-100 shadow-sm backdrop-blur-sm"
    >
      <span className="inline-flex items-center gap-2">
        <CalendarIcon className="h-4 w-4 shrink-0 text-neutral-300" />
        <span>Day {day}</span>
      </span>
    </div>
  );
}
