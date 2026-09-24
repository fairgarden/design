'use client'

import * as React from 'react'
import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible'
import { Popover as BasePopover } from '@base-ui/react/popover'
import { Toolbar as BaseToolbar } from '@base-ui/react/toolbar'
import { cva, type VariantProps } from 'class-variance-authority'

import { Badge } from '../../feedback/badge'
import { Breadcrumb, breadcrumbStairRow, type BreadcrumbCrumb } from '../../navigation/breadcrumb'
import { DisclosureGlyph } from '../../disclosure/collapsible'
import { Ground } from '../../foundations/ground'
import { Icon, iconHost } from '../../foundations/icon'
import { Link } from '../../actions/link'
import { assignRef } from '../../utils/assignRef'
import { cx } from '../../utils/className'
import {
  OVERLAY_COLLISION_PADDING,
  OVERLAY_SIDE_OFFSET,
  OverlayScope,
  overlayAttributes,
  overlayScaleClassName,
} from '../../utils/overlay'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import {
  isPageGroundPreset,
  isPastelPreset,
  useScope,
  type PageGroundPreset,
} from '../../utils/scope'
import styles from './section-bar.module.css'

/*
 * Sticky Section Bar (§11.7) [D183, D184]: position and in-page jumps on
 * deep content; the page's one sticky bar, swapped with the header, never
 * stacked with it.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: section-bar.module.css; CVA function `sectionBar`.
 * - Axes: `kind` → section | guide | tabs → section, guide, tabs [D155]
 *   (`tabs` with more than 6 sections renders as `section`); `capped` →
 *   `capped` (the top rule); `docked` → `docked` (the swap position, an
 *   element Base UI does not manage); `primary`, `secondary` → the scales
 *   module classes, which the bar's Ground scope writes. `search`,
 *   `listen`, `share`, `tools` and `toTop` are content, not axes.
 * - Compound variants: none.
 * - Defaults: kind section, capped false, docked false; color axes: none.
 * - Color fallback: inherits the covered band's page ground through its
 *   Ground. On a pastel the `topRule` takes the scales module's
 *   `secondaryGreen`, the brand green.
 * - States: Collapsible `data-panel-open` on `glyph` → the disclosure glyph
 *   turns inward in --primary12; :hover on `glyph` → the glyph at the next
 *   tier's weight. :hover on `jumpTrigger` → the label takes
 *   --role-link-hover, the chevron the next tier's weight, the indicator
 *   keeps --border-size-2; `data-popup-open` → chevron up, indicator at
 *   --border-size-2-25 [D181]. The inline crumbs are the §9.8 Breadcrumb's, which
 *   owns their states. :hover on a Jump item → --role-link-hover;
 *   on a `tab` → the bare-text underline; on `listen` → the body-link hover
 *   (the Link's own). `aria-current="location"` on `jumpItem` → the
 *   --border-size-2-25 start bar; on `tab` → the --border-size-2-25 current bar plus
 *   --font-weight-7 [D15, D184]. Panels and the popup: the clip reveal on
 *   data-starting-style / data-ending-style. `docked` → the docked position,
 *   a --fgd-duration-quick cut. :focus-visible → the ring.
 * - Parts: base (the scoped `nav`: a toolbar role cannot sit on the
 *   landmark, and the sticky box is the band), topRule, toolbar (the Base UI
 *   Toolbar Root, data-orientation="horizontal"), lead, glyph (Collapsible
 *   Trigger), title, breadcrumb (the §9.8 Breadcrumb, kind="staircase"
 *   without its own Collapsible: its one line from --md-n-above, the
 *   current crumb at --font-weight-7 [D184]; its links are Toolbar links),
 *   jumpTrigger (Popover Trigger),
 *   jumpIndicator, tools, share, search, listen, listenCount, tabList, tab,
 *   toTop, bottomRule (the band's end border), breadcrumbPanel (Collapsible
 *   Panel), jumpPanel (Popover Popup), jumpList, jumpItem.
 * - Scope: the root is a `kind="band"` Ground on the covered band's page
 *   ground. `jumpPanel` is a portaled `white` scope (`page` scheme) framed
 *   by --border-size-2 --primary12 [D92, D156].
 * - Container: none; page frame on viewport media [D163].
 */
export const sectionBar = cva(styles.base, {
  variants: {
    kind: {
      section: styles.section,
      guide: styles.guide,
      tabs: styles.tabs,
    },
    capped: {
      true: styles.capped,
    },
    docked: {
      true: styles.docked,
    },
    // Color axes: never defaulted [D133]. The bar's Ground writes the classes.
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'section',
    capped: false,
    docked: false,
  },
})

type SectionBarVariants = VariantProps<typeof sectionBar>

/** The three §11.7 builds. */
export type SectionBarKind = NonNullable<SectionBarVariants['kind']>

/** One in-page section: the target's `id` and the label the Jump list, title and tabs show. */
export interface SectionBarSection {
  /** The section's element `id`; its first heading takes focus when the section is followed. */
  id: string
  /** The label, authored in sentence case. */
  label: React.ReactNode
}

/** The guide bar's `listen` jump [D184]: a standalone link with an opaque count badge. */
export interface SectionBarListen {
  /** The recordings' anchor, e.g. "#recordings"; following it moves focus to that heading. */
  href: string
  /** Default "Listen". */
  label?: React.ReactNode
  /** The number of recordings, shown in a count Badge. */
  count?: number
}

type SectionBarCommonProps = Omit<React.ComponentPropsWithRef<'nav'>, 'children'> & {
  /** The optional top rule: `--border-size-2` in the brand green, decorative like the strip. Default `false`. */
  capped?: boolean
  /**
   * The docked position: sticky at the top edge on `--layer-2`. The page
   * shell sets it from `onDockChange` and swaps it with the header on
   * upward scroll; the two never stack [D89, D183]. Default `false`.
   */
  docked?: boolean
  /** Primary Radix scale for the bar's scope. Never defaulted [D133]. */
  primary?: SectionBarVariants['primary']
  /** Secondary Radix scale: the Jump indicator, tab hover and link hover. Never defaulted. */
  secondary?: SectionBarVariants['secondary']
  /** The page ground of the band the bar covers. Default: the enclosing page ground, else `paper`. */
  preset?: PageGroundPreset
  /** The landmark's name. Default "In this section". */
  label?: string
  /** The ancestors, root first: the inline breadcrumb from `--md-n-above`, the staircase below it. */
  items?: readonly BreadcrumbCrumb[]
  /** The current page: the last crumb, at `--font-weight-7`, acting as the title [D184]. */
  current: React.ReactNode
  /** The page's sections, in order: the Jump list, the base title and the tab strip. */
  sections?: readonly SectionBarSection[]
  /** The section in view, controlled. Omitted, the bar follows scroll (scrollspy). */
  activeSection?: string
  /** Called when the section in view changes. */
  onActiveSectionChange?: (id: string) => void
  /**
   * Called when the sentinel at the bar's in-flow position leaves (`true`)
   * or re-enters (`false`) the viewport top [D183]. Pass it to wire `docked`.
   */
  onDockChange?: (docked: boolean) => void
  /** The Jump trigger's word. Default "Jump to". */
  jumpLabel?: string
  /** The staircase toggle's accessible name. Default "Page path". */
  toggleLabel?: string
  /** End tools, such as the §9.4 audio Toggle at `--size-px-7`. Below 360 px they move into the staircase panel. */
  tools?: React.ReactNode
  /** Share links (inline-tier icon links), from `--xl-n-above` [D184]. */
  share?: React.ReactNode
  /** Builds each crumb anchor, e.g. `(href) => <NextLink href={href} />`. */
  renderLink?: (href: string) => React.ReactElement
}

type SectionBarKindProps =
  | {
      /**
       * `section` (default): glyph, caps title and Jump to at base; from
       * `--md-n-above` the inline breadcrumb and the live Jump label.
       * `guide`: an optional start `search`, the centred breadcrumb, and
       * Jump to with an optional `listen` jump at the end. `tabs`: from
       * `--lg-n-above`, with 6 or fewer sections, the tab strip replaces
       * Jump to.
       */
      kind?: 'section'
      search?: never
      listen?: never
      toTop?: never
    }
  | {
      kind: 'guide'
      /** A §9.10 Autocomplete (Search) at `--fgd-size-control-md`, capped at `--size-px-13`, from `--md-n-above`. */
      search?: React.ReactNode
      /** The end `listen` jump [D184]. */
      listen?: SectionBarListen
      toTop?: never
    }
  | {
      kind: 'tabs'
      /**
       * The `toTop` cell's target: the skip link's target, e.g. "#main". It
       * moves focus there. Omitted, no cell.
       */
      toTop?: string
      search?: never
      listen?: never
    }

/** Props for SectionBar: `nav` props, the kind with its parts, the path, the sections and the color axes. */
export type SectionBarProps = SectionBarCommonProps & SectionBarKindProps

type SectionBarAllProps = SectionBarCommonProps & {
  kind?: SectionBarKind
  search?: React.ReactNode
  listen?: SectionBarListen
  toTop?: string
}

/**
 * The element a followed link should focus: the section's first heading
 * (or the target itself when `heading` is false), made programmatically
 * focusable if it is not already.
 */
function focusTargetFor(href: string, heading = true): HTMLElement | null {
  if (typeof document === 'undefined' || !href.startsWith('#')) return null
  const id = decodeURIComponent(href.slice(1))
  const target = id === '' ? null : document.getElementById(id)
  if (target == null) return null
  const element =
    heading && !/^H[1-6]$/.test(target.tagName)
      ? (target.querySelector<HTMLElement>('h1, h2, h3, h4, h5, h6') ?? target)
      : target
  if (!element.hasAttribute('tabindex') && !element.matches('a[href], button, input, select, textarea')) {
    element.setAttribute('tabindex', '-1')
  }
  return element
}

/** Scrollspy: the last section whose top has passed the bar's bottom edge. */
function useSectionInView(
  sections: readonly SectionBarSection[],
  barRef: React.RefObject<HTMLElement | null>,
  enabled: boolean
): string | undefined {
  const ids = sections.map((section) => section.id).join('\n')
  const [active, setActive] = React.useState<string | undefined>(sections[0]?.id)

  React.useEffect(() => {
    const list = ids.split('\n').filter(Boolean)
    if (!enabled || list.length === 0) return undefined
    let frame = 0
    const update = () => {
      frame = 0
      const bar = barRef.current
      const line = Math.max(bar ? bar.getBoundingClientRect().bottom : 0, 0) + 1
      let current = list[0]
      for (const id of list) {
        const element = document.getElementById(id)
        if (element != null && element.getBoundingClientRect().top <= line) current = id
      }
      // Scrolled to the end: the last section is in view even when its top
      // cannot reach the bar (a short closing section).
      const root = document.documentElement
      if (window.scrollY > 0 && window.innerHeight + window.scrollY >= root.scrollHeight - 1) {
        current = list[list.length - 1]
      }
      setActive(current)
    }
    const schedule = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame !== 0) window.cancelAnimationFrame(frame)
    }
  }, [ids, enabled, barRef])

  return active
}

/**
 * The page's sticky section bar: a Base UI Toolbar in a `nav` named "In
 * this section", on the covered band's page ground, with a
 * `--border-size-1` `--role-rule` bottom rule and no shadow; one line, at
 * least `--fgd-size-hit` tall.
 *
 * - Base: the disclosure glyph opens the staircase breadcrumb (capped at
 *   half the viewport), the caps title follows the section in view, and
 *   "Jump to" opens the list of sections.
 * - From `--md-n-above`: the inline breadcrumb (root → current, the current
 *   crumb at `--font-weight-7`) replaces glyph and title, and the Jump label
 *   carries the section in view, announced politely once per change.
 * - The Jump panel is a Popover of links in a `nav` "On this page",
 *   `--size-px-14` wide: Tab moves through the links, Escape closes it, and
 *   following a link closes it and moves focus to the section's heading.
 * - `kind="tabs"`: from `--lg-n-above`, with 6 or fewer sections, equal
 *   cells of at least `--size-px-12` replace Jump to, with scrollspy
 *   (`aria-current="location"`) and an optional `toTop` cell at the start.
 * - `kind="guide"`: an optional start `search`, the centred breadcrumb, and
 *   Jump to with an optional `listen` jump at the end.
 *
 * Docking: pass `onDockChange` and feed `docked`; bring the header back in
 * its place on upward scroll. Hidden in print; the path prints in the
 * masthead.
 */
export function SectionBar(props: SectionBarProps) {
  const {
    kind,
    capped,
    docked,
    primary,
    secondary,
    preset: presetProp,
    label = 'In this section',
    items = [],
    current,
    sections = [],
    activeSection,
    onActiveSectionChange,
    onDockChange,
    jumpLabel = 'Jump to',
    toggleLabel = 'Page path',
    tools,
    share,
    search,
    listen,
    toTop,
    renderLink,
    className,
    ref,
    ...rest
  } = props as SectionBarAllProps

  const scope = useScope()
  const preset: PageGroundPreset =
    presetProp ?? (isPageGroundPreset(scope.ground) ? scope.ground : 'paper')
  const tabsFit = kind === 'tabs' && sections.length > 0 && sections.length <= 6
  const resolvedKind: SectionBarKind = kind === 'tabs' && !tabsFit ? 'section' : (kind ?? 'section')

  const barRef = React.useRef<HTMLElement | null>(null)
  const sentinelRef = React.useRef<HTMLSpanElement | null>(null)
  const pendingFocus = React.useRef<HTMLElement | null>(null)
  const [jumpOpen, setJumpOpen] = React.useState(false)

  const inView = useSectionInView(sections, barRef, activeSection === undefined)
  const activeId = activeSection ?? inView
  const activeLabel = sections.find((section) => section.id === activeId)?.label

  const setBarRef = React.useCallback(
    (node: HTMLElement | null) => {
      barRef.current = node
      assignRef(ref, node)
    },
    [ref]
  )

  // Report scrollspy changes.
  const onActiveRef = React.useRef(onActiveSectionChange)
  React.useEffect(() => {
    onActiveRef.current = onActiveSectionChange
  }, [onActiveSectionChange])
  React.useEffect(() => {
    if (inView !== undefined && activeSection === undefined) onActiveRef.current?.(inView)
  }, [inView, activeSection])

  // Dock when the sentinel at the bar's in-flow position leaves the viewport top [D183].
  const onDockRef = React.useRef(onDockChange)
  React.useEffect(() => {
    onDockRef.current = onDockChange
  }, [onDockChange])
  const observeDock = onDockChange != null
  React.useEffect(() => {
    const sentinel = sentinelRef.current
    if (!observeDock || sentinel == null || typeof IntersectionObserver === 'undefined') {
      return undefined
    }
    const observer = new IntersectionObserver(([entry]) => {
      onDockRef.current?.(!entry.isIntersecting && entry.boundingClientRect.top < 0)
    })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [observeDock])

  /** A followed section link moves focus to the section's heading. */
  const followSection = (href: string) => {
    focusTargetFor(href)?.focus({ preventScroll: true })
  }

  const hasStair = items.length > 0
  const pastel = isPastelPreset(preset)
  // The guide bar ends on Jump to and the tools, so its breadcrumb centres on the bar.
  const guide = resolvedKind === 'guide'

  // The §9.8 Breadcrumb's one line (from --md-n-above); the bar reveals the
  // staircase in its own Collapsible below. Its links join the toolbar.
  const crumbs = (
    <Breadcrumb
      kind="staircase"
      withStaircase={false}
      printLine={false}
      items={items}
      current={current}
      renderLink={renderLink}
      renderCrumb={(href) => <BaseToolbar.Link render={renderLink?.(href)} />}
      className={styles.breadcrumb}
    />
  )

  const jump =
    sections.length > 0 ? (
      <BasePopover.Root open={jumpOpen} onOpenChange={setJumpOpen}>
        <BasePopover.Trigger
          render={<BaseToolbar.Button />}
          className={cx(styles.jumpTrigger, iconHost)}
        >
          <span className={styles.jumpLabel}>
            <span className={styles.jumpStatic}>{jumpLabel}</span>
            <span className={styles.jumpLive}>
              <span className={styles.visuallyHidden}>{jumpLabel}: </span>
              {activeLabel ?? jumpLabel}
            </span>
          </span>
          <Icon name="expand_more" weight="interactive" className={styles.chevron} />
          <span className={styles.jumpIndicator} aria-hidden="true" />
        </BasePopover.Trigger>
        <BasePopover.Portal>
          <BasePopover.Positioner
            className={styles.jumpPositioner}
            side="bottom"
            align="end"
            sideOffset={OVERLAY_SIDE_OFFSET}
            collisionPadding={OVERLAY_COLLISION_PADDING}
          >
            <BasePopover.Popup
              {...overlayAttributes}
              className={cx(styles.jumpPanel, overlayScaleClassName)}
              finalFocus={() => {
                const element = pendingFocus.current
                pendingFocus.current = null
                return element ?? true
              }}
            >
              <OverlayScope>
                <nav aria-label="On this page">
                  <ol className={styles.jumpList}>
                    {sections.map((section) => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          className={styles.jumpItem}
                          aria-current={section.id === activeId ? 'location' : undefined}
                          onClick={() => {
                            pendingFocus.current = focusTargetFor(`#${section.id}`)
                            setJumpOpen(false)
                          }}
                        >
                          {section.label}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </OverlayScope>
            </BasePopover.Popup>
          </BasePopover.Positioner>
        </BasePopover.Portal>
      </BasePopover.Root>
    ) : null

  const tabList =
    resolvedKind === 'tabs' ? (
      <ul className={styles.tabList}>
        {toTop != null ? (
          <li className={styles.toTopItem}>
            <BaseToolbar.Link
              href={toTop}
              aria-label="Back to top"
              className={cx(styles.toTop, iconHost)}
              onClick={() => focusTargetFor(toTop, false)?.focus({ preventScroll: true })}
            >
              <Icon name="arrow_upward" weight="interactive" />
            </BaseToolbar.Link>
          </li>
        ) : null}
        {sections.map((section) => (
          <li key={section.id} className={styles.tabItem}>
            <BaseToolbar.Link
              href={`#${section.id}`}
              className={styles.tab}
              aria-current={section.id === activeId ? 'location' : undefined}
              onClick={() => followSection(`#${section.id}`)}
            >
              <span className={styles.tabLabel}>{section.label}</span>
            </BaseToolbar.Link>
          </li>
        ))}
      </ul>
    ) : null

  const listenLink =
    guide && listen != null ? (
      <BaseToolbar.Link
        href={listen.href}
        render={
          <Link
            kind="inline"
            href={listen.href}
            className={styles.listen}
            onClick={() => followSection(listen.href)}
          />
        }
      >
        {listen.label ?? 'Listen'}
        {listen.count != null ? (
          <Badge numeric className={styles.listenCount}>
            {listen.count}
          </Badge>
        ) : null}
      </BaseToolbar.Link>
    ) : null

  const toolbar = (
    <BaseToolbar.Root className={styles.toolbar}>
      <div className={styles.lead}>
        {hasStair ? (
          <BaseCollapsible.Trigger
            render={<BaseToolbar.Button />}
            className={styles.glyph}
            aria-label={toggleLabel}
          >
            <DisclosureGlyph size="chrome" />
          </BaseCollapsible.Trigger>
        ) : null}
        <span className={styles.title}>{activeLabel ?? current}</span>
      </div>
      {guide && search != null ? (
        <div className={styles.search}>{search}</div>
      ) : null}
      {crumbs}
      {tabList}
      {guide ? null : jump}
      {(guide && jump != null) || listenLink != null || tools != null || share != null ? (
        <div className={styles.end}>
          {guide ? jump : null}
          {listenLink}
          {tools != null ? (
            <div className={cx(styles.tools, hasStair && styles.toolsMovable)}>{tools}</div>
          ) : null}
          {share != null ? <div className={styles.share}>{share}</div> : null}
        </div>
      ) : null}
    </BaseToolbar.Root>
  )

  return (
    <>
      {observeDock ? (
        <span ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
      ) : null}
      <Ground
        kind="band"
        preset={preset}
        primary={primary ?? undefined}
        secondary={secondary ?? undefined}
        render={<nav aria-label={label} />}
        ref={setBarRef}
        {...rest}
        className={cx(
          sectionBar({ kind: resolvedKind, capped, docked }),
          className
        )}
      >
        {capped ? (
          <span
            className={cx(styles.topRule, pastel && secondaryScaleVariants.green)}
            aria-hidden="true"
          />
        ) : null}
        <BaseCollapsible.Root className={styles.stack}>
          {toolbar}
          {hasStair ? (
            <BaseCollapsible.Panel className={styles.breadcrumbPanel}>
              <ol className={styles.stairList}>
                {items.map((crumb, index) => (
                  <li
                    key={index}
                    className={breadcrumbStairRow({
                      level: Math.min(index + 1, 6) as 1 | 2 | 3 | 4 | 5 | 6,
                    })}
                  >
                    {index > 0 ? (
                      <span className={styles.stairChevron}>
                        <Icon name="chevron_right" />
                      </span>
                    ) : null}
                    {crumb.href != null ? (
                      <Link
                        kind="nav"
                        href={crumb.href}
                        render={renderLink?.(crumb.href)}
                        className={styles.stairLink}
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className={styles.stairPlain}>{crumb.label}</span>
                    )}
                  </li>
                ))}
                <li
                  className={breadcrumbStairRow({
                    level: Math.min(items.length + 1, 6) as 1 | 2 | 3 | 4 | 5 | 6,
                  })}
                >
                  <span className={styles.stairChevron}>
                    <Icon name="chevron_right" />
                  </span>
                  <span className={styles.stairCurrent} aria-current="page">
                    {current}
                  </span>
                </li>
              </ol>
              {tools != null ? <div className={styles.panelTools}>{tools}</div> : null}
            </BaseCollapsible.Panel>
          ) : null}
        </BaseCollapsible.Root>
        <span className={styles.visuallyHidden} aria-live="polite" aria-atomic="true">
          {activeLabel}
        </span>
      </Ground>
    </>
  )
}
