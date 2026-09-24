'use client'

import * as React from 'react'
import { Popover as BasePopover } from '@base-ui/react/popover'
import { useRender } from '@base-ui/react/use-render'
import { mergeProps } from '@base-ui/react/merge-props'
import { cva, type VariantProps } from 'class-variance-authority'

import { Button, type ButtonProps } from '../../actions/button'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { cx, resolveClassName } from '../../utils/className'
import {
  OVERLAY_COLLISION_PADDING,
  OVERLAY_SIDE_OFFSET,
  OverlayScope,
  OverlayTail,
  overlayActionClassName,
  overlayAttributes,
  overlayScales,
} from '../../utils/overlay'
import styles from './popover.module.css'

/*
 * Popover (§10.15): non-modal content anchored to a trigger.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: popover.module.css; CVA function `popover`.
 * - Axes: `kind` → panel | definition → `panel` (padded panel),
 *   `definition` (term, definition and source) [D155]; `primary`,
 *   `secondary` → scales module classes, applied inside the popup's scope.
 * - Compound variants: none. Defaults: `kind: panel`; color axes: none.
 * - Color fallback: the popup takes the `white` preset's defaults; props
 *   apply inside it, and `secondary` drives only content accents.
 * - States: Popup data-starting-style / data-ending-style → the clip reveal
 *   from the trigger side (data-side), instant under --motionNotOK and on
 *   data-instant [D91]; Arrow data-side → which edge the tail sits on;
 *   Close is an icon-only Button (§9.2 states). The trigger's
 *   data-popup-open belongs to the trigger's own module (Button).
 * - Parts: positioner (the layer), base (the popup), arrow (the tail;
 *   rendering it is the tail form), title (`term` in the definition kind),
 *   description, source, close.
 * - Scope: the popup renders in its Base UI Portal as a nested `white`
 *   scope (`page` scheme, no data-theme) with the --border-size-2
 *   --primary12 frame [D92, D139, D156].
 * - Container: none; inherits its context.
 */
export const popover = cva(styles.base, {
  variants: {
    kind: {
      panel: styles.panel,
      definition: styles.definition,
    },
    // Color axes: never defaulted [D133]; PopoverPopup computes the overlay preset's defaults.
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'panel',
  },
})

type PopoverVariants = VariantProps<typeof popover>
export type PopoverKind = NonNullable<PopoverVariants['kind']>

const KindContext = React.createContext<PopoverKind>('panel')

/** Props for Popover: Base UI Popover.Root props (`open`, `onOpenChange`, `modal` …). */
export type PopoverProps<Payload = unknown> = BasePopover.Root.Props<Payload>

/** Groups the parts of a popover (Base UI Popover.Root). Esc or an outside press closes it. */
export function Popover<Payload = unknown>(props: PopoverProps<Payload>) {
  return <BasePopover.Root<Payload> {...props} />
}

/** Props for PopoverTrigger: Button props plus Base UI's trigger options. */
export type PopoverTriggerProps = ButtonProps & {
  /** Associates a detached trigger with a Popover created by `Popover.createHandle`. */
  handle?: BasePopover.Trigger.Props['handle']
  /** A payload handed to the Popover's children function when this trigger opens it. */
  payload?: unknown
}

/**
 * Opens the popover on press, never on hover (§10.15). Renders a Button
 * (§9.2); its data-popup-open shows the expanded state.
 */
export function PopoverTrigger(props: PopoverTriggerProps) {
  const { handle, payload, ...buttonProps } = props
  return (
    <BasePopover.Trigger
      handle={handle}
      payload={payload}
      render={<Button {...(buttonProps as ButtonProps)} />}
    />
  )
}

type PositionerProps = BasePopover.Positioner.Props

/** Props for PopoverPopup: Base UI Popover.Popup props plus placement, kind, color axes and portal options. */
export type PopoverPopupProps = BasePopover.Popup.Props & {
  /** `panel` (default): a padded panel. `definition`: a term, its definition and an optional source. */
  kind?: PopoverVariants['kind']
  /** Primary Radix scale inside the popup's `white` scope. Omitted, the white preset's default [D133]. */
  primary?: PopoverVariants['primary']
  /** Secondary Radix scale inside the popup: link underlines and other accents only. */
  secondary?: PopoverVariants['secondary']
  /** Which side of the trigger the panel sits on. Default `bottom`; it flips when there is no room. */
  side?: PositionerProps['side']
  /** Alignment to the trigger. Default `start`. */
  align?: PositionerProps['align']
  /** Distance from the trigger in px. Default 8 (`--size-px-2`). */
  sideOffset?: PositionerProps['sideOffset']
  /** Offset along the alignment axis in px. Default 0. */
  alignOffset?: PositionerProps['alignOffset']
  /** Clearance from the viewport edge in px before the panel shifts or flips. Default 16. */
  collisionPadding?: PositionerProps['collisionPadding']
  /** The element the portal renders into. Default: `document.body`. */
  container?: BasePopover.Portal.Props['container']
  /** Keeps the portal mounted while closed. */
  keepMounted?: boolean
}

/**
 * The anchored panel, rendered in its Base UI Portal as a nested `white`
 * scope: --primary1 face, --border-size-2 --primary12 frame, --radius-2-25,
 * 240–360 px wide from --md-n-above and the viewport less its margins
 * below. It opens instantly or with a clip reveal from the trigger side.
 * Render `PopoverArrow` inside it for the tail.
 */
export function PopoverPopup(props: PopoverPopupProps) {
  const {
    kind,
    primary,
    secondary,
    side,
    align = 'start',
    sideOffset = OVERLAY_SIDE_OFFSET,
    alignOffset,
    collisionPadding = OVERLAY_COLLISION_PADDING,
    container,
    keepMounted,
    className,
    children,
    ...rest
  } = props

  const scales = overlayScales(primary, secondary)

  return (
    <BasePopover.Portal container={container} keepMounted={keepMounted}>
      <BasePopover.Positioner
        className={styles.positioner}
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
      >
        <BasePopover.Popup
          {...rest}
          {...overlayAttributes}
          className={resolveClassName(className, (extra) =>
            popover({
              kind,
              primary: scales.primary,
              secondary: scales.secondary,
              className: cx(overlayActionClassName, extra),
            })
          )}
        >
          <KindContext.Provider value={kind ?? 'panel'}>
            <OverlayScope>{children}</OverlayScope>
          </KindContext.Provider>
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  )
}

/** Props for PopoverArrow: Base UI Popover.Arrow props. */
export type PopoverArrowProps = BasePopover.Arrow.Props

/**
 * The tail: a --size-px-2-5 × 6 px triangle filled with the face, its
 * --border-size-2 --primary12 edge continuing the panel's frame.
 */
export function PopoverArrow(props: PopoverArrowProps) {
  const { className, ...rest } = props
  return (
    <BasePopover.Arrow
      {...rest}
      className={resolveClassName(className, (extra) => cx(styles.arrow, extra))}
    >
      <OverlayTail className={styles.tail} />
    </BasePopover.Arrow>
  )
}

/** Props for PopoverTitle: Base UI Popover.Title props. */
export type PopoverTitleProps = BasePopover.Title.Props

/**
 * The popover's heading (Base UI Popover.Title, an `h2`) and accessible
 * name. In the `definition` kind it is the term, in tracked caps
 * (`type-label`); in a panel, `type-subhead`.
 */
export function PopoverTitle(props: PopoverTitleProps) {
  const { className, ...rest } = props
  const kind = React.useContext(KindContext)
  const part = kind === 'definition' ? styles.term : styles.title
  return (
    <BasePopover.Title
      {...rest}
      className={resolveClassName(className, (extra) => cx(part, extra))}
    />
  )
}

/** Props for PopoverDescription: Base UI Popover.Description props. */
export type PopoverDescriptionProps = BasePopover.Description.Props

/** The content or the definition (Base UI Popover.Description), in `type-body-ui` --primary12. */
export function PopoverDescription(props: PopoverDescriptionProps) {
  const { className, ...rest } = props
  return (
    <BasePopover.Description
      {...rest}
      className={resolveClassName(className, (extra) => cx(styles.description, extra))}
    />
  )
}

/** Props for PopoverSource: `p` props and `render`. */
export type PopoverSourceProps = useRender.ComponentProps<'p'>

/** A definition's source caption, in `type-caption` --role-muted. */
export function PopoverSource(props: PopoverSourceProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: mergeProps<'p'>({ className: cx(styles.source, className) }, rest),
  })
}

/** Props for PopoverClose: Base UI Popover.Close props plus the X's accessible name. */
export type PopoverCloseProps = BasePopover.Close.Props & {
  /** The close X's accessible name, visually hidden. Default "Close". */
  label?: string
}

/**
 * The optional close X, top end: an icon-only Button with the inline-tier
 * `close` glyph and a --fgd-size-hit target (§9.2). Pass `render` to close
 * from another control instead; `label` is then ignored.
 */
export function PopoverClose(props: PopoverCloseProps) {
  const { label = 'Close', render, className, children, ...rest } = props

  if (render) {
    return (
      <BasePopover.Close {...rest} className={className} render={render}>
        {children}
      </BasePopover.Close>
    )
  }

  return (
    <BasePopover.Close
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
