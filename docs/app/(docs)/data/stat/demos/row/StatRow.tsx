'use client'

import { Link } from '@fairgarden/design/actions/link'
import { Stat, StatBlock } from '@fairgarden/design/data/stat'
import styles from './row.module.css'

/** Four stats set every figure compact; two stats keep the full stat size. */
export function StatRow() {
  return (
    <div className={styles.stack}>
      <StatBlock>
        <Stat
          label="Land protected"
          value="4,200"
          unit="ha"
          qualifier="across 38 preserves"
          source={
            <Link kind="noteref" href="#stat-note-1">
              1
            </Link>
          }
        />
        <Stat label="Members" value="15,000+" delta="12% since 2025" deltaDirection="up" />
        <Stat label="Species counted" value="312" qualifier="in the 2026 bird count" />
        <Stat label="Trail closures" value="3" delta="2 fewer than last spring" deltaDirection="down" />
      </StatBlock>
      <StatBlock>
        <Stat label="Volunteer hours" value="8,640" unit="h" qualifier="in 2026" />
        <Stat label="Wetland restored" value="≈ 62" unit="ha" qualifier="since 2019" />
      </StatBlock>
      <p id="stat-note-1" className={styles.note}>
        1. Conservation easements and owned preserves, as of June 2026.
      </p>
    </div>
  )
}
