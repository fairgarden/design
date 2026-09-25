'use client'

import * as React from 'react'
import { Button } from '@fairgarden/design/actions/button'
import { useToastManager } from '@fairgarden/design/feedback/toast'
import styles from './statuses.module.css'

/**
 * The toasts go to the app's one ToastProvider, which this site mounts in its
 * layout: an app has a single toast bar, so a demo never wraps its own.
 */
export function ToastStatuses() {
  const toasts = useToastManager()
  const [items, setItems] = React.useState(3)

  const removeItems = () => {
    const removed = items
    setItems(0)
    const id = toasts.add({
      title: `${removed} items removed`,
      description: 'They left your trip list.',
      status: 'success',
      actions: [
        {
          children: 'Undo',
          onClick: () => {
            // Busy: the cell reads "Undoing…" at its rest width, then the toast closes.
            toasts.update(id, { actions: [{ children: 'Undoing…', 'aria-busy': true }] })
            window.setTimeout(() => {
              setItems(removed)
              toasts.close(id)
            }, 1200)
          },
        },
      ],
    })
  }

  // A destructive action cell: "Discard Notes" is drawn in the danger ink.
  const showError = () => {
    const id = toasts.add({
      status: 'danger',
      title: 'Couldn’t sync your notes',
      description: 'Check your connection; your notes are kept on this device.',
      actions: [
        { children: 'Try Again', onClick: () => toasts.close(id) },
        { children: 'Discard Notes', destructive: true, onClick: () => toasts.close(id) },
      ],
    })
  }

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <Button variant="solid" destructive onClick={removeItems} disabled={items === 0}>
          Remove Items
        </Button>
        <Button onClick={() => toasts.add({ title: 'Draft saved', description: 'Saved 2 minutes ago.' })}>
          Save Draft
        </Button>
        <Button
          onClick={() =>
            toasts.add({ status: 'info', title: 'Trail map updated', description: 'The Alder crossing detour is marked.' })
          }
        >
          Show Info
        </Button>
        <Button
          onClick={() =>
            toasts.add({ status: 'warning', title: 'Storm warning', description: 'Ridge trails close at 3 pm today.' })
          }
        >
          Show Warning
        </Button>
        <Button onClick={showError}>Show Error</Button>
      </div>
      <p className={styles.status} aria-live="polite">
        {`Trip list: ${items} items. Neutral, info and success toasts close after 6 s, paused on hover, focus or a hidden tab; warning, error and action toasts stay.`}
      </p>
    </div>
  )
}
