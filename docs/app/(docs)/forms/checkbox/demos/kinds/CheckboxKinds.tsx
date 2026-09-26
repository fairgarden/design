'use client'

import * as React from 'react'
import { Checkbox } from '@fairgarden/design/forms/checkbox'
import { CheckboxGroup } from '@fairgarden/design/forms/checkbox-group'
import styles from './kinds.module.css'

/**
 * Option cards (caps title, right-aligned value) and ledger rows (a dotted
 * leader to the box). The group's `kind` sets its checkboxes' kind.
 */
export function CheckboxKinds() {
  const cardsId = React.useId()
  const ledgerId = React.useId()

  return (
    <div className={styles.stack}>
      <div className={styles.group}>
        <p id={cardsId} className={styles.legend}>
          Framing Options
        </p>
        <CheckboxGroup kind="card" aria-labelledby={cardsId} defaultValue={['frame']}>
          <Checkbox value="frame" valueLabel="+ $75.00" description="Solid oak, hand finished.">
            Oak Frame
          </Checkbox>
          <Checkbox value="mount" valueLabel="+ $20.00">
            Archival Mount
          </Checkbox>
          <Checkbox value="glass" valueLabel="+ $40.00" disabled>
            Museum Glass
          </Checkbox>
        </CheckboxGroup>
      </div>
      <div className={styles.group}>
        <p id={ledgerId} className={styles.legend}>
          Order Sheet
        </p>
        <CheckboxGroup kind="ledger" aria-labelledby={ledgerId} defaultValue={['fern']}>
          <Checkbox value="fern" valueLabel="$120">
            Fern Print
          </Checkbox>
          <Checkbox value="heron" valueLabel="$140">
            Heron Print
          </Checkbox>
          <Checkbox value="map" valueLabel="$95">
            Trail Map
          </Checkbox>
        </CheckboxGroup>
      </div>
    </div>
  )
}
