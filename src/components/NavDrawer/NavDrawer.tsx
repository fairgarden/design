'use client'

import * as React from 'react'
import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible'
import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { cva, type VariantProps } from 'class-variance-authority'

import { DisclosureGlyph } from '../Collapsible'
import { Dialog } from '../Dialog'
import { Ground } from '../Ground'
import { Icon } from '../Icon'
import { link } from '../Link'
import { NavigationBarContext } from '../NavigationBar'
import { ScrollArea } from '../ScrollArea'
import { holdsCurrent, isCurrentPath, listItems, type SitemapSection } from '../../utils/navigation'
import { cx, resolveClassName } from '../../utils/className'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { isBandPreset, useScope, type BandPreset } from '../../utils/scope'
import styles from './nav-drawer.module.css'

/*
 * Mobile Navigation Drawer (§11.6) [D97, D183]: primary navigation below
 * --ds-nav-inline-n-above, on the Dialog.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: nav-drawer.module.css; CVA function `navigationDrawer`.
 * - Axes: `primary`, `secondary` → scales module classes, applied through
 *   the sheet's Ground. The sheet form (full or side) follows the viewport
 *   through the module's --md-n-above query, not an axis.
 * - Compound variants: none. Defaults: none; color axes none.
 * - Color fallback: the header's scope through React context (the
 *   Navigation Bar's preset and overrides); the action is the §9.2 `solid`
 *   Button on that scope's action scale.
 * - States: Dialog Popup `data-starting-style` → the clip reveal from the
 *   top (full sheet) or the docked edge (side sheet), instant under
 *   --motionNotOK; Collapsible Panel the same from its top; menu Button
 *   `data-popup-open` → × plus "Close"; Collapsible Trigger
 *   `data-panel-open` → the D109 glyph turns inward in --primary12;
 *   `aria-current` → the --ds-stroke-3 start-edge bar (weight 700 on
 *   links); `:hover` [D181] → group rows and direct links take the
 *   bare-text underline; child (panel) and footer links are §9.3 list
 *   links (Link's `kind="nav"` with `list`), color only, plus the
 *   underline where --role-link-hover resolves to --primary12; the menu
 *   Button and close control take the `text` Button hover;
 *   `:focus-visible` → the ring, inset inside rows.
 * - Parts: base (the sheet), bar, logo, logoMark, close, closeLabel, scroll,
 *   nav, list, item, groupRow, rowLabel, glyph, panel, childList (the
 *   indent guide), childLink, directLink, linkLabel, footer, footerAction,
 *   footerList, footerLink, footerLocale, menuTrigger, menuLabel.
 * - Scope: the portaled sheet re-declares the header's scope as a
 *   `kind="band"` Ground of its preset (Ground writes `data-theme` as on
 *   the header); never a `white` overlay scope [D97, D148].
 * - Container: none; page frame on the viewport custom media.
 * - Data: `sections` takes the shared navigation data (utils/navigation),
 *   the object that also builds the Navigation Menu panels and the footer
 *   sitemap [D187].
 */
export const navigationDrawer = cva(styles.base, {
  variants: {
    // Color axes: never defaulted [D133]; the sheet's Ground applies them.
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
})

type NavigationDrawerVariants = VariantProps<typeof navigationDrawer>


interface DrawerContextValue {
  currentPath?: string
}

const DrawerContext = React.createContext<DrawerContextValue>({})
/**
 * Link's list-link build (`kind="nav"` with `list`) for the child (panel)
 * and footer links: its color-only hover, press and ring [D181].
 */
const listLink = link({ kind: 'nav', list: true })

/** Where a drawer link sits: a top-level row, inside a group, or in the footer. */
const PlacementContext = React.createContext<'top' | 'group' | 'footer'>('top')


const ROW = 'a[href], button:not([disabled])'

/** The inline bar item matching the drawer's last open group, else the bar's first item. */
function findInlineItem(trigger: HTMLElement, sheet: HTMLElement | null): HTMLElement | null {
  const header = trigger.closest('header') ?? trigger.ownerDocument.body
  const items = Array.from(header.querySelectorAll<HTMLElement>(`[data-navigation-menu] :is(${ROW})`))
  const openRows = sheet ? Array.from(sheet.querySelectorAll<HTMLElement>('[data-panel-open]')) : []
  const wanted = openRows.at(-1)?.textContent?.trim().toLowerCase()
  const match = wanted ? items.find((item) => item.textContent?.trim().toLowerCase() === wanted) : undefined
  return match ?? items[0] ?? null
}

/** Props for NavDrawer. */
export type NavDrawerProps = {
  /**
   * The top-level rows from the shared navigation data (utils/navigation),
   * the object that also feeds `NavigationMenuSections` and `Footer`'s
   * `sitemap` [D187]. A section with links is a group (its landing page
   * first, then its links); one with only an `href` is a direct link. They
   * come before `children`.
   */
  sections?: readonly SitemapSection[]
  /** The top-level rows: `NavDrawerGroup`s and direct `NavDrawerLink`s. */
  children?: React.ReactNode
  /** The fixed footer zone: a `NavDrawerFooter`. */
  footer?: React.ReactNode
  /** The menu Button's label, authored in title case [D160]. Default "Menu". */
  label?: string
  /** The close control's label. Default "Close". */
  closeLabel?: string
  /** The drawer `nav`'s name. Default "Main". */
  navLabel?: string
  /** The logo repeated in the drawer's bar. Default: the Navigation Bar's. */
  logo?: React.ReactNode
  /** The logo link. Default: the Navigation Bar's, else "/". */
  logoHref?: string
  /** The logo link's accessible name. Default: the Navigation Bar's. */
  logoLabel?: string
  /** The current page's URL path. Default: the Navigation Bar's. */
  currentPath?: string
  /** Controlled open state. */
  open?: boolean
  /** Initial open state. Default `false`. */
  defaultOpen?: boolean
  /** Called when the drawer opens or closes. */
  onOpenChange?: (open: boolean) => void
  /** Override the header scope's primary. Never defaulted [D133]. */
  primary?: NavigationDrawerVariants['primary']
  /** Override the header scope's secondary. Never defaulted. */
  secondary?: NavigationDrawerVariants['secondary']
  /** Class names for the sheet, added after its own. */
  className?: string
  /** Class names for the menu Button, added after its own. */
  triggerClassName?: string
}

/**
 * The navigation drawer below --ds-nav-inline-n-above [D183]: the menu
 * Button (the `menu` icon plus "Menu"; × plus "Close" while open) and a
 * modal Dialog sheet in the header's own scope, full screen below
 * --md-n-above and a 480 px side sheet with a --ds-stroke-3 inner edge
 * from it. The sheet repeats the header's bar with the close control where
 * the menu Button was, lists independent Collapsible groups and direct
 * links in a Scroll Area, and keeps its footer fixed. Focus moves to the
 * first row, is trapped, and returns to the menu Button; no backdrop is
 * painted. If the viewport reaches the inline threshold while open, it
 * closes and focus goes to the matching bar item. Put it in the Navigation
 * Bar's `drawer` slot.
 */
export function NavDrawer(props: NavDrawerProps) {
  const {
    sections,
    children,
    footer,
    label = 'Menu',
    closeLabel = 'Close',
    navLabel = 'Main',
    logo: logoProp,
    logoHref: logoHrefProp,
    logoLabel: logoLabelProp,
    currentPath: currentPathProp,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    primary,
    secondary,
    className,
    triggerClassName,
  } = props

  const bar = React.useContext(NavigationBarContext)
  const scope = useScope()
  const preset: BandPreset = bar?.preset ?? (isBandPreset(scope.ground) ? scope.ground : 'paper')
  const logo = logoProp ?? bar?.logo
  const logoHref = logoHrefProp ?? bar?.logoHref ?? '/'
  const logoLabel = logoLabelProp ?? bar?.logoLabel
  const currentPath = currentPathProp ?? bar?.currentPath

  const [innerOpen, setInnerOpen] = React.useState(defaultOpen)
  const open = openProp ?? innerOpen
  const setOpen = React.useCallback(
    (next: boolean) => {
      onOpenChange?.(next)
      if (openProp === undefined) setInnerOpen(next)
    },
    [onOpenChange, openProp]
  )

  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const sheetRef = React.useRef<HTMLDivElement | null>(null)
  const listRef = React.useRef<HTMLUListElement | null>(null)
  const returnTarget = React.useRef<HTMLElement | null>(null)

  // From the inline threshold the Navigation Bar hides the menu Button:
  // close, and send focus to the matching bar item [D183].
  React.useEffect(() => {
    if (!open) return undefined
    const check = () => {
      const trigger = triggerRef.current
      if (trigger && trigger.getClientRects().length === 0) {
        returnTarget.current = findInlineItem(trigger, sheetRef.current)
        setOpen(false)
      }
    }
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [open, setOpen])

  const context = React.useMemo<DrawerContextValue>(() => ({ currentPath }), [currentPath])

  return (
    <DrawerContext.Provider value={context}>
      <Dialog open={open} onOpenChange={(next) => setOpen(next)}>
        <BaseDialog.Trigger ref={triggerRef} className={cx(styles.menuTrigger, triggerClassName)}>
          <Icon name={open ? 'close' : 'menu'} size="tag" weight="interactive" className={styles.menuIcon} />
          <span className={styles.menuLabel}>{open ? closeLabel : label}</span>
        </BaseDialog.Trigger>
        <BaseDialog.Portal>
          <BaseDialog.Popup
            ref={sheetRef}
            aria-label={label}
            initialFocus={() => listRef.current?.querySelector<HTMLElement>(ROW) ?? true}
            finalFocus={() => {
              const target = returnTarget.current
              returnTarget.current = null
              return target ?? true
            }}
            className={navigationDrawer({ className })}
            render={
              <Ground
                kind="band"
                preset={preset}
                primary={primary ?? bar?.primary}
                secondary={secondary ?? bar?.secondary}
                render={<div />}
              />
            }
          >
            <div className={styles.bar}>
              {logo != null ? (
                <a className={styles.logo} href={logoHref} aria-label={logoLabel}>
                  <span className={styles.logoMark}>{logo}</span>
                </a>
              ) : null}
              <BaseDialog.Close className={styles.close}>
                <Icon name="close" size="tag" weight="interactive" className={styles.menuIcon} />
                <span className={styles.closeLabel}>{closeLabel}</span>
              </BaseDialog.Close>
            </div>
            <ScrollArea className={styles.scroll}>
              <nav aria-label={navLabel} className={styles.nav}>
                <ul ref={listRef} className={styles.list}>
                  {listItems([sections?.map(sectionRow), children], styles.item)}
                </ul>
              </nav>
            </ScrollArea>
            {footer}
          </BaseDialog.Popup>
        </BaseDialog.Portal>
      </Dialog>
    </DrawerContext.Provider>
  )
}

/** One top-level row from the navigation data: a group with its links, or a direct link. */
function sectionRow(section: SitemapSection) {
  const key = section.href ?? section.label
  if (section.links.length === 0) {
    return section.href != null ? (
      <NavDrawerLink key={key} href={section.href}>
        {section.label}
      </NavDrawerLink>
    ) : null
  }
  return (
    <NavDrawerGroup key={key} label={section.label}>
      {section.href != null ? <NavDrawerLink href={section.href}>{section.label}</NavDrawerLink> : null}
      {section.links.map((link) => (
        <NavDrawerLink key={link.href + link.label} href={link.href} active={link.current ? true : undefined}>
          {link.label}
        </NavDrawerLink>
      ))}
    </NavDrawerGroup>
  )
}

/** Props for NavDrawerGroup: Base UI Collapsible Root props, the row label and its links. */
export type NavDrawerGroupProps = Omit<BaseCollapsible.Root.Props, 'children'> & {
  /** The group row's label, in the display serif (`type-itemhead`). */
  label: React.ReactNode
  /** The group's `NavDrawerLink`s. Nest groups one level deep at most. */
  children?: React.ReactNode
}

/**
 * One top-level group: an independent Collapsible whose trigger row shows
 * LTA's expand/collapse glyph [D109] (outward in --role-muted, inward in
 * --primary12 when open; it swaps, never rotates), over its child links on
 * an indent guide. A group holding the current page opens by default and
 * its row takes the start-edge bar (`aria-current="true"`).
 */
export function NavDrawerGroup(props: NavDrawerGroupProps) {
  const { label, defaultOpen, className, children, ...rest } = props
  const { currentPath } = React.useContext(DrawerContext)
  const containsCurrent = holdsCurrent(children, currentPath)
  return (
    <BaseCollapsible.Root
      {...rest}
      defaultOpen={defaultOpen ?? containsCurrent}
      className={resolveClassName(className, (extra) => cx(styles.group, extra))}
    >
      <BaseCollapsible.Trigger
        {...(containsCurrent ? { 'aria-current': 'true' as const } : {})}
        className={styles.groupRow}
      >
        <span className={styles.rowLabel}>{label}</span>
        <DisclosureGlyph size="row" className={styles.glyph} />
      </BaseCollapsible.Trigger>
      <BaseCollapsible.Panel className={styles.panel}>
        <PlacementContext.Provider value="group">
          <ul className={styles.childList}>{listItems(children, styles.childItem)}</ul>
        </PlacementContext.Provider>
      </BaseCollapsible.Panel>
    </BaseCollapsible.Root>
  )
}

/** Props for NavDrawerLink: anchor props plus an explicit current flag. */
export type NavDrawerLinkProps = React.ComponentProps<'a'> & {
  /** Marks the link as the current page. Default: its path equals the drawer's `currentPath`. */
  active?: boolean
}

/**
 * A drawer link. At the top level it is a direct link, styled as a group
 * row without the glyph (the bare-text underline on hover); in a group, a
 * `type-body-ui` child link on the indent guide; in the footer, a utility
 * link. Child and footer links are list links, whose hover is color only
 * [D181]. The current page takes `aria-current="page"`, the --ds-stroke-3
 * start-edge bar and weight 700.
 */
export function NavDrawerLink(props: NavDrawerLinkProps) {
  const { active, href, className, children, ...rest } = props
  const { currentPath } = React.useContext(DrawerContext)
  const placement = React.useContext(PlacementContext)
  const current = active ?? isCurrentPath(href, currentPath)
  const part =
    placement === 'group'
      ? cx(listLink, styles.childLink)
      : placement === 'footer'
        ? cx(listLink, styles.footerLink)
        : styles.directLink
  return (
    <a
      {...(current ? { 'aria-current': 'page' as const } : {})}
      {...rest}
      href={href}
      className={cx(part, className)}
    >
      <span className={styles.linkLabel}>{children}</span>
    </a>
  )
}

/** Props for NavDrawerFooter: `div` props, the action and the locale Select. */
export type NavDrawerFooterProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** The primary pill: a `solid` Button at `size="lg"`, hugging its label. */
  action?: React.ReactNode
  /** The locale Select (or a locale link). */
  locale?: React.ReactNode
  /** Utility links (`NavDrawerLink`s): the utility bar's links, repeated. */
  children?: React.ReactNode
}

/**
 * The drawer's fixed footer zone, under a --border-size-2 --role-rule: the
 * primary pill first (where the header's action goes below 360 px), then
 * the utility links at a --ds-size-hit pitch, then the locale Select. Put
 * it in the drawer's `footer`.
 */
export function NavDrawerFooter(props: NavDrawerFooterProps) {
  const { action, locale, className, children, ...rest } = props
  return (
    <div {...rest} className={cx(styles.footer, className)}>
      {action != null ? <div className={styles.footerAction}>{action}</div> : null}
      {children != null ? (
        <PlacementContext.Provider value="footer">
          <ul className={styles.footerList}>{listItems(children, styles.childItem)}</ul>
        </PlacementContext.Provider>
      ) : null}
      {locale != null ? <div className={styles.footerLocale}>{locale}</div> : null}
    </div>
  )
}
