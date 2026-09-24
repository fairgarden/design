'use client'

import * as React from 'react'
import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { useRender } from '@base-ui/react/use-render'
import { mergeProps } from '@base-ui/react/merge-props'
import { cva, type VariantProps } from 'class-variance-authority'

import { Button, type ButtonProps } from '../../actions/button'
import { Ground } from '../../foundations/ground'
import { cx, resolveClassName } from '../../utils/className'
import {
  OverlayScope,
  overlayActionClassName,
  overlayAttributes,
  overlayScales,
} from '../../utils/overlay'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { GroundContext, rootScope, type FieldPreset } from '../../utils/scope'
import styles from './dialog.module.css'

/*
 * Dialog (§10.14): a focused sub-task in a modal panel.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: dialog.module.css; CVA functions `dialog` (the popup panel) and
 *   `dialogBackdrop` (the optional solid cover). Alert Dialog composes this
 *   panel and adds its glyph (alert-dialog.module.css).
 * - Axes: `wide` → `wide` (width --fgd-measure-reading from --md-n-above);
 *   `primary`, `secondary` → scales module classes, applied inside the
 *   panel's scope. `dialogBackdrop`: `covered` → `covered`.
 * - Compound variants: none. Defaults: `wide: false`; color axes: none.
 * - Color fallback: the panel takes the `white` preset's defaults; explicit
 *   props apply inside it. Actions are §9.2 Buttons; a destructive one
 *   takes `destructive` [D192].
 * - States: Popup data-starting-style / data-ending-style → the clip reveal,
 *   instant under --motionNotOK [D91]; data-nested-dialog-open → the lower
 *   dialog stays visible, framed and inert, never dimmed; body
 *   data-overflow-y-start / -end (the §10.19 Scroll Area names, set here)
 *   → the scroll-edge rules; Close is an icon-only Button (§9.2 states).
 * - Parts: base, topBar, eyebrow, title, close, body, description, actions,
 *   backdrop.
 * - Scope: the popup renders in its Base UI Portal as a nested `white`
 *   scope (`page` scheme, no data-theme) with the --border-size-2-25 --primary12
 *   frame [D92, D139, D156]. The cover renders as a `kind="field"` Ground
 *   of the page ground's companion field, which writes its own data-theme
 *   [D148, D177, D178].
 * - Container: none; the dialog is page frame and uses the viewport media:
 *   a full-screen sheet below --md-n-above, centered from it [D121].
 */
export const dialog = cva(styles.base, {
  variants: {
    wide: {
      true: styles.wide,
    },
    // Color axes: never defaulted [D133]; DialogPopup computes the overlay preset's defaults.
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    wide: false,
  },
})

/** The Backdrop part: colorless by default; `covered` is the opaque solid cover (from --md-n-above). */
export const dialogBackdrop = cva(styles.backdrop, {
  variants: {
    covered: {
      true: styles.covered,
    },
  },
  defaultVariants: {
    covered: false,
  },
})

type DialogVariants = VariantProps<typeof dialog>

/** Props for Dialog: Base UI Dialog.Root props (`open`, `onOpenChange`, `modal` …). */
export type DialogProps<Payload = unknown> = BaseDialog.Root.Props<Payload>

/**
 * Groups the parts of a dialog (Base UI Dialog.Root). Modal by default: the
 * page stays visible, inert and scroll-locked, never dimmed [D24 → D121].
 */
export function Dialog<Payload = unknown>(props: DialogProps<Payload>) {
  return <BaseDialog.Root<Payload> {...props} />
}

/** Props for DialogTrigger: Button props plus Base UI's trigger `handle` and `payload`. */
export type DialogTriggerProps = ButtonProps & {
  /** Associates a detached trigger with a Dialog created by `Dialog.createHandle`. */
  handle?: BaseDialog.Trigger.Props['handle']
  /** A payload handed to the Dialog's children function when this trigger opens it. */
  payload?: unknown
}

/** Opens the dialog. Renders a Button (§9.2); author its label in title case [D160]. */
export function DialogTrigger(props: DialogTriggerProps) {
  const { handle, payload, ...buttonProps } = props
  return (
    <BaseDialog.Trigger
      handle={handle}
      payload={payload}
      render={<Button {...(buttonProps as ButtonProps)} />}
    />
  )
}

/** Where focus lands on open: the first field in the body, else Base UI's default [§10.14 States]. */
const fieldSelector = [
  'input:not([type="hidden"]):not(:disabled)',
  'select:not(:disabled)',
  'textarea:not(:disabled)',
  '[role="combobox"]:not([aria-disabled="true"])',
  '[role="textbox"]',
  '[contenteditable="true"]',
].join(',')

interface DialogContextValue {
  bodyRef: React.RefObject<HTMLDivElement | null>
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

type InitialFocus = NonNullable<BaseDialog.Popup.Props['initialFocus']>
type InitialFocusFunction = Extract<InitialFocus, (...args: never[]) => unknown>
type OpenInteraction = Parameters<InitialFocusFunction>[0]

/** Props for DialogPopup: Base UI Dialog.Popup props plus the panel axes, the cover and the portal options. */
export type DialogPopupProps = BaseDialog.Popup.Props & {
  /** `true`: the detail-view width, --fgd-measure-reading, from --md-n-above. Default `false`. */
  wide?: DialogVariants['wide']
  /**
   * Primary Radix scale inside the panel's `white` scope: text, frame and
   * rules. Omitted, the white preset's default; never the trigger's [D133].
   */
  primary?: DialogVariants['primary']
  /** Secondary Radix scale inside the panel: accents only. Omitted, the white preset's default. */
  secondary?: DialogVariants['secondary']
  /**
   * The optional solid cover, from --md-n-above: the page ground's
   * companion field [D177] (paper, white, meadow and pollen → `forest`;
   * tide and heather → `royal`; apricot and rose → `brick`; see
   * `companionField` from Ground). It renders as a `kind="field"` Ground of
   * that preset at full-viewport geometry with no edge, fully opaque,
   * hiding the page [D88 → D121]. Omitted (default), no backdrop is painted.
   */
  cover?: FieldPreset
  /** The element the portal renders into. Default: `document.body`. */
  container?: BaseDialog.Portal.Props['container']
  /** Keeps the portal mounted while closed. */
  keepMounted?: boolean
}

/**
 * The modal panel, rendered in its Base UI Portal as a nested `white` scope
 * with the --border-size-2-25 --primary12 frame. Below --md-n-above it is a
 * full-screen opaque sheet; from --md-n-above it is centered, at least
 * --size-px-7-5 from every edge. It opens instantly or with a clip reveal,
 * never a fade. Compose `DialogTopBar` (eyebrow, title, close), `DialogBody`
 * and `DialogActions` inside it.
 *
 * Focus moves to the first field in the body, else to Base UI's default
 * (the first tabbable element); pass `initialFocus` to override.
 */
export function DialogPopup(props: DialogPopupProps) {
  const {
    wide,
    primary,
    secondary,
    cover,
    container,
    keepMounted,
    className,
    initialFocus,
    children,
    ...rest
  } = props

  const bodyRef = React.useRef<HTMLDivElement | null>(null)
  const context = React.useMemo<DialogContextValue>(() => ({ bodyRef }), [])
  const scales = overlayScales(primary, secondary)

  const focusFirstField = React.useCallback((interaction: OpenInteraction) => {
    // Opened by touch: Base UI focuses the popup so no keyboard opens.
    if (interaction === 'touch') return true
    return bodyRef.current?.querySelector<HTMLElement>(fieldSelector) ?? true
  }, [])

  return (
    <BaseDialog.Portal container={container} keepMounted={keepMounted}>
      {cover ? <DialogCover preset={cover} /> : null}
      <BaseDialog.Popup
        {...rest}
        {...overlayAttributes}
        initialFocus={initialFocus ?? focusFirstField}
        className={resolveClassName(className, (extra) =>
          dialog({
            wide,
            primary: scales.primary,
            secondary: scales.secondary,
            className: cx(overlayActionClassName, extra),
          })
        )}
      >
        <DialogContext.Provider value={context}>
          <OverlayScope>{children}</OverlayScope>
        </DialogContext.Provider>
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  )
}

/**
 * The solid cover: the Backdrop rendered as a `kind="field"` Ground of the
 * companion field [D177, D178]. Ground writes the field's fixed mode; the
 * Dialog writes no data-theme, and its `covered` class replaces the field's
 * inset geometry and edge with the full viewport. Base UI renders it for
 * the lowest dialog only, so an Alert over a Dialog never adds a second
 * cover.
 */
function DialogCover({ preset }: { preset: FieldPreset }) {
  return (
    <GroundContext.Provider value={rootScope}>
      <BaseDialog.Backdrop
        className={dialogBackdrop({ covered: true })}
        render={<Ground kind="field" preset={preset} render={<div />} />}
      />
    </GroundContext.Provider>
  )
}

/** Props for DialogTopBar: `div` props and `render`. */
export type DialogTopBarProps = useRender.ComponentProps<'div'>

/**
 * The titled top bar: an optional `DialogEyebrow`, the `DialogTitle` and the
 * `DialogClose` X. At least --fgd-size-control-xl tall; on the sheet a
 * --border-size-2-25 --primary12 rule runs under it.
 */
export function DialogTopBar(props: DialogTopBarProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({ className: cx(styles.topBar, className) }, rest),
  })
}

/** Props for DialogEyebrow: `p` props and `render`. */
export type DialogEyebrowProps = useRender.ComponentProps<'p'>

/** An optional eyebrow above the title, in tracked caps (`type-eyebrow`); dropped below 360 px. */
export function DialogEyebrow(props: DialogEyebrowProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: mergeProps<'p'>({ className: cx(styles.eyebrow, className) }, rest),
  })
}

/** Props for DialogTitle: Base UI Dialog.Title props. */
export type DialogTitleProps = BaseDialog.Title.Props

/**
 * The dialog's title and accessible name (Base UI Dialog.Title, an `h2`),
 * in `type-itemhead`. Every dialog has one.
 */
export function DialogTitle(props: DialogTitleProps) {
  const { className, ...rest } = props
  return (
    <BaseDialog.Title
      {...rest}
      className={resolveClassName(className, (extra) => cx(styles.title, extra))}
    />
  )
}

/** Props for DialogDescription: Base UI Dialog.Description props. */
export type DialogDescriptionProps = BaseDialog.Description.Props

/** The dialog's description (Base UI Dialog.Description), in `type-body-ui` --primary12. */
export function DialogDescription(props: DialogDescriptionProps) {
  const { className, ...rest } = props
  return (
    <BaseDialog.Description
      {...rest}
      className={resolveClassName(className, (extra) => cx(styles.description, extra))}
    />
  )
}

/** Props for DialogClose: Base UI Dialog.Close props plus the X's accessible name. */
export type DialogCloseProps = BaseDialog.Close.Props & {
  /** The close X's accessible name, visually hidden. Default "Close". */
  label?: string
}

/**
 * Closes the dialog. By default the top bar's X: an icon-only Button with
 * the inline-tier `close` glyph and a --fgd-size-hit target (§9.2). Pass
 * `render` (for example `<Button variant="outline">Cancel</Button>`) to
 * close from an action instead; `label` is then ignored.
 */
export function DialogClose(props: DialogCloseProps) {
  const { label = 'Close', render, className, children, ...rest } = props

  if (render) {
    return (
      <BaseDialog.Close {...rest} className={className} render={render}>
        {children}
      </BaseDialog.Close>
    )
  }

  return (
    <BaseDialog.Close
      {...rest}
      className={resolveClassName(className, (extra) => cx(styles.close, extra))}
      render={
        <Button variant="outline" iconOnly icon="close">
          {label}
        </Button>
      }
    />
  )
}

/** Props for DialogBody: `div` props and `render`. */
export type DialogBodyProps = useRender.ComponentProps<'div'>

/**
 * The scrolling body: description and content. While content is hidden
 * above or below, a --border-size-2 --role-rule edge shows under the top
 * bar or above the action bar (the §10.19 overflow edge), never a fade.
 */
export function DialogBody(props: DialogBodyProps) {
  const { render, ref, className, ...rest } = props
  const context = React.useContext(DialogContext)
  const localRef = React.useRef<HTMLDivElement | null>(null)

  useOverflowEdges(localRef)

  return useRender({
    defaultTagName: 'div',
    render,
    ref: context ? [ref ?? null, localRef, context.bodyRef] : [ref ?? null, localRef],
    props: mergeProps<'div'>({ className: cx(styles.body, className) }, rest),
  })
}

/** Props for DialogActions: `div` props and `render`. */
export type DialogActionsProps = useRender.ComponentProps<'div'>

/**
 * The action bar: a `solid` Button first, then its outline twin, each
 * hugging its label. A destructive action (Delete, Remove, Discard) takes
 * Button `destructive`, drawn in the danger (red) roles [D192]. Stacked
 * and docked at the bottom of the sheet below --md-n-above; one row from
 * it [D106].
 */
export function DialogActions(props: DialogActionsProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({ className: cx(styles.actions, className) }, rest),
  })
}

/**
 * Writes data-overflow-y-start / data-overflow-y-end on a scroll container
 * while content is hidden in that direction (the §10.19 Scroll Area names).
 */
function useOverflowEdges(ref: React.RefObject<HTMLElement | null>) {
  React.useEffect(() => {
    const node = ref.current
    if (!node) return undefined

    const update = () => {
      const start = node.scrollTop > 0
      const end = node.scrollTop + node.clientHeight < node.scrollHeight - 1
      node.toggleAttribute('data-overflow-y-start', start)
      node.toggleAttribute('data-overflow-y-end', end)
    }

    update()
    node.addEventListener('scroll', update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(node)
    Array.from(node.children).forEach((child) => observer.observe(child))

    return () => {
      node.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [ref])
}
