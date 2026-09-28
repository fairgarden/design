'use client'

import * as React from 'react'
import { Alert } from '@fairgarden/design/feedback/alert'
import { Button } from '@fairgarden/design/actions/button'
import styles from './statuses.module.css'

export function AlertStatuses() {
  const [retries, setRetries] = React.useState(0)

  return (
    <div className={styles.stack}>
      <Alert status="info" title="Trail closed.">
        The ridge loop reopens after the nesting season.
      </Alert>
      <Alert status="success" title="Saved.">
        Your volunteer shift is on the calendar.
      </Alert>
      <Alert status="warning" title="High water.">
        The lower ford may be impassable after rain.
      </Alert>
      <Alert
        status="danger"
        title="Couldn't load."
        action={
          <Button variant="outline" size="md" onClick={() => setRetries((value) => value + 1)}>
            Retry
          </Button>
        }
      >
        The map service didn&apos;t answer{retries > 0 ? ` (${retries} retries)` : ''}.
      </Alert>
    </div>
  )
}
