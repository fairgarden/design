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
import styles from './basic.module.css'

export function DialogBasic() {
  const [name, setName] = React.useState('Ridge Loop')
  const [draft, setDraft] = React.useState(name)

  return (
    <div className={styles.stack}>
      <Dialog
        onOpenChange={(open) => {
          if (open) setDraft(name)
        }}
      >
        <DialogTrigger variant="outline">Rename Trail</DialogTrigger>
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
          </DialogActions>
        </DialogPopup>
      </Dialog>
      <p className={styles.status} aria-live="polite">
        Current name: {name}
      </p>
    </div>
  )
}
