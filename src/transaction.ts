import { copy, type State } from "./domain";
/** Persist the entire next snapshot before exposing it to the UI. A failed write never partially publishes. */
export function transaction(
  previous: State,
  mutate: (next: State) => void,
  persist: (next: State) => void,
): State {
  const next = copy(previous);
  mutate(next);
  persist(next);
  return next;
}
