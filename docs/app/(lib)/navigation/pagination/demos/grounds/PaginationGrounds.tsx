'use client'

import * as React from 'react'
import { Ground } from '@fairgarden/design/foundations/ground'
import { Pagination } from '@fairgarden/design/navigation/pagination'
import {
  isFieldPreset,
  isPageGroundPreset,
  presets,
  type GroundPreset,
} from '@fairgarden/design/utils/scope'
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

/** A light page ground, a pastel and a deep field; lists rarely sit on saturated fields. */
const grounds = [
  firstPreset((preset) => presets[preset].tone === 'light-base'),
  firstPreset((preset) => presets[preset].tone === 'tinted'),
  firstPreset((preset) => isFieldPreset(preset) && presets[preset].mode === 'always-dark'),
].filter((preset): preset is GroundPreset => preset != null)

const href = (page: number) => `#grounds-${page}`

export function PaginationGrounds() {
  return (
    <div className={styles.stack}>
      {grounds.map((preset) => (
        <Sample key={preset} preset={preset} className={styles.face}>
          <p className={styles.name}>{preset}</p>
          <Pagination kind="compact" page={3} count={12} getHref={href} />
        </Sample>
      ))}
    </div>
  )
}
