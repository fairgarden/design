'use client'

import * as React from 'react'
import { PreviewCard as BasePreviewCard } from '@base-ui/react/preview-card'
import { useRender } from '@base-ui/react/use-render'
import { mergeProps } from '@base-ui/react/merge-props'
import { cva, type VariantProps } from 'class-variance-authority'

import { Link, type LinkProps } from '../../actions/link'
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
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import styles from './preview-card.module.css'

/*
 * Preview Card (§10.15): a hover preview of a linked page, for pointer
 * users only. No case shows one; derived from P2, P7, [D79] and [D92].
 *
 * Implementation (CSS Modules + CVA)
 * - Module: preview-card.module.css; CVA function `previewCard`.
 * - Axes: `primary`, `secondary` → scales module classes, applied inside
 *   the popup's scope.
 * - Compound variants: none. Defaults: none; color axes: none.
 * - Color fallback: the popup takes the `white` preset's defaults.
 * - States: Popup data-starting-style / data-ending-style → the clip reveal
 *   from the trigger side (data-side), instant under --motionNotOK and on
 *   data-instant [D91]; Arrow data-side → the tail's edge. Opens after
 *   600 ms of hover and closes 300 ms after leave.
 * - Parts: positioner, base (the popup), arrow and tail, thumb, title,
 *   description, domain.
 * - Scope: the popup renders in its Base UI Portal as a nested `white`
 *   scope (`page` scheme, no data-theme) with the --border-size-2
 *   --primary12 frame [D92, D139, D156].
 * - Container: none; inherits its context. Shown only with hover and a
 *   fine pointer; on touch the link simply navigates.
 */
export const previewCard = cva(styles.base, {
  variants: {
    // Color axes: never defaulted [D133]; PreviewCardPopup computes the overlay preset's defaults.
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
})

type PreviewCardVariants = VariantProps<typeof previewCard>

/** Props for PreviewCard: Base UI PreviewCard.Root props (`open`, `onOpenChange` …). */
export type PreviewCardProps<Payload = unknown> = BasePreviewCard.Root.Props<Payload>

/** Groups the parts of a preview card (Base UI PreviewCard.Root). */
export function PreviewCard<Payload = unknown>(props: PreviewCardProps<Payload>) {
  return <BasePreviewCard.Root<Payload> {...props} />
}

/** Props for PreviewCardTrigger: Link props plus the hover delays and Base UI's trigger options. */
export type PreviewCardTriggerProps = LinkProps & {
  /** Hover time before the card opens, in ms. Default 600. */
  delay?: number
  /** Time after the pointer leaves before the card closes, in ms. Default 300. */
  closeDelay?: number
  /** Associates a detached trigger with a PreviewCard created by `PreviewCard.createHandle`. */
  handle?: BasePreviewCard.Trigger.Props['handle']
  /** A payload handed to the PreviewCard's children function when this trigger opens it. */
  payload?: unknown
}

/**
 * The link that opens the card on hover. Renders a Link (§9.3), `inline`
 * by default, so it navigates and prints like any link [D79]. The card is
 * never the only route to its information.
 */
export function PreviewCardTrigger(props: PreviewCardTriggerProps) {
  const { delay = 600, closeDelay = 300, handle, payload, ...linkProps } = props
  return (
    <BasePreviewCard.Trigger
      delay={delay}
      closeDelay={closeDelay}
      handle={handle}
      payload={payload}
      render={<Link {...linkProps} />}
    />
  )
}

type PositionerProps = BasePreviewCard.Positioner.Props

/** Props for PreviewCardPopup: Base UI PreviewCard.Popup props plus placement, color axes and portal options. */
export type PreviewCardPopupProps = BasePreviewCard.Popup.Props & {
  /** Primary Radix scale inside the popup's `white` scope. Omitted, the white preset's default [D133]. */
  primary?: PreviewCardVariants['primary']
  /** Secondary Radix scale inside the popup: accents only. */
  secondary?: PreviewCardVariants['secondary']
  /** Which side of the link the card sits on. Default `bottom`; it flips when there is no room. */
  side?: PositionerProps['side']
  /** Alignment to the link. Default `start`. */
  align?: PositionerProps['align']
  /** Distance from the link in px. Default 8 (`--size-px-2`). */
  sideOffset?: PositionerProps['sideOffset']
  /** Clearance from the viewport edge in px. Default 16. */
  collisionPadding?: PositionerProps['collisionPadding']
  /** The element the portal renders into. Default: `document.body`. */
  container?: BasePreviewCard.Portal.Props['container']
}

/**
 * The preview panel, rendered in its Base UI Portal as a nested `white`
 * scope: --primary1 face, --border-size-2 --primary12 frame, --ds-radius-8,
 * 240–360 px wide. Compose `PreviewCardThumb`, `PreviewCardTitle`,
 * `PreviewCardDescription` and `PreviewCardDomain` inside it, and
 * `PreviewCardArrow` for the tail. It holds at most one link.
 */
export function PreviewCardPopup(props: PreviewCardPopupProps) {
  const {
    primary,
    secondary,
    side,
    align = 'start',
    sideOffset = OVERLAY_SIDE_OFFSET,
    collisionPadding = OVERLAY_COLLISION_PADDING,
    container,
    className,
    children,
    ...rest
  } = props

  const scales = overlayScales(primary, secondary)

  return (
    <BasePreviewCard.Portal container={container}>
      <BasePreviewCard.Positioner
        className={styles.positioner}
        side={side}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
      >
        <BasePreviewCard.Popup
          {...rest}
          {...overlayAttributes}
          className={resolveClassName(className, (extra) =>
            previewCard({
              primary: scales.primary,
              secondary: scales.secondary,
              className: cx(overlayActionClassName, extra),
            })
          )}
        >
          <OverlayScope>{children}</OverlayScope>
        </BasePreviewCard.Popup>
      </BasePreviewCard.Positioner>
    </BasePreviewCard.Portal>
  )
}

/** Props for PreviewCardArrow: Base UI PreviewCard.Arrow props. */
export type PreviewCardArrowProps = BasePreviewCard.Arrow.Props

/** The tail: a --ds-space-12 × 6 px triangle whose --border-size-2 edge continues the frame. */
export function PreviewCardArrow(props: PreviewCardArrowProps) {
  const { className, ...rest } = props
  return (
    <BasePreviewCard.Arrow
      {...rest}
      className={resolveClassName(className, (extra) => cx(styles.arrow, extra))}
    >
      <OverlayTail className={styles.tail} />
    </BasePreviewCard.Arrow>
  )
}

/** Props for PreviewCardThumb: `img` props and `render`. */
export type PreviewCardThumbProps = useRender.ComponentProps<'img'>

/**
 * The page's thumbnail: a --ratio-widescreen photograph with the nested
 * radius (--ds-radius-8 − --size-px-3, floored at --radius-1) [D40].
 * Give it `alt` (empty when the title already names it).
 */
export function PreviewCardThumb(props: PreviewCardThumbProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'img',
    render,
    ref,
    props: mergeProps<'img'>({ className: cx(styles.thumb, className) }, rest),
  })
}

/** Props for PreviewCardTitle: `p` props and `render`. */
export type PreviewCardTitleProps = useRender.ComponentProps<'p'>

/** The linked page's title, in `type-itemhead` --primary12. */
export function PreviewCardTitle(props: PreviewCardTitleProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: mergeProps<'p'>({ className: cx(styles.title, className) }, rest),
  })
}

/** Props for PreviewCardDescription: `p` props and `render`. */
export type PreviewCardDescriptionProps = useRender.ComponentProps<'p'>

/** A one-line description, in `type-body-ui` --primary12. */
export function PreviewCardDescription(props: PreviewCardDescriptionProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: mergeProps<'p'>({ className: cx(styles.description, className) }, rest),
  })
}

/** Props for PreviewCardDomain: `p` props and `render`. */
export type PreviewCardDomainProps = useRender.ComponentProps<'p'>

/** The page's domain, in `type-data` --role-muted (mono measures). */
export function PreviewCardDomain(props: PreviewCardDomainProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: mergeProps<'p'>({ className: cx(styles.domain, className) }, rest),
  })
}
