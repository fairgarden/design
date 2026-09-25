'use client'

import * as React from 'react'
import { mergeProps } from '@base-ui/react/merge-props'
import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area'
import { Tabs as BaseTabs } from '@base-ui/react/tabs'
import { useRender } from '@base-ui/react/use-render'
import { cva } from 'class-variance-authority'

import { cx, resolveClassName } from '../../utils/className'
import {
  primaryScaleVariants,
  secondaryScaleVariants,
  type PrimaryScale,
  type RadixScale,
} from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './file-tabs.module.css'

/*
 * File tabs: the folder-tab header that switches a code block between its
 * files (mono file names, §3.11), with optional controls and a busy status
 * at its end. Code Block and Demo render their header through it. It is
 * presentational and needs no docs engine. Tabs (§9.5) is for peer panels
 * of prose; these take any number of files, can be deep links, and share
 * one panel.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: file-tabs.module.css; CVA functions `fileTabs` (the Root) and
 *   `fileTabsHeader` (the header FileTabsList renders, internal).
 * - Axes: `primary`, `secondary` → scales module classes (Root); `frame`
 *   (`top` | `joined` | `none`) → frameTop, frameJoined, frameNone (header).
 * - Compound variants: none.
 * - Defaults: frame `top`; color axes are never defaulted [D133].
 * - Color fallback: inherits the scope.
 * - States: the selected tab (`data-active`) → the folder tab: filled
 *   --role-select-text with a --role-select-text-edge edge and
 *   --radius-2-25 top radii, a --role-select-text-label label at
 *   --font-weight-7, its neighbours tucked under it; `:active` on it → the
 *   radii grow (motion OK only); `:hover` on the others → the bare-text
 *   underline (--role-accent at --border-size-2, offset --size-px-1)
 *   [D181]; `:active` on the others → a --border-size-2 --primary12 line
 *   under the label; `:focus-visible` → the ring inside the hit area;
 *   `data-disabled` → --role-muted label and a `line-dotted-fine` underline,
 *   the selected tab keeping its shape on a --primary1 face [D16, D85].
 *   The scroll line → --primary12 while pointed at or dragged. The header:
 *   `data-tablist` (two or more files) → the controls' cell takes a
 *   --role-rule start edge; `data-hang` (measured) → the controls hang
 *   outside the host's inline-end edge. FileTabsControl: `data-popup-open`
 *   → the open bar (in the header) or the drawn ear (hung); disabled →
 *   --role-muted.
 * - Parts: base, header, lead (the tabs or the one file's label), scroller
 *   / viewport (the row the list scrolls in), scrollbar and thumb (the
 *   scroll line on the header's rule), list, tab, label, edge / edgeLine
 *   (the disabled underline), single (the lone file's label), side (the
 *   header's end), status, controls (their cell), control
 *   (FileTabsControl), panel.
 * - Scope: none.
 * - Container: none; the list scrolls sideways when the tabs overflow, and
 *   the hang is measured against the viewport and the nearest clip.
 */
export const fileTabs = cva(styles.base, {
  variants: {
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
})

/** The header's CVA function (FileTabsList): where it sits on its host. */
const fileTabsHeader = cva(styles.header, {
  variants: {
    frame: {
      top: styles.frameTop,
      joined: styles.frameJoined,
      none: styles.frameNone,
    },
  },
  defaultVariants: {
    frame: 'top',
  },
})

/** Where the header sits on its host: see `FileTabsProps['frame']`. */
export type FileTabsFrame = 'top' | 'joined' | 'none'

/** One file tab. */
export type FileTab = {
  /** The tab's value, unique within `tabs`. The code block passes the file name. */
  id: string
  /** The label, in mono (`typeData`, not caps): usually the file name. */
  name: string
  /**
   * Deep-link slug. The tab renders as `<a href="#slug">` (`nativeButton={false}`).
   * A plain click selects the tab and `preventDefault()`s the anchor, so the page
   * doesn't jump and the hash isn't written. A modifier click (Ctrl, Cmd, Alt or
   * Shift) opens the link and leaves the selection alone.
   */
  slug?: string
}

/** Props for FileTabs: Base UI Tabs Root props (without its value props and `orientation`) plus the files, the header's frame, controls and status, and the color axes. */
export type FileTabsProps = Omit<
  BaseTabs.Root.Props,
  'value' | 'defaultValue' | 'onValueChange' | 'orientation'
> & {
  tabs: readonly FileTab[]
  /** Controlled: the selected tab's `id`. `undefined`, or an id not in `tabs`, selects the first tab. */
  value?: string
  /** Uncontrolled initial `id`. Default: the first tab. */
  defaultValue?: string
  /**
   * Called on user selection only. Not called for a modifier activation, which
   * `eventDetails.cancel()`s. The modifiers are read from `eventDetails.event`
   * (Base UI 1.8), so this covers the keyboard as well as the pointer.
   */
  onValueChange?: (id: string) => void
  /** Disables every tab: `--role-muted` label plus a `line-dotted-fine` underline, no opacity. Default `false`. */
  disabled?: boolean
  /**
   * Where the header sits. Its host is the bordered box it opens: a
   * `--border-size-1` edge, no padding, a `--primary1` face and no clip,
   * such as Code Block's frame, or the Root itself given a frame class.
   * `'top'`: at the top of the host, whose top corners take
   * `--radius-2-25`. The tab strip runs out over the host's side edges by
   * their width, so an end tab's edge is the host's edge; the side edges
   * are drawn again over the header from below the corner radius, so
   * scrolled tabs pass under them; `controls` may hang outside.
   * `'joined'`: the same, in a part of the host below another (Demo's
   * code); the header draws the `--role-rule` that joins the part above,
   * and the side edges run from it. `'none'`: no host frame (tabs over
   * their panel on the page); the strip stays inside the header, the end
   * tabs show their own edges, and `controls` always sit in the header.
   * Default `'top'`.
   */
  frame?: FileTabsFrame
  /**
   * Controls at the header's end: a `FileTabsControl` (a Menu's ⋮ trigger)
   * or a few small icon Buttons. With two or more tabs in a framed header
   * they hang outside the host's inline-end edge and take no header width,
   * wherever the free space there holds their hit area (`--fgd-size-hit`,
   * or their width if wider) past the host's edge, up to the viewport or the
   * nearest ancestor that clips sideways (`overflow-clip-margin` counts).
   * The space is measured again on resize. Otherwise, and before
   * hydration, they sit in a `--fgd-size-hit` cell at the header's end with
   * a `--role-rule` start edge, where the tabs end. With one file they sit
   * beside its label, wrapping onto a second row when they can't. Hidden in
   * print.
   */
  controls?: React.ReactNode
  /**
   * The busy "-ing…" label while something the header started is under way
   * ("Switching to JS…", "Formatting…") [D84], laid over the header's end
   * beside the controls: mono, `--role-muted`, on the `--primary1` face with
   * a `--role-rule` start edge, so it never moves or narrows the tabs. Its
   * element is a `role="status"` live region, rendered whenever `status`
   * isn't `undefined`: pass `''` while idle, so it stays mounted and its
   * changes are announced. Not for confirmations such as a copy: those are
   * toasts (§10.17). Hidden in print.
   */
  status?: React.ReactNode
  /** Primary scale: labels, rules, focus ring. Never defaulted [D133]. */
  primary?: PrimaryScale
  /** Secondary scale: the selected tab's fill, edge and label (`--role-select*`). Never defaulted. */
  secondary?: RadixScale
}

interface FileTabsContextValue {
  tabs: readonly FileTab[]
  /** The selected tab's id; `undefined` only when there are no tabs. */
  selected: string | undefined
  disabled: boolean
  frame: FileTabsFrame
  controls: React.ReactNode
  status: React.ReactNode
}

const FileTabsContext = React.createContext<FileTabsContextValue | null>(null)
FileTabsContext.displayName = 'FileTabsContext'

function useFileTabsContext(part: string): FileTabsContextValue {
  const context = React.useContext(FileTabsContext)
  if (context === null) {
    throw new Error(`${part} must be placed inside FileTabs.`)
  }
  return context
}

/** The modifiers that make an anchor open elsewhere (new tab, window or split) instead of selecting. */
function hasModifier(event: unknown): boolean {
  if (typeof event !== 'object' || event === null) return false
  const keys = event as Partial<Pick<MouseEvent, 'ctrlKey' | 'metaKey' | 'altKey' | 'shiftKey'>>
  return Boolean(keys.ctrlKey || keys.metaKey || keys.altKey || keys.shiftKey)
}

/**
 * A link tab's click: a plain click only selects, so the page doesn't jump
 * and the hash isn't written; a modifier click keeps the browser's own
 * handling (the selection change is canceled in the Root).
 */
function handleLinkClick(event: React.MouseEvent<HTMLAnchorElement>) {
  if (!hasModifier(event)) event.preventDefault()
}

/**
 * The root of a set of file tabs: it holds the selection and the header's
 * `frame`, `controls` and `status`, and wraps both the header
 * (`FileTabsList`) and `FileTabsPanel`. Tabs with a `slug` are deep links:
 * a plain click selects the file, a modifier click opens the link and
 * leaves the selection.
 */
export function FileTabs(props: FileTabsProps) {
  const {
    tabs,
    value,
    defaultValue,
    onValueChange,
    disabled = false,
    frame = 'top',
    controls,
    status,
    primary,
    secondary,
    className,
    ...rest
  } = props
  const scope = useScopeAttributes()
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)

  const requested = value !== undefined ? value : uncontrolled
  const selected = tabs.some((tab) => tab.id === requested) ? requested : tabs[0]?.id

  const handleValueChange = (next: BaseTabs.Tab.Value, details: BaseTabs.Root.ChangeEventDetails) => {
    // Only user activations; Base UI's automatic fallbacks never reach a controlled root.
    if (details.reason !== 'none') return
    const tab = tabs.find((candidate) => candidate.id === next)
    if (tab === undefined) return
    // A modifier activation of a link (click, Enter or Space) opens the link instead.
    if (tab.slug && hasModifier(details.event)) {
      details.cancel()
      return
    }
    setUncontrolled(tab.id)
    onValueChange?.(tab.id)
  }

  const context = React.useMemo(
    () => ({ tabs, selected, disabled, frame, controls, status }),
    [tabs, selected, disabled, frame, controls, status],
  )

  return (
    <FileTabsContext.Provider value={context}>
      <BaseTabs.Root
        {...rest}
        {...scope}
        value={selected ?? null}
        onValueChange={handleValueChange}
        className={resolveClassName(className, (extra) =>
          fileTabs({ primary, secondary, className: extra })
        )}
      />
    </FileTabsContext.Provider>
  )
}

/**
 * The hung controls' room past the header's edge (the host's inner edge):
 * their hit area, `--fgd-size-hit` (44 px), or their own width if wider,
 * plus the host's `--border-size-1` edge. For a FileTabsControl, 45 px.
 */
const HIT_PX = 44
const HOST_EDGE_PX = 1

function lengthPx(value: string) {
  const match = /(-?[\d.]+)px/.exec(value)
  return match ? parseFloat(match[1]) : 0
}

/**
 * The free space past an element's inline-end edge before anything clips
 * it: the viewport, or the nearest ancestor that clips or scrolls
 * horizontally (at its padding edge, grown by `overflow-clip-margin` for
 * `overflow: clip`). Hanging only into that space keeps the page from
 * scrolling sideways.
 */
function roomAtInlineEnd(element: HTMLElement) {
  const rtl = getComputedStyle(element).direction === 'rtl'
  const rect = element.getBoundingClientRect()
  let limit = rtl ? 0 : document.documentElement.clientWidth
  for (let node = element.parentElement; node && node !== document.documentElement; node = node.parentElement) {
    const style = getComputedStyle(node)
    if (style.overflowX === 'visible') continue
    const box = node.getBoundingClientRect()
    const margin = style.overflowX === 'clip' ? lengthPx(style.overflowClipMargin) : 0
    limit = rtl
      ? Math.max(limit, box.left + lengthPx(style.borderLeftWidth) - margin)
      : Math.min(limit, box.right - lengthPx(style.borderRightWidth) + margin)
  }
  return rtl ? rect.left - limit : limit - rect.right
}

/**
 * Whether the header's controls hang outside the host: only where enabled
 * (two or more tabs, controls, a framed header) and the space past the
 * host's edge holds them. Elsewhere, and before hydration, they sit in the
 * header. Measured again whenever the header, the controls or the window
 * resize.
 */
function useHang(
  headerRef: React.RefObject<HTMLDivElement | null>,
  controlsRef: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
) {
  const [hang, setHang] = React.useState(false)
  React.useLayoutEffect(() => {
    const header = headerRef.current
    const controls = controlsRef.current
    if (!enabled || header == null || controls == null) {
      setHang(false)
      return undefined
    }
    // `clientWidth` leaves out the cell's start edge, so the header's cell
    // and the hung ear measure alike (a FileTabsControl: 43 or 24 px, so 45).
    const measure = () =>
      setHang(roomAtInlineEnd(header) >= Math.max(HIT_PX, controls.clientWidth) + HOST_EDGE_PX)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(header)
    observer.observe(controls)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [headerRef, controlsRef, enabled])
  return hang
}

/** Props for FileTabsList: Base UI Tabs List props; the tabs, controls and status come from the Root. */
export type FileTabsListProps = Omit<BaseTabs.List.Props, 'children'> & {
  /** The tablist's accessible name. Default `"Files"`. */
  'aria-label'?: string
}

const staticListState: BaseTabs.List.State = { orientation: 'horizontal', tabActivationDirection: 'none' }

/**
 * The header: 48 px on its `--role-rule`, the folder tabs across its full
 * width, and the Root's `status` and `controls` at its end. The tabs are
 * mono and bottom-aligned, the selected one filled with its neighbours
 * tucked under it. When they overflow, the row scrolls sideways with a thin
 * scroll line on the rule. With one tab it shows that name as a mono label
 * (no tablist); with none, only the controls and status, or nothing. Its
 * own props (`aria-label`, `className` …) go to the tablist, or to the one
 * file's label.
 */
export function FileTabsList(props: FileTabsListProps) {
  const { 'aria-label': ariaLabel = 'Files', className, style, ...rest } = props
  const { tabs, disabled, frame, controls, status } = useFileTabsContext('FileTabsList')
  const headerRef = React.useRef<HTMLDivElement | null>(null)
  const controlsRef = React.useRef<HTMLDivElement | null>(null)

  const hasControls = controls != null && typeof controls !== 'boolean'
  const hasStatus = status !== undefined
  const tablist = tabs.length > 1
  const hang = useHang(headerRef, controlsRef, tablist && hasControls && frame !== 'none')

  if (tabs.length === 0 && !hasControls && !hasStatus) return null

  let lead: React.ReactNode = null
  if (tabs.length === 1) {
    const labelClass = typeof className === 'function' ? className(staticListState) : className
    const labelStyle = typeof style === 'function' ? style(staticListState) : style
    lead = (
      <span className={cx(styles.single, labelClass)} style={labelStyle}>
        {tabs[0].name}
      </span>
    )
  } else if (tablist) {
    lead = (
      // The row scrolls natively with its scrollbar hidden: nothing is
      // reserved for it, so the tabs stay on the rule when they overflow.
      <BaseScrollArea.Root className={styles.scroller}>
        {/* The tabs are the row's focus stops, so the viewport takes none (§10.19). */}
        <BaseScrollArea.Viewport className={styles.viewport} tabIndex={-1}>
          <BaseTabs.List
            {...rest}
            aria-label={ariaLabel}
            style={style}
            className={resolveClassName(className, (extra) => cx(styles.list, extra))}
          >
            {tabs.map((tab) => (
              <FileTabsTab key={tab.id} tab={tab} disabled={disabled} />
            ))}
          </BaseTabs.List>
        </BaseScrollArea.Viewport>
        <BaseScrollArea.Scrollbar orientation="horizontal" className={styles.scrollbar}>
          <BaseScrollArea.Thumb className={styles.thumb} />
        </BaseScrollArea.Scrollbar>
      </BaseScrollArea.Root>
    )
  }

  return (
    <div
      ref={headerRef}
      className={fileTabsHeader({ frame })}
      data-tablist={tablist ? '' : undefined}
      data-hang={hang ? '' : undefined}
    >
      <div className={styles.lead}>{lead}</div>
      {hasControls || hasStatus ? (
        <div className={styles.side}>
          {/* Laid over the header's end, so its words never move the tabs.
              Mounted whenever `status` is set: it's the live region. */}
          {hasStatus ? (
            <span role="status" className={styles.status}>
              {status}
            </span>
          ) : null}
          {hasControls ? (
            <div ref={controlsRef} className={styles.controls}>
              {controls}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

/** One folder tab: a link when the file has a slug, else a button. */
function FileTabsTab(props: { tab: FileTab; disabled: boolean }) {
  const { tab, disabled } = props
  const content = (
    <span className={styles.label}>
      {tab.name}
      {disabled ? (
        <svg className={styles.edge} aria-hidden="true" focusable="false">
          <line className={styles.edgeLine} x1="0" y1="50%" x2="100%" y2="50%" />
        </svg>
      ) : null}
    </span>
  )

  if (tab.slug) {
    return (
      <BaseTabs.Tab
        value={tab.id}
        disabled={disabled}
        className={styles.tab}
        nativeButton={false}
        render={<a href={`#${tab.slug}`} onClick={handleLinkClick} />}
      >
        {content}
      </BaseTabs.Tab>
    )
  }

  return (
    <BaseTabs.Tab value={tab.id} disabled={disabled} className={styles.tab}>
      {content}
    </BaseTabs.Tab>
  )
}

/** Props for FileTabsControl: button props plus `render`. Name it with `aria-label`. */
export type FileTabsControlProps = Omit<useRender.ComponentProps<'button'>, 'className'> & {
  className?: string
}

/**
 * One header control for the Root's `controls`: a `<button>` holding an
 * icon (an `Icon` with `weight="interactive"` takes its hover weight here).
 * In the header it is a `--fgd-size-hit` cell, the header's full height.
 * Hung, it is an ear `--size-px-5` wide just outside the host's edge, with
 * its `--fgd-size-hit` hit area all past that edge and none over the tabs.
 * While its popup is open (`data-popup-open`) it shows a
 * `--border-size-2-25` bar along its foot, or, hung, the ear's own edge on
 * the `--primary1` face. As a Menu's trigger:
 * `<Menu.Trigger render={<FileTabsControl />} aria-label="More actions">`.
 */
export function FileTabsControl(props: FileTabsControlProps) {
  const { render, ref, className, ...elementProps } = props
  return useRender({
    defaultTagName: 'button',
    render,
    ref,
    props: mergeProps<'button'>({ type: 'button' }, elementProps, {
      className: cx(styles.control, className),
    }),
  })
}

/** Props for FileTabsPanel: Base UI Tabs Panel props; its value is the selected tab's. */
export type FileTabsPanelProps = Omit<BaseTabs.Panel.Props, 'value'>

const staticPanelState: BaseTabs.Panel.State = {
  hidden: false,
  orientation: 'horizontal',
  tabActivationDirection: 'none',
  transitionStatus: undefined,
}

/**
 * The panel for the selected tab: `role="tabpanel"`, labelled by the selected
 * tab, which `aria-controls` it. Its element stays the same across selections,
 * so the content inside is never remounted; empty hidden panels stand in for
 * the other tabs, so every tab's `aria-controls` resolves. With fewer than
 * two tabs it renders a plain `div` (there is no tablist to pair with).
 */
export function FileTabsPanel(props: FileTabsPanelProps) {
  const { className, style, render, keepMounted, children, ...rest } = props
  const { tabs, selected } = useFileTabsContext('FileTabsPanel')

  if (tabs.length < 2 || selected === undefined) {
    const plainClass = typeof className === 'function' ? className(staticPanelState) : className
    const plainStyle = typeof style === 'function' ? style(staticPanelState) : style
    return (
      <div {...rest} className={cx(styles.panel, plainClass)} style={plainStyle}>
        {children}
      </div>
    )
  }

  return (
    <>
      <BaseTabs.Panel
        {...rest}
        render={render}
        keepMounted={keepMounted}
        value={selected}
        style={style}
        className={resolveClassName(className, (extra) => cx(styles.panel, extra))}
      >
        {children}
      </BaseTabs.Panel>
      {tabs.map((tab) =>
        tab.id === selected ? null : (
          <BaseTabs.Panel key={tab.id} value={tab.id} keepMounted className={styles.panel} />
        )
      )}
    </>
  )
}
