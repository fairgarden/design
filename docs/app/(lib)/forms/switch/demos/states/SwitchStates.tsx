'use client'

import * as React from 'react'
import { Switch } from '@fairgarden/design/forms/switch'
import styles from './states.module.css'

/**
 * A settings list of rows (on, off, disabled, and a remote save that shows
 * "Saving…"), then an inline switch.
 */
export function SwitchStates() {
  const [alerts, setAlerts] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  const save = (next: boolean) => {
    setSaving(true)
    window.setTimeout(() => {
      setAlerts(next)
      setSaving(false)
    }, 1200)
  }

  return (
    <div className={styles.stack}>
      <div>
        <Switch
          checked={alerts}
          onCheckedChange={save}
          aria-busy={saving}
          description="Applies at once; saving takes a moment."
        >
          Email Alerts
        </Switch>
        <Switch>Trail Closures</Switch>
        <Switch disabled>Text Messages</Switch>
        <Switch disabled defaultChecked>
          Member Mail
        </Switch>
      </div>
      <Switch kind="inline" defaultChecked>
        Show Elevation
      </Switch>
    </div>
  )
}
