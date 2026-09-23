import type * as React from 'react'

/**
 * Writes a node to a consumer's ref (callback or object), for a component
 * that also keeps its own ref to the same node. Not exported from any index.
 */
export function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value)
  else if (ref) (ref as React.RefObject<T | null>).current = value
}
