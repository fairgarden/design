'use client'

import * as React from 'react'
import { Toggle } from '@fairgarden/design/actions/toggle'
import { ToggleGroup } from '@fairgarden/design/actions/toggle-group'
import styles from './groups.module.css'

const sizes = ['XS', 'S', 'M', 'L', 'XL']

/**
 * A segmented view switch (single: ●), filter chips (multiple: ✓) and a
 * single-choice chip group whose label echoes the value.
 */
export function ToggleGroups() {
  const [size, setSize] = React.useState<string[]>(['M'])

  return (
    <div className={styles.stack}>
      <ToggleGroup variant="segmented" label="View" defaultValue={['map']}>
        <Toggle value="map">Map</Toggle>
        <Toggle value="list">List</Toggle>
        <Toggle value="grid">Grid</Toggle>
      </ToggleGroup>
      <ToggleGroup variant="chip" label="Filter Trails" multiple defaultValue={['shaded']}>
        <Toggle value="shaded">Shaded</Toggle>
        <Toggle value="loop">Loop Trail</Toggle>
        <Toggle value="dogs">Dog Friendly</Toggle>
        <Toggle value="water">Near Water</Toggle>
        <Toggle value="access" disabled>
          Step Free
        </Toggle>
      </ToggleGroup>
      <ToggleGroup
        variant="chip"
        label={`Size: ${size[0] ?? 'None'}`}
        value={size}
        onValueChange={setSize}
      >
        {sizes.map((value) => (
          <Toggle key={value} value={value}>
            {value}
          </Toggle>
        ))}
      </ToggleGroup>
      <ToggleGroup label="Units" defaultValue={['metric']}>
        <Toggle value="metric">Metric</Toggle>
        <Toggle value="imperial">Imperial</Toggle>
      </ToggleGroup>
    </div>
  )
}
