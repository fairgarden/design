'use client'

import * as React from 'react'
import { Button } from '@fairgarden-private/design/components/Button'
import {
  AlertDialog,
  AlertDialogActions,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@fairgarden-private/design/components/AlertDialog'
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
import styles from './basic.module.css'

/**
 * A rename task. Its destructive action, Delete Trail, is a `destructive`
 * text Button that opens an alert over the dialog, whose confirm is red too.
 */
export function DialogBasic() {
  const [name, setName] = React.useState('Ridge Loop')
  const [draft, setDraft] = React.useState(name)
  const [open, setOpen] = React.useState(false)
  const [deleted, setDeleted] = React.useState(false)

  return (
    <div className={styles.stack}>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (next) setDraft(name)
          setOpen(next)
        }}
      >
        <DialogTrigger variant="outline" disabled={deleted}>
          Rename Trail
        </DialogTrigger>
        <DialogPopup>
          <DialogTopBar>
            <DialogEyebrow>Trail 12</DialogEyebrow>
            <DialogTitle>Rename Trail</DialogTitle>
            <DialogClose />
          </DialogTopBar>
          <DialogBody>
            <DialogDescription>
              The new name shows on the map, the trailhead sign list and the printed guide.
            </DialogDescription>
            <label className={styles.field}>
              <span className={styles.label}>Trail Name</span>
              <input
                className={styles.input}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
            </label>
          </DialogBody>
          <DialogActions>
            <DialogClose
              render={
                <Button variant="solid" onClick={() => setName(draft.trim() || name)}>
                  Save Name
                </Button>
              }
            />
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <AlertDialog>
              <AlertDialogTrigger variant="text" destructive>
                Delete Trail
              </AlertDialogTrigger>
              <AlertDialogPopup status="danger">
                <AlertDialogBody>
                  <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    It leaves the map and the printed guide for everyone.
                  </AlertDialogDescription>
                </AlertDialogBody>
                <AlertDialogActions>
                  <Button
                    variant="solid"
                    destructive
                    onClick={() => {
                      setDeleted(true)
                      setOpen(false)
                    }}
                  >
                    Delete Trail
                  </Button>
                  <AlertDialogCancel>Keep Trail</AlertDialogCancel>
                </AlertDialogActions>
              </AlertDialogPopup>
            </AlertDialog>
          </DialogActions>
        </DialogPopup>
      </Dialog>
      {deleted ? (
        <Button variant="text" onClick={() => setDeleted(false)}>
          Restore Trail
        </Button>
      ) : null}
      <p className={styles.status} aria-live="polite">
        {deleted ? `Deleted ${name}.` : `Current name: ${name}`}
      </p>
    </div>
  )
}
