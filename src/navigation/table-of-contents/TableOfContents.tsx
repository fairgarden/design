'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { Link } from '../../actions/link'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './table-of-contents.module.css'

/*
 * Table of Contents (§9.16) [D202]: the page's "On this page" list, the
 * docs layout's right column.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: table-of-contents.module.css; CVA function `tableOfContents`.
 * - Axes: `primary`, `secondary` → scales module classes.
 * - Compound variants: none. Defaults: none; color axes none.
 * - Color fallback: inherits the scope.
 * - States: entries are Link `kind="nav"` with `list`: `:hover` →
 *   --role-link-hover only (plus the underline where it is --primary12)
 *   [D181]; `aria-current="location"` (the section in view, `activeId`) →
 *   the --border-size-2-25 start-edge bar over the guide and weight 700,
 *   whose box every entry reserves, so scrollspy never rewraps a line;
 *   `:focus-visible` → the ring, inset inside the row.
 * - Parts: base (the nav), heading, list, item, link, label, labelText.
 * - Scope: none. Container: none; its column sets its width, and the docs
 *   layout makes that column sticky.
 * - Data: `items` is plain data ({ id, title, level }), the page's
 *   headings, so it can come from the docs engine (utils/docs, planned) or
 *   from the rendered page.
 */
export const tableOfContents = cva(styles.base, {
  variants: {
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
})

type TableOfContentsVariants = VariantProps<typeof tableOfContents>

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
 * What a host tells the lists inside it. The docs layout sets `labelHidden`
 * in its "On this page" disclosure, whose trigger already says it.
 */
export interface TableOfContentsContextValue {
  /** Hides the visible heading; it stays the landmark's name. */
  labelHidden?: boolean
}

/** Provided by a host of the list, such as the docs layout's disclosure. */
export const TableOfContentsContext = React.createContext<TableOfContentsContextValue>({})
TableOfContentsContext.displayName = 'TableOfContentsContext'

/** Props for TableOfContents: `nav` props, the headings, the section in view and the color axes. */
export type TableOfContentsProps = Omit<React.ComponentPropsWithRef<'nav'>, 'children'> &
  TableOfContentsVariants & {
    /** The page's headings in order, levels 2–4 (a level-3 nests under the level-2 before it). */
    items: readonly TableOfContentsItem[]
    /**
     * The id of the section in view: its entry takes `aria-current="location"`.
     * Pass `useActiveHeading(ids)` for scrollspy. Omitted, no entry is marked.
     */
    activeId?: string
    /** The visible heading and the landmark's name. Default "On this page". */
    label?: string
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

/**
 * The page's "On this page" list [D202]: a `nav` named by its caps heading
 * (`type-label`) over an `ol` of in-page links in `type-caption`, H2s at
 * the top level and H3 and H4 nested on the --role-hairline guide. The
 * section in view (`activeId`) takes `aria-current="location"`, the
 * --border-size-2-25 start-edge bar and weight 700; every entry reserves
 * that weight's box, so marking a section never moves the list.
 * Presentational: pair it with `useActiveHeading` for scrollspy. The docs
 * layout shows it in a sticky column from --xl-n-above and in an "On this
 * page" disclosure below. Hidden in print.
 */
export function TableOfContents(props: TableOfContentsProps) {
  const {
    items,
    activeId,
    label = 'On this page',
    renderLink,
    primary,
    secondary,
    className,
    ...rest
  } = props

  const scope = useScopeAttributes()
  const { labelHidden } = React.useContext(TableOfContentsContext)
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
      {...rest}
      {...scope}
      {...(labelHidden ? { 'aria-label': label } : { 'aria-labelledby': headingId })}
      className={tableOfContents({ primary, secondary, className })}
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
