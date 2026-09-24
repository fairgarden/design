'use client'

import * as React from 'react'

import {
  ExpandingBox,
  ExpandingBoxMain,
  expandingBoxParts,
} from '../../foundations/expanding-box'
import { Icon } from '../../foundations/icon'
import { cx } from '../../utils/className'
import { useScopeAttributes } from '../../utils/scope'
import { useShortcutLabel } from './useShortcutLabel'
import { searchDialog, type SearchDialogVariants } from './variants'
import styles from './search-dialog.module.css'

/*
 * The search dialog's trigger (the source's SearchButton). Private to the
 * module: SearchDialog renders it.
 */

/** Props for SearchDialogTrigger, all set by SearchDialog. */
export type SearchDialogTriggerProps = {
  ref: React.Ref<HTMLButtonElement>
  /** The expanding-box pair's name. */
  name: string
  /** The dialog is open: the trigger's box hands its names to the dialog's and hides. */
  open: boolean
  label: string
  keyboardShortcut: boolean
  onClick: () => void
  primary: SearchDialogVariants['primary']
  secondary: SearchDialogVariants['secondary']
  className: string | undefined
}

/**
 * The field-like trigger holding the collapsed, active-while-closed
 * ExpandingBox: the magnifier, the label in --role-muted and, with
 * `keyboardShortcut`, the ⌘K / Ctrl K hint from --lg-n-above. Mounted
 * always, `visibility: hidden` while open.
 */
export function SearchDialogTrigger(props: SearchDialogTriggerProps): React.JSX.Element {
  const { ref, name, open, label, keyboardShortcut, onClick, primary, secondary, className } =
    props
  const scope = useScopeAttributes()
  const shortcut = useShortcutLabel()
  const hint = keyboardShortcut ? shortcut : null

  return (
    <button
      {...scope}
      ref={ref}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-keyshortcuts={hint?.aria}
      className={searchDialog({
        primary,
        secondary,
        className: cx(expandingBoxParts.host, styles.trigger, className),
      })}
      onClick={onClick}
    >
      <ExpandingBox
        as="span"
        name={name}
        active={!open}
        collapsed
        primary={primary}
        secondary={secondary}
        className={styles.triggerBox}
      >
        <ExpandingBoxMain className={styles.triggerMain}>
          <Icon name="search" className={styles.magnifier} />
          <span className={styles.triggerLabel}>{label}</span>
          {hint ? (
            <kbd aria-hidden="true" className={cx(expandingBoxParts.end, styles.kbd)}>
              {hint.label}
            </kbd>
          ) : null}
        </ExpandingBoxMain>
      </ExpandingBox>
    </button>
  )
}
