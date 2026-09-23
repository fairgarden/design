'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { Ground } from '../Ground'
import {
  NavigationMenuFrameContext,
  isCurrentPath,
  type NavigationMenuFrame,
} from '../NavigationMenu'
import { cx } from '../../utils/className'
import {
  primaryScaleVariants,
  secondaryScaleVariants,
  type PrimaryScale,
  type RadixScale,
} from '../../utils/scales'
import { isBandPreset, useScope, type BandPreset } from '../../utils/scope'
import styles from './navigation-bar.module.css'

/*
 * Navigation Bar (§11.5) [D182, D183], with the brand strip and utility bar
 * (§11.3): the site header on every page.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: navigation-bar.module.css; CVA function `navigationBar`.
 * - Axes: `masthead` → `masthead` (wordmark row over a caps nav row,
 *   --border-size-2 top rule); `ruled` → `ruled` (vertical --border-size-1
 *   rules between items); `compact` → `compact` (the docked header: brand
 *   drawing and utility row dropped; triggers, search and action kept, at
 *   the same height) [D183]; `primary`, `secondary` → scales module
 *   classes, applied through the header's Ground.
 * - Compound variants: none.
 * - Defaults: masthead false, ruled false, compact false; color axes none.
 * - Color fallback: inherits the scope; the action is the §9.2 `solid`
 *   Button on the scope's action scale; the strip passes secondary green.
 * - States: item states are the Navigation Menu's (§9.6); `data-docked`
 *   (written by the sticky observer) → the frame fixed at the top edge on
 *   --layer-2, swapped in by a --ds-duration-quick clip cut; utility links
 *   `:hover` → the bare-text underline [D181], `aria-current="page"` → the
 *   --ds-stroke-3 bar; `:focus-visible` → the ring.
 * - Parts: base, frame, skipLink, strip, utility (utilityInner, slot,
 *   utilityNav, utilityList, utilityLink, utilityLabel, locale), bar,
 *   inner, logo, logoMark, brandDrawing, nav, tools, iconButtons, action,
 *   menuSlot. Items, triggers, panels and dropdowns are the Navigation
 *   Menu's; the menu trigger is the drawer's (§11.6).
 * - Scope: the root is a `kind="band"` Ground (a page ground, or `night`
 *   only over the night media hero) [D178]. Panels are portaled `white`
 *   scopes (§9.6).
 * - Container: none; page frame on the viewport custom media
 *   --ds-nav-inline-n-above [D183].
 */
export const navigationBar = cva(styles.base, {
  variants: {
    masthead: {
      true: styles.masthead,
    },
    ruled: {
      true: styles.ruled,
    },
    compact: {
      true: styles.compact,
    },
    // Color axes: never defaulted [D133]; the header's Ground applies them.
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    masthead: false,
    ruled: false,
    compact: false,
  },
})

type NavigationBarVariants = VariantProps<typeof navigationBar>

/** What the header shares with its drawer (§11.6) and utility bar. */
export interface NavigationBarContextValue {
  /** The header's preset; the drawer sheet re-declares it [D97]. */
  preset: BandPreset
  primary?: PrimaryScale
  secondary?: RadixScale
  /** The logo, repeated in the drawer's bar. */
  logo?: React.ReactNode
  logoHref: string
  logoLabel?: string
  /** The current page's URL path. */
  currentPath?: string
}

/** Provided by NavigationBar; read by NavDrawer and the utility links. */
export const NavigationBarContext = React.createContext<NavigationBarContextValue | null>(null)
NavigationBarContext.displayName = 'NavigationBarContext'

/**
 * How the header docks [D183]:
 * - `none` (default): static; it scrolls away with the page [D174].
 * - `pinned`: a page without a section bar; the header docks after 50vh of
 *   scroll and then stays in both directions, until its own place scrolls
 *   back into view.
 * - `swap`: a page with a sticky section bar; once the bar's in-flow
 *   sentinel (`sentinelRef`) has left the viewport top, any upward scroll
 *   brings the header back in place of the bar and downward scroll restores
 *   the bar. Hide the section bar while `onDockChange` reports `true`.
 */
export type NavigationBarDock = 'none' | 'pinned' | 'swap'

/** Props for NavigationBar. */
export type NavigationBarProps = Omit<React.ComponentProps<'header'>, 'children'> & {
  /**
   * The header preset: a page ground (`paper`, `white` or the page's
   * pastel), or `night` only directly over the night media hero. Omitted,
   * the header takes the page ground it sits in.
   */
  preset?: BandPreset
  /** Override the preset's primary (a pairing §2 verifies). Never defaulted [D133]. */
  primary?: NavigationBarVariants['primary']
  /** Override the preset's secondary. Never defaulted. */
  secondary?: NavigationBarVariants['secondary']
  /** The logo: an ink logo in `currentColor` (an `svg` or `img`), 28 px tall, 36 px from --lg-n-above. */
  logo: React.ReactNode
  /** The home link's accessible name, e.g. "FairGarden home". */
  logoLabel: string
  /** The home link. Default "/". */
  logoHref?: string
  /** An optional fine-line brand drawing (--ds-stroke-0-75) beside the logo; dropped when compact. */
  brandDrawing?: React.ReactNode
  /** A `NavigationBarUtility` row above the bar, from --ds-nav-inline-n-above; never docks. */
  utility?: React.ReactNode
  /** The `NavigationMenu`, inline from --ds-nav-inline-n-above. */
  children?: React.ReactNode
  /** Icon Buttons, e.g. `<Search kind="trigger" … />`, `--size-px-1` apart. */
  search?: React.ReactNode
  /** The one primary action: a `solid` Button at `size="sm"`. Below 480 px it moves to the drawer footer, so repeat it there. */
  action?: React.ReactNode
  /** The `NavDrawer` (menu Button and sheet), shown below --ds-nav-inline-n-above. */
  drawer?: React.ReactNode
  /** The current page's URL path, shared with the menu, drawer and utility links. */
  currentPath?: string
  /** The skip link's target. Default "#main". */
  skipHref?: string
  /** The skip link's words. Default "Skip to main content". */
  skipLabel?: string
  /** `true`: the stacked masthead. Default `false`. */
  masthead?: NavigationBarVariants['masthead']
  /** `true`: vertical --border-size-1 rules between items. Default `false`. */
  ruled?: NavigationBarVariants['ruled']
  /** `true`: the compact header, even undocked. The sticky observer sets it while docked. Default `false`. */
  compact?: NavigationBarVariants['compact']
  /** How the header docks. Default `none`. */
  dock?: NavigationBarDock
  /** With `dock="swap"`: a zero-height element at the section bar's in-flow position. */
  sentinelRef?: React.RefObject<Element | null>
  /** Called when the header docks (`true`) or returns to its place (`false`). */
  onDockChange?: (docked: boolean) => void
}

/**
 * The site header: a skip link first, the green brand strip, an optional
 * utility row, then the bar holding the logo (a home link), the Navigation
 * Menu (from --ds-nav-inline-n-above), icon Buttons, the one action and,
 * below the threshold, the drawer's menu Button. It is opaque, ruled at the
 * bottom in --role-rule, 56 px tall (64 px from --lg-n-above), and its
 * items never wrap: overflow goes to the utility row, then a "More" item
 * [D183]. It prints as the §7.8 masthead's logo only.
 */
export function NavigationBar(props: NavigationBarProps) {
  const {
    preset: presetProp,
    primary,
    secondary,
    logo,
    logoLabel,
    logoHref = '/',
    brandDrawing,
    utility,
    children,
    search,
    action,
    drawer,
    currentPath,
    skipHref = '#main',
    skipLabel = 'Skip to main content',
    masthead,
    ruled,
    compact,
    dock = 'none',
    sentinelRef,
    onDockChange,
    className,
    style,
    ref,
    ...rest
  } = props

  const scope = useScope()
  const preset: BandPreset = presetProp ?? (isBandPreset(scope.ground) ? scope.ground : 'paper')

  const rootRef = React.useRef<HTMLElement | null>(null)
  const frameRef = React.useRef<HTMLDivElement | null>(null)
  const barRef = React.useRef<HTMLDivElement | null>(null)
  const innerRef = React.useRef<HTMLDivElement | null>(null)
  const [docked, setDocked] = React.useState(false)
  const [flowSize, setFlowSize] = React.useState<number | null>(null)

  // The in-flow height, held by the root while the frame is docked, so the page never jumps.
  React.useEffect(() => {
    const frame = frameRef.current
    if (!frame || docked || dock === 'none') return undefined
    const measure = () => setFlowSize(frame.getBoundingClientRect().height)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(frame)
    return () => observer.disconnect()
  }, [docked, dock])

  // Pinned: dock after 50vh of scroll, stay until the header's place is back in view [D183].
  React.useEffect(() => {
    if (dock !== 'pinned') return undefined
    const update = () => {
      const root = rootRef.current
      if (!root) return
      const top = root.getBoundingClientRect().top
      setDocked((was) =>
        was ? top < 0 : top < 0 && window.scrollY >= window.innerHeight / 2
      )
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [dock])

  // Swap: past the section bar's sentinel, upward scroll docks the header, downward restores the bar [D89, D183].
  React.useEffect(() => {
    if (dock !== 'swap') return undefined
    const sentinel = sentinelRef?.current
    if (!sentinel) return undefined
    let past = false
    let lastY = window.scrollY
    const observer = new IntersectionObserver(([entry]) => {
      past = !entry.isIntersecting && entry.boundingClientRect.top < 0
      if (!past) setDocked(false)
    })
    observer.observe(sentinel)
    const onScroll = () => {
      const y = window.scrollY
      const delta = y - lastY
      lastY = y
      if (past && delta !== 0) setDocked(delta < 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [dock, sentinelRef])

  React.useEffect(() => {
    if (dock === 'none') setDocked(false)
  }, [dock])

  const onDockChangeRef = React.useRef(onDockChange)
  onDockChangeRef.current = onDockChange
  const reported = React.useRef(false)
  React.useEffect(() => {
    if (reported.current === docked) return
    reported.current = docked
    onDockChangeRef.current?.(docked)
  }, [docked])

  const frame = React.useMemo<NavigationMenuFrame>(
    () => ({ anchorRef: barRef, boundaryRef: innerRef, currentPath }),
    [currentPath]
  )

  const barContext = React.useMemo<NavigationBarContextValue>(
    () => ({
      preset,
      primary: primary ?? undefined,
      secondary: secondary ?? undefined,
      logo,
      logoHref,
      logoLabel,
      currentPath,
    }),
    [preset, primary, secondary, logo, logoHref, logoLabel, currentPath]
  )

  const setRootRef = React.useCallback(
    (node: HTMLElement | null) => {
      rootRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref]
  )

  const rootStyle =
    docked && flowSize != null
      ? ({ ...style, '--navigation-bar-flow-size': `${flowSize}px` } as React.CSSProperties)
      : style

  return (
    <NavigationBarContext.Provider value={barContext}>
      <NavigationMenuFrameContext.Provider value={frame}>
        <Ground
          {...rest}
          kind="band"
          preset={preset}
          primary={primary ?? undefined}
          secondary={secondary ?? undefined}
          render={<header />}
          ref={setRootRef}
          style={rootStyle}
          data-docked={docked ? '' : undefined}
          className={navigationBar({ masthead, ruled, compact: compact || docked, className })}
        >
          <div ref={frameRef} className={styles.frame}>
            <a className={styles.skipLink} href={skipHref}>
              {skipLabel}
            </a>
            <div className={cx(styles.strip, secondaryScaleVariants.green)} aria-hidden="true" />
            {utility}
            <div ref={barRef} className={styles.bar}>
              <div ref={innerRef} className={styles.inner}>
                <a className={styles.logo} href={logoHref} aria-label={logoLabel}>
                  <span className={styles.logoMark}>{logo}</span>
                  {brandDrawing != null ? (
                    <span className={styles.brandDrawing} aria-hidden="true">
                      {brandDrawing}
                    </span>
                  ) : null}
                </a>
                {children != null ? <div className={styles.nav}>{children}</div> : null}
                <div className={styles.tools}>
                  {search != null ? <div className={styles.iconButtons}>{search}</div> : null}
                  {action != null ? <div className={styles.action}>{action}</div> : null}
                  {drawer != null ? <div className={styles.menuSlot}>{drawer}</div> : null}
                </div>
              </div>
            </div>
          </div>
        </Ground>
      </NavigationMenuFrameContext.Provider>
    </NavigationBarContext.Provider>
  )
}

/* ── Utility bar (§11.3) ─────────────────────────────────────────────────── */

/** Props for NavigationBarUtility: `nav` props, the start slot and the locale link. */
export type NavigationBarUtilityProps = Omit<React.ComponentProps<'nav'>, 'children'> & {
  /** An optional start slot: a phone number or tagline, in --primary12. */
  start?: React.ReactNode
  /** An optional locale link at the end ("English ▾ Change language"); a control never sits here. */
  locale?: React.ReactNode
  /** The landmark's name. Default "Utility". */
  label?: string
  /** The row's `NavigationBarUtilityLink`s: text links only. */
  children?: React.ReactNode
}

/**
 * The 36 px utility row above the bar (§11.3): secondary destinations as
 * text links in a `nav` labelled "Utility", divided from the bar by a
 * --role-hairline rule, aligned to --ds-container-content. Shown from
 * --ds-nav-inline-n-above (below it, repeat its links in the drawer
 * footer); the compact docked header drops it [D183]. Put it in the bar's
 * `utility` slot.
 */
export function NavigationBarUtility(props: NavigationBarUtilityProps) {
  const { start, locale, label = 'Utility', className, children, ...rest } = props
  return (
    <div className={cx(styles.utility, className)}>
      <div className={styles.utilityInner}>
        {start != null ? <div className={styles.slot}>{start}</div> : null}
        <nav {...rest} aria-label={label} className={styles.utilityNav}>
          <ul className={styles.utilityList}>
            {React.Children.map(children, (child) =>
              child == null || child === false ? null : <li className={styles.utilityItem}>{child}</li>
            )}
          </ul>
        </nav>
        {locale != null ? <div className={styles.locale}>{locale}</div> : null}
      </div>
    </div>
  )
}

/** Props for NavigationBarUtilityLink: anchor props. */
export type NavigationBarUtilityLinkProps = React.ComponentProps<'a'>

/**
 * A utility link: `type-label` caps, no rest underline, the bare-text
 * underline on hover [D181], a 24 px target at a 24 px pitch (the §1.5.12
 * utility exemption). The current page (its path equals the bar's
 * `currentPath`) takes `aria-current="page"` and the --ds-stroke-3 bar.
 */
export function NavigationBarUtilityLink(props: NavigationBarUtilityLinkProps) {
  const { href, className, children, ...rest } = props
  const bar = React.useContext(NavigationBarContext)
  const current = isCurrentPath(href, bar?.currentPath)
  return (
    <a
      {...(current ? { 'aria-current': 'page' as const } : {})}
      {...rest}
      href={href}
      className={cx(styles.utilityLink, className)}
    >
      <span className={styles.utilityLabel}>{children}</span>
    </a>
  )
}
