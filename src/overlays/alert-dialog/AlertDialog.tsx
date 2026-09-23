'use client'

import * as React from 'react'
import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog'
import { cva } from 'class-variance-authority'

import { Button, type ButtonProps } from '../../actions/button'
import {
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogPopup,
  DialogTitle,
  type DialogActionsProps,
  type DialogBodyProps,
  type DialogDescriptionProps,
  type DialogPopupProps,
  type DialogTitleProps,
} from '../dialog'
import { cx, resolveClassName } from '../../utils/className'
import { overlayAttributes } from '../../utils/overlay'
import { secondaryScaleVariants } from '../../utils/scales'
import { StatusGlyph, statusLabels, statusScales } from '../../utils/StatusGlyph'
import styles from './alert-dialog.module.css'

/*
 * Alert Dialog (§10.14): confirms a destructive or irreversible action.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: alert-dialog.module.css; CVA function `alertDialog`. The panel,
 *   body, title, description and action bar are the Dialog's
 *   (dialog.module.css, through DialogPopup); this module adds the glyph.
 * - Axes: `status` → warning | danger (selects the ▲ or ◆ glyph and its
 *   scale; it carries no class); `primary`, `secondary` → applied inside
 *   the panel's scope by DialogPopup.
 * - Compound variants: none. Defaults: `status` is required, no default;
 *   color axes: none.
 * - Color fallback: the panel takes the `white` preset's defaults; the
 *   glyph's secondary is the status scale (warning amber, danger red) [D129].
 *   A confirm that destroys (every danger alert's, and any Delete, Remove
 *   or Discard) is a `solid` Button with `destructive`: the danger fill
 *   [D192].
 * - States: as Dialog. Focus opens on the least destructive action
 *   (AlertDialogCancel); Esc means Cancel; outside presses never dismiss.
 * - Parts: base (the panel, with the Dialog's base), glyph.
 * - Scope: as Dialog. The glyph writes the overlay scope attributes beside
 *   its status scale so --role-status re-resolves on it [D148].
 * - Container: none; the panel is page frame (see Dialog).
 */
export const alertDialog = cva(styles.base)

export type AlertDialogStatus = 'warning' | 'danger'

/** Props for AlertDialog: Base UI AlertDialog.Root props (`open`, `onOpenChange` …). */
export type AlertDialogProps<Payload = unknown> = BaseAlertDialog.Root.Props<Payload>

/**
 * Groups the parts of an alert dialog (Base UI AlertDialog.Root): always
 * modal, and an outside press never dismisses it. It may open over a
 * Dialog, never deeper; the Dialog stays visible, framed and inert.
 */
export function AlertDialog<Payload = unknown>(props: AlertDialogProps<Payload>) {
  return <BaseAlertDialog.Root<Payload> {...props} />
}

/** Props for AlertDialogTrigger: Button props plus Base UI's trigger `handle` and `payload`. */
export type AlertDialogTriggerProps = ButtonProps & {
  /** Associates a detached trigger with an AlertDialog created by `AlertDialog.createHandle`. */
  handle?: BaseAlertDialog.Trigger.Props['handle']
  /** A payload handed to the AlertDialog's children function when this trigger opens it. */
  payload?: unknown
}

/** Opens the alert dialog. Renders a Button (§9.2) whose label names the act ("Delete Photos"). */
export function AlertDialogTrigger(props: AlertDialogTriggerProps) {
  const { handle, payload, ...buttonProps } = props
  return (
    <BaseAlertDialog.Trigger
      handle={handle}
      payload={payload}
      render={<Button {...(buttonProps as ButtonProps)} />}
    />
  )
}

const CancelContext = React.createContext<React.RefObject<HTMLButtonElement | null> | null>(null)

/** Props for AlertDialogPopup: DialogPopup props (without `wide`) plus the required status. */
export type AlertDialogPopupProps = Omit<DialogPopupProps, 'wide'> & {
  /**
   * Required (no default): `warning` draws ▲ with !, `danger` ◆ with ×, at
   * the block tier above the title [D58]. The glyph and the words carry the
   * seriousness; a destructive confirm adds the red fill (Button
   * `destructive`) [D192].
   */
  status: AlertDialogStatus
  /** The glyph's accessible name; defaults to the English status word. */
  statusLabel?: string
}

/**
 * The alert panel: the Dialog panel (--size-sm, white scope, --ds-stroke-3
 * --primary12 frame, full-screen sheet below --md-n-above) with the status
 * glyph above the title. Compose `AlertDialogBody` (title and one
 * consequence sentence) and `AlertDialogActions` inside it; there is no
 * close X, only `AlertDialogCancel`, which takes focus on open.
 */
export function AlertDialogPopup(props: AlertDialogPopupProps) {
  const { status, statusLabel, className, initialFocus, children, ...rest } = props
  const cancelRef = React.useRef<HTMLButtonElement | null>(null)

  // Focus on open: the least destructive action, else Base UI's default.
  const focusCancel = React.useCallback(() => cancelRef.current ?? true, [])

  return (
    <DialogPopup
      {...rest}
      initialFocus={initialFocus ?? focusCancel}
      className={resolveClassName(className, (extra) => alertDialog({ className: extra }))}
    >
      <StatusGlyph
        {...overlayAttributes}
        status={status}
        label={statusLabel ?? statusLabels[status]}
        className={cx(styles.glyph, secondaryScaleVariants[statusScales[status]])}
      />
      <CancelContext.Provider value={cancelRef}>{children}</CancelContext.Provider>
    </DialogPopup>
  )
}

/** Props for AlertDialogCancel: Button props for the outline twin that dismisses the alert. */
export type AlertDialogCancelProps = ButtonProps

/**
 * The least destructive action, and the alert's only way out besides Esc:
 * an `outline` Button that closes the alert and takes focus when it opens.
 * Name the act it keeps ("Keep Photos"), never "OK" or "Cancel" alone.
 */
export function AlertDialogCancel(props: AlertDialogCancelProps) {
  const cancelRef = React.useContext(CancelContext)
  const { variant = 'outline', ...buttonProps } = props
  return (
    <BaseAlertDialog.Close
      ref={cancelRef ?? undefined}
      render={<Button {...(buttonProps as ButtonProps)} variant={variant} />}
    />
  )
}

/** Props for AlertDialogTitle: DialogTitle props. */
export type AlertDialogTitleProps = DialogTitleProps

/** The alert's title and accessible name, in `type-itemhead`: the question ("Delete 3 photos?"). */
export function AlertDialogTitle(props: AlertDialogTitleProps) {
  return <DialogTitle {...props} />
}

/** Props for AlertDialogDescription: DialogDescription props. */
export type AlertDialogDescriptionProps = DialogDescriptionProps

/** One consequence sentence, in `type-body-ui` --primary12. */
export function AlertDialogDescription(props: AlertDialogDescriptionProps) {
  return <DialogDescription {...props} />
}

/** Props for AlertDialogBody: DialogBody props. */
export type AlertDialogBodyProps = DialogBodyProps

/** Holds the title and description under the glyph; scrolls with overflow edges like the Dialog body. */
export function AlertDialogBody(props: AlertDialogBodyProps) {
  return <DialogBody {...props} />
}

/** Props for AlertDialogActions: DialogActions props. */
export type AlertDialogActionsProps = DialogActionsProps

/**
 * The action bar: the confirming `solid` Button first ("Delete 3 Photos",
 * "Deleting…" while busy), then `AlertDialogCancel`. A confirm that
 * destroys (every `danger` alert's, and any Delete, Remove or Discard)
 * takes `destructive`, the danger fill [D192]. Stacked below
 * --md-n-above, one row from it.
 */
export function AlertDialogActions(props: AlertDialogActionsProps) {
  return <DialogActions {...props} />
}
