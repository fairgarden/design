'use client'

import * as React from 'react'
import { Ground } from '@fairgarden-private/design/components/Ground'
import {
  Toolbar,
  ToolbarBottomRule,
  ToolbarButton,
  ToolbarCount,
  ToolbarGroup,
  ToolbarSeparator,
} from '@fairgarden-private/design/components/Toolbar'
import {
  isFieldPreset,
  isPageGroundPreset,
  presets,
  type GroundPreset,
} from '@fairgarden-private/design/utils/scope'
import styles from './grounds.module.css'

/** The first preset that passes `test`, read from the preset table, never named here. */
function firstPreset(test: (preset: GroundPreset) => boolean): GroundPreset | undefined {
  return (Object.keys(presets) as GroundPreset[]).find(test)
}

/** A sample surface: a field preset as an inset field, a page ground as a face. */
function Sample({
  preset,
  className,
  children,
}: {
  preset: GroundPreset
  className: string
  children: React.ReactNode
}) {
  if (isFieldPreset(preset)) {
    return (
      <Ground kind="field" preset={preset} className={className}>
        {children}
      </Ground>
    )
  }
  if (isPageGroundPreset(preset)) {
    return (
      <Ground kind="face" preset={preset} className={className}>
        {children}
      </Ground>
    )
  }
  return null
}

/** A light page ground, a pastel and a deep field; toolbars avoid saturated fields. */
const grounds = [
  firstPreset((preset) => presets[preset].tone === 'light-base'),
  firstPreset((preset) => presets[preset].tone === 'tinted'),
  firstPreset((preset) => isFieldPreset(preset) && presets[preset].mode === 'always-dark'),
].filter((preset): preset is GroundPreset => preset != null)

export function ToolbarGrounds() {
  return (
    <div className={styles.stack}>
      {grounds.map((preset) => (
        <Sample key={preset} preset={preset} className={styles.face}>
          <p className={styles.name}>{preset}</p>
          <Toolbar aria-label={`Sightings on ${preset}`}>
            <ToolbarCount>Sightings (12)</ToolbarCount>
            <ToolbarGroup>
              <ToolbarButton icon="add">Log Sighting</ToolbarButton>
              <ToolbarSeparator />
              <ToolbarButton iconOnly icon="download">
                Download
              </ToolbarButton>
            </ToolbarGroup>
            <ToolbarBottomRule />
          </Toolbar>
        </Sample>
      ))}
    </div>
  )
}
