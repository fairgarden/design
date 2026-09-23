'use client'

import * as React from 'react'
import { Toggle } from '@fairgarden-private/design/components/Toggle'
import styles from './states.module.css'

/**
 * Text toggles (pressed shows ✓, the inverse pair and weight 700), an icon
 * toggle that swaps ▷ for ‖, sizes, and a disabled toggle.
 */
export function ToggleStates() {
  const [playing, setPlaying] = React.useState(false)

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <Toggle defaultPressed>Show Trails</Toggle>
        <Toggle icon="zoom_in">Magnify</Toggle>
        <Toggle size="sm">Small</Toggle>
        <Toggle disabled>Offline Maps</Toggle>
      </div>
      <div className={styles.row}>
        <Toggle
          iconOnly
          icon="play_arrow"
          pressedIcon="pause"
          pressed={playing}
          onPressedChange={setPlaying}
        >
          {playing ? 'Pause Birdsong' : 'Play Birdsong'}
        </Toggle>
        <span className={styles.status} aria-live="polite">
          {playing ? 'Playing' : 'Paused'}
        </span>
      </div>
    </div>
  )
}
