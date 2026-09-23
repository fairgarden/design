import * as React from 'react'

/**
 * Marks each case-insensitive occurrence of `query` in `label` with the
 * `match` part: weight, never color or fill (P2).
 */
export function highlightMatch(label: string, query: string, className: string) {
  const needle = query.trim().toLocaleLowerCase()
  if (!needle) return label
  const haystack = label.toLocaleLowerCase()
  const parts: React.ReactNode[] = []
  let start = 0
  let index = haystack.indexOf(needle)
  while (index !== -1) {
    if (index > start) parts.push(label.slice(start, index))
    parts.push(
      <mark key={index} className={className}>
        {label.slice(index, index + needle.length)}
      </mark>,
    )
    start = index + needle.length
    index = haystack.indexOf(needle, start)
  }
  if (start < label.length) parts.push(label.slice(start))
  return parts
}
