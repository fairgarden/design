'use client'

import * as React from 'react'
import { Checkbox } from '@fairgarden/design/forms/checkbox'
import { CheckboxGroup } from '@fairgarden/design/forms/checkbox-group'
import styles from './states.module.css'

const trails = ['ridge', 'river', 'meadow', 'summit']

/**
 * Rest, checked, disabled and read-only boxes, then a group whose "select
 * all" parent turns indeterminate while only some trails are ticked.
 */
export function CheckboxStates() {
  const legendId = React.useId()
  const [value, setValue] = React.useState<string[]>(['ridge'])

  return (
    <div className={styles.stack}>
      <div className={styles.list}>
        <Checkbox defaultChecked>Email Updates</Checkbox>
        <Checkbox description="One message a week, at most.">Trail Reports</Checkbox>
        <Checkbox disabled>Printed Catalog</Checkbox>
        <Checkbox disabled defaultChecked>
          Member Newsletter
        </Checkbox>
        <Checkbox readOnly defaultChecked>
          Terms Accepted
        </Checkbox>
      </div>
      <div className={styles.group}>
        <p id={legendId} className={styles.legend}>
          Trails to Walk
        </p>
        <CheckboxGroup
          aria-labelledby={legendId}
          value={value}
          onValueChange={setValue}
          allValues={trails}
        >
          <Checkbox parent>All Trails</Checkbox>
          <Checkbox value="ridge">Ridge Loop</Checkbox>
          <Checkbox value="river">River Walk</Checkbox>
          <Checkbox value="meadow">Meadow Path</Checkbox>
          <Checkbox value="summit">Summit Trail</Checkbox>
        </CheckboxGroup>
      </div>
    </div>
  )
}
