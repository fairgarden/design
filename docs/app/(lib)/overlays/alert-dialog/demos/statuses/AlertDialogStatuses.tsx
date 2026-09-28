'use client'

import * as React from 'react'
import { Button } from '@fairgarden/design/actions/button'
import {
  AlertDialog,
  AlertDialogActions,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@fairgarden/design/overlays/alert-dialog'
import styles from './statuses.module.css'

/** Two destructive confirms, danger and warning: each trigger and confirm is a `destructive` Button, so both are red. */
export function AlertDialogStatuses() {
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [discardOpen, setDiscardOpen] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [log, setLog] = React.useState('Nothing deleted or discarded yet.')

  // Busy: the confirming button reads "Deleting…" and the alert stays open until the result.
  const deletePhotos = () => {
    setDeleting(true)
    window.setTimeout(() => {
      setDeleting(false)
      setDeleteOpen(false)
      setLog('Deleted 3 photos from the trail report.')
    }, 1200)
  }

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <AlertDialog
          open={deleteOpen}
          onOpenChange={(open) => {
            if (!deleting) setDeleteOpen(open)
          }}
        >
          <AlertDialogTrigger variant="outline" destructive>
            Delete Photos
          </AlertDialogTrigger>
          <AlertDialogPopup status="danger">
            <AlertDialogBody>
              <AlertDialogTitle>Delete 3 photos?</AlertDialogTitle>
              <AlertDialogDescription>
                They leave the trail report for everyone and can’t be restored.
              </AlertDialogDescription>
            </AlertDialogBody>
            <AlertDialogActions>
              <Button variant="solid" destructive aria-busy={deleting} onClick={deletePhotos}>
                {deleting ? 'Deleting…' : 'Delete 3 Photos'}
              </Button>
              <AlertDialogCancel disabled={deleting}>Keep Photos</AlertDialogCancel>
            </AlertDialogActions>
          </AlertDialogPopup>
        </AlertDialog>

        <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
          <AlertDialogTrigger variant="outline" destructive>
            Discard Changes
          </AlertDialogTrigger>
          <AlertDialogPopup status="warning">
            <AlertDialogBody>
              <AlertDialogTitle>Discard your edits to Ridge Loop?</AlertDialogTitle>
              <AlertDialogDescription>
                Changes made since you opened the trail are lost.
              </AlertDialogDescription>
            </AlertDialogBody>
            <AlertDialogActions>
              <Button
                variant="solid"
                destructive
                onClick={() => {
                  setDiscardOpen(false)
                  setLog('Discarded the edits to Ridge Loop.')
                }}
              >
                Discard Edits
              </Button>
              <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            </AlertDialogActions>
          </AlertDialogPopup>
        </AlertDialog>
      </div>
      <p className={styles.status} aria-live="polite">
        {log}
      </p>
    </div>
  )
}
