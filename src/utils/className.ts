/*
 * Class-name helpers shared by every component. Not exported from any
 * index. CVA builds each part's own classes; these join a consumer's
 * `className` after them (§1.11.3), keeping Base UI's state-function form
 * (§1.11.4).
 */

/** Base UI's `className`: a string, or a function of the part's state. */
export type StateClassName<State> = string | ((state: State) => string | undefined) | undefined

/**
 * Appends a consumer's `className` (string or state function) to a CVA
 * result, keeping the function form so Base UI can call it with the state.
 */
export function resolveClassName<State>(
  className: StateClassName<State>,
  build: (extra?: string) => string
): string | ((state: State) => string) {
  if (typeof className === 'function') {
    return (state: State) => build(className(state))
  }
  return build(className)
}

/** Space-joins the truthy class names. */
export function cx(...names: Array<string | false | null | undefined>): string {
  return names.filter(Boolean).join(' ')
}
