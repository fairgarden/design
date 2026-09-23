'use client'

import * as React from 'react'
import { Ground } from '@fairgarden-private/design/components/Ground'
import { Link } from '@fairgarden-private/design/components/Link'
import { Newsletter } from '@fairgarden-private/design/components/Newsletter'
import styles from './straddle.module.css'

/**
 * The royal straddle card opening the night band: the seam falls between
 * its heading and first field. `reading` widens it to the reading measure
 * from 1024 px, so Email and Postcode share a row.
 */
export function NewsletterStraddle() {
  const [reading, setReading] = React.useState(true)

  return (
    <div className={styles.frame}>
      <label className={styles.toggle}>
        <input
          type="checkbox"
          checked={reading}
          onChange={(event) => setReading(event.target.checked)}
        />{' '}
        Reading page (align to the prose column)
      </label>
      <Ground kind="band" preset="paper" render={<div />} className={styles.upper}>
        <p className={styles.prose}>
          …and so the thrush returns each May to the same few acres of old forest, which is why
          protecting them matters.
        </p>
      </Ground>
      <Ground kind="band" preset="night" render={<div />} className={styles.lower}>
        <div className={styles.container}>
          <Newsletter
            kind="straddle"
            grained
            reading={reading}
            postcode
            heading="Get the Latest Bird Conservation News"
            printUrl="example.org/newsletter"
            submitLabel="Sign Up"
            legal={
              <>
                By signing up you agree to our <Link href="https://example.org/terms">terms</Link>.
              </>
            }
          />
          <p className={styles.after}>The footer continues here.</p>
        </div>
      </Ground>
    </div>
  )
}
