'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { Card, CardKicker, CardMedia, CardTitle, CardTitleLink } from '../../content/card'
import { Ground } from '../../foundations/ground'
import { Icon } from '../../foundations/icon'
import { Link } from '../../actions/link'
import { SectionDivider } from '../section-divider'
import { cx } from '../../utils/className'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import {
  isPageGroundPreset,
  useScope,
  type BandPreset,
  type PageGroundPreset,
} from '../../utils/scope'
import typeRoles from '../../utils/type.module.css'
import styles from './hero.module.css'

/*
 * Hero (§11.9) [D185]: the page's one opening statement, and its only `h1`.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: hero.module.css; CVA function `hero`.
 * - Axes: `kind` → editorial | illustrated | split | technical → same-named
 *   classes (variants A–D); `stacked` → `stacked` ("C, stacked"; split
 *   only, excluded in the types for the other kinds); `landing` →
 *   `landing` (allows `type-display-xl`); `transactional` → `transactional`
 *   (the `--ds-size-control-xl` pill row); `primary`, `secondary` → the
 *   scales module classes, which the hero's Ground scope writes.
 * - Compound variants: none.
 * - Defaults: kind editorial, stacked false, landing false, transactional
 *   false; color axes: none.
 * - Color fallback: inherits the preset's defaults through its Ground; the
 *   actions are §9.2 Buttons, whose `solid` takes the scope's action scale.
 * - States: only `railLabel`, a §9.3 `nav` Link: :hover → the bare-text
 *   underline (--role-accent, --border-size-2, offset --size-px-1) [D181];
 *   :focus-visible → the ring, which follows the rotated box. Buttons and
 *   the entry cards (Card kind="entry", §12.2) carry their own states.
 * - Parts: base, wayfinding, title, lockup, lede, actions, media, photo,
 *   caption, iconButton, plate, drawing, frame, cells, cell, entries, rail,
 *   railLabel, compass, trail, seam; plus container, layout and content
 *   (the text column), aside (the technical right column), entryItem and
 *   entry (the list item and its Card), and the seam-span and trail
 *   sub-parts.
 * - Scope: the root is a `kind="band"` Ground: a page ground, or `night` as
 *   the media hero [D177, D178]. `plate` is a `kind="face"` Ground of a
 *   page ground, and each entry card a §12.2 `Card kind="entry"`, whose
 *   face is a `white` Ground [D185]; `iconButton` sits in a `night`
 *   face (the §9.2 media variant); the illustrated campaign field is a
 *   `kind="field"` Ground inside the band. `seam` is the exit seam: a
 *   `kind="band"` Ground of the next band's page ground (`next`), rendered
 *   after the hero when something crosses the edge (the stacked photo, the
 *   entry cards, the rail's trail) or the night hero ends on the hill or
 *   the fringe. It carries the parts that land on that ground in its
 *   colors: the stacked photo's caption, the entry cards, the trail.
 * - Container: the technical info cells (`cells`) are the inline-size
 *   container `hero-cells` (baseline flex-wrap at a 120 px minimum; viewport
 *   fallback 1 column at --xs-n-below, one row at --lg-n-above; container
 *   2-up from 360, 4-up from 480) [D163]. The rest is page frame on
 *   viewport media.
 */
export const hero = cva(styles.base, {
  variants: {
    kind: {
      editorial: styles.editorial,
      illustrated: styles.illustrated,
      split: styles.split,
      technical: styles.technical,
    },
    stacked: {
      true: styles.stacked,
    },
    landing: {
      true: styles.landing,
    },
    transactional: {
      true: styles.transactional,
    },
    // Color axes: never defaulted [D133]. The hero's Ground writes the classes.
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'editorial',
    stacked: false,
    landing: false,
    transactional: false,
  },
})

type HeroVariants = VariantProps<typeof hero>

/** The four §11.9 builds: A editorial, B illustrated, C split photo, D technical. */
export type HeroKind = NonNullable<HeroVariants['kind']>

/** One compact entry card [D185], rendered as `Card kind="entry"`: square image, caps category, item-head link. */
export interface HeroEntry {
  /** The card's one link. */
  href: string
  /** The category, in `type-label` caps. */
  category: React.ReactNode
  /** The link text, in `type-itemhead`. */
  title: React.ReactNode
  /** A square image, usually an `img` with its `alt`. */
  image?: React.ReactNode
}

/** Up to three entry cards [D185]. */
export type HeroEntries =
  | readonly []
  | readonly [HeroEntry]
  | readonly [HeroEntry, HeroEntry]
  | readonly [HeroEntry, HeroEntry, HeroEntry]

/** The explore rail [D185]: the rotated rail label and its optional compass. */
export interface HeroRail {
  /** Where the rail goes, usually an in-page anchor. */
  href: string
  /** The label, e.g. "Explore the land". */
  label: React.ReactNode
  /** An optional compass: an icon-only §9.2 Button that scrolls with the hero, never a fixed launcher. */
  compass?: React.ReactNode
}

/** One technical info cell: a caps label over a mono value. */
export interface HeroCell {
  label: React.ReactNode
  value: React.ReactNode
}

type HeroCommonProps = Omit<React.ComponentPropsWithRef<'header'>, 'title' | 'children'> & {
  /** Landing pages: the title may take `type-display-xl` from `--lg-n-above`. Default `false`. */
  landing?: boolean
  /**
   * A transactional hero: the actions carry the page's single
   * `--ds-size-control-xl` pill (pass `size="xl"` to its Button). Default `false`.
   */
  transactional?: boolean
  /** Primary Radix scale for the hero's scope. Never defaulted; omitted, the preset's default [D133]. */
  primary?: HeroVariants['primary']
  /** Secondary Radix scale for the hero's scope: the title, the trail and the accents. */
  secondary?: HeroVariants['secondary']
  /** Wayfinding above the title: a §9.8 Breadcrumb, an eyebrow, a pill badge or a topic tag. */
  wayfinding?: React.ReactNode
  /** The `h1`: `type-display`, about 20ch, in 2–3 lines. Real text, never on a photo. */
  title: React.ReactNode
  /** The title's `id`. */
  titleId?: string
  /** The lede: `type-lead` in `--primary12` (a mono subtitle in `technical`). */
  lede?: React.ReactNode
  /** The action Buttons: one `solid` pill (`size="lg"`) and at most its outline twin. */
  actions?: React.ReactNode
  /**
   * The page ground of the band below the hero, which the exit seam takes
   * (the stacked photo's lower half and caption, the entry cards, the
   * trail and the hill all land on it). Default: the enclosing page
   * ground, else `paper`. Open the next band on the same preset.
   */
  next?: PageGroundPreset
  /** Builds each anchor (rail, entry cards), e.g. `(href) => <NextLink href={href} />`. */
  renderLink?: (href: string) => React.ReactElement
}

type HeroGroundProps =
  | {
      /**
       * The hero's band: a page ground (default: the enclosing page ground,
       * else `paper`), or `night` as the media hero [D177].
       */
      preset?: PageGroundPreset
      edge?: never
    }
  | {
      preset: 'night'
      /**
       * The night hero's shaped exit, light mode only [D179]: `hill`
       * (editorial and reference pages) or `fringe` (campaign pages). It
       * counts as the page's one shaped edge; with `stacked` the photo
       * passes in front of the hill. A seam carries one device [D51], so
       * entry cards replace it. Omitted: the straight cut.
       */
      edge?: 'hill' | 'fringe'
    }

type HeroPhotoProps = {
  /** A content photo figure's caption: description, then "Photo: Name"; right-flush below. */
  caption?: React.ReactNode
  /** An icon-only `onMedia` Button over the photo's corner (the §9.2 media variant). */
  photoAction?: React.ReactNode
  /** The explore rail: an inline link under the lede at base; the rotated corner label from `--md-n-above`. */
  rail?: HeroRail
  drawing?: never
  field?: never
  aside?: never
  cells?: never
}

type HeroEditorialProps = HeroPhotoProps & {
  /** A: type only, or the media hero's photo figure (centred, on `night`). */
  kind?: 'editorial'
  /** The photo, usually an `img` with its `alt`, at 3:2. With a photo the text centres. */
  photo?: React.ReactNode
  /** Up to 3 entry cards straddling the hero's bottom edge from `--lg-n-above` (with a photo). */
  entries?: HeroEntries
  stacked?: never
  plate?: never
}

type HeroSplitProps = HeroPhotoProps & {
  /** C: a flat text band and the photo as its own figure, beside it from `--lg-n-above`. */
  kind: 'split'
  /** The photo, usually an `img` with its `alt`, at 3:2. Never text on it. */
  photo: React.ReactNode
} & (
    | {
        /**
         * "C, stacked" for editorial and reference pages: from
         * `--lg-n-above` the text band, then the photo in the reading span
         * straddling the band edge, the hill behind it and the caption
         * right-flush below [D185]. Default `false`.
         */
        stacked: true
        entries?: never
        plate?: never
      }
    | {
        stacked?: false
        /** Up to 3 entry cards straddling the hero's bottom edge from `--lg-n-above`. */
        entries?: HeroEntries
        /** An opaque plate (a face) overlapping the photo's lower edge; it must stand ≥ 128 px tall. */
        plate?: React.ReactNode
      }
  )

type HeroIllustratedProps = {
  /** B: text with a sticker drawing; the only hero that may carry a Display Lockup (`HeroLockup`). */
  kind: 'illustrated'
  preset?: PageGroundPreset
  edge?: never
  /** The sticker drawing with its halo: `--ds-size-art-s` at base, `--ds-size-art-l` from `--lg-n-above`. */
  drawing?: React.ReactNode
  /** A campaign hero: the lockup and drawing sit in the page's one `leaf` or `amber` field [D177]. */
  field?: 'leaf' | 'amber'
  /** The explore rail. */
  rail?: HeroRail
  stacked?: never
  photo?: never
  caption?: never
  photoAction?: never
  plate?: never
  entries?: never
  aside?: never
  cells?: never
}

type HeroTechnicalProps = {
  /** D: a `line-double` frame: title, rule, mono subtitle, actions. */
  kind: 'technical'
  preset?: PageGroundPreset
  edge?: never
  /** The right column behind a vertical rule from `--lg-n-above` (a spec list or an install field). */
  aside?: React.ReactNode
  /** The ruled info-cell row: a caps label over a mono value in each cell (2 or 4 cells). */
  cells?: readonly HeroCell[]
  /** An optional line diagram. */
  drawing?: React.ReactNode
  stacked?: never
  photo?: never
  caption?: never
  photoAction?: never
  plate?: never
  entries?: never
  field?: never
  rail?: never
}

/**
 * Props for Hero: `header` props, the kind with its parts, the preset (and
 * the night hero's `edge`), `next`, the flags and the color axes.
 */
export type HeroProps = HeroCommonProps &
  (
    | (HeroEditorialProps & HeroGroundProps)
    | (HeroSplitProps & HeroGroundProps)
    | HeroIllustratedProps
    | HeroTechnicalProps
  )

/** Every prop at once, for destructuring the union. */
type HeroAllProps = HeroCommonProps & {
  kind?: HeroKind
  stacked?: boolean
  preset?: BandPreset
  edge?: 'hill' | 'fringe'
  photo?: React.ReactNode
  caption?: React.ReactNode
  photoAction?: React.ReactNode
  plate?: React.ReactNode
  entries?: readonly HeroEntry[]
  drawing?: React.ReactNode
  field?: 'leaf' | 'amber'
  aside?: React.ReactNode
  cells?: readonly HeroCell[]
  rail?: HeroRail
}

/** Props for HeroLockup. */
export interface HeroLockupProps {
  /** The caps words, in `type-lockup-caps`. */
  caps: React.ReactNode
  /** The one accent word, in `type-lockup-accent`. */
  accent: React.ReactNode
}

/**
 * The Display Lockup (§3.8) as the illustrated hero's title: caps words and
 * one accent word, real text in the `h1`. Pass it as `title`.
 */
export function HeroLockup({ caps, accent }: HeroLockupProps) {
  return (
    <span className={styles.lockup}>
      <span className={styles.lockupCaps}>{caps}</span>{' '}
      <span className={styles.lockupAccent}>{accent}</span>
    </span>
  )
}

/**
 * The rail's descender, the one tall `ornament-trail` (§4.7.1) [D185]: an
 * origin circle under the rail label, a freehand fall across the seam and an
 * open `marker-terminal`. Fixed art, 40 × 113 px, so it keeps to the
 * 40 px page margin; decorative.
 */
function RailTrail() {
  return (
    <svg
      className={styles.trail}
      width="40"
      height="113"
      viewBox="0 0 40 113"
      aria-hidden="true"
      focusable="false"
    >
      <circle className={styles.trailMarker} cx="20" cy="4" r="2.5" />
      <path
        className={styles.trailPath}
        d="M20 11C20 24 8 30 10 44C12 58 30 58 30 72C30 86 16 90 17 101"
        vectorEffect="non-scaling-stroke"
      />
      <path
        className={styles.trailMarker}
        d="M14.3 105.3 17.8 111 20.3 104.7Z"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

/**
 * The page's one hero, with the single `h1`. Never text on a photo, never
 * sized to the viewport, never animated on load. A photo hero splits: text
 * on a flat ground, the photo as its own captioned figure.
 *
 * - `editorial` (A): type only on the page ground; with a `photo`, the
 *   centred media hero, on `preset="night"`.
 * - `illustrated` (B): text and a sticker drawing; `field` sets them in a
 *   campaign field; `HeroLockup` is its Display Lockup.
 * - `split` (C): text beside the photo from `--lg-n-above`; `stacked` puts
 *   the photo under the text in the reading span, straddling the edge.
 * - `technical` (D): the double-ruled frame, with `aside` and `cells`.
 *
 * Straddles [D185]: `entries` (up to 3) cross the bottom edge from
 * `--lg-n-above` and stack under the hero below it; the stacked photo
 * crosses it too, with the hill behind. `rail` pins the rotated label to
 * the bottom end corner, its trail crossing the seam. The hero then renders
 * its exit seam on `next`, the band below. Prints as the masthead title.
 */
export function Hero(props: HeroProps) {
  const {
    kind,
    stacked,
    landing,
    transactional,
    primary,
    secondary,
    preset: presetProp,
    edge,
    next,
    wayfinding,
    title,
    titleId,
    lede,
    actions,
    photo,
    caption,
    photoAction,
    plate,
    entries,
    drawing,
    field,
    aside,
    cells,
    rail,
    renderLink,
    className,
    ...rest
  } = props as HeroAllProps

  const scope = useScope()
  const resolvedKind: HeroKind = kind ?? 'editorial'
  const pageGround: PageGroundPreset = isPageGroundPreset(scope.ground) ? scope.ground : 'paper'
  const preset: BandPreset = presetProp ?? pageGround
  const nextPreset: PageGroundPreset = next ?? pageGround

  const photoKind = resolvedKind === 'editorial' || resolvedKind === 'split'
  const hasPhoto = photoKind && photo != null
  const isStacked = resolvedKind === 'split' && stacked === true && hasPhoto
  const entryList = hasPhoto && !isStacked && entries != null ? entries.slice(0, 3) : []
  // A seam carries one device [D51]: entry cards straddling it take the place of a shaped edge.
  const shapedEdge = preset === 'night' && entryList.length === 0 ? edge : undefined
  const hasRail = rail != null && resolvedKind !== 'technical'
  const seamed = isStacked || entryList.length > 0 || shapedEdge != null || hasRail
  // Something else fills the seam band, so the shaped edge lies over it.
  const edgeOver = isStacked || entryList.length > 0
  const pageSeam = seamed && preset !== 'night' && preset !== nextPreset

  /*
   * In an illustrated hero on a field, the rotated rail (from --md-n-above)
   * sits on the band beside the field, so it renders as the band's child to
   * take the band's inks and mode, not the field's; the inline copy under
   * the lede serves the base width. Each copy is display: none at the
   * other's widths, so one link is ever in the accessibility tree.
   */
  const railOnBand = hasRail && resolvedKind === 'illustrated' && field != null
  const renderRail = (explore: HeroRail, placement?: string) => (
    <div className={cx(styles.rail, placement)}>
      <Link
        kind="nav"
        href={explore.href}
        render={renderLink?.(explore.href)}
        className={styles.railLabel}
      >
        {explore.label}
        <Icon name="arrow_forward" className={styles.railArrow} />
      </Link>
      {explore.compass != null ? <div className={styles.compass}>{explore.compass}</div> : null}
    </div>
  )
  const railNode =
    hasRail && rail != null ? renderRail(rail, railOnBand ? styles.railInline : undefined) : null
  const railCorner = railOnBand && rail != null ? renderRail(rail, styles.railCorner) : null

  const text = (
    <div className={styles.content}>
      {wayfinding != null ? <div className={styles.wayfinding}>{wayfinding}</div> : null}
      <h1 id={titleId} className={cx(styles.title, typeRoles.typeDisplay)}>
        {title}
      </h1>
      {lede != null ? (
        <p
          className={cx(
            styles.lede,
            resolvedKind === 'technical' ? typeRoles.typeData : typeRoles.typeLead
          )}
        >
          {lede}
        </p>
      ) : null}
      {railNode}
      {actions != null ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  )

  const figure = hasPhoto ? (
    <figure className={styles.media}>
      <div className={styles.photo}>
        {photo}
        {photoAction != null ? (
          <Ground
            kind="face"
            preset="night"
            onMedia
            render={<div />}
            className={styles.iconButton}
          >
            {photoAction}
          </Ground>
        ) : null}
      </div>
      {plate != null && !isStacked ? (
        <Ground
          kind="face"
          preset={preset === 'night' ? 'paper' : 'white'}
          render={<div />}
          className={styles.plate}
        >
          {plate}
        </Ground>
      ) : null}
      {caption != null ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  ) : null

  let body: React.ReactNode
  if (resolvedKind === 'illustrated') {
    const inner = (
      <>
        {drawing != null ? <div className={styles.drawing}>{drawing}</div> : null}
        {text}
      </>
    )
    body =
      field != null ? (
        <Ground
          kind="field"
          preset={field}
          render={<div />}
          className={cx(styles.field, styles.layout)}
        >
          {inner}
        </Ground>
      ) : (
        <div className={styles.layout}>{inner}</div>
      )
  } else if (resolvedKind === 'technical') {
    body = (
      <div className={styles.frame}>
        {text}
        {aside != null ? <div className={styles.aside}>{aside}</div> : null}
        {drawing != null ? <div className={styles.drawing}>{drawing}</div> : null}
        {cells != null && cells.length > 0 ? (
          <dl className={styles.cells}>
            {cells.map((cell, index) => (
              <div key={index} className={styles.cell}>
                <dt className={styles.cellLabel}>{cell.label}</dt>
                <dd className={styles.cellValue}>{cell.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    )
  } else {
    body = (
      <div className={styles.layout}>
        {text}
        {figure}
      </div>
    )
  }

  const band = (
    <Ground
      kind="band"
      preset={preset}
      primary={primary ?? undefined}
      secondary={secondary ?? undefined}
      render={<header />}
      {...rest}
      className={cx(
        hero({ kind: resolvedKind, stacked: isStacked, landing, transactional }),
        resolvedKind === 'editorial' && hasPhoto && styles.mediaHero,
        shapedEdge != null && styles.edged,
        className
      )}
    >
      <div className={styles.container}>{body}</div>
      {railCorner}
    </Ground>
  )

  if (!seamed) return band

  return (
    <>
      {band}
      <Ground
        kind="band"
        preset={nextPreset}
        render={<div />}
        className={cx(
          styles.seam,
          isStacked && styles.seamStacked,
          entryList.length > 0 && styles.seamEntries
        )}
      >
        {pageSeam ? <SectionDivider kind="page-seam" className={styles.seamRule} /> : null}
        {shapedEdge != null ? (
          <SectionDivider
            kind={shapedEdge}
            className={cx(styles.seamEdge, edgeOver && styles.seamEdgeOver)}
          />
        ) : null}
        {isStacked ? (
          <div className={styles.container}>
            <div className={styles.seamSpan}>
              <div className={styles.photoSpacer} />
              {caption != null ? (
                <p className={styles.seamCaption} aria-hidden="true">
                  {caption}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
        {entryList.length > 0 ? (
          <div className={styles.container}>
            <ul className={styles.entries}>
              {entryList.map((entry, index) => (
                <li key={index} className={styles.entryItem}>
                  <Card kind="entry" className={styles.entry}>
                    {entry.image != null ? <CardMedia>{entry.image}</CardMedia> : null}
                    <CardKicker>{entry.category}</CardKicker>
                    <CardTitle render={<p />}>
                      <CardTitleLink href={entry.href} render={renderLink?.(entry.href)}>
                        {entry.title}
                      </CardTitleLink>
                    </CardTitle>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {hasRail ? <RailTrail /> : null}
      </Ground>
    </>
  )
}
