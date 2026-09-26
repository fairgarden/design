'use client'

import * as React from 'react'
import { mergeProps } from '@base-ui/react/merge-props'
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
 * File tabs: paper-style folder tabs over a package of static documents
 * kept together (a grant packet, a lease, a year of minutes), each tab a
 * standalone document sharing one panel, with optional controls and a busy
 * status at the header's end. Tabs (§9.5) switch views or sections of one
 * thing; these take any number of documents, can be deep links, and label
 * them in the UI face (`mono` for file names). Code Block and Demo render
 * their headers through it for code files, with `mono`. It is
 * presentational and needs no docs engine.
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
 *   --radius-2-75 top radii (the paper-tab radius, as the first and last
 *   tabs' outer corners), a --role-select-text-label label at
 *   --font-weight-7, its neighbours tucked under it; `:active` on it → the
 *   radii grow (motion OK only); `:hover` on the others → the bare-text
 *   underline (--role-accent at --border-size-2, offset --size-px-1)
 *   [D181]; `:active` on the others → a --border-size-2 --primary12 line
 *   under the label; `:focus-visible` → the ring inside the hit area;
 *   `data-disabled` → --role-muted label and a `line-dotted-fine` underline,
 *   the selected tab keeping its shape on a --primary1 face [D16, D85].
 *   The header: `data-tablist` (two or more documents) → the bar leaves the
 *   flow and the tablist becomes the tabs' native scroll row (and small
 *   controls' cell takes a --role-rule start edge). A FileTabsControl in
 *   `controls` → the header's end always hangs outside the host's
 *   inline-end edge (CSS `:has()`, nothing measured). FileTabsControl:
 *   `:hover` / `:focus-visible` → at once, the ear drawn in --primary12 on
 *   the --role-soft-hover fill [D181]; `aria-expanded="true"` (its menu
 *   open; never its tooltip's `data-popup-open`) → the ear on the
 *   --primary1 face; disabled → --role-muted.
 * - Parts: base, header, bar (the row inside it, which draws the host's
 *   side edges), lead (the tabs or the one document's label), list (the
 *   tabs' native scroll row), tab, label, edge / edgeLine (the disabled
 *   underline), single (the lone document's label), side (the header's end),
 *   status, controls (their cell), control (FileTabsControl), panel.
 * - Scope: none.
 * - Container: none; the tabs scroll sideways in their native scroll row
 *   when they overflow. The host leaves --fgd-size-file-tabs-control free
 *   past its inline-end edge, unclipped, for the hanging ⋮.
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

/** One tab: a document in the package. */
export type FileTab = {
  /** The tab's value, unique within `tabs`. A code block passes the file name. */
  id: string
  /** The label: the document's short title (a file name in a code block). UI face at the caption size, not caps; mono with `mono`. */
  name: string
  /**
   * Deep-link slug. The tab renders as `<a href="#slug">` (`nativeButton={false}`).
   * A plain click selects the tab and `preventDefault()`s the anchor, so the page
   * doesn't jump and the hash isn't written. A modifier click (Ctrl, Cmd, Alt or
   * Shift) opens the link and leaves the selection alone.
   */
  slug?: string
}

/** Props for FileTabs: Base UI Tabs Root props (without its value props and `orientation`) plus the documents, the header's frame, controls, status and label face, and the color axes. */
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
   * Labels in mono (`type-data`, §3.11) instead of the UI face: for file
   * names, e.g. code. Code Block and Demo set it. Default `false`.
   */
  mono?: boolean
  /**
   * Where the header sits. Its host is the bordered box it opens: a
   * `--border-size-1` edge, no padding, a `--primary1` face and no clip,
   * such as Code Block's frame, or the Root itself given a frame class.
   * `'top'`: at the top of the host, whose top corners take
   * `--radius-2-25` (a host with another radius sets `--file-tabs-host-radius`
   * on the Root). The tab strip runs out over the host's side edges by
   * their width, so an end tab's edge is the host's edge, its paper-tab
   * corner leaving that line below the host's corner; the side edges are
   * drawn again over the header from below the host's corner radius, so
   * scrolled tabs and the ends of the strip's native scrollbar pass under
   * them; a `FileTabsControl` hangs outside.
   * `'joined'`: the same, in a part of the host below another (Demo's
   * code); the header draws the `--role-rule` that joins the part above,
   * and the side edges run from it. `'none'`: no host frame (tabs over
   * their panel on the page); the strip stays inside the header, the end
   * tabs show their own edges, and a `FileTabsControl` hangs past the
   * header's own end. Default `'top'`.
   */
  frame?: FileTabsFrame
  /**
   * Controls at the header's end: a `FileTabsControl` (a Menu's ⋮ trigger)
   * or a few small icon Buttons.
   * - A `FileTabsControl` always hangs just outside the host's inline-end
   *   edge (past the header's own end with `frame="none"`) with zero layout
   *   width, whatever the tab count, so the tabs keep the whole header. Its
   *   hit area, `--fgd-size-hit`, extends outward into the gutter, never
   *   over the tabs. **The host must leave `--fgd-size-file-tabs-control`
   *   (24 px) free past its edge, unclipped** (or inside an
   *   `overflow-clip-margin`); where the page ends sooner, clip it sideways
   *   (`overflow-x: clip`) so the rest of the hit area can't scroll it.
   * - Small icon Buttons sit in the header: beside the one document's label,
   *   wrapping onto a second row when they can't share its line; with
   *   several documents, in a `--fgd-size-hit` cell at the header's end with a
   *   `--role-rule` start edge, where the tabs end.
   * Hidden in print.
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
  mono: boolean
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
 * `frame`, `controls`, `status` and `mono`, and wraps both the header
 * (`FileTabsList`) and `FileTabsPanel`. Tabs with a `slug` are deep links:
 * a plain click selects the document, a modifier click opens the link and
 * leaves the selection.
 */
export function FileTabs(props: FileTabsProps) {
  const {
    tabs,
    value,
    defaultValue,
    onValueChange,
    disabled = false,
    mono = false,
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
    () => ({ tabs, selected, disabled, mono, frame, controls, status }),
    [tabs, selected, disabled, mono, frame, controls, status],
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

/** Props for FileTabsList: Base UI Tabs List props; the tabs, controls and status come from the Root. */
export type FileTabsListProps = Omit<BaseTabs.List.Props, 'children'> & {
  /** The tablist's accessible name. Default `"Documents"` (Code Block passes `"Files"`). */
  'aria-label'?: string
}

const staticListState: BaseTabs.List.State = { orientation: 'horizontal', tabActivationDirection: 'none' }

/**
 * The header: 56 px with its `--role-rule`, the folder tabs across its full
 * width under 12 px of room, running over the rule, and the Root's
 * `status` and `controls` at its end. The labels take the UI face (mono
 * with `mono`), the selected tab filled with its neighbours tucked under it. When they overflow, their
 * row scrolls sideways with its native scrollbar, which hangs just below
 * the header (or overlays the strip's foot, where scrollbars overlay), so
 * the tabs never lift off the rule. With one tab it shows that name as a
 * label (no tablist); with none, only the controls and status, or
 * nothing. Its own props (`aria-label`, `className` …) go to the tablist,
 * or to the one document's label.
 */
export function FileTabsList(props: FileTabsListProps) {
  const { 'aria-label': ariaLabel = 'Documents', className, style, ...rest } = props
  const { tabs, disabled, mono, frame, controls, status } = useFileTabsContext('FileTabsList')

  const hasControls = controls != null && typeof controls !== 'boolean'
  const hasStatus = status !== undefined
  const tablist = tabs.length > 1

  if (tabs.length === 0 && !hasControls && !hasStatus) return null

  let lead: React.ReactNode = null
  if (tabs.length === 1) {
    const labelClass = typeof className === 'function' ? className(staticListState) : className
    const labelStyle = typeof style === 'function' ? style(staticListState) : style
    lead = (
      <span className={cx(styles.single, mono ? styles.singleMono : styles.singleUi, labelClass)} style={labelStyle}>
        {tabs[0].name}
      </span>
    )
  } else if (tablist) {
    // The tablist is the tabs' native scroll row (the header's
    // `data-tablist` styles it): Base UI scrolls it to bring each tab into
    // view as arrow keys move focus.
    lead = (
      <BaseTabs.List
        {...rest}
        aria-label={ariaLabel}
        style={style}
        className={resolveClassName(className, (extra) => cx(styles.list, extra))}
      >
        {tabs.map((tab) => (
          <FileTabsTab key={tab.id} tab={tab} disabled={disabled} mono={mono} />
        ))}
      </BaseTabs.List>
    )
  }

  return (
    <div
      className={fileTabsHeader({ frame })}
      data-tablist={tablist ? '' : undefined}
    >
      <div className={styles.bar}>
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
              <div className={styles.controls}>
                {controls}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

/** One folder tab: a link when the document has a slug, else a button. */
function FileTabsTab(props: { tab: FileTab; disabled: boolean; mono: boolean }) {
  const { tab, disabled, mono } = props
  const content = (
    <span className={cx(styles.label, mono ? styles.labelMono : styles.labelUi)} data-label={tab.name}>
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
 * icon (an `Icon` with `weight="interactive"` takes its hover weight here;
 * the ⋮ is `more_vert` at the tag tier, `size="tag"`, 20 px).
 * It always hangs outside the host's inline-end edge: an ear `--size-px-4`
 * wide from the host's edge line, from the host's top edge to the header
 * rule's foot, with its `--fgd-size-hit` hit area past that edge and none
 * over the tabs; the host leaves `--fgd-size-file-tabs-control` free there.
 * Hovered or focused, the ear shows at once, drawn in `--primary12` on the
 * `--role-soft-hover` fill (at the top of a rounded host, wrapping the
 * host's top-end corner, so the outline runs unbroken round both); while its popup is open (`aria-expanded="true"`;
 * a tooltip's `data-popup-open` changes nothing), on the `--primary1` face.
 * As a Menu's trigger:
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
