'use client'

import * as React from 'react'
import { Button } from '@fairgarden/design/actions/button'
import { ReportContext } from './ReportedError'

/** Toggles the reported error, so the banner comes and goes. */
export function PlotLabel() {
  const { failing, setFailing } = React.useContext(ReportContext)
  return (
    <Button onClick={() => setFailing(!failing)}>{failing ? 'Pass a Plot' : 'Drop the Plot'}</Button>
  )
}
