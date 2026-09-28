'use client'

import * as React from 'react'
import { Chip } from '@fairgarden/design/actions/chip'
import { PresetGround } from '@/components/PresetGround'
import styles from './removable.module.css'

const initial = ['Oak Savanna', 'Wetland', 'Tallgrass Prairie', 'Riparian Forest']

/** Active filters as removable chips; the last one is locked. On paper and on the forest field. */
export function ChipRemovable() {
  const [chosen, setChosen] = React.useState(initial)
  const remove = (value: string) => setChosen((list) => list.filter((item) => item !== value))

  return (
    <div className={styles.stack}>
      {(['paper', 'forest'] as const).map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.face}>
          <span className={styles.name}>{preset}</span>
          <ul className={styles.row} aria-label="Active filters">
            {chosen.map((value) => (
              <li key={value}>
                <Chip onRemove={() => remove(value)}>{value}</Chip>
              </li>
            ))}
            <li>
              <Chip disabled onRemove={() => undefined} removeLabel="Remove Members Only (locked)">
                Members Only
              </Chip>
            </li>
          </ul>
        </PresetGround>
      ))}
      <p className={styles.status} aria-live="polite">
        {chosen.length} of {initial.length} filters active
        {chosen.length < initial.length ? (
          <>
            {' '}
            <button type="button" className={styles.reset} onClick={() => setChosen(initial)}>
              Reset
            </button>
          </>
        ) : null}
      </p>
    </div>
  )
}
