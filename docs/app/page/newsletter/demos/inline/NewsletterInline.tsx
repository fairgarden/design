'use client'

import * as React from 'react'
import { Ground } from '@fairgarden/design/foundations/ground'
import { Link } from '@fairgarden/design/actions/link'
import {
  Newsletter,
  type NewsletterStatusKind,
} from '@fairgarden/design/page/newsletter'
import styles from './inline.module.css'

/** An envelope at the block tier, drawn in currentColor (--role-accent). */
function Envelope() {
  return (
    <svg viewBox="0 0 36 36" aria-hidden="true" focusable="false" className={styles.icon}>
      <rect x="4" y="8" width="28" height="20" rx="2" />
      <path d="m5 10 13 10 13-10" />
    </svg>
  )
}

/** The inline footer form on the night band, with the butted submit cell. Submit to see "Sending…", then success. */
export function NewsletterInline() {
  const [busy, setBusy] = React.useState(false)
  const [status, setStatus] = React.useState<NewsletterStatusKind | undefined>()

  return (
    <Ground kind="band" preset="night" render={<div />} className={styles.band}>
      <div className={styles.column}>
        <Newsletter
          heading="Subscribe"
          pitch="Stories from the land, once a month."
          icon={<Envelope />}
          printUrl="example.org/newsletter"
          busy={busy}
          status={status}
          statusMessage="Check your inbox to confirm."
          legal={
            <>
              We never share your address. <Link href="https://example.org/privacy">Privacy</Link>
            </>
          }
          onSubscribe={() => {
            setBusy(true)
            window.setTimeout(() => {
              setBusy(false)
              setStatus('success')
            }, 1200)
          }}
        />
      </div>
    </Ground>
  )
}
