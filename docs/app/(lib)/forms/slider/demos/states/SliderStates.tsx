'use client'

import * as React from 'react'
import { Slider } from '@fairgarden/design/forms/slider'
import styles from './states.module.css'

/**
 * Continuous with a unit, stepped with a labelled tick scale, a two-thumb
 * range, and disabled (the indicator goes, the value stays).
 */
export function SliderStates() {
  return (
    <div className={styles.stack}>
      <Slider
        label="Walking Distance"
        defaultValue={6}
        max={20}
        step={0.5}
        formatValue={(formatted) => `${formatted[0]} km`}
      />
      <Slider
        label="Group Size"
        stepped
        defaultValue={8}
        min={0}
        max={20}
        marks={[
          { value: 0 },
          { value: 5 },
          { value: 10 },
          { value: 15 },
          { value: 20 },
        ]}
      />
      <Slider
        label="Price Range"
        defaultValue={[40, 120]}
        max={200}
        step={5}
        minStepsBetweenValues={2}
        format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
        thumbLabels={['Minimum price', 'Maximum price']}
      />
      <Slider label="Elevation Gain" defaultValue={300} max={1000} disabled formatValue={(formatted) => `${formatted[0]} m`} />
    </div>
  )
}
