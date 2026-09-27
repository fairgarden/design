'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from '../../disclosure/collapsible'
import { Ground } from '../../foundations/ground'
import { NavDrawer, type NavDrawerProps } from '../../navigation/nav-drawer'
import { TableOfContentsContext } from '../../navigation/table-of-contents'
import { cx } from '../../utils/className'
import { SkipLinkContext } from '../../utils/frame'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { isPageGroundPreset, useScope, type PageGroundPreset } from '../../utils/scope'
import styles from './docs-layout.module.css'

/*
 * Docs Layout (§11.15) [D202, D203]: the documentation page frame. A skip
 * link, the site header, then the frame's columns: the sidebar navigation,
 * the page, and an optional table of contents.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: docs-layout.module.css; CVA function `docsLayout`.
 * - Axes: `primary`, `secondary` → scales module classes, applied through
 *   the root's Ground.
 * - Compound variants: none. Defaults: none; color axes none.
 * - Color fallback: the root is a `kind="band"` Ground of the page ground
 *   (`preset`, else the scope's page ground, else `paper`); every part
 *   takes its role variables.
 * - States: none of its own. The sidebar column and the table-of-contents
 *   column are placed by viewport media only (the sidebar from
 *   --fgd-nav-inline-n-above, the contents column from --xl-n-above), so
 *   the server HTML paints the final frame: nothing is measured and
 *   nothing moves at hydration [D201].
 * - Parts: base (the page), skipLink, frame (the columns), sidebar (its
 *   sticky column), main, tocDisclosure (the "On this page" Collapsible
 *   below --xl-n-above), tocTrigger, tocPanel, toc (its sticky column),
 *   drawerTrigger (the menu Button of a DocsLayoutDrawer outside a
 *   Navigation Bar).
 * - Scope: the root re-declares the page ground as a `kind="band"` Ground.
 * - Container: none; page frame on the viewport custom media [D163].
 */
export const docsLayout = cva(styles.base, {
  variants: {
    // Color axes: never defaulted [D133]; the root's Ground applies them.
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
})

type DocsLayoutVariants = VariantProps<typeof docsLayout>

interface DocsLayoutContextValue {
  /** The sidebar navigation, repeated in the drawer below the threshold. */
  sidebar: React.ReactNode
  /** The in-flow sidebar column. */
  sidebarRef: React.RefObject<HTMLDivElement | null>
}

/** Provided by DocsLayout; read by DocsLayoutDrawer. */
export const DocsLayoutContext = React.createContext<DocsLayoutContextValue | null>(null)
DocsLayoutContext.displayName = 'DocsLayoutContext'

/** Props for DocsLayout: `div` props, the frame's slots, the page ground and the color axes. */
export type DocsLayoutProps = Omit<React.ComponentPropsWithRef<'div'>, 'children'> &
  DocsLayoutVariants & {
    /**
     * The site header: a `NavigationBar` with `wide` (so its content box
     * meets the columns), whose `drawer` is a `DocsLayoutDrawer`.
     */
    header?: React.ReactNode
    /**
     * The page tree: a `SidebarNav`. It fills the sticky start column from
     * --fgd-nav-inline-n-above and, below it, the drawer that
     * `DocsLayoutDrawer` opens from the header.
     */
    sidebar?: React.ReactNode
    /**
     * The page's contents: a `TableOfContents`. It fills the sticky end
     * column from --xl-n-above and, below it, an "On this page" disclosure
     * at the top of the page. Omitted, neither appears.
     */
    toc?: React.ReactNode
    /** The page. */
    children?: React.ReactNode
    /** A full-width part under the columns, such as the site `Footer`. */
    footer?: React.ReactNode
    /** The page ground: `paper` (default), `white` or the page's one pastel. */
    preset?: PageGroundPreset
    /** The `main` element's id, the skip link's target. Default "main". */
    mainId?: string
    /** The skip link's words. Default "Skip to main content". */
    skipLabel?: string
    /** The contents disclosure's label below --xl-n-above. Default "On this page". */
    tocLabel?: string
    /** Override the page ground's primary. Never defaulted [D133]. */
    primary?: DocsLayoutVariants['primary']
    /** Override the page ground's secondary. Never defaulted. */
    secondary?: DocsLayoutVariants['secondary']
  }

/**
 * The documentation page frame [D202, D203]. A skip link first (the
 * header's Navigation Bar then renders none), the header, then up to three
 * columns inside `--fgd-container-wide`: the sidebar (`SidebarNav`, a
 * sticky 240 px column with its own scroll, from --fgd-nav-inline-n-above;
 * below it the header's menu Button opens the same navigation in the
 * drawer), the `main` page with its end gutter for the code blocks'
 * hanging ⋮, and the table of contents (a sticky 240 px column from
 * --xl-n-above; below it an "On this page" disclosure at the top of the
 * page, closed). Every placement is viewport media, so the first paint is
 * the final frame. Print keeps the page alone.
 */
export function DocsLayout(props: DocsLayoutProps) {
  const {
    header,
    sidebar,
    toc,
    children,
    footer,
    preset: presetProp,
    mainId = 'main',
    skipLabel = 'Skip to main content',
    tocLabel = 'On this page',
    primary,
    secondary,
    className,
    ...rest
  } = props

  const scope = useScope()
  const preset: PageGroundPreset =
    presetProp ?? (isPageGroundPreset(scope.ground) ? scope.ground : 'paper')
  const sidebarRef = React.useRef<HTMLDivElement | null>(null)
  const context = React.useMemo<DocsLayoutContextValue>(() => ({ sidebar, sidebarRef }), [sidebar])
  const hasSidebar = sidebar != null && sidebar !== false
  const hasToc = toc != null && toc !== false

  return (
    <SkipLinkContext.Provider value>
      <DocsLayoutContext.Provider value={context}>
        <Ground
          {...rest}
          kind="band"
          preset={preset}
          primary={primary ?? undefined}
          secondary={secondary ?? undefined}
          render={<div />}
          className={docsLayout({ className })}
        >
          <a className={styles.skipLink} href={`#${mainId}`}>
            {skipLabel}
          </a>
          {header}
          <div className={cx(styles.frame, hasSidebar && styles.withSidebar, hasToc && styles.withToc)}>
            {hasSidebar ? (
              <div ref={sidebarRef} className={styles.sidebar}>
                {sidebar}
              </div>
            ) : null}
            <main id={mainId} className={styles.main}>
              {hasToc ? (
                <Collapsible className={styles.tocDisclosure}>
                  <CollapsibleTrigger className={styles.tocTrigger}>{tocLabel}</CollapsibleTrigger>
                  <CollapsiblePanel className={styles.tocPanel}>
                    <TableOfContentsContext.Provider value={LABEL_HIDDEN}>{toc}</TableOfContentsContext.Provider>
                  </CollapsiblePanel>
                </Collapsible>
              ) : null}
              {children}
            </main>
            {hasToc ? <div className={styles.toc}>{toc}</div> : null}
          </div>
          {footer}
        </Ground>
      </DocsLayoutContext.Provider>
    </SkipLinkContext.Provider>
  )
}

const LABEL_HIDDEN = { labelHidden: true }

/** Props for DocsLayoutDrawer: NavDrawer's, less the list it builds itself. */
export type DocsLayoutDrawerProps = Omit<NavDrawerProps, 'nav' | 'sections' | 'children' | 'navLabel'>

/**
 * The docs layout's drawer [D202]: a `NavDrawer` whose sheet shows the
 * layout's `sidebar` (the same `SidebarNav`, from the same data). Put it in
 * the header's `drawer` slot: the Navigation Bar shows its menu Button
 * below --fgd-nav-inline-n-above, exactly where the sidebar column is
 * absent. Focus moves to the current page's link, is trapped, Escape
 * closes, and focus returns to the menu Button; the page behind is inert
 * and does not scroll. If the window widens past the threshold while it is
 * open, it closes and focus moves to the sidebar column's current link.
 */
export function DocsLayoutDrawer(props: DocsLayoutDrawerProps) {
  const { triggerClassName, ...rest } = props
  const layout = React.useContext(DocsLayoutContext)
  const inlineTarget = React.useCallback(() => {
    const column = layout?.sidebarRef.current
    return (
      column?.querySelector<HTMLElement>('a[aria-current="page"]') ??
      column?.querySelector<HTMLElement>('a[href]') ??
      null
    )
  }, [layout])
  return (
    <NavDrawer
      {...rest}
      nav={layout?.sidebar}
      inlineTarget={inlineTarget}
      triggerClassName={cx(styles.drawerTrigger, triggerClassName)}
    />
  )
}
