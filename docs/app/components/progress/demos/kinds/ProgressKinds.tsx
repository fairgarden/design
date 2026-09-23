'use client'

import * as React from 'react'
import { Button } from '@fairgarden-private/design/components/Button'
import { Progress } from '@fairgarden-private/design/components/Progress'
import styles from './kinds.module.css'

/** Bar, steps, ring and rail; indeterminate, complete and failed. */
export function ProgressKinds() {
  const [upload, setUpload] = React.useState(62)

  return (
    <div className={styles.stack}>
      <Progress label="Uploading trail map" value={upload} />
      <div className={styles.row}>
        <Button size="sm" onClick={() => setUpload((value) => Math.min(100, value + 19))}>
          Upload More
        </Button>
        <Button size="sm" variant="text" onClick={() => setUpload(0)}>
          Reset
        </Button>
      </div>
      <Progress kind="steps" label="Membership form" value={2} max={4} />
      <Progress kind="ring" label="Quiz" value={3} max={5} formatValue={(_formatted, value) => `${value} of 5`} />
      <Progress label="Loading sightings" value={null} />
      <Progress
        label="Photo upload"
        value={40}
        status="danger"
        statusText="Upload failed. Retry"
      />
      <Progress kind="rail" label="Gallery position" value={3} max={8} formatValue={(_formatted, value) => `${value} of 8`} />
    </div>
  )
}
