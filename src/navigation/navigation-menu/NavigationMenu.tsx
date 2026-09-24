'use client'

import * as React from 'react'
import { NavigationMenu as BaseNavigationMenu } from '@base-ui/react/navigation-menu'
import { cva, type VariantProps } from 'class-variance-authority'

import { Card, CardBody, CardMedia, CardTitle, CardTitleLink } from '../../content/card'
import { Icon } from '../../foundations/icon'
import { link } from '../../actions/link'
import { ScrollArea } from '../../data/scroll-area'
import { Separator } from '../../foundations/separator'
import { assignRef } from '../../utils/assignRef'
import { cx, resolveClassName } from '../../utils/className'
import { OverlayScope, overlayAttributes, overlayScaleClassName } from '../../utils/overlay'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import {
  holdsCurrent,
  isCurrentPath,
  isInSection,
  listItems,
  sitemapPanel,
  type SitemapLink,
  type SitemapSection,
} from '../../utils/navigation'
import { useScopeAttributes } from '../../utils/scope'
import { NAV_DELAY_MS } from '../../utils/tokens'
import styles from './navigation-menu.module.css'

export { NAV_DELAY_MS }

/*
 * Navigation Menu (§9.6) [D182]: site wayfinding in the bar, from
 * --fgd-nav-inline-n-above [D183]. Below it the Navigation Bar shows the
 * drawer (§11.6) instead.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: navigation-menu.module.css; CVA functions `navigationMenu`
 *   (the bar root) and `navigationMenuContent` (a panel).
 * - Axes: root `primary`, `secondary` → scales module classes;
 *   `navigationMenuContent`: `kind` → dropdown | overview | index.
 * - Compound variants: none.
 * - Defaults: none on the root; content `kind: dropdown`; color axes none.
 * - Color fallback: the bar's parts inherit the scope; the panels take the
 *   `white` preset's defaults (olive × green) and never the bar's scales.
 * - Delays [D182]: NAV_DELAY_MS (utils/tokens.ts) mirrors
 *   --fgd-delay-nav-open (150 ms) and --fgd-delay-nav-close (300 ms) into
 *   Root `delay` and `closeDelay`; hover opens and closes only for a mouse
 *   (a fine, hovering pointer); click, Enter, Space and ArrowDown open on
 *   every input. Base UI drops the open delay to 0 ms between adjacent
 *   triggers once a panel is mounted, and its safe-polygon path keeps a
 *   diagonal move into a panel from switching panels.
 * - States: trigger `data-popup-open` → the --border-size-2-25 open bar flush
 *   with the bar's rule, chevron flipped; `data-active` on a link → current
 *   (bar: the --border-size-2-25 bar plus --font-weight-7; panel: weight plus a
 *   --border-size-2-25 underline); `aria-current="true"` on a bar trigger or
 *   link whose section is a path prefix of the page → parent of current
 *   (the --border-size-2 bar); `:hover` (not disabled) [D181] → bar items
 *   the bare-text underline, panel links --role-link-hover only, overview
 *   link, group headings and featured bar the chevron-link hover; `:active`
 *   → bar items a --border-size-2-25 --primary12 underline (derived; flagged),
 *   panel links a --border-size-2 --primary12 underline; `:focus-visible`
 *   → the ring on the hit area; popup `data-starting-style` → the
 *   first-open clip reveal only; switching and closing are instant, with no
 *   --popup-width or --popup-height transition.
 * - Parts: base, list, item, trigger, hit, label, chevron, barLink, link
 *   (with Link's `nav` + `list` classes), positioner, popup, viewport (in a
 *   Scroll Area capped by `maxBlockSize`), content; overview adds
 *   featured, description, tierRule, search, groups, group, heading,
 *   promo; index adds categoryList, categoryTrigger, linkPane, featuredBar.
 * - Scope: the popup renders through its Base UI Portal and declares the
 *   `white` overlay scope (`page` scheme), edged in --primary12 at
 *   --border-size-2 [D148, D156].
 * - Container: none; page frame, driven by the viewport custom media.
 */
export const navigationMenu = cva(styles.base, {
  variants: {
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
})

/** Panel classes: `kind` → dropdown (default) | overview | index [D182]. */
export const navigationMenuContent = cva(styles.content, {
  variants: {
    kind: {
      dropdown: styles.dropdown,
      overview: styles.overview,
      index: styles.index,
    },
  },
  defaultVariants: {
    kind: 'dropdown',
  },
})

type NavigationMenuVariants = VariantProps<typeof navigationMenu>

/** The panel kinds of `navigationMenuContent` [D182]. */
export type NavigationMenuContentKind = NonNullable<
  VariantProps<typeof navigationMenuContent>['kind']
>

/* ── Current by URL path [D182]: shared with the drawer (utils/navigation) ── */

export { toPath, isCurrentPath, isInSection } from '../../utils/navigation'

/* ── Frame and internal contexts ─────────────────────────────────────────── */

/**
 * What a host frame (the Navigation Bar) tells its menu: the bar whose
 * bottom rule the panels attach under, the content container an `index` or
 * `dropdown` panel end-aligns inside, and the current page's path.
 */
export interface NavigationMenuFrame {
  /** The bar element; panels attach at 0 offset under its bottom rule. Default: the menu's `nav`. */
  anchorRef?: React.RefObject<HTMLElement | null>
  /** The content container (--fgd-container-content). Default: the anchor. */
  boundaryRef?: React.RefObject<HTMLElement | null>
  /** The current page's URL path, for current and parent-of-current. */
  currentPath?: string
}

/** Provided by the Navigation Bar (§11.5); a menu outside a bar uses its own `nav`. */
export const NavigationMenuFrameContext = React.createContext<NavigationMenuFrame>({})
NavigationMenuFrameContext.displayName = 'NavigationMenuFrameContext'

interface ItemRecord {
  kind?: NavigationMenuContentKind
  trigger?: HTMLElement | null
}

interface RootContextValue {
  currentPath?: string
  registry: React.RefObject<Map<unknown, ItemRecord>>
  pointerType: React.RefObject<string>
}

const RootContext = React.createContext<RootContextValue | null>(null)
const ItemContext = React.createContext<{ value: unknown } | null>(null)
/** Where a link sits: in the bar, or in a panel (and which list). */
const PlacementContext = React.createContext<'bar' | 'panel'>('bar')

const useIsoLayoutEffect = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect

function record(registry: React.RefObject<Map<unknown, ItemRecord>>, value: unknown): ItemRecord {
  const map = registry.current
  let entry = map.get(value)
  if (!entry) {
    entry = {}
    map.set(value, entry)
  }
  return entry
}


type ChangeDetails = BaseNavigationMenu.Root.ChangeEventDetails
type PositionerProps = BaseNavigationMenu.Positioner.Props
type OffsetFunction = Extract<NonNullable<PositionerProps['alignOffset']>, (...args: never[]) => unknown>
type AnchorProp = PositionerProps['anchor']

const TEXT_ENTRY = 'input, textarea, select, [role="combobox"], [contenteditable="true"]'
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'

/** A field inside the panel has focus: pointer leave must not close it [D182]. */
function fieldHasFocus(container: HTMLElement | null): boolean {
  if (!container) return false
  const active = container.ownerDocument.activeElement
  return active != null && container.contains(active) && active.matches(TEXT_ENTRY)
}

/** Opened from the keyboard: ArrowDown, or Enter / Space (a click with no pointer detail). */
function isKeyboardOpen(details: ChangeDetails): boolean {
  if (details.reason === 'list-navigation') return true
  if (details.reason !== 'trigger-press') return false
  const event = details.event
  if (event.type === 'keydown') return true
  return 'detail' in event && event.detail === 0
}

/* ── Root ────────────────────────────────────────────────────────────────── */

/** Props for NavigationMenu: Base UI Root props (without the delays), the color axes and the page path. */
export type NavigationMenuProps = Omit<
  BaseNavigationMenu.Root.Props<string>,
  'delay' | 'closeDelay' | 'orientation' | 'children'
> & {
  /**
   * Primary Radix scale for the bar's parts: labels, bars and focus ring.
   * Never defaulted; omitted, it inherits the scope [D133]. The panels keep
   * the `white` preset's scales.
   */
  primary?: NavigationMenuVariants['primary']
  /**
   * Secondary Radix scale for the bar's parts: the chevrons and the hover
   * underline (`--role-glyph`, `--role-accent`). Never defaulted.
   */
  secondary?: NavigationMenuVariants['secondary']
  /**
   * The current page's URL path. A link whose path equals it is current
   * (`aria-current="page"`); a bar item whose section is a path prefix of it
   * is the parent of current (`aria-current="true"`). Inside a Navigation
   * Bar it defaults to the bar's `currentPath`.
   */
  currentPath?: string
  /** The landmark's name. Default "Main". */
  label?: string
  /** `NavigationMenuItem`s, in bar order. */
  children?: React.ReactNode
}

/**
 * The desktop site navigation [D182]: a `nav` labelled "Main" holding the
 * bar's items. Triggers are buttons that open their panel on click, Enter,
 * Space or ArrowDown, and on hover intent under a mouse
 * (--fgd-delay-nav-open, closing --fgd-delay-nav-close after the pointer
 * leaves); focus alone never opens one. Opening from the keyboard moves
 * focus to the panel's first link; Escape closes and returns focus to the
 * trigger. Panels attach at 0 offset under the bar's bottom rule, switch
 * instantly and scroll in a Scroll Area when taller than the viewport.
 */
export function NavigationMenu(props: NavigationMenuProps) {
  const {
    primary,
    secondary,
    currentPath: currentPathProp,
    label = 'Main',
    value: valueProp,
    defaultValue,
    onValueChange,
    onPointerOver,
    onPointerDown,
    className,
    children,
    ref,
    ...rest
  } = props

  const frame = React.useContext(NavigationMenuFrameContext)
  const currentPath = currentPathProp ?? frame.currentPath
  const scope = useScopeAttributes()

  const registry = React.useRef(new Map<unknown, ItemRecord>())
  const pointerType = React.useRef('mouse')
  const rootRef = React.useRef<HTMLElement | null>(null)
  const popupRef = React.useRef<HTMLElement | null>(null)
  const focusOnOpen = React.useRef(false)

  const controlled = valueProp !== undefined
  const [innerValue, setInnerValue] = React.useState<string | null>(defaultValue ?? null)
  const value = controlled ? (valueProp ?? null) : innerValue

  const handleValueChange = (next: string | null, details: ChangeDetails) => {
    // Hover intent is for a mouse only; touch and pen open by tap [D182].
    if (details.reason === 'trigger-hover' && pointerType.current !== 'mouse') {
      details.cancel()
      return
    }
    // A panel whose field has focus stays open on pointer leave, and while a
    // press lands in that field's own suggestion list [D182].
    if (next == null && fieldHasFocus(popupRef.current)) {
      const target = details.event.target
      const inList =
        details.reason === 'outside-press' &&
        target instanceof Element &&
        target.closest('[role="listbox"]') != null
      if (details.reason === 'trigger-hover' || inList) {
        details.cancel()
        return
      }
    }
    if (next != null && isKeyboardOpen(details)) focusOnOpen.current = true
    onValueChange?.(next, details)
    if (details.isCanceled) return
    if (!controlled) setInnerValue(next)
  }

  // A route change closes the panel.
  const lastPath = React.useRef(currentPath)
  React.useEffect(() => {
    if (lastPath.current === currentPath) return
    lastPath.current = currentPath
    if (!controlled) setInnerValue(null)
  }, [currentPath, controlled])

  // Opening from the keyboard moves focus to the panel's first link [D182].
  React.useEffect(() => {
    if (value == null || !focusOnOpen.current) return undefined
    focusOnOpen.current = false
    let frameId = 0
    let tries = 0
    const focusFirst = () => {
      const panel = popupRef.current?.querySelector('[data-navigation-menu-content][data-open]')
      const target = panel?.querySelector<HTMLElement>(FOCUSABLE)
      if (target) target.focus()
      else if (tries++ < 10) frameId = requestAnimationFrame(focusFirst)
    }
    frameId = requestAnimationFrame(focusFirst)
    return () => cancelAnimationFrame(frameId)
  }, [value])

  const kind: NavigationMenuContentKind =
    value == null ? 'dropdown' : (registry.current.get(value)?.kind ?? 'dropdown')

  // The virtual anchor: the bar's box vertically (so the panel meets its
  // bottom rule), full width for `overview`, the trigger's span otherwise.
  const anchor = React.useMemo<AnchorProp>(() => {
    if (value == null) return undefined
    const bar = () => frame.anchorRef?.current ?? rootRef.current
    return {
      getBoundingClientRect() {
        const barRect = bar()?.getBoundingClientRect() ?? new DOMRect()
        if (kind === 'overview') {
          return new DOMRect(0, barRect.top, document.documentElement.clientWidth, barRect.height)
        }
        const trigger = registry.current.get(value)?.trigger?.getBoundingClientRect()
        return trigger ? new DOMRect(trigger.left, barRect.top, trigger.width, barRect.height) : barRect
      },
      contextElement: bar() ?? undefined,
    }
  }, [value, kind, frame.anchorRef])

  // `index` and `dropdown` end-align to the content container rather than overflow it.
  const alignOffset = React.useCallback<OffsetFunction>(
    (data) => {
      if (kind === 'overview' || value == null) return 0
      const boundary = (
        frame.boundaryRef?.current ??
        frame.anchorRef?.current ??
        rootRef.current
      )?.getBoundingClientRect()
      const trigger = registry.current.get(value)?.trigger?.getBoundingClientRect()
      if (!boundary || !trigger || !rootRef.current) return 0
      const rtl = getComputedStyle(rootRef.current).direction === 'rtl'
      const overflow = rtl
        ? boundary.left - (trigger.right - data.positioner.width)
        : trigger.left + data.positioner.width - boundary.right
      return overflow > 0 ? -overflow : 0
    },
    [kind, value, frame.boundaryRef, frame.anchorRef]
  )

  const trackPointer = (event: React.PointerEvent<HTMLElement>) => {
    pointerType.current = event.pointerType
  }

  const context = React.useMemo<RootContextValue>(
    () => ({ currentPath, registry, pointerType }),
    [currentPath]
  )

  const setRootRef = React.useCallback(
    (node: HTMLElement | null) => {
      rootRef.current = node
      assignRef(ref, node)
    },
    [ref]
  )

  return (
    <RootContext.Provider value={context}>
      <BaseNavigationMenu.Root
        {...rest}
        {...scope}
        ref={setRootRef}
        aria-label={label}
        data-navigation-menu=""
        value={value}
        onValueChange={handleValueChange}
        delay={NAV_DELAY_MS.open}
        closeDelay={NAV_DELAY_MS.close}
        onPointerOver={(event) => {
          trackPointer(event)
          onPointerOver?.(event)
        }}
        onPointerDown={(event) => {
          trackPointer(event)
          onPointerDown?.(event)
        }}
        className={resolveClassName(className, (extra) =>
          navigationMenu({ primary, secondary, className: extra })
        )}
      >
        <BaseNavigationMenu.List className={styles.list}>{children}</BaseNavigationMenu.List>
        <BaseNavigationMenu.Portal>
          <BaseNavigationMenu.Positioner
            className={styles.positioner}
            anchor={anchor}
            positionMethod="fixed"
            side="bottom"
            align="start"
            sideOffset={0}
            alignOffset={alignOffset}
            collisionPadding={0}
            collisionAvoidance={{ side: 'none', align: 'none' }}
          >
            <BaseNavigationMenu.Popup
              ref={popupRef}
              render={<div />}
              {...overlayAttributes}
              className={cx(
                styles.popup,
                kind === 'overview' ? styles.popupOverview : styles.popupAttached,
                overlayScaleClassName
              )}
            >
              <OverlayScope>
                {/* A panel taller than the space below the bar scrolls; the cap is that space. */}
                <ScrollArea maxBlockSize="calc(var(--available-height, 100dvh) - var(--border-size-2))">
                  <BaseNavigationMenu.Viewport className={styles.viewport} />
                </ScrollArea>
              </OverlayScope>
            </BaseNavigationMenu.Popup>
          </BaseNavigationMenu.Positioner>
        </BaseNavigationMenu.Portal>
      </BaseNavigationMenu.Root>
    </RootContext.Provider>
  )
}

function useRoot(): RootContextValue {
  const context = React.useContext(RootContext)
  if (!context) throw new Error('Navigation Menu parts must be placed inside <NavigationMenu>.')
  return context
}

/* ── Item, Trigger, Link ─────────────────────────────────────────────────── */

/** Props for NavigationMenuItem: Base UI Item props. */
export type NavigationMenuItemProps = BaseNavigationMenu.Item.Props

/**
 * One bar item: a `NavigationMenuTrigger` with its `NavigationMenuContent`,
 * or a plain `NavigationMenuLink`. `value` identifies it when the menu is
 * controlled; omitted, one is generated.
 */
export function NavigationMenuItem(props: NavigationMenuItemProps) {
  const { value: valueProp, className, ...rest } = props
  const generated = React.useId()
  const value: unknown = valueProp ?? generated
  const item = React.useMemo(() => ({ value }), [value])
  return (
    <ItemContext.Provider value={item}>
      <BaseNavigationMenu.Item
        {...rest}
        value={value}
        className={resolveClassName(className, (extra) => cx(styles.item, extra))}
      />
    </ItemContext.Provider>
  )
}

/** Props for NavigationMenuTrigger: Base UI Trigger props plus the section path. */
export type NavigationMenuTriggerProps = BaseNavigationMenu.Trigger.Props & {
  /**
   * The path of the section this trigger opens (`/what-we-do`). While the
   * page lies in it, the trigger is the parent of current
   * (`aria-current="true"`, the --border-size-2 bar) [D182].
   */
  section?: string
}

/**
 * A bar trigger: a button with a caps label (`type-label`, [D165]) and the
 * `expand_more` chevron in `--role-glyph`, which flips while open. It opens
 * its panel on click, Enter, Space, ArrowDown or mouse hover intent, never
 * on focus alone; the section's landing page is the panel's first link.
 */
export function NavigationMenuTrigger(props: NavigationMenuTriggerProps) {
  const { section, className, children, ref, ...rest } = props
  const root = useRoot()
  const item = React.useContext(ItemContext)
  const parent = isInSection(section, root.currentPath)

  const setRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      if (item) record(root.registry, item.value).trigger = node
      assignRef(ref, node)
    },
    [item, root.registry, ref]
  )

  return (
    <BaseNavigationMenu.Trigger
      {...rest}
      {...(parent ? { 'aria-current': 'true' as const } : {})}
      ref={setRef}
      className={resolveClassName(className, (extra) => cx(styles.trigger, extra))}
    >
      <span className={styles.hit}>
        <span className={styles.label}>{children}</span>
        <BaseNavigationMenu.Icon className={styles.chevron}>
          <Icon name="expand_more" weight="interactive" />
        </BaseNavigationMenu.Icon>
      </span>
    </BaseNavigationMenu.Trigger>
  )
}

/** Props for NavigationMenuLink: Base UI Link props. */
export type NavigationMenuLinkProps = BaseNavigationMenu.Link.Props

/** A panel row's Link classes: the list link's color-only hover, press and current [D181]. */
const panelLink = link({ kind: 'nav', list: true })

/**
 * A link. In the bar it is a caps item with no rest underline; in a panel
 * it is a `type-body-ui` row at a `--fgd-size-hit` pitch in Link's list-link
 * build (`kind="nav"` with `list`), whose hover is `--role-link-hover` only
 * (§9.3) [D181]. `active` defaults to "its path is the current page"
 * (`aria-current="page"`); a bar link whose path is a prefix of the page is
 * the parent of current. Panel links close the panel on click.
 */
export function NavigationMenuLink(props: NavigationMenuLinkProps) {
  const { active: activeProp, closeOnClick = true, href, className, children, ...rest } = props
  const root = useRoot()
  const placement = React.useContext(PlacementContext)
  const active = activeProp ?? isCurrentPath(href, root.currentPath)

  if (placement === 'bar') {
    const parent = !active && isInSection(href, root.currentPath)
    return (
      <BaseNavigationMenu.Link
        {...rest}
        {...(parent ? { 'aria-current': 'true' as const } : {})}
        href={href}
        active={active}
        closeOnClick={closeOnClick}
        className={resolveClassName(className, (extra) => cx(styles.barLink, extra))}
      >
        <span className={styles.hit}>
          <span className={styles.label}>{children}</span>
        </span>
      </BaseNavigationMenu.Link>
    )
  }

  return (
    <BaseNavigationMenu.Link
      {...rest}
      href={href}
      active={active}
      closeOnClick={closeOnClick}
      className={resolveClassName(className, (extra) => cx(panelLink, styles.link, extra))}
    >
      {children}
    </BaseNavigationMenu.Link>
  )
}

/* ── Content ─────────────────────────────────────────────────────────────── */

type ContentBaseProps = Omit<BaseNavigationMenu.Content.Props, 'children'> & {
  children?: React.ReactNode
}

/**
 * Props for NavigationMenuContent: Base UI Content props and the panel
 * `kind`, with each kind's slots. A discriminated union on `kind`.
 */
export type NavigationMenuContentProps = ContentBaseProps &
  (
    | {
        /** `dropdown` (default): a simple list panel of 3–8 `NavigationMenuLink`s. */
        kind?: 'dropdown'
        featured?: never
        search?: never
        promo?: never
        featuredBar?: never
      }
    | {
        /**
         * `overview`: the section's overview link and description, a
         * hairline tier rule, an optional search, caps link groups (the
         * children: `NavigationMenuGroup`s) 2-up in columns 1–8 beside the
         * promo, or up to 4-up across 12 without one.
         */
        kind: 'overview'
        /** The overview link, a `NavigationMenuFeatured`: the section's landing page, the panel's first link. */
        featured?: React.ReactNode
        /** One §9.10 Search field under the overview row; the panel stays open while it has focus. */
        search?: React.ReactNode
        /** At most one `NavigationMenuPromo` card, in columns 9–12. */
        promo?: React.ReactNode
        featuredBar?: never
      }
    | {
        /**
         * `index`: a category list (the children:
         * `NavigationMenuCategory`s) beside the selected category's link
         * pane, with a featured bar across both.
         */
        kind: 'index'
        /** One `NavigationMenuFeaturedBar` across both panes, at the foot. */
        featuredBar?: React.ReactNode
        featured?: never
        search?: never
        promo?: never
      }
  )

/**
 * A panel. It renders in the menu's portaled `white` overlay scope,
 * attached under the bar's bottom rule: `overview` full-bleed with its
 * content on the 12-column grid of `--fgd-container-content`; `index` and
 * `dropdown` at the trigger's start edge, end-aligned to the content
 * container, with square top and `--radius-2-25` bottom corners.
 */
export function NavigationMenuContent(props: NavigationMenuContentProps) {
  const {
    kind: kindProp,
    featured,
    search,
    promo,
    featuredBar,
    className,
    children,
    ...rest
  } = props
  const kind: NavigationMenuContentKind = kindProp ?? 'dropdown'
  const root = useRoot()
  const item = React.useContext(ItemContext)

  useIsoLayoutEffect(() => {
    if (item) record(root.registry, item.value).kind = kind
  }, [item, kind, root.registry])

  let body: React.ReactNode
  if (kind === 'overview') {
    body = (
      <div className={cx(styles.overviewInner, promo != null && styles.withPromo)}>
        <div className={styles.overviewMain}>
          {featured}
          {featured != null ? <Separator variant="hairline" className={styles.tierRule} /> : null}
          {search != null ? <div className={styles.search}>{search}</div> : null}
          <div className={styles.groups}>{children}</div>
        </div>
        {promo != null ? <div className={styles.promoCell}>{promo}</div> : null}
      </div>
    )
  } else if (kind === 'index') {
    body = <IndexPanel featuredBar={featuredBar}>{children}</IndexPanel>
  } else {
    body = <ul className={styles.dropdownList}>{listItems(children, styles.listItem)}</ul>
  }

  return (
    <BaseNavigationMenu.Content
      {...rest}
      data-navigation-menu-content=""
      className={resolveClassName(className, (extra) =>
        navigationMenuContent({ kind, className: extra })
      )}
    >
      <OverlayScope>
        <PlacementContext.Provider value="panel">{body}</PlacementContext.Provider>
      </OverlayScope>
    </BaseNavigationMenu.Content>
  )
}

/* ── Overview parts ──────────────────────────────────────────────────────── */

/** Props for NavigationMenuFeatured: Base UI Link props plus the one-line description. */
export type NavigationMenuFeaturedProps = BaseNavigationMenu.Link.Props & {
  /** One line of `type-body-ui` in `--role-muted` under the link. */
  description?: React.ReactNode
}

/**
 * The overview link (`featured`): the trigger's own section landing page, a
 * `type-itemhead` serif link in `--role-heading` with a trailing › in
 * `--role-accent`, then its description. Put it in `featured`.
 */
export function NavigationMenuFeatured(props: NavigationMenuFeaturedProps) {
  const {
    description,
    active: activeProp,
    closeOnClick = true,
    href,
    className,
    children,
    ...rest
  } = props
  const root = useRoot()
  const active = activeProp ?? isCurrentPath(href, root.currentPath)
  return (
    <div className={styles.featuredBlock}>
      <BaseNavigationMenu.Link
        {...rest}
        href={href}
        active={active}
        closeOnClick={closeOnClick}
        className={resolveClassName(className, (extra) => cx(styles.featured, extra))}
      >
        <span className={styles.featuredLabel}>{children}</span>
        <Icon name="chevron_right" size="tag" weight="interactive" className={styles.featuredGlyph} />
      </BaseNavigationMenu.Link>
      {description != null ? <p className={styles.description}>{description}</p> : null}
    </div>
  )
}

/** Props for NavigationMenuGroup: `div` props, the heading and its optional link. */
export type NavigationMenuGroupProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** The group heading, set in `type-label` caps. */
  heading: React.ReactNode
  /** Makes the heading a link with a trailing ›, to the group's landing page. */
  href?: string
  /** The group's `NavigationMenuLink`s. */
  children?: React.ReactNode
}

/**
 * A caps link group in an `overview` panel: a heading (a link with › when
 * `href` is given) over its links at a `--fgd-size-hit` pitch.
 */
export function NavigationMenuGroup(props: NavigationMenuGroupProps) {
  const { heading, href, className, children, ...rest } = props
  const root = useRoot()
  const id = React.useId()
  return (
    <div {...rest} className={cx(styles.group, className)}>
      {href != null ? (
        <BaseNavigationMenu.Link
          id={id}
          href={href}
          active={isCurrentPath(href, root.currentPath)}
          closeOnClick
          className={styles.heading}
        >
          <span className={styles.headingLabel}>{heading}</span>
          <Icon name="chevron_right" weight="interactive" className={styles.headingGlyph} />
        </BaseNavigationMenu.Link>
      ) : (
        <p id={id} className={styles.heading}>
          <span className={styles.headingLabel}>{heading}</span>
        </p>
      )}
      <ul className={styles.groupList} aria-labelledby={id}>
        {listItems(children, styles.listItem)}
      </ul>
    </div>
  )
}

/** Props for NavigationMenuPromo. */
export type NavigationMenuPromoProps = {
  /** The destination: the card's one Tab stop, its stretched title link. */
  href: string
  /** The title, `type-itemhead`. */
  title: React.ReactNode
  /** A 16:9 image (an `img` with its `alt`). */
  image?: React.ReactNode
  /** A two-line `type-body-ui` blurb. */
  children?: React.ReactNode
  /** Class names for the card, added after its own. */
  className?: string
}

/**
 * The optional promo card of an `overview` panel (≤ 1 per panel): a §12.2
 * card with a 16:9 image, a stretched title link (one Tab stop) and a
 * blurb. Its hover is the title link's `--role-link-hover`; no shadow.
 */
export function NavigationMenuPromo(props: NavigationMenuPromoProps) {
  const { href, title, image, className, children } = props
  return (
    <Card render={<div />} className={cx(styles.promo, className)}>
      {image != null ? <CardMedia className={styles.promoMedia}>{image}</CardMedia> : null}
      <CardTitle render={<p />}>
        <CardTitleLink href={href}>{title}</CardTitleLink>
      </CardTitle>
      {children != null ? <CardBody>{children}</CardBody> : null}
    </Card>
  )
}

/* ── Index parts ─────────────────────────────────────────────────────────── */

/** Props for NavigationMenuCategory. */
export type NavigationMenuCategoryProps = {
  /** The category row's label. */
  label: React.ReactNode
  /** Identifies the category; omitted, the panel assigns one. */
  value?: string
  /** The category's `NavigationMenuLink`s, shown in the link pane. */
  children?: React.ReactNode
  /** Class names for the category row, added after its own. */
  className?: string
}

/**
 * One category of an `index` panel: a row in the category list (a trigger
 * of the nested vertical menu) and its links in the pane. The selected
 * category takes a `--border-size-2-25` start-edge bar and `--font-weight-7`.
 */
export function NavigationMenuCategory(props: NavigationMenuCategoryProps) {
  const { label, value, className, children } = props
  return (
    <BaseNavigationMenu.Item value={value} className={styles.categoryItem}>
      <BaseNavigationMenu.Trigger className={cx(styles.categoryTrigger, className)}>
        <span className={styles.categoryLabel}>{label}</span>
      </BaseNavigationMenu.Trigger>
      <BaseNavigationMenu.Content className={styles.linkPaneContent}>
        <ul className={styles.paneList}>{listItems(children, styles.listItem)}</ul>
      </BaseNavigationMenu.Content>
    </BaseNavigationMenu.Item>
  )
}

/** Props for NavigationMenuFeaturedBar: Base UI Link props. */
export type NavigationMenuFeaturedBarProps = BaseNavigationMenu.Link.Props

/**
 * The featured bar of an `index` panel: one `type-itemhead` link with a ›
 * in `--role-glyph`, across both panes above a `--role-hairline` rule. Put
 * it in `featuredBar`.
 */
export function NavigationMenuFeaturedBar(props: NavigationMenuFeaturedBarProps) {
  const { active: activeProp, closeOnClick = true, href, className, children, ...rest } = props
  const root = useRoot()
  const active = activeProp ?? isCurrentPath(href, root.currentPath)
  return (
    <BaseNavigationMenu.Link
      {...rest}
      href={href}
      active={active}
      closeOnClick={closeOnClick}
      className={resolveClassName(className, (extra) => cx(styles.featuredBar, extra))}
    >
      <span className={styles.featuredLabel}>{children}</span>
      <Icon name="chevron_right" size="tag" weight="interactive" className={styles.featuredBarGlyph} />
    </BaseNavigationMenu.Link>
  )
}

type CategoryElement = React.ReactElement<NavigationMenuCategoryProps>

function isCategory(node: React.ReactNode): node is CategoryElement {
  return React.isValidElement(node) && node.type === NavigationMenuCategory
}


/**
 * The `index` body: a nested vertical Navigation Menu Root (categories as
 * its triggers, the link pane as its viewport) and the featured bar. One
 * category is always selected: the one holding the current page, else the
 * first. Categories switch on click, Enter or mouse rest after
 * --fgd-delay-nav-open, instantly.
 */
function IndexPanel({
  featuredBar,
  children,
}: {
  featuredBar?: React.ReactNode
  children?: React.ReactNode
}) {
  const root = useRoot()
  const baseId = React.useId()

  const categories: React.ReactNode[] = []
  const values: string[] = []
  let initial: string | null = null
  for (const child of React.Children.toArray(children)) {
    if (!isCategory(child)) {
      categories.push(child)
      continue
    }
    const value = child.props.value ?? `${baseId}-${values.length}`
    values.push(value)
    if (initial === null && holdsCurrent(child.props.children, root.currentPath)) initial = value
    categories.push(React.cloneElement(child, { value }))
  }

  const [value, setValue] = React.useState<string | null>(initial ?? values[0] ?? null)

  const handleValueChange = (next: string | null, details: ChangeDetails) => {
    if (details.reason === 'trigger-hover' && root.pointerType.current !== 'mouse') {
      details.cancel()
      return
    }
    // Keep a category selected; a link press still closes the whole menu.
    if (next == null && details.reason !== 'link-press') {
      details.cancel()
      return
    }
    setValue(next)
  }

  return (
    <div className={styles.indexBody}>
      <BaseNavigationMenu.Root
        orientation="vertical"
        value={value}
        onValueChange={handleValueChange}
        delay={NAV_DELAY_MS.open}
        closeDelay={NAV_DELAY_MS.close}
        className={styles.indexRoot}
      >
        <BaseNavigationMenu.List className={styles.categoryList}>{categories}</BaseNavigationMenu.List>
        <BaseNavigationMenu.Viewport className={styles.linkPane} />
      </BaseNavigationMenu.Root>
      {featuredBar != null ? <div className={styles.featuredBarCell}>{featuredBar}</div> : null}
    </div>
  )
}

/* ── From the shared navigation data [D187] ──────────────────────────────── */

/** Props for NavigationMenuSections. */
export type NavigationMenuSectionsProps = {
  /**
   * The shared navigation data (utils/navigation): the top-level sections,
   * in bar order. The same object feeds the drawer and the footer sitemap.
   */
  sections: readonly SitemapSection[]
}

/** A data link's `current` forces current; otherwise the path decides. */
function dataActive(link: SitemapLink): true | undefined {
  return link.current ? true : undefined
}

function SectionPanel({ section }: { section: SitemapSection }) {
  const trigger = <NavigationMenuTrigger section={section.href}>{section.label}</NavigationMenuTrigger>
  const panel = sitemapPanel(section)

  if (panel === 'overview') {
    const { promo } = section
    return (
      <>
        {trigger}
        <NavigationMenuContent
          kind="overview"
          featured={
            section.href != null ? (
              <NavigationMenuFeatured href={section.href} description={section.description}>
                {section.label}
              </NavigationMenuFeatured>
            ) : undefined
          }
          promo={
            promo != null ? (
              <NavigationMenuPromo
                href={promo.href}
                title={promo.title}
                image={promo.image != null ? <img src={promo.image.src} alt={promo.image.alt} /> : undefined}
              >
                {promo.description}
              </NavigationMenuPromo>
            ) : undefined
          }
        >
          {section.links.map((group) => (
            <NavigationMenuGroup key={group.href + group.label} heading={group.label} href={group.href}>
              {(group.links ?? []).map((link) => (
                <NavigationMenuLink key={link.href + link.label} href={link.href} active={dataActive(link)}>
                  {link.label}
                </NavigationMenuLink>
              ))}
            </NavigationMenuGroup>
          ))}
        </NavigationMenuContent>
      </>
    )
  }

  if (panel === 'index') {
    const { featured } = section
    return (
      <>
        {trigger}
        <NavigationMenuContent
          kind="index"
          featuredBar={
            featured != null ? (
              <NavigationMenuFeaturedBar href={featured.href} active={dataActive(featured)}>
                {featured.label}
              </NavigationMenuFeaturedBar>
            ) : undefined
          }
        >
          {section.links.map((category) => (
            <NavigationMenuCategory key={category.href + category.label} label={category.label}>
              {/* The category's landing page opens its pane, then its own links. */}
              {[category, ...(category.links ?? [])].map((link) => (
                <NavigationMenuLink key={link.href + link.label} href={link.href} active={dataActive(link)}>
                  {link.label}
                </NavigationMenuLink>
              ))}
            </NavigationMenuCategory>
          ))}
        </NavigationMenuContent>
      </>
    )
  }

  // A dropdown opens on its landing page, then the section's links.
  return (
    <>
      {trigger}
      <NavigationMenuContent>
        {section.href != null ? (
          <NavigationMenuLink href={section.href}>{section.label}</NavigationMenuLink>
        ) : null}
        {section.links.map((link) => (
          <NavigationMenuLink key={link.href + link.label} href={link.href} active={dataActive(link)}>
            {link.label}
          </NavigationMenuLink>
        ))}
      </NavigationMenuContent>
    </>
  )
}

/**
 * The bar's items built from the shared navigation data [D187], the object
 * that also feeds `NavDrawer`'s `sections` and `Footer`'s `sitemap`. Each
 * section is a trigger (its `href` marks the parent of current) and the
 * panel `sitemapPanel` picks: `overview` (the overview link and
 * description, a caps group per link over its own `links`, the promo),
 * `index` (a category per link and the featured bar) or `dropdown` (the
 * landing page, then the links). A section without links is a plain bar
 * link. Put it inside `NavigationMenu`, alone or beside hand-built items.
 */
export function NavigationMenuSections(props: NavigationMenuSectionsProps) {
  const { sections } = props
  return (
    <>
      {sections.map((section) =>
        section.links.length === 0 && section.href == null ? null : (
          <NavigationMenuItem key={section.href ?? section.label}>
            {section.links.length === 0 && section.href != null ? (
              <NavigationMenuLink href={section.href}>{section.label}</NavigationMenuLink>
            ) : (
              <SectionPanel section={section} />
            )}
          </NavigationMenuItem>
        )
      )}
    </>
  )
}
