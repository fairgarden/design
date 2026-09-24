'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { Button } from '../../actions/button'
import { Ground } from '../../foundations/ground'
import { OrnamentBlob, OrnamentTrail } from '../../utils/Ornament'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './cta-block.module.css'

/*
 * CTA Block (§11.10, the CTA banner): the page's one closing invitation
 * before the footer ("Keep exploring", "Find a garden near you"). A
 * `section` labelled by its headline, holding the kicker or eyebrow, the
 * headline, an optional support line, the action Button (`solid`, with a
 * leading arrow) and an optional `outline` twin. The saturated and deep
 * kinds are a CTA field, a `<Ground kind="field">` inset in the content
 * container, never a full-bleed band [D177, D180]; the sunburst, mission
 * and framed kinds sit on the page ground of their band.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: cta-block.module.css; CVA function `ctaBlock` (the spec's
 *   `ctaBanner`, named for the component).
 * - Axes: `kind` → sunburst | mission | saturated | deep | framed →
 *   same-named classes (`saturated` and `deep` render the CTA field);
 *   `patterned` → `patterned` (the headline takes --primary12 over a
 *   pattern; always on for `sunburst` and `mission`); `primary`,
 *   `secondary` → scales module classes.
 * - Compound variants: none.
 * - Defaults: kind sunburst, patterned false; color axes: none [D133].
 * - Color fallback: inherits the band's scope, or the field preset's
 *   defaults. The action is a §9.2 Button whose `solid` class aliases the
 *   scope's action scale (the ink pill on the solid fields).
 * - States: none of its own; the Buttons carry §9.2's.
 * - Parts: base, field (saturated and deep), content (the container),
 *   layout (its grid), text, decor (decorSunburst composes
 *   pattern-sunburst), kicker, trail (an OrnamentTrail by default), headline,
 *   support, actions, mount (an OrnamentBlob around the mark), frame (with
 *   frameLine), cornerMark.
 * - Scope: sunburst, mission and framed sit on their band's page ground;
 *   for saturated and deep, `field` is a `kind="field"` Ground of a field
 *   preset, with its --radius-3-25 and its --primary12 edge in
 *   --role-edge [D177, D178].
 * - Container: `content` is the inline-size container `cta`; the action row
 *   and the deep and framed kinds' headline/actions split (7 / 5 from 768 px)
 *   query it. Baseline: the actions flex-wrap; the split's viewport
 *   fallback is --lg-n-above (§5.10.2) [D163].
 */
export const ctaBlock = cva(styles.base, {
  variants: {
    kind: {
      sunburst: styles.sunburst,
      mission: styles.mission,
      saturated: styles.saturated,
      deep: styles.deep,
      framed: styles.framed,
    },
    patterned: {
      true: styles.patterned,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'sunburst',
    patterned: false,
  },
})

type CTABlockVariants = VariantProps<typeof ctaBlock>

/** An action: title-case label, authored [D160]; a destination prints as "Label (short URL)". */
export interface CTAAction {
  /** Verb plus object, title case: "Find a Garden". */
  label: string
  /** Where it goes; the Button renders an anchor. */
  href?: string
  /** Called on click (with or without `href`). */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
}

/** The saturated campaign field's presets [D177, D180]. */
export type CTASaturatedField = 'amber' | 'leaf' | 'clay' | 'royal' | 'brick'

/** The deep field's presets: `forest`, or `royal` (the companion of tide and heather) [D177]. */
export type CTADeepField = 'forest' | 'royal'

interface CTABlockCommonProps extends Omit<React.ComponentPropsWithRef<'section'>, 'children'> {
  /** The headline, `type-h2`, centered, ≤ 45ch and ≤ 4 lines. It names the section. */
  headline: React.ReactNode
  /** The headline's level. Default `2`. */
  headingLevel?: 2 | 3
  /**
   * The kicker (`type-kicker`, `--role-heading`), starting ≈ 15% of the
   * column in while the headline centers.
   */
  kicker?: React.ReactNode
  /**
   * The trail before the kicker, in `--role-accent`, ≤ `--size-px-12` wide.
   * Omitted, the `sunburst` kind draws `ornament-trail` (`<OrnamentTrail />`,
   * the short tail) and the other kinds none; pass your own `aria-hidden`
   * SVG in `currentColor`, or `null` for none. It prints at 0.75 pt.
   */
  trail?: React.ReactNode
  /** An optional support line, `--primary12`. */
  support?: React.ReactNode
  /** The primary action: the `solid` pill at `--size-px-8` with a leading arrow. */
  action: CTAAction
  /** The optional outline twin, same height. */
  secondaryAction?: CTAAction
  /**
   * Decoration behind the content, in `--role-tint`, clipped by the block
   * (the `sunburst` kind's reaches `--size-px-7-5` below it). Omitted, the
   * `sunburst` kind draws `pattern-sunburst` from an origin `--size-px-7-5`
   * below the block's bottom edge, and the other kinds none; pass your own
   * art in `currentColor` (centred on the bottom edge), or `null` for none.
   * A mission band's `pattern-speckle` belongs on its band's Ground, which
   * is full-bleed. Dropped in print; the block reads completely without it.
   * Sunburst ≤ 1 per page.
   */
  decor?: React.ReactNode
  /**
   * `patterned`: the headline takes `--primary12`, since only `--primary12`
   * text sits on a pattern. Always on for `sunburst` and `mission`. Default
   * `false`.
   */
  patterned?: boolean
  /**
   * Primary Radix scale: text, rules, marks and the outline twin. Never
   * defaulted; omitted, it inherits the scope [D133].
   */
  primary?: CTABlockVariants['primary']
  /** Secondary Radix scale: kicker and unpatterned headline, trail, blob discs. Never defaulted. */
  secondary?: CTABlockVariants['secondary']
}

interface CTABlockPageProps extends CTABlockCommonProps {
  /**
   * `sunburst` (default): trail kicker, centered serif headline, arrow pill,
   * the sunburst rising behind (white or the page ground, just before the
   * footer). `mission`: blob mount, centered H2, body, pill. `framed`: the
   * crop-mark box (technical pages). `saturated`: the campaign field, one
   * ink. `deep`: a `forest` or `royal` field with the pill and its outline
   * twin.
   */
  kind?: 'sunburst' | 'mission' | 'framed'
  field?: never
  /**
   * `mission` only: the mark on the blob mount (`ornament-blob`, an
   * `OrnamentBlob`): a logo, block icon or numeral in `currentColor`, which
   * takes the front disc's `--secondary-contrast`, about 57 px wide. The
   * discs are `--secondary9` over `--secondary7`; once per page, never on
   * fields. In print the discs drop and the mark prints black.
   */
  mount?: React.ReactNode
}

interface CTABlockSaturatedProps extends CTABlockCommonProps {
  kind: 'saturated'
  /** The campaign field: `amber` (default), `leaf`, `clay`, `royal` (if no other royal card) or `brick`. */
  field?: CTASaturatedField
  mount?: never
}

interface CTABlockDeepProps extends CTABlockCommonProps {
  kind: 'deep'
  /** The deep field: `forest` (default) or `royal`. */
  field?: CTADeepField
  mount?: never
}

/**
 * Props for CTABlock: `section` props, the kind (with its field for the
 * field kinds), the headline and its companions, the actions, the
 * decoration and the color axes.
 */
export type CTABlockProps = CTABlockPageProps | CTABlockSaturatedProps | CTABlockDeepProps

function ActionButton({ action, variant }: { action: CTAAction; variant: 'solid' | 'outline' }) {
  const { label, href, onClick } = action
  return (
    <Button
      variant={variant}
      size="lg"
      icon={variant === 'solid' ? 'arrow_forward' : undefined}
      onClick={onClick}
      {...(href != null ? { render: <a href={href} />, nativeButton: false } : null)}
    >
      {label}
    </Button>
  )
}

function CornerMark({ corner }: { corner: 'startStart' | 'startEnd' | 'endStart' | 'endEnd' }) {
  return (
    <svg
      className={`${styles.cornerMark} ${styles[corner]}`}
      viewBox="0 0 12 12"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M0 6h12M6 0v12" />
    </svg>
  )
}

/**
 * The CTA block. At most one per page, the page's ornament peak; never a
 * form (use Newsletter), a repeated mid-page promo or a floating bar. In
 * print the ornament drops, the action prints "Label (short URL)" and a
 * CTA field prints its edge as a black frame.
 */
export function CTABlock(props: CTABlockProps) {
  const {
    kind,
    field,
    headline,
    headingLevel = 2,
    kicker,
    trail,
    support,
    action,
    secondaryAction,
    decor,
    mount,
    patterned,
    primary,
    secondary,
    className,
    ...rest
  } = props

  const scope = useScopeAttributes()
  const headingId = React.useId()
  const resolvedKind = kind ?? 'sunburst'
  const isField = resolvedKind === 'saturated' || resolvedKind === 'deep'
  const HeadingTag = headingLevel === 3 ? 'h3' : 'h2'
  // Omitted slots take the kind's own ornament; `null` (or `false`) omits it.
  const isSunburst = resolvedKind === 'sunburst'
  const resolvedTrail = trail === undefined ? (isSunburst ? <OrnamentTrail /> : null) : trail

  const content = (
    <div className={styles.content}>
      <div className={styles.layout}>
        <div className={styles.text}>
          {resolvedKind === 'mission' && mount != null ? (
            <div className={styles.mount} aria-hidden="true">
              <OrnamentBlob>{mount}</OrnamentBlob>
            </div>
          ) : null}
          {kicker != null ? (
            <p className={styles.kicker}>
              {resolvedTrail != null && resolvedTrail !== false ? (
                <span className={styles.trail} aria-hidden="true">
                  {resolvedTrail}
                </span>
              ) : null}
              <span>{kicker}</span>
            </p>
          ) : null}
          <HeadingTag id={headingId} className={styles.headline}>
            {headline}
          </HeadingTag>
          {support != null ? <p className={styles.support}>{support}</p> : null}
        </div>
        <div className={styles.actions}>
          <ActionButton action={action} variant="solid" />
          {secondaryAction ? <ActionButton action={secondaryAction} variant="outline" /> : null}
        </div>
      </div>
    </div>
  )

  const body = (
    <>
      {decor === undefined && isSunburst ? (
        <div className={`${styles.decor} ${styles.decorSunburst}`} aria-hidden="true" />
      ) : decor != null && decor !== false ? (
        <div className={styles.decor} aria-hidden="true">
          {decor}
        </div>
      ) : null}
      {content}
      {resolvedKind === 'framed' ? (
        <>
          <svg className={styles.frame} aria-hidden="true" focusable="false">
            <rect className={styles.frameLine} width="100%" height="100%" />
          </svg>
          <CornerMark corner="startStart" />
          <CornerMark corner="startEnd" />
          <CornerMark corner="endStart" />
          <CornerMark corner="endEnd" />
        </>
      ) : null}
    </>
  )

  const defaultField = resolvedKind === 'deep' ? 'forest' : 'amber'

  return (
    <section
      {...rest}
      {...scope}
      aria-labelledby={rest['aria-labelledby'] ?? headingId}
      className={ctaBlock({
        kind: resolvedKind,
        patterned: patterned === true || isSunburst || resolvedKind === 'mission',
        primary,
        secondary,
        className,
      })}
    >
      {isField ? (
        <Ground
          kind="field"
          preset={(field as CTASaturatedField | CTADeepField | undefined) ?? defaultField}
          render={<div />}
          className={styles.field}
        >
          {body}
        </Ground>
      ) : (
        body
      )}
    </section>
  )
}
