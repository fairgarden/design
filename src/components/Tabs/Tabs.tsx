'use client'

import * as React from 'react'
import { Tabs as BaseTabs } from '@base-ui/react/tabs'
import { cva, type VariantProps } from 'class-variance-authority'

import { Button } from '../Button'
import { Icon, type IconName } from '../Icon'
import { ScrollArea } from '../ScrollArea'
import { cx, resolveClassName } from '../../utils/className'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './tabs.module.css'

/*
 * Tabs (§9.5): 2–6 peer panels on one page, one visible at a time.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: tabs.module.css; CVA function `tabs`.
 * - Axes: `variant` → underline | segmented (a bar on a baseline; full-bleed
 *   equal cells); `filled` → `filled` (typed only with `segmented`: the
 *   current cell takes the --role-select fill; the parent passes it on the
 *   light presets only, since the module never reads the scope [D155]);
 *   `primary`, `secondary` → scales module classes. The `index` variant
 *   (vertical rail) is not built yet.
 * - Compound variants: none.
 * - Defaults: variant underline, filled false; color axes: none.
 * - Color fallback: inherits the scope.
 * - States: the current tab (`data-active`, Base UI's name for §9.5's
 *   `data-selected`) → the --ds-stroke-3 bar (the Indicator, placed from
 *   Base UI's active-tab position variables) and --font-weight-7, plus the
 *   --role-select cell under `filled`; `:hover` (not disabled) → the
 *   bare-text underline under the label (--role-accent at --border-size-2,
 *   offset --size-px-1), told from the bar by color and position, and the
 *   `filled` current cell's fill at --role-select-hover [D181]; `:active` →
 *   the bar at --border-size-2; `:focus-visible` → the
 *   ring on the hit area; `data-disabled` → --role-muted label and a
 *   `line-dotted-fine` underline.
 * - Parts: base, list, tab, label, icon, indicator, panel, overflow (+ `bar`,
 *   the non-scrolling row that holds the Scroll Area and the overflow
 *   button; `scroller`, the `wide` Scroll Area root the list scrolls in;
 *   `edge` / `edgeLine`, the disabled dotted underline; `printLabel`).
 * - Scope: none.
 * - Container: `base` is the inline-size container `tabs`. Baseline: up to 3
 *   equal cells with wrapping labels; 4–6 hug their labels in a `wide`
 *   Scroll Area with a › button; from 768 px of container one row of hugging tabs
 *   (§5.10.2). Viewport fallback --md-n-above.
 */
export const tabs = cva(styles.base, {
  variants: {
    variant: {
      underline: styles.underline,
      segmented: styles.segmented,
    },
    filled: {
      true: styles.filled,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    variant: 'underline',
    filled: false,
  },
})

type TabsVariants = VariantProps<typeof tabs>
type TabValue = BaseTabs.Tab.Value

/** Tab labels by value, so each panel can print its heading (§7.7). */
interface TabsLabels {
  labels: ReadonlyMap<TabValue, React.ReactNode>
  register: (value: TabValue, label: React.ReactNode) => () => void
}

const TabsLabelsContext = React.createContext<TabsLabels | null>(null)

type TabsVariantProps =
  | {
      /** `underline` (default): tabs on a full-width `--role-rule` baseline; the current tab's bar is as wide as its label. */
      variant?: 'underline'
      /** Only with `segmented`. */
      filled?: never
    }
  | {
      /** `segmented`: full-bleed equal cells; the bar spans the current cell's bottom. */
      variant: 'segmented'
      /**
       * The current cell takes the `--role-select` fill, a `--role-select-edge`
       * edge and a `--role-select-mark` label. Pass it on the light presets
       * only (paper, white); deep and saturated grounds mark the current cell
       * by the bar and weight alone. The label follows the secondary: its own
       * contrast ink where that carries text on step 9, else `--primary12`
       * (§1.4.7). Don't pass it with a crimson, gold, pink, red, ruby or tomato
       * secondary, whose step 9 carries no words. Default `false`.
       */
      filled?: boolean
    }

/** Props for Tabs: Base UI Tabs Root props (without `orientation`) plus the variant and color axes. */
export type TabsProps = Omit<BaseTabs.Root.Props, 'orientation'> &
  TabsVariantProps & {
    /**
     * Primary Radix scale: labels, bar, baseline and focus ring. Never
     * defaulted; omitted, it inherits the scope [D133].
     */
    primary?: TabsVariants['primary']
    /**
     * Secondary Radix scale: only the segmented current cell under `filled`,
     * whose label takes the scale's own contrast ink where it carries text
     * (indigo's `--indigo1`), else `--primary12`. Keep it equal to the brand
     * strip's scale so strip and cell join.
     */
    secondary?: TabsVariants['secondary']
  }

/**
 * Tabs for 2–6 peer panels on one page (§9.5): `TabsList` holding `TabsTab`s,
 * then one `TabsPanel` per tab. Labels are caps wayfinding (`type-label`),
 * authored in sentence case [D165]. Never use tabs for page-to-page
 * navigation or sequential steps. In print the list hides and every panel
 * prints in order under its label. The root is an inline-size container, so
 * give it a width in shrink-to-fit contexts.
 */
export function Tabs(props: TabsProps) {
  const { variant, filled, primary, secondary, className, ...rest } = props
  const scope = useScopeAttributes()
  const [labels, setLabels] = React.useState<ReadonlyMap<TabValue, React.ReactNode>>(
    () => new Map()
  )

  const register = React.useCallback((value: TabValue, label: React.ReactNode) => {
    setLabels((current) => {
      if (current.get(value) === label) return current
      const next = new Map(current)
      next.set(value, label)
      return next
    })
    return () => {
      setLabels((current) => {
        if (current.get(value) !== label) return current
        const next = new Map(current)
        next.delete(value)
        return next
      })
    }
  }, [])

  const context = React.useMemo(() => ({ labels, register }), [labels, register])

  return (
    <TabsLabelsContext.Provider value={context}>
      <BaseTabs.Root
        {...rest}
        {...scope}
        className={resolveClassName(className, (extra) =>
          tabs({ variant, filled: filled ?? false, primary, secondary, className: extra })
        )}
      />
    </TabsLabelsContext.Provider>
  )
}

/** Props for TabsList: Base UI Tabs List props plus the overflow button's label. */
export type TabsListProps = BaseTabs.List.Props & {
  /** Accessible name of the overflow › button that scrolls the row. Default "More tabs". */
  overflowLabel?: string
}

/**
 * The tab list and its current-tab indicator. When 4–6 tabs overflow their
 * row, the row scrolls sideways in a `wide` Scroll Area (the last tab
 * clipped, a visible scrollbar, hard overflow edges) and a `--size-px-7` ›
 * button at its end scrolls it on. More than 6 tabs belong in navigation
 * or a Select.
 */
export function TabsList(props: TabsListProps) {
  const { overflowLabel = 'More tabs', className, children, ...rest } = props
  const viewportRef = React.useRef<HTMLDivElement | null>(null)
  const [canScroll, setCanScroll] = React.useState(false)

  React.useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return undefined
    const update = () => {
      const remaining = viewport.scrollWidth - viewport.clientWidth - Math.abs(viewport.scrollLeft)
      setCanScroll(remaining > 1)
    }
    update()
    const resize = new ResizeObserver(update)
    resize.observe(viewport)
    if (viewport.firstElementChild) resize.observe(viewport.firstElementChild)
    viewport.addEventListener('scroll', update, { passive: true })
    return () => {
      resize.disconnect()
      viewport.removeEventListener('scroll', update)
    }
  }, [])

  const scrollOn = () => {
    const viewport = viewportRef.current
    if (!viewport) return
    const direction = getComputedStyle(viewport).direction === 'rtl' ? -1 : 1
    viewport.scrollBy({ left: direction * viewport.clientWidth * 0.75 })
  }

  return (
    <div className={styles.bar}>
      {/* The tabs are the row's focus stops, so the viewport takes none (§10.19). */}
      <ScrollArea
        kind="wide"
        focusable={false}
        viewportRef={viewportRef}
        className={styles.scroller}
      >
        <BaseTabs.List
          {...rest}
          className={resolveClassName(className, (extra) => cx(styles.list, extra))}
        >
          {children}
          <BaseTabs.Indicator className={styles.indicator} renderBeforeHydration />
        </BaseTabs.List>
      </ScrollArea>
      {canScroll ? (
        <Button
          iconOnly
          size="sm"
          icon="chevron_right"
          className={styles.overflow}
          onClick={scrollOn}
          tabIndex={-1}
        >
          {overflowLabel}
        </Button>
      ) : null}
    </div>
  )
}

/** Props for TabsTab: Base UI Tab props plus an optional leading icon. */
export type TabsTabProps = BaseTabs.Tab.Props & {
  /**
   * An optional leading icon, Material Symbols Rounded at the inline tier,
   * FILL 0. Never icon-only.
   */
  icon?: IconName
}

/**
 * One tab: an optional icon and a caps `type-label` label, at least
 * `--ds-size-hit` tall. Inactive labels are `--role-muted` at weight 600,
 * the current label `--primary12` at 700 with the `--ds-stroke-3` bar.
 * Prefer removing a tab to disabling it.
 */
export function TabsTab(props: TabsTabProps) {
  const { icon, value, disabled, className, children, ...rest } = props
  const registry = React.useContext(TabsLabelsContext)
  const register = registry?.register

  React.useEffect(() => register?.(value, children), [register, value, children])

  return (
    <BaseTabs.Tab
      {...rest}
      value={value}
      disabled={disabled}
      className={resolveClassName(className, (extra) => cx(styles.tab, extra))}
    >
      {icon ? <Icon name={icon} className={styles.icon} /> : null}
      <span className={styles.label}>
        <span className={styles.labelText}>{children}</span>
        {/* Reserves the weight-700 width so the row never shifts when the current tab changes. */}
        <span className={styles.labelSizer} aria-hidden="true">
          {children}
        </span>
      </span>
      {disabled ? (
        <svg className={styles.edge} aria-hidden="true" focusable="false">
          <line className={styles.edgeLine} x1="0" y1="50%" x2="100%" y2="50%" />
        </svg>
      ) : null}
    </BaseTabs.Tab>
  )
}

/** Props for TabsPanel: Base UI Tab Panel props plus the printed label. */
export type TabsPanelProps = BaseTabs.Panel.Props & {
  /**
   * The heading this panel prints under. Omitted, it takes the matching
   * tab's label once the page has hydrated.
   */
  label?: React.ReactNode
}

/**
 * One panel, `--size-px-5` below the list, with no border. Panels stay in
 * the DOM while hidden (`keepMounted`, default `true`) so print can show
 * every panel in order, each under its label in `type-subhead`.
 */
export function TabsPanel(props: TabsPanelProps) {
  const { label, value, keepMounted = true, className, children, ...rest } = props
  const registry = React.useContext(TabsLabelsContext)
  const printLabel = label ?? registry?.labels.get(value)

  return (
    <BaseTabs.Panel
      {...rest}
      value={value}
      keepMounted={keepMounted}
      className={resolveClassName(className, (extra) => cx(styles.panel, extra))}
    >
      {printLabel == null ? null : (
        <p className={styles.printLabel} aria-hidden="true">
          {printLabel}
        </p>
      )}
      {children}
    </BaseTabs.Panel>
  )
}

