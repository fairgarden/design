'use client'

import * as React from 'react'
import { Breadcrumb, type BreadcrumbCrumb } from '@fairgarden-private/design/components/Breadcrumb'
import { Ground } from '@fairgarden-private/design/components/Ground'
import {
  isFieldPreset,
  isPageGroundPreset,
  presets,
  type GroundPreset,
} from '@fairgarden-private/design/utils/scope'
import styles from './grounds.module.css'

const path: BreadcrumbCrumb[] = [
  { label: 'Home', href: '#grounds' },
  { label: 'Guides', href: '#grounds' },
]

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

/** A light page ground, a pastel, a deep field and a saturated field. */
const grounds = [
  firstPreset((preset) => presets[preset].tone === 'light-base'),
  firstPreset((preset) => presets[preset].tone === 'tinted'),
  firstPreset((preset) => isFieldPreset(preset) && presets[preset].mode === 'always-dark'),
  firstPreset((preset) => isFieldPreset(preset) && presets[preset].mode === 'always-light'),
].filter((preset): preset is GroundPreset => preset != null)

export function BreadcrumbGrounds() {
  return (
    <div className={styles.stack}>
      {grounds.map((preset) => (
        <Sample key={preset} preset={preset} className={styles.face}>
          <p className={styles.name}>{preset}</p>
          <Breadcrumb kind="staircase" items={path} current="Warblers of the Northeast" />
        </Sample>
      ))}
    </div>
  )
}
