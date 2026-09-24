'use client'

import * as React from 'react'
import { Separator as BaseSeparator } from '@base-ui/react/separator'
import { useRender } from '@base-ui/react/use-render'
import { mergeProps } from '@base-ui/react/merge-props'
import { cva, type VariantProps } from 'class-variance-authority'

import { Icon, iconHost } from '../../foundations/icon'
import { cx } from '../../utils/className'
import { printUrl } from '../../utils/printUrl'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import typeRoles from '../../utils/type.module.css'
import styles from './section-header.module.css'

/*
 * Section Header & Eyebrow (§11.8): opens every band or module in a fixed
 * order: what kind of thing this is (eyebrow), what it says (heading), why
 * it matters (lede), where to go next ("See all").
 *
 * Implementation (CSS Modules + CVA)
 * - Module: section-header.module.css; CVA function `sectionHeader`.
 * - Axes: `kind` → editorial | trailed | scene | anchored | technical |
 *   topic → same-named classes (`trailed` is the trail kicker, so it does
 *   not clash with the `trail` part); `level` → band | module → band,
 *   module (the heading's element, type role and ink); `primary`,
 *   `secondary` → scales module classes.
 * - Compound variants: none.
 * - Defaults: kind editorial, level band; color axes: none.
 * - Color fallback: inherits the scope.
 * - States: only `seeAll`: :hover → the arrow-link hover [D181] (label
 *   --role-link-hover, the arrow at the next tier's weight, the rest
 *   underline kept); :focus-visible → the ring. A topic tag keeps its own
 *   module (§10).
 * - Parts: base, eyebrow, eyebrowRule (Base UI Separator,
 *   data-orientation="horizontal"), trail, kicker, heading, lede, seeAll,
 *   art, number, topicTag; plus kickerRow, marker, seeAllLabel, seeAllArrow,
 *   printUrl and action (the scene pill or the anchored action).
 * - Scope: none.
 * - Container: none; inherits its context. "See all" joins the heading row
 *   from --lg-n-above, a page-frame rule on viewport media [D163].
 */
export const sectionHeader = cva(styles.base, {
  variants: {
    kind: {
      editorial: styles.editorial,
      trailed: styles.trailed,
      scene: styles.scene,
      anchored: styles.anchored,
      technical: styles.technical,
      topic: styles.topic,
    },
    level: {
      band: styles.band,
      module: styles.module,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'editorial',
    level: 'band',
  },
})

type SectionHeaderVariants = VariantProps<typeof sectionHeader>

/** The six §11.8 builds. */
export type SectionHeaderKind = NonNullable<SectionHeaderVariants['kind']>

/** The "See all" link: a standalone link in `type-label` caps with a trailing arrow. */
export interface SectionHeaderSeeAll {
  /** The destination; a short absolute URL also prints after the label (§7.6). */
  href: string
  /** Authored in sentence case; the CSS sets the caps. Default "See all". */
  label?: React.ReactNode
  /** Base UI `render`, e.g. `<NextLink href="/trails" />`. */
  render?: React.ReactElement
}

type SectionHeaderCommonProps = Omit<useRender.ComponentProps<'div'>, 'children'> & {
  /**
   * `band` (default): an `h2` in `type-h2`, the section head in
   * `--role-heading`. `module`: an `h3` in `type-itemhead` in `--primary12`
   * (an item head, not a section head [D60]).
   */
  level?: SectionHeaderVariants['level']
  /**
   * Primary Radix scale: the eyebrow, lede, module heading and rules. Never
   * defaulted; omitted, it inherits the band or field [D133].
   */
  primary?: SectionHeaderVariants['primary']
  /**
   * Secondary Radix scale: the band heading and kicker (`--role-heading`),
   * the trail and the "See all" underline (`--role-accent`) and its hover
   * ink. Never defaulted.
   */
  secondary?: SectionHeaderVariants['secondary']
  /** The heading text: what the band or module says. Required: an eyebrow is never the only heading. */
  heading: React.ReactNode
  /** The heading's `id`, for the band's `aria-labelledby`. */
  headingId?: string
  /** Why it matters: `type-lead` in `--primary12`, capped at `--fgd-measure-reading`. */
  lede?: React.ReactNode
  /** Where to go next: below the lede at base, at the heading row's end from `--lg-n-above`. */
  seeAll?: SectionHeaderSeeAll
  /** The action row: the scene opener's pill, or the anchored opener's action. */
  children?: React.ReactNode
}

type SectionHeaderKindProps =
  | {
      /**
       * `editorial` (default): eyebrow, hairline, content. With an
       * eyebrow the header opens with its rule, so the band needs no
       * page-seam hairline above it [D179].
       */
      kind?: 'editorial'
      /** What kind of thing this is: `type-eyebrow` caps in `--primary12`, over its hairline. */
      eyebrow?: React.ReactNode
      kicker?: never
      art?: never
      number?: never
      topic?: never
    }
  | {
      /** `trailed`: a display-serif kicker threaded by the dashed trail; the heading centred below it. */
      kind: 'trailed'
      /** The kicker: `type-kicker` in `--role-heading`, a section head. */
      kicker: React.ReactNode
      eyebrow?: never
      art?: never
      number?: never
      topic?: never
    }
  | {
      /** `scene`: heading, lede and pill, all centred. */
      kind: 'scene'
      eyebrow?: never
      kicker?: never
      art?: never
      number?: never
      topic?: never
    }
  | {
      /** `anchored`: a sticker drawing sitting on the heading, then an action. */
      kind: 'anchored'
      /** The sticker (§6.14) at `--fgd-size-art-s`; its halo touches the heading's cap tops. */
      art: React.ReactNode
      eyebrow?: never
      kicker?: never
      number?: never
      topic?: never
    }
  | {
      /** `technical`: a mono section number and a caps label with a colon, over a rule. */
      kind: 'technical'
      /** The section number, e.g. "03", in `type-data`. */
      number: React.ReactNode
      /** The label, in `type-label` caps; the colon is added. */
      eyebrow: React.ReactNode
      kicker?: never
      art?: never
      topic?: never
    }
  | {
      /** `topic`: an icon and caps topic tag above the heading. */
      kind: 'topic'
      /** The topic tag: a §10 Tag with its icon, which keeps its own module. */
      topic: React.ReactNode
      eyebrow?: never
      kicker?: never
      art?: never
      number?: never
    }

/** Props for SectionHeader: `div` props, `render`, the kind with its parts, the level and the color axes. */
export type SectionHeaderProps = SectionHeaderCommonProps & SectionHeaderKindProps

/**
 * The entry-left `ornament-trail` (§4.7.1): an origin circle, a freehand
 * rise with one loop, then a level run stopping `--fgd-space-halo` before the
 * kicker. Fixed art, 120 × 56 px; decorative.
 */
function TrailEntry() {
  return (
    <svg
      className={styles.trail}
      width="120"
      height="56"
      viewBox="0 0 120 56"
      aria-hidden="true"
      focusable="false"
    >
      <circle className={styles.marker} cx="5" cy="46" r="2.5" />
      <path
        className={styles.trailPath}
        d="M12 45.2C18 43 22 38 26 31C31 22 35 9 43 8C51 7 53 20 46 27C39 34 30 29 33 20C36 12 50 14 60 21C68 26 76 28 86 28L120 28"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

/** The trail resumed `--fgd-space-halo` after the kicker, ending in an open `marker-terminal`. */
function TrailTail() {
  return (
    <svg
      className={styles.trail}
      width="40"
      height="56"
      viewBox="0 0 40 56"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className={styles.trailPath}
        d="M0 28C8 28 14 30 22 29"
        vectorEffect="non-scaling-stroke"
      />
      <path className={styles.marker} d="M26 26 32 29 26 32Z" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/** "See all →": `type-label` caps, underlined at rest in `--role-accent`, with a `--fgd-size-hit` target. */
function SeeAll({ href, label, render }: SectionHeaderSeeAll) {
  const url = printUrl(href)
  return useRender({
    defaultTagName: 'a',
    render,
    props: {
      href,
      className: cx(styles.seeAll, iconHost),
      children: (
        <>
          <span className={styles.seeAllLabel}>{label ?? 'See all'}</span>
          <Icon name="arrow_forward" weight="interactive" className={styles.seeAllArrow} />
          {url !== null ? <span className={styles.printUrl}>({url})</span> : null}
        </>
      ),
    },
  })
}

/**
 * The opener of a band or module. Keep the order eyebrow → heading → lede →
 * action; pick the eyebrow rule or the trail, never both; left-align over
 * reading content and centre only scene openers. On the night band and in
 * fields every text resolves to `--primary12`; the eyebrow is never the
 * accent. Prints with its rules, never at the foot of a page.
 */
export function SectionHeader(props: SectionHeaderProps) {
  const {
    render,
    ref,
    className,
    kind,
    level,
    primary,
    secondary,
    heading,
    headingId,
    lede,
    seeAll,
    eyebrow,
    kicker,
    art,
    number,
    topic,
    children,
    ...rest
  } = props

  const scope = useScopeAttributes()
  const resolvedKind: SectionHeaderKind = kind ?? 'editorial'
  const HeadingTag = level === 'module' ? 'h3' : 'h2'

  const content = (
    <>
      {resolvedKind === 'technical' ? (
        <>
          <p className={styles.numberRow}>
            <span className={cx(styles.number, typeRoles.typeData)}>{number}</span>
            <span className={cx(styles.eyebrow, typeRoles.typeLabel)}>{eyebrow}</span>
          </p>
          <BaseSeparator orientation="horizontal" className={styles.eyebrowRule} />
        </>
      ) : null}
      {resolvedKind === 'editorial' && eyebrow != null ? (
        <>
          <p className={cx(styles.eyebrow, typeRoles.typeEyebrow)}>{eyebrow}</p>
          <BaseSeparator orientation="horizontal" className={styles.eyebrowRule} />
        </>
      ) : null}
      {resolvedKind === 'trailed' ? (
        <div className={styles.kickerRow}>
          <TrailEntry />
          <p className={cx(styles.kicker, typeRoles.typeKicker)}>{kicker}</p>
          <TrailTail />
        </div>
      ) : null}
      {resolvedKind === 'anchored' ? <div className={styles.art}>{art}</div> : null}
      {resolvedKind === 'topic' ? <div className={styles.topicTag}>{topic}</div> : null}
      <HeadingTag
        id={headingId}
        className={cx(styles.heading, level === 'module' ? typeRoles.typeItemhead : typeRoles.typeH2)}
      >
        {heading}
      </HeadingTag>
      {lede != null ? <p className={cx(styles.lede, typeRoles.typeLead)}>{lede}</p> : null}
      {seeAll != null ? <SeeAll {...seeAll} /> : null}
      {children != null ? <div className={styles.action}>{children}</div> : null}
    </>
  )

  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>(
      {
        ...scope,
        className: sectionHeader({ kind: resolvedKind, level, primary, secondary, className }),
        children: content,
      },
      rest
    ),
  })
}
