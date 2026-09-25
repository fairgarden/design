'use client'

import * as React from 'react'
import { cva } from 'class-variance-authority'

import { DisclosureGlyph } from '../../disclosure/collapsible'
import { cx } from '../../utils/className'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import styles from './code-block.module.css'

/*
 * Internal to Code Block and Demo: the frame parts the loaded block and its
 * loading state share: the CVA function and the window's toggle (the
 * header, with its hanging actions, is File Tabs'). No docs engine runtime
 * here, so the loading path (CodeBlockLoading, DemoLoading) stays light.
 * Not exported from the index; `codeBlock` is re-exported by CodeBlock.
 */

/** Code Block's CVA function. `embedded` is the Demo's code section. */
export const codeBlock = cva(styles.base, {
  variants: {
    embedded: {
      true: styles.embedded,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    embedded: false,
  },
})

/** Display names for variant keys, as in the source. */
const VARIANT_LABELS: Readonly<Record<string, string>> = { CssModules: 'CSS Modules' }

/** A variant Select's items from variant keys (`useCode().variants`, or a fallback's). */
export function variantItems(variants: readonly string[]) {
  return variants.map((value) => ({ value, label: VARIANT_LABELS[value] ?? value }))
}

/**
 * A content prop that arrives from JSON: `true`, or a fence's flag (the
 * pipeline passes a bare ` ```tsx collapse ` as the string `'true'`).
 */
export function isOn(value: unknown) {
  return value === true || value === 'true' || value === ''
}

export type CodeBlockToggleProps = {
  /** The hidden checkbox's id (the label's `htmlFor`). */
  id: string
  /** The file's line count, for "Show all {n} lines". */
  lines: number | undefined
  /** Controlled by useCode's `expanded` once loaded. */
  checked?: boolean
  /** Uncontrolled in the loading state: `initialExpanded`. */
  defaultChecked?: boolean
  /** A fallback that carries only the window has nothing to expand into yet. */
  disabled?: boolean
  onChange?: (expanded: boolean) => void
  /** `useCodeWindow().toggleRef`. */
  toggleRef?: React.Ref<HTMLLabelElement>
}

/**
 * The window's control: a visually hidden checkbox (the state, which works
 * before hydration) and its label, a full-width row with the disclosure
 * glyph [D109].
 */
export function CodeBlockToggle(props: CodeBlockToggleProps) {
  const { id, lines, checked, defaultChecked, disabled, onChange, toggleRef } = props

  // As the source: a pointer press never leaves the hidden checkbox focused.
  const blurPointerFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    if (!event.currentTarget.matches(':focus-visible')) event.currentTarget.blur()
  }

  return (
    <>
      <input
        type="checkbox"
        id={id}
        className={styles.checkbox}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onFocus={blurPointerFocus}
        onChange={onChange ? (event) => onChange(event.target.checked) : undefined}
      />
      {/* `data-panel-open` sets the disclosure glyph's open state. */}
      <label
        ref={toggleRef}
        htmlFor={id}
        className={styles.toggle}
        data-panel-open={(checked ?? defaultChecked) ? '' : undefined}
      >
        <DisclosureGlyph size="chrome" />
        <span className={cx(styles.toggleLabel, styles.showAll)}>
          {lines != null ? `Show all ${lines} lines` : 'Show all lines'}
        </span>
        <span className={cx(styles.toggleLabel, styles.showFewer)}>Show fewer lines</span>
      </label>
    </>
  )
}
