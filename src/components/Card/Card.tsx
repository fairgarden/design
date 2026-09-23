'use client'

import * as React from 'react'
import { useRender } from '@base-ui/react/use-render'
import { mergeProps } from '@base-ui/react/merge-props'
import { cva, type VariantProps } from 'class-variance-authority'

import { Ground } from '../Ground'
import { Link, type LinkProps } from '../Link'
import { cx } from '../../utils/className'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { isPageGroundPreset, useScope, useScopeAttributes } from '../../utils/scope'
import styles from './card.module.css'

/*
 * Card (§12.2): a self-contained, linked item among peers. Composed from
 * semantic HTML; no Base UI card primitive exists.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: card.module.css; CVA function `card`.
 * - Axes: `kind` → editorial | block | entry (v1 subset of editorial |
 *   event | species | block | promo | entry); `faced` → `faced` (editorial
 *   only; excluded in the types for block and entry, which are always
 *   faced); `lead` → `lead` (editorial only: the horizontal lead card);
 *   `disabled` → `disabled` (a state class in the states layer, unmanaged
 *   element); `primary`, `secondary` → scales module classes.
 * - Compound variants: `faced` + `lead` → `facedLead` (the flush photo
 *   runs down the start edge instead of across the top).
 * - Defaults: kind editorial, faced false, lead false, disabled false
 *   (§12.2); color axes none.
 * - Color fallback: inherits the scope.
 * - States: CardTitleLink (Link kind="title") owns the underline states
 *   (§9.3) [D157]; `base:has(titleLink:focus-visible)` → ring outside the
 *   frame; `faced:has(titleLink:active)` → the face's edge steps to
 *   --border-size-2 --primary12. Hover is the title link's own
 *   (--role-link-hover, §9.3) [D181].
 * - Edge states (the hook composing modules use): the face draws its edge
 *   in --role-edge, which its Ground publishes: --primary10 on a page
 *   ground, --primary12 as a light island [D178, D179]; the entry card's
 *   is a static --border-size-2 --primary12 [D185]. `CardChoice` holds
 *   an option card's Checkbox or Radio: its `data-checked` steps the edge to
 *   --border-size-2 --role-select-edge (§10.7), its `data-disabled` draws
 *   the unavailable edge. `disabled` (or that `data-disabled`) → a
 *   line-dotted-fine edge in --role-disabled-edge, title and body
 *   --role-muted, the action removed [D16]. A composing module may set
 *   `--card-frame` (a width) on the root to draw the outer scope's
 *   --primary12 frame inset over the face's edge: Pricing's recommended and
 *   selected tiers (§12.9).
 * - Parts: base, face, media, leadBody (the lead card's text column),
 *   entryBody (the entry card's text column), kicker, title, titleLink,
 *   meta, body, choice, action.
 * - Scope: `face` is a nested Ground [D178]: `white` on a page ground and
 *   for block and entry, `paper` inside a field or the night band (Ground
 *   writes the light island [D149, D179]). Bare cards have no face scope.
 * - Container: `base` is the inline-size container `card` (the action row's
 *   360 px stack guard queries it); face padding and the lead layout read
 *   the ancestor `card-grid` container at 608 / 944 px (§5.10.2). Baseline
 *   without support: media above text, padding by viewport (--md-n-above /
 *   --lg-n-above), lead horizontal from --lg-n-above, stack guard at
 *   --xs-n-below [D163]. Cards fill their grid row, and the action row is
 *   pinned to the card's bottom (§12.3). The entry card keeps its
 *   horizontal layout at every width; its host (the Hero) sets the columns.
 */
const card = cva(styles.base, {
  variants: {
    kind: {
      editorial: styles.editorial,
      block: styles.block,
      entry: styles.entry,
    },
    faced: {
      true: styles.faced,
    },
    lead: {
      true: styles.lead,
    },
    disabled: {
      true: styles.disabled,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  compoundVariants: [{ faced: true, lead: true, class: styles.facedLead }],
  defaultVariants: {
    kind: 'editorial',
    faced: false,
    lead: false,
    disabled: false,
  },
})

type CardVariants = VariantProps<typeof card>

type CardKindProps =
  | {
      /** Editorial (default): open (bare) by default per §12.2; `faced` adds the face and edge. */
      kind?: 'editorial'
      /**
       * Adds the face (a nested `white` Ground on a page ground, a `paper`
       * light island inside a field or the night band) and its
       * `--role-edge` edge. Editorial only. Default `false`: the open card
       * (§12.2).
       */
      faced?: boolean
      /**
       * The single lead card of a grid: horizontal, media 5 columns and
       * text 7, once its `card-grid` container reaches 944 px (viewport
       * fallback `--lg-n-above`); stacked below. Editorial only. Default
       * `false`.
       */
      lead?: boolean
    }
  | {
      /** Block edge: featured cards only, one card family per page on 1–3 cards [D174]. */
      kind: 'block'
      /** Not available on block cards, which always draw their block edge. */
      faced?: never
      /** Not available on block cards. */
      lead?: never
    }
  | {
      /**
       * Entry [D185]: compact and horizontal, a `white` face (a light
       * island on the night hero) with a static `--border-size-2`
       * `--primary12` edge. A leading `CardMedia` is the square image, flush
       * to the start edge and as tall as the card; then a `CardKicker`
       * (the category) and a `CardTitle` with its link. Used only as a
       * hero's entry cards (§11.9).
       */
      kind: 'entry'
      /** Not available on entry cards, which are always faced. */
      faced?: never
      /** Not available on entry cards. */
      lead?: never
    }

/** Props for Card: `article` props, `render`, and the kind, face and color axes. */
export type CardProps = useRender.ComponentProps<'article'> & {
  /**
   * Primary Radix scale for the card and its face: text, rules and edges.
   * Never defaulted; omitted, it inherits the scope [D133].
   */
  primary?: CardVariants['primary']
  /**
   * Secondary Radix scale for the card and its face: the accents, such as
   * the title link's underline. Never defaulted; omitted, it inherits the scope.
   */
  secondary?: CardVariants['secondary']
  /**
   * Unavailable (a sold-out product, a past event): title and body in
   * `--role-muted`, a `line-dotted-fine` edge, the action removed; the photo
   * is untouched and nothing fades [D16]. Add the status word as a Badge.
   * Default `false`.
   */
  disabled?: boolean
} & CardKindProps

/**
 * The card frame. Plain children are fine (`<Card>…</Card>`); the optional
 * parts `CardMedia`, `CardKicker`, `CardTitle` (+ `CardTitleLink`),
 * `CardMeta`, `CardBody`, `CardChoice` and `CardFooter` give the §12.2
 * anatomy and rhythm. Put a
 * leading `CardMedia` first (a direct child) to run it flush to the frame.
 * In a grid row, cards share one height and the footer sits at the bottom.
 *
 * Renders `<article>`; pass `render={<li />}` or similar to change it. The
 * root is an inline-size container, so give it a width in shrink-to-fit
 * contexts (flex items without stretch, floats).
 */
export function Card(props: CardProps) {
  const {
    render,
    ref,
    className,
    kind = 'editorial',
    faced,
    lead,
    disabled = false,
    primary,
    secondary,
    children,
    ...rest
  } = props

  const scope = useScope()
  const scopeAttributes = useScopeAttributes()

  const isFaced = kind === 'editorial' && faced === true
  const isLead = kind === 'editorial' && lead === true
  const isEntry = kind === 'entry'
  // Faces are white on a page ground; inside a field or the night band an
  // editorial face is a paper light island (block and entry stay white) [D179, D185].
  const facePreset = kind === 'editorial' && !isPageGroundPreset(scope.ground) ? 'paper' : 'white'

  // The lead and entry cards set their media beside a text column; other cards stack.
  let content: React.ReactNode = children
  if (isLead || isEntry) {
    const media: React.ReactNode[] = []
    const text: React.ReactNode[] = []
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === CardMedia) media.push(child)
      else text.push(child)
    })
    content = (
      <>
        {media}
        <div className={isEntry ? styles.entryBody : styles.leadBody}>{text}</div>
      </>
    )
  }

  const face =
    isFaced || kind === 'block' || isEntry ? (
      <Ground
        kind="face"
        preset={facePreset}
        primary={primary ?? undefined}
        secondary={secondary ?? undefined}
        render={<div />}
        className={styles.face}
      >
        {content}
      </Ground>
    ) : (
      <div className={styles.face}>{content}</div>
    )

  return useRender({
    defaultTagName: 'article',
    render,
    ref,
    props: mergeProps<'article'>(
      {
        ...scopeAttributes,
        className: card({
          kind,
          faced: isFaced,
          lead: isLead,
          disabled,
          primary,
          secondary,
          className,
        }),
        children: face,
      },
      rest
    ),
  })
}

/** Props for CardMedia: `figure` props and `render`. */
export type CardMediaProps = useRender.ComponentProps<'figure'>

/** Photo or drawing (`figure` with an `img`). Flush when first in a faced card; inset in a block card. */
export function CardMedia(props: CardMediaProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'figure',
    render,
    ref,
    props: mergeProps<'figure'>({ className: cx(styles.media, className) }, rest),
  })
}

/** Props for CardKicker: paragraph props and `render`. */
export type CardKickerProps = useRender.ComponentProps<'p'>

/**
 * The kicker above the title (§12.2 part `kicker`): a topic Tag, or a
 * category in `type-label` caps in --primary12, as on the entry card.
 */
export function CardKicker(props: CardKickerProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: mergeProps<'p'>({ className: cx(styles.kicker, className) }, rest),
  })
}

/** Props for CardTitle: heading props and `render` (default `<h3>`). */
export type CardTitleProps = useRender.ComponentProps<'h3'>

/** `type-itemhead` in --primary12. Renders `<h3>`; pass `render={<h2 />}` to fit the outline. */
export function CardTitle(props: CardTitleProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'h3',
    render,
    ref,
    props: mergeProps<'h3'>({ className: cx(styles.title, className) }, rest),
  })
}

/** Props for CardTitleLink: Link props except `kind`, which is always `title`. */
export type CardTitleLinkProps = Omit<LinkProps, 'kind'>

/**
 * The card's one primary link, inside `CardTitle`. A §9.3 title Link: its
 * hit area stretches over the whole card; hover, focus and press underline
 * the title; the card draws the focus ring outside its frame.
 */
export function CardTitleLink(props: CardTitleLinkProps) {
  const { className, ...rest } = props
  return <Link {...rest} kind="title" className={cx(styles.titleLink, className)} />
}

/** Props for CardMeta: paragraph props and `render`. */
export type CardMetaProps = useRender.ComponentProps<'p'>

/** Date, format, place joined by "·": `type-caption` in --role-muted. */
export function CardMeta(props: CardMetaProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: mergeProps<'p'>({ className: cx(styles.meta, className) }, rest),
  })
}

/** Props for CardBody: `div` props and `render`. */
export type CardBodyProps = useRender.ComponentProps<'div'>

/** Two to four lines of `type-body-ui` in --primary12. */
export function CardBody(props: CardBodyProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({ className: cx(styles.body, className) }, rest),
  })
}

/** Props for CardChoice: `div` props and `render`. */
export type CardChoiceProps = useRender.ComponentProps<'div'>

/**
 * The option-card indicator slot (§12.2 part `choice`, §10.7): put the
 * card's Checkbox or Radio here. Its `data-checked` steps the faced edge to
 * `--border-size-2` in `--role-select-edge`; its `data-disabled` draws the
 * unavailable edge and mutes the title and body. Sits above the stretched
 * title link as its own control.
 */
export function CardChoice(props: CardChoiceProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({ className: cx(styles.choice, className) }, rest),
  })
}

/** Props for CardFooter: `div` props and `render`. */
export type CardFooterProps = useRender.ComponentProps<'div'>

/**
 * The action row (§12.2 part `action`): a sm outline Button, or a
 * "READ MORE ›" standalone Link. Pinned to the card's bottom, so a grid
 * row's actions align (§12.3); sits above the stretched title link; stacks
 * below 360 px of card width; removed while the card is `disabled`.
 */
export function CardFooter(props: CardFooterProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({ className: cx(styles.action, className) }, rest),
  })
}

