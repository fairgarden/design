'use client'

import * as React from 'react'
import { Button } from '@fairgarden-private/design/components/Button'
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogEyebrow,
  DialogPopup,
  DialogTitle,
  DialogTopBar,
  DialogTrigger,
} from '@fairgarden-private/design/components/Dialog'
import styles from './cover.module.css'

const stops = [
  ['Trailhead kiosk', 'Maps, a water tap and the day’s closures.'],
  ['Alder crossing', 'A plank bridge over the creek; slippery after rain.'],
  ['Meadow overlook', 'Bench and interpretive sign on the spring bird count.'],
  ['Old orchard', 'Heritage apples, fenced from deer since 2019.'],
  ['Ridge saddle', 'The high point at 412 m, with a view to the reservoir.'],
  ['Fern gully', 'Steep steps down to the spring; hold the rail.'],
  ['Beaver pond', 'Quiet water; dogs stay on the boardwalk.'],
  ['Return junction', 'Left for the car park, right for the long loop.'],
] as const

export function DialogCover() {
  const [added, setAdded] = React.useState(false)

  return (
    <div className={styles.stack}>
      <Dialog>
        <DialogTrigger variant="outline" icon="zoom_in">
          Open Trail Guide
        </DialogTrigger>
        <DialogPopup wide cover="forest">
          <DialogTopBar>
            <DialogEyebrow>Field Guide</DialogEyebrow>
            <DialogTitle>Ridge Loop, Stop by Stop</DialogTitle>
            <DialogClose />
          </DialogTopBar>
          <DialogBody>
            <DialogDescription>
              Eight stops over 6.4 km. Scroll the list: a rule marks each edge with hidden content.
            </DialogDescription>
            <ol className={styles.list}>
              {stops.map(([name, note]) => (
                <li key={name} className={styles.stop}>
                  <strong className={styles.name}>{name}</strong>
                  <span>{note}</span>
                </li>
              ))}
            </ol>
          </DialogBody>
          <DialogActions>
            <DialogClose
              render={
                <Button variant="solid" onClick={() => setAdded(true)}>
                  Add to Trip
                </Button>
              }
            />
            <DialogClose render={<Button variant="outline">Close Guide</Button>} />
          </DialogActions>
        </DialogPopup>
      </Dialog>
      <p className={styles.status} aria-live="polite">
        {added ? 'Ridge Loop is in your trip.' : 'Not in your trip yet.'}
      </p>
    </div>
  )
}
