import * as React from 'react'

/**
 * Writes a node to a consumer's ref (callback or object), for a component
 * that also keeps its own ref to the same node. Not exported from any index.
 */
export function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value)
  else if (ref) (ref as React.RefObject<T | null>).current = value
}

/**
 * One ref for two: either alone when the other is missing, else a callback
 * that writes both, whose identity changes only with theirs. Not exported
 * from any index.
 */
export function useMergedRef<T>(
  a: React.Ref<T> | undefined,
  b: React.Ref<T> | undefined
): React.Ref<T> | undefined {
  return React.useMemo(() => {
    if (!a) return b
    if (!b) return a
    return (node: T | null) => {
      assignRef(a, node)
      assignRef(b, node)
    }
  }, [a, b])
}
