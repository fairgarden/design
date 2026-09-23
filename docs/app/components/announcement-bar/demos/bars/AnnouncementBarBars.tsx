'use client'

import * as React from 'react'
import {
  AnnouncementBar,
  AnnouncementBarAccent,
} from '@fairgarden-private/design/components/AnnouncementBar'
import styles from './bars.module.css'

/** A page-ground bar with its rule, link and dismiss; a mono countdown; a forest field bar; a dual-voice record. */
export function AnnouncementBarBars() {
  const [dismissals, setDismissals] = React.useState(0)

  return (
    <div className={styles.stack}>
      <AnnouncementBar
        key={dismissals}
        preset="white"
        link={{ href: 'https://example.org/hours', label: 'See Hours' }}
        dismissible
      >
        The visitor center is closed 24–26 December.
      </AnnouncementBar>
      <AnnouncementBar
        voice="mono"
        countdown={{ end: '2026-12-31T17:00:00Z', expired: 'Registration closed' }}
      >
        Registration closes in
      </AnnouncementBar>
      <AnnouncementBar
        kind="field"
        link={{ href: 'https://example.org/walks', label: 'Book a Walk' }}
      >
        Guided spring walks are open for booking.
      </AnnouncementBar>
      <AnnouncementBar kind="field" preset="amber" voice="dual" record>
        Product recall: <AnnouncementBarAccent>Trail Mix No. 4</AnnouncementBarAccent>, lots 12–19
      </AnnouncementBar>
      <p className={styles.status}>
        <button type="button" className={styles.reset} onClick={() => setDismissals((n) => n + 1)}>
          Show the dismissed bar again
        </button>
      </p>
    </div>
  )
}
