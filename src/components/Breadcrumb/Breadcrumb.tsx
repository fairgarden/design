'use client'

import * as React from 'react'
import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible'
import { cva, type VariantProps } from 'class-variance-authority'

import { Button } from '../Button'
import { DisclosureGlyph, disclosureGlyphHost } from '../Collapsible'
import { Icon } from '../Icon'
import { Link } from '../Link'
import { Menu, MenuItem, MenuPopup, MenuTrigger } from '../Menu'
import { Tooltip, TooltipPopup, TooltipTrigger } from '../Tooltip'
import { cx } from '../../utils/className'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './breadcrumb.module.css'

/*
 * Breadcrumb (§9.8): where the page sits in the hierarchy.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: breadcrumb.module.css; CVA functions `breadcrumb` (the root) and
 *   `breadcrumbStairRow` (a staircase row).
 * - Axes: `kind` → inline | staircase | parent → kindInline, kindStaircase,
 *   kindParent (prefixed, because `staircase` is also a part); `primary`,
 *   `secondary` → scales module classes (the secondary drives nothing).
 *   `breadcrumbStairRow`: `level` → 1 … 6 → level1 … level6, the indent.
 * - Compound variants: none.
 * - Defaults: kind inline; color axes: none.
 * - Color fallback: inherits the scope.
 * - States: ancestors are Link kind="nav" muted, so the Link owns their
 *   muted rest ink, hover (--role-link-hover only, underlined where that is
 *   --primary12), press and ring [D80, D181]. aria-current="page" on
 *   `current` → --font-weight-6 (--font-weight-7 on the staircase kind's
 *   one line, the section bar's title [D184]). Collapsible data-panel-open on
 *   `stairToggle` → the disclosure glyph turns inward in --primary12 (the
 *   Collapsible's glyph rules); :hover on `stairToggle` → the glyph at the
 *   next tier's weight (its glyph host, §11.7); `staircase` data-starting-style /
 *   data-ending-style → the clip reveal, instant under --motionNotOK.
 * - Parts: base (the nav), list, item, link, separator, current,
 *   domainGlyph, overflow (the "…" item), staircase (the Collapsible panel), stairToggle,
 *   stairRow; plus plain (a level without a page), parentRow / parentLink /
 *   parentText (the ‹ Parent link, a `text` Button), stair, stairBar,
 *   stairGlyph, stairTitle, stairList, stairChevron and printLine.
 * - Scope: none.
 * - Container: a `kindInline` root is the inline-size container
 *   `breadcrumb`. Baseline: the parent link only; viewport fallback inline
 *   from --md-n-above (4 levels) and 6 levels from --lg-n-above; container
 *   from 768 px inline, collapsing the middle past 4 levels, from 1024 px up
 *   to 6 (§5.10.2). `kindStaircase` is page frame on viewport media
 *   (§5.10.1): the collapsed staircase below --md-n-above, one line from it
 *   (4 levels, 6 from --lg-n-above), whose crumbs truncate [D184]. The
 *   §11.7 SectionBar renders this one line (`withStaircase={false}`) and
 *   reveals the staircase in its own Collapsible.
 */
export const breadcrumb = cva(styles.base, {
  variants: {
    kind: {
      inline: styles.kindInline,
      staircase: styles.kindStaircase,
      parent: styles.kindParent,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'inline',
  },
})

/** A staircase row's indent (§9.8 Tokens): level 2 adds the chevron slot, deeper levels step by --size-px-2. */
export const breadcrumbStairRow = cva(styles.stairRow, {
  variants: {
    level: {
      1: styles.level1,
      2: styles.level2,
      3: styles.level3,
      4: styles.level4,
      5: styles.level5,
      6: styles.level6,
    },
  },
})

export type BreadcrumbVariants = VariantProps<typeof breadcrumb>
export type BreadcrumbKind = NonNullable<BreadcrumbVariants['kind']>
type StairLevel = NonNullable<VariantProps<typeof breadcrumbStairRow>['level']>

/** One ancestor level. */
export interface BreadcrumbCrumb {
  /** The level's name, authored in sentence case; the CSS sets the caps [D165]. */
  label: React.ReactNode
  /** The level's page. Omitted, the level has no page and shows as plain muted text. */
  href?: string
}

/** Props for Breadcrumb: `nav` props, the levels, the kind and the color axes. */
export interface BreadcrumbProps
  extends Omit<React.ComponentPropsWithRef<'nav'>, 'children'>,
    BreadcrumbVariants {
  /** The ancestors, root first. The current page is `current`, never an item. */
  items: readonly BreadcrumbCrumb[]
  /** The current page's title: last, unlinked, `aria-current="page"`. */
  current: React.ReactNode
  /**
   * `inline` (default): the in-page breadcrumb, a module that reflows on its
   * own width (parent link only, then one line). `staircase`: the section-bar
   * breadcrumb, the LTA staircase below `--md-n-above` and one line from it,
   * the current crumb at `--font-weight-7` acting as the title [D184].
   * `parent`: always the single "‹ Parent" link.
   */
  kind?: BreadcrumbVariants['kind']
  /**
   * `kind="staircase"` only: render the staircase's own Collapsible (toggle,
   * truncated title and rows) below `--md-n-above`. Pass `false` when a host
   * reveals the staircase itself, as the §11.7 SectionBar does across its
   * whole bar; the breadcrumb then renders only its one line. Default `true`.
   */
  withStaircase?: boolean
  /**
   * Primary Radix scale: every part's ink and the focus ring. Never
   * defaulted; omitted, it inherits the scope [D133].
   */
  primary?: BreadcrumbVariants['primary']
  /** Secondary Radix scale, accepted for the shared contract; the breadcrumb carries no accent. */
  secondary?: BreadcrumbVariants['secondary']
  /** An optional solid domain glyph at `--size-px-3`, drawn before the root in `--primary12`. */
  domainGlyph?: React.ReactNode
  /**
   * Builds each anchor, e.g. `(href) => <NextLink href={href} />`. Default: a
   * plain `<a href>`.
   */
  renderLink?: (href: string) => React.ReactElement
  /**
   * Builds the one line's ancestor links in place of `renderLink`; the "…"
   * menu's items, the staircase rows and the parent link keep `renderLink`.
   * The §11.7 SectionBar passes a Toolbar link here, so its crumbs join the
   * toolbar's arrow-key roving.
   */
  renderCrumb?: (href: string) => React.ReactElement
  /** Accessible name and tooltip of the "…" overflow button. Default "More levels". */
  overflowLabel?: string
  /** Accessible name of the staircase toggle. Default "Page path". */
  toggleLabel?: string
  /**
   * Prints the path as one plain line of caps, ancestors joined by " / ",
   * current page omitted, no URLs (§7.8) [D80, D105]. Pass `false` when the
   * page masthead prints the path instead. Default `true`.
   */
  printLine?: boolean
}

function anchor(href: string, renderLink?: (href: string) => React.ReactElement) {
  return renderLink ? renderLink(href) : <a href={href} />
}

/** The level count at which each tier collapses the middle, root and last ancestors kept (§9.8). */
function collapse(count: number, maxLevels: number) {
  const keep = maxLevels - 2
  if (count + 1 <= maxLevels) {
    return { shown: (_index: number) => true, hidden: [] as number[] }
  }
  const hidden: number[] = []
  for (let index = 1; index < count - keep; index += 1) hidden.push(index)
  return { shown: (index: number) => index === 0 || index >= count - keep, hidden }
}

/** The chevron separator: Material Symbols `chevron_right`, inline tier, hidden from assistive technology. */
function CrumbSeparator() {
  return <Icon name="chevron_right" className={styles.separator} />
}

function Crumb({
  crumb,
  renderLink,
}: {
  crumb: BreadcrumbCrumb
  renderLink?: (href: string) => React.ReactElement
}) {
  if (crumb.href == null) return <span className={styles.plain}>{crumb.label}</span>
  return (
    <Link
      kind="nav"
      muted
      href={crumb.href}
      render={renderLink?.(crumb.href)}
      className={styles.link}
    >
      {crumb.label}
    </Link>
  )
}

/** The "…" crumb: an icon-only `sm` Button opening a Menu of the hidden ancestors. */
function Overflow({
  tier,
  crumbs,
  label,
  renderLink,
}: {
  tier: string
  crumbs: readonly BreadcrumbCrumb[]
  label: string
  renderLink?: (href: string) => React.ReactElement
}) {
  return (
    <li className={cx(styles.item, tier)}>
      <Menu>
        <Tooltip>
          <TooltipTrigger
            render={
              <MenuTrigger variant="text" size="sm" iconOnly icon="more_horiz">
                {label}
              </MenuTrigger>
            }
          />
          <TooltipPopup>{label}</TooltipPopup>
        </Tooltip>
        <MenuPopup>
          {crumbs.map((crumb, index) =>
            crumb.href == null ? (
              <MenuItem key={index} disabled>
                {crumb.label}
              </MenuItem>
            ) : (
              <MenuItem key={index} render={anchor(crumb.href, renderLink)}>
                {crumb.label}
              </MenuItem>
            )
          )}
        </MenuPopup>
      </Menu>
      <CrumbSeparator />
    </li>
  )
}

/** The one-line form, with the tier classes the module's media and container rules read. */
function CrumbList({
  items,
  current,
  domainGlyph,
  renderLink,
  renderCrumb,
  overflowLabel,
}: {
  items: readonly BreadcrumbCrumb[]
  current: React.ReactNode
  domainGlyph?: React.ReactNode
  renderLink?: (href: string) => React.ReactElement
  renderCrumb?: (href: string) => React.ReactElement
  overflowLabel: string
}) {
  const md = collapse(items.length, 4)
  const lg = collapse(items.length, 6)
  const rows: React.ReactNode[] = []

  items.forEach((crumb, index) => {
    rows.push(
      <li
        key={`crumb-${index}`}
        className={cx(styles.item, md.shown(index) && styles.inMd, lg.shown(index) && styles.inLg)}
      >
        {index === 0 && domainGlyph != null ? (
          <span className={styles.domainGlyph} aria-hidden="true">
            {domainGlyph}
          </span>
        ) : null}
        <Crumb crumb={crumb} renderLink={renderCrumb ?? renderLink} />
        <CrumbSeparator />
      </li>
    )
    if (index === 0 && md.hidden.length > 0) {
      rows.push(
        <Overflow
          key="overflow-md"
          tier={styles.inMd}
          crumbs={md.hidden.map((hidden) => items[hidden])}
          label={overflowLabel}
          renderLink={renderLink}
        />
      )
    }
    if (index === 0 && lg.hidden.length > 0) {
      rows.push(
        <Overflow
          key="overflow-lg"
          tier={styles.inLg}
          crumbs={lg.hidden.map((hidden) => items[hidden])}
          label={overflowLabel}
          renderLink={renderLink}
        />
      )
    }
  })

  rows.push(
    <li key="current" className={cx(styles.item, styles.inMd, styles.inLg)}>
      <span className={styles.current} aria-current="page">
        {current}
      </span>
    </li>
  )

  return <ol className={styles.list}>{rows}</ol>
}

/** "‹ Parent": a `text` Button rendered as an anchor, in `type-label` caps [D165]. */
function ParentLink({
  items,
  renderLink,
}: {
  items: readonly BreadcrumbCrumb[]
  renderLink?: (href: string) => React.ReactElement
}) {
  const parent = [...items].reverse().find((crumb) => crumb.href != null)
  if (parent?.href == null) return null
  return (
    <div className={styles.parentRow}>
      <Button
        variant="text"
        icon="chevron_left"
        nativeButton={false}
        render={anchor(parent.href, renderLink)}
        className={styles.parentLink}
      >
        <span className={styles.parentText}>{parent.label}</span>
      </Button>
    </div>
  )
}

/** The LTA staircase: the toggle and truncated title, then one indented row per level. */
function Staircase({
  items,
  current,
  renderLink,
  toggleLabel,
}: {
  items: readonly BreadcrumbCrumb[]
  current: React.ReactNode
  renderLink?: (href: string) => React.ReactElement
  toggleLabel: string
}) {
  const level = (index: number) => Math.min(index + 1, 6) as StairLevel
  const chevron = (
    <span className={styles.stairChevron}>
      <Icon name="chevron_right" />
    </span>
  )

  return (
    <BaseCollapsible.Root className={styles.stair}>
      <div className={styles.stairBar}>
        <BaseCollapsible.Trigger
          className={cx(styles.stairToggle, disclosureGlyphHost)}
          aria-label={toggleLabel}
        >
          <span className={styles.stairGlyph}>
            <DisclosureGlyph size="chrome" />
          </span>
        </BaseCollapsible.Trigger>
        <span className={styles.stairTitle}>{current}</span>
      </div>
      <BaseCollapsible.Panel className={styles.staircase}>
        <ol className={styles.stairList}>
          {items.map((crumb, index) => (
            <li key={index} className={breadcrumbStairRow({ level: level(index) })}>
              {index > 0 ? chevron : null}
              <Crumb crumb={crumb} renderLink={renderLink} />
            </li>
          ))}
          <li className={breadcrumbStairRow({ level: level(items.length) })}>
            {items.length > 0 ? chevron : null}
            <span className={styles.current} aria-current="page">
              {current}
            </span>
          </li>
        </ol>
      </BaseCollapsible.Panel>
    </BaseCollapsible.Root>
  )
}

/**
 * A `nav` named "Breadcrumb" holding the ancestors in order, then the
 * current page, unlinked and marked `aria-current="page"`. Crumbs are
 * `type-label` caps; ancestors are `--role-muted` at `--font-weight-4`, the
 * current page `--primary12` at `--font-weight-6`, and › chevrons separate
 * them. Crumbs never wrap: the middle collapses into a "…" menu instead.
 * Use it on pages two or more levels deep, never as a history trail.
 */
export function Breadcrumb(props: BreadcrumbProps) {
  const {
    items,
    current,
    kind,
    primary,
    secondary,
    domainGlyph,
    renderLink,
    renderCrumb,
    overflowLabel = 'More levels',
    toggleLabel = 'Page path',
    printLine = true,
    withStaircase = true,
    className,
    ...rest
  } = props

  const scope = useScopeAttributes()
  const resolvedKind: BreadcrumbKind = kind ?? 'inline'

  return (
    <nav
      aria-label="Breadcrumb"
      {...rest}
      {...scope}
      className={breadcrumb({ kind, primary, secondary, className })}
    >
      {resolvedKind !== 'staircase' ? (
        <ParentLink items={items} renderLink={renderLink} />
      ) : withStaircase ? (
        <Staircase
          items={items}
          current={current}
          renderLink={renderLink}
          toggleLabel={toggleLabel}
        />
      ) : null}
      {resolvedKind === 'parent' ? null : (
        <CrumbList
          items={items}
          current={current}
          domainGlyph={domainGlyph}
          renderLink={renderLink}
          renderCrumb={renderCrumb}
          overflowLabel={overflowLabel}
        />
      )}
      {printLine && items.length > 0 ? (
        <p className={styles.printLine}>
          {items.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 ? ' / ' : null}
              {crumb.label}
            </React.Fragment>
          ))}
        </p>
      ) : null}
    </nav>
  )
}
