'use client'

import { Stat, StatBlock } from '@fairgarden/design/data/stat'
import styles from './hero.module.css'

/** The hero stat on the blob mount (once per page), and a stat inline in running text. */
export function StatHero() {
  return (
    <div className={styles.stack}>
      <StatBlock kind="hero">
        <Stat label="Nesting pairs" value="42" qualifier="of bald eagles on the river, up from 6 in 2001" />
      </StatBlock>
      <p className={styles.text}>
        The new index answers a query in{' '}
        <StatBlock kind="inline">
          <Stat value="38" unit="ms" qualifier="at the 95th percentile" />
        </StatBlock>
        , fast enough for the search field to update as you type.
      </p>
    </div>
  )
}
