import type { Params } from "./params";
import type { State } from "./types";

export function update(state: State, params: Params, deltaMs: number): State {
    const { currentDay } = state
    const newDay = currentDay + deltaMs / params.dayLengthMs

    return { ...state, currentDay: newDay }
}
