'use client'

import * as React from 'react'
import { Popover as BasePopover } from '@base-ui/react/popover'
import { useRender } from '@base-ui/react/use-render'
import { mergeProps } from '@base-ui/react/merge-props'
import { cva, type VariantProps } from 'class-variance-authority'

import { Button, type ButtonProps } from '../../actions/button'
import {
  OutlineMorphFrame,
  OutlineMorphTail,
  type OutlineMorphRefs,
} from '../../foundations/outline-morph'
import {
  HOVER_REASONS,
  useOutlineMorphRoot,
} from '../../foundations/outline-morph/useOutlineMorphRoot'
import { useMergedRef } from '../../utils/assignRef'
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
 * - States: the popup opens and closes by the outline morph or at once, no
 *   reveal of its own [D205]; Arrow data-side → which edge the tail sits on;
 *   Close is an icon-only Button (§9.2 states). The trigger's
 *   data-popup-open belongs to the trigger's own module (Button).
 * - Parts: positioner (the layer), base (the popup), arrow (the tail;
 *   rendering it is the tail form), title (`term` in the definition kind),
 *   description, source, close.
 * - Scope: the popup renders in its Base UI Portal as a nested `white`
 *   scope (`page` scheme, no data-theme) with the --border-size-2
 *   --primary12 frame [D92, D139, D156].
 * - Container: none; inherits its context.
 * - Outline morph [D204]: on by default (`morph={false}` on Popover opts
 *   out). The trigger's ring (keyboard) or edge (pointer) grows into the
 *   panel's frame and back (foundations/outline-morph); PopoverTrigger
 *   takes the source ref, the popup answers `data-outline-morph` and the
 *   frame renders beside it. With a PopoverArrow, the tail rides the morph:
 *   PopoverArrow is the tail source, and the tail cap (OutlineMorphTail,
 *   `tailCap`) grows out of the frame's trigger-facing edge as it lands and
 *   retracts into it on close, while the popup's own tail is held hidden.
 *   Hover opens (`openOnHover`) are instant.
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

/** The popover's outline morph refs, or `null` with `morph={false}` [D204]. */
const MorphContext = React.createContext<OutlineMorphRefs | null>(null)

/** Props for Popover: Base UI Popover.Root props (`open`, `onOpenChange`, `modal` …) plus the outline morph. */
export type PopoverProps<Payload = unknown> = BasePopover.Root.Props<Payload> & {
  /**
   * The outline morph: the trigger's focus ring (or, opened by pointer, its
   * edge) grows into the panel's frame as it opens and shrinks back as it
   * closes; a tail (PopoverArrow) grows out of the frame's edge as it lands.
   * A hover open is instant. Instant under reduced motion; off in forced colors and
   * print, and wherever `--fgd-outline-morph: none` applies. Default
   * `true`; `false` opens and closes the panel at once.
   */
  morph?: boolean
}

/**
 * Groups the parts of a popover (Base UI Popover.Root) and wires its
 * outline morph. Esc or an outside press closes it.
 */
export function Popover<Payload = unknown>(props: PopoverProps<Payload>) {
  const { morph = true, onOpenChange, ...rootProps } = props
  const outline = useOutlineMorphRoot({
    open: rootProps.open,
    defaultOpen: rootProps.defaultOpen,
    onOpenChange,
    morph,
    instant: (_open, details) => details.reason != null && HOVER_REASONS.has(details.reason),
  })
  return (
    <MorphContext.Provider value={outline.refs}>
      <BasePopover.Root<Payload> {...rootProps} onOpenChange={outline.onOpenChange} />
    </MorphContext.Provider>
  )
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
  const morph = React.useContext(MorphContext)
  return (
    <BasePopover.Trigger
      ref={morph?.sourceRef}
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
 * below. It opens from its trigger by the outline morph, or at once.
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
    ref,
    ...rest
  } = props

  const scales = overlayScales(primary, secondary)
  const morph = React.useContext(MorphContext)
  const popupRef = useMergedRef<HTMLDivElement>(ref, morph?.targetRef)

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
          ref={popupRef}
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
        {morph ? <OutlineMorphFrame ref={morph.frameRef} /> : null}
        {morph ? (
          <OutlineMorphTail ref={morph.tailRef} className={styles.tailCap}>
            <OverlayTail className={styles.tail} />
          </OutlineMorphTail>
        ) : null}
      </BasePopover.Positioner>
    </BasePopover.Portal>
  )
}

/** Props for PopoverArrow: Base UI Popover.Arrow props. */
export type PopoverArrowProps = BasePopover.Arrow.Props

/**
 * The tail: a --size-px-2-5 × 6 px triangle filled with the face, its
 * --border-size-2 --primary12 edge continuing the panel's frame. With the
 * outline morph it grows out of the frame's edge as the panel lands.
 */
export function PopoverArrow(props: PopoverArrowProps) {
  const { className, ref, ...rest } = props
  // The tail source of the outline morph's tail cap [D204].
  const morph = React.useContext(MorphContext)
  const arrowRef = useMergedRef<HTMLDivElement>(ref, morph?.tailSourceRef)
  return (
    <BasePopover.Arrow
      {...rest}
      ref={arrowRef}
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
