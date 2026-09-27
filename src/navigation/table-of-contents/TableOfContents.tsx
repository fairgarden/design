'use client'

import * as React from 'react'
import { Popover as BasePopover } from '@base-ui/react/popover'
import { cva, type VariantProps } from 'class-variance-authority'

import { Link } from '../../actions/link'
import { Icon, iconHost } from '../../foundations/icon'
import { OutlineMorphFrame, useOutlineMorph } from '../../foundations/outline-morph'
import { cx } from '../../utils/className'
import {
  OVERLAY_COLLISION_PADDING,
  OVERLAY_SIDE_OFFSET,
  OverlayScope,
  overlayAttributes,
  overlayScaleClassName,
} from '../../utils/overlay'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './table-of-contents.module.css'

/*
 * Table of Contents (§9.16) [D202, D203]: the page's "On this page" list,
 * the docs layout's right column; and, as `kind="bar"`, the compact bar
 * the layout pins at the top of the page below that column's threshold.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: table-of-contents.module.css; CVA function `tableOfContents`.
 * - Axes: `kind` → list | bar → kindList, kindBar (the root: the nav, or
 *   the bar's box); `primary`, `secondary` → scales module classes.
 * - Compound variants: none. Defaults: kind list; color axes none.
 * - Color fallback: inherits the scope; the bar's panel is a portaled
 *   `white` overlay scope (§10.1).
 * - States: entries are Link `kind="nav"` with `list`: `:hover` →
 *   --role-link-hover only (plus the underline where it is --primary12)
 *   [D181]; `aria-current="location"` (the section in view, `activeId`) →
 *   the --border-size-2-25 start-edge bar over the guide and weight 700,
 *   whose box every entry reserves, so scrollspy never rewraps a line;
 *   `:focus-visible` → the ring, inset inside the row. Bar trigger:
 *   `:hover` → the field edge steps to --primary12 [D140];
 *   `data-popup-open` → the edge --primary12 and the chevron turned;
 *   `:focus-visible` → the ring. The panel opens and closes by the outline
 *   morph or at once [D205]; `data-outline-morph` → its edge takes its face
 *   while the morph draws the frame [D204].
 * - Parts: base (the nav, or the bar's box), heading, list, item, link,
 *   label, labelText; the bar's trigger, barLabel, barTitle, barChevron,
 *   positioner, panel, panelScroll, visuallyHidden.
 * - Scope: none; the panel declares the overlay's `white` scope.
 * - Container: none; its host sets its width (the docs layout's column, or
 *   the page column for the bar).
 * - Data: `items` is plain data ({ id, title, level }), the page's
 *   headings, so it can come from the docs engine (utils/docs, planned) or
 *   from the rendered page.
 * - Outline morph [D204]: with `kind="bar"`, on by default (`morph={false}`
 *   opts out; `--fgd-outline-morph: none` for a subtree): the bar's ring
 *   or edge grows into the panel's frame and back
 *   (foundations/outline-morph), as the Select and the Section Bar's Jump
 *   to do.
 */
export const tableOfContents = cva(styles.base, {
  variants: {
    kind: {
      list: styles.kindList,
      bar: styles.kindBar,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'list',
  },
})

type TableOfContentsVariants = VariantProps<typeof tableOfContents>

/** How the contents draw: the full list, or the compact bar that opens it. */
export type TableOfContentsKind = NonNullable<TableOfContentsVariants['kind']>

/** Heading levels the list shows: H2 at its top level, H3 and H4 nested under it. */
export type TableOfContentsLevel = 2 | 3 | 4

/** One heading on the page. */
export interface TableOfContentsItem {
  /** The heading's `id`: the entry links to `#id`. */
  id: string
  /** The heading's text. */
  title: string
  /** The heading level: 2, 3 or 4. */
  level: TableOfContentsLevel
}

/**
 * What a host tells the contents inside it. The docs layout sets
 * `kind: 'bar'` where it pins the compact bar (below --xl-n-above), so
 * the one `toc` it is given draws as the column there and as the bar here.
 */
export interface TableOfContentsContextValue {
  /** The kind to draw when the component names none. */
  kind?: TableOfContentsKind
  /** Hides the list's visible heading; it stays the landmark's name. */
  labelHidden?: boolean
}

/** Provided by a host of the contents, such as the docs layout. */
export const TableOfContentsContext = React.createContext<TableOfContentsContextValue>({})
TableOfContentsContext.displayName = 'TableOfContentsContext'

/** Props for TableOfContents: `nav` props, the headings, the section in view, the kind and the color axes. */
export type TableOfContentsProps = Omit<React.ComponentPropsWithRef<'nav'>, 'children'> & {
    /** The page's headings in order, levels 2–4 (a level-3 nests under the level-2 before it). */
    items: readonly TableOfContentsItem[]
    /**
     * The id of the section in view: its entry takes `aria-current="location"`,
     * and the bar names it. Pass `useActiveHeading(ids)` for scrollspy.
     * Omitted, no entry is marked and the bar names the first section.
     */
    activeId?: string
    /** The visible heading (the bar's label) and the landmark's name. Default "On this page". */
    label?: string
    /**
     * `list` (default): the full list. `bar`: one line naming the section in
     * view, which opens the list in an anchored panel. Omitted, a host's
     * `TableOfContentsContext` may set it (the docs layout does).
     */
    kind?: TableOfContentsVariants['kind']
    /**
     * With `kind="bar"`: the outline morph, the bar's ring or edge growing
     * into the panel's frame on open and back on close [D204]. Default
     * `true`; it never runs under reduced motion, in forced colors or in
     * print.
     */
    morph?: boolean
    /** Builds each anchor. Default: a plain `<a href="#id">`, which scrolls and writes the hash. */
    renderLink?: (href: string) => React.ReactElement
    /** Override the scope's primary. Never defaulted [D133]. */
    primary?: TableOfContentsVariants['primary']
    /** Override the scope's secondary. Never defaulted. */
    secondary?: TableOfContentsVariants['secondary']
  }

interface Node {
  item: TableOfContentsItem
  children: Node[]
}

/** Nests the flat heading list: each entry under the nearest shallower one before it. */
function toTree(items: readonly TableOfContentsItem[]): Node[] {
  const roots: Node[] = []
  const stack: Node[] = []
  for (const item of items) {
    const node: Node = { item, children: [] }
    while (stack.length > 0 && stack[stack.length - 1].item.level >= item.level) stack.pop()
    const parent = stack[stack.length - 1]
    if (parent) parent.children.push(node)
    else roots.push(node)
    stack.push(node)
  }
  return roots
}

/** The heading a followed entry lands on, made focusable (as the Section Bar's Jump list does). */
function headingFor(id: string): HTMLElement | null {
  if (typeof document === 'undefined') return null
  const target = document.getElementById(id)
  if (target == null) return null
  if (!target.hasAttribute('tabindex') && !target.matches('a[href], button, input, select, textarea')) {
    target.setAttribute('tabindex', '-1')
  }
  return target
}

interface ContentsListProps {
  items: readonly TableOfContentsItem[]
  activeId: string | undefined
  label: string
  labelHidden: boolean
  renderLink: ((href: string) => React.ReactElement) | undefined
  /** Called when an entry is followed (the bar closes its panel). */
  onFollow?: (id: string) => void
  className: string
  rootProps?: Omit<React.ComponentPropsWithRef<'nav'>, 'children' | 'className'>
}

/** The list: a `nav` named by its heading (or `aria-label`), over the nested `ol` of entries. */
function ContentsList(props: ContentsListProps) {
  const { items, activeId, label, labelHidden, renderLink, onFollow, className, rootProps } = props
  const headingId = React.useId()
  const tree = React.useMemo(() => toTree(items), [items])

  const renderNodes = (nodes: Node[]) => (
    <ol className={styles.list}>
      {nodes.map(({ item, children }) => {
        const href = `#${item.id}`
        return (
          <li key={item.id} className={styles.item}>
            <Link
              kind="nav"
              list
              href={href}
              render={renderLink?.(href)}
              aria-current={item.id === activeId ? 'location' : undefined}
              onClick={onFollow ? () => onFollow(item.id) : undefined}
              className={styles.link}
            >
              <span className={styles.label} data-label={item.title}>
                <span className={styles.labelText}>{item.title}</span>
              </span>
            </Link>
            {children.length > 0 ? renderNodes(children) : null}
          </li>
        )
      })}
    </ol>
  )

  return (
    <nav
      {...rootProps}
      {...(labelHidden ? { 'aria-label': label } : { 'aria-labelledby': headingId })}
      className={className}
    >
      {labelHidden ? null : (
        <p id={headingId} className={styles.heading}>
          {label}
        </p>
      )}
      {renderNodes(tree)}
    </nav>
  )
}

/**
 * The page's contents [D202, D203].
 *
 * `kind="list"` (default): a `nav` named by its caps heading (`type-label`)
 * over an `ol` of in-page links in `type-caption`, H2s at the top level and
 * H3 and H4 nested on the --role-hairline guide. The section in view
 * (`activeId`) takes `aria-current="location"`, the --border-size-2-25
 * start-edge bar and weight 700; every entry reserves that weight's box, so
 * marking a section never moves the list.
 *
 * `kind="bar"`: one field-box line, "On this page" and the section in view
 * (the first before scrollspy runs), truncated, with a chevron. It opens
 * the same list in an anchored panel about a third of the viewport tall,
 * scrolled inside so the section in view sits centered and marked, with
 * focus on it; following an entry goes to its heading and closes the
 * panel; Escape and an outside press close it and focus returns to the
 * bar. The bar's ring or edge morphs into the panel's frame [D204].
 *
 * Presentational: pair it with `useActiveHeading` for scrollspy. The docs
 * layout shows the list in a sticky column from --xl-n-above and the bar,
 * pinned under the header, below. With no items it renders nothing. Hidden
 * in print.
 */
export function TableOfContents(props: TableOfContentsProps) {
  const {
    items,
    activeId,
    label = 'On this page',
    kind: kindProp,
    morph = true,
    renderLink,
    primary,
    secondary,
    className,
    ref,
    ...rest
  } = props

  const scope = useScopeAttributes()
  const context = React.useContext(TableOfContentsContext)
  const kind: TableOfContentsKind = kindProp ?? context.kind ?? 'list'

  if (items.length === 0) return null

  if (kind === 'bar') {
    return (
      <ContentsBar
        items={items}
        activeId={activeId}
        label={label}
        morph={morph}
        renderLink={renderLink}
        className={tableOfContents({ kind, primary, secondary, className })}
        scope={scope}
        rootRef={ref as React.Ref<HTMLDivElement> | undefined}
        rootProps={rest as React.ComponentPropsWithoutRef<'div'>}
      />
    )
  }

  return (
    <ContentsList
      items={items}
      activeId={activeId}
      label={label}
      labelHidden={context.labelHidden ?? false}
      renderLink={renderLink}
      className={tableOfContents({ kind, primary, secondary, className })}
      rootProps={{ ...rest, ...scope, ref }}
    />
  )
}

interface ContentsBarProps {
  items: readonly TableOfContentsItem[]
  activeId: string | undefined
  label: string
  morph: boolean
  renderLink: ((href: string) => React.ReactElement) | undefined
  className: string
  scope: ReturnType<typeof useScopeAttributes>
  rootRef: React.Ref<HTMLDivElement> | undefined
  rootProps: React.ComponentPropsWithoutRef<'div'>
}

/** `kind="bar"`: the one-line trigger and its anchored panel. */
function ContentsBar(props: ContentsBarProps) {
  const { items, activeId, label, morph, renderLink, className, scope, rootRef, rootProps } = props
  const [open, setOpen] = React.useState(false)
  const refs = useOutlineMorph({ open, enabled: morph })
  const panelId = React.useId()
  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  const pendingFocus = React.useRef<HTMLElement | null>(null)

  // Before scrollspy runs (and on the server), the first section.
  const current = items.find((item) => item.id === activeId) ?? items[0]

  const follow = React.useCallback((id: string) => {
    pendingFocus.current = headingFor(id)
    setOpen(false)
  }, [])

  return (
    <div {...rootProps} {...scope} ref={rootRef} className={className}>
      <BasePopover.Root open={open} onOpenChange={(next) => setOpen(next)}>
        <BasePopover.Trigger
          ref={morph ? refs.sourceRef : undefined}
          aria-controls={open ? panelId : undefined}
          className={cx(styles.trigger, iconHost)}
        >
          <span className={styles.barLabel}>{label}</span>
          <span className={styles.visuallyHidden}>: </span>
          <span className={styles.barTitle}>{current.title}</span>
          <Icon name="expand_more" weight="interactive" className={styles.barChevron} />
        </BasePopover.Trigger>
        <BasePopover.Portal>
          <BasePopover.Positioner
            className={styles.positioner}
            side="bottom"
            align="start"
            sideOffset={OVERLAY_SIDE_OFFSET}
            collisionPadding={OVERLAY_COLLISION_PADDING}
          >
            <BasePopover.Popup
              ref={morph ? refs.targetRef : undefined}
              id={panelId}
              {...overlayAttributes}
              aria-label={label}
              className={cx(styles.panel, overlayScaleClassName)}
              initialFocus={() => {
                const scroller = scrollRef.current
                return (
                  scroller?.querySelector<HTMLElement>('a[aria-current="location"]') ??
                  scroller?.querySelector<HTMLElement>('a[href]') ??
                  true
                )
              }}
              finalFocus={() => {
                const element = pendingFocus.current
                pendingFocus.current = null
                return element ?? true
              }}
            >
              <OverlayScope>
                <PanelScroll scrollRef={scrollRef}>
                  <ContentsList
                    items={items}
                    activeId={current.id}
                    label={label}
                    labelHidden
                    renderLink={renderLink}
                    onFollow={follow}
                    className={cx(styles.base, styles.kindList)}
                  />
                </PanelScroll>
              </OverlayScope>
            </BasePopover.Popup>
            {morph ? <OutlineMorphFrame ref={refs.frameRef} /> : null}
          </BasePopover.Positioner>
        </BasePopover.Portal>
      </BasePopover.Root>
      {/* The section in view, announced politely once per change, as the Section Bar's Jump label [D184]. */}
      <span className={styles.visuallyHidden} aria-live="polite" aria-atomic="true">
        {current.title}
      </span>
    </div>
  )
}

/**
 * The panel's scroller. On mount it scrolls itself, never the page, so the
 * section in view sits centered; the panel's height is final before it
 * paints (its fallback cap), and a second pass a frame later follows the
 * positioner's measured room.
 */
function PanelScroll({
  scrollRef,
  children,
}: {
  scrollRef: React.RefObject<HTMLDivElement | null>
  children: React.ReactNode
}) {
  React.useLayoutEffect(() => {
    const center = () => {
      const scroller = scrollRef.current
      const link = scroller?.querySelector<HTMLElement>('a[aria-current="location"]')
      if (scroller == null || link == null) return
      const box = scroller.getBoundingClientRect()
      const target = link.getBoundingClientRect()
      scroller.scrollTop += target.top - box.top - (box.height - target.height) / 2
    }
    center()
    const frame = window.requestAnimationFrame(center)
    return () => window.cancelAnimationFrame(frame)
  }, [scrollRef])

  return (
    <div ref={scrollRef} className={styles.panelScroll}>
      {children}
    </div>
  )
}
