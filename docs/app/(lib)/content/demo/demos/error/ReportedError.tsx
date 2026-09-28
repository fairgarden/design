'use client'

import * as React from 'react'
import { CodeControllerContext } from '@fairgarden/docs/CodeControllerContext'

const message = "TypeError: Cannot read properties of undefined (reading 'species')"

/** The demo's reported failure, and its switch. */
export const ReportContext = React.createContext({
  failing: false,
  setFailing: (_failing: boolean) => {},
})

/**
 * Reports a runtime error for the demo the way a live runner does: through
 * the engine's CodeControllerContext `errors`, keyed by variant, which
 * `useDemo` surfaces as `error`.
 */
export function ReportedError({ children }: { children: React.ReactNode }) {
  const [failing, setFailing] = React.useState(true)
  const controller = React.useMemo(
    () => ({ errors: { Default: failing ? message : null } }),
    [failing],
  )
  const report = React.useMemo(() => ({ failing, setFailing }), [failing])
  return (
    <CodeControllerContext.Provider value={controller}>
      <ReportContext.Provider value={report}>{children}</ReportContext.Provider>
    </CodeControllerContext.Provider>
  )
}
