'use client'

import * as React from 'react'
import { Button as BaseButton } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { Button } from '../../actions/button'
import { ScrollArea } from '../scroll-area'
import { cx } from '../../utils/className'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './table.module.css'

/*
 * Table (§8.2): composed from semantic `table`, `caption`, `thead`, `tbody`,
 * `tfoot` and `th scope`, inside a Scroll Area at every width [D163].
 *
 * Implementation (CSS Modules + CVA)
 * - Module: table.module.css; CVA function `table`.
 * - Axes: `strategy` → stack | fit | scroll | prioritize (the §8.2
 *   responsive strategy, one per table); `grid` → `grid` (the matrix grid,
 *   matrices only); `density` → compact | default (`compact`,
 *   `densityDefault`); `interactive` → `interactive` (rows are click
 *   targets); `onSolid` → `onSolid` (≤ 5 rows on a saturated ground: dotted
 *   row rules); `primary`, `secondary` → scales module classes.
 * - Compound variants: none.
 * - Defaults: strategy stack, grid/interactive/onSolid false; density and
 *   color axes none [D133].
 * - Color fallback: inherits the scope; the table has no secondary part
 *   except a selection Checkbox, which follows §10.
 * - States: `expanded` (prioritize: the optional columns shown; a CVA
 *   state class, the root is not Base UI-managed); TableRow `selected` or
 *   a descendant `data-checked`, and `:target` → `rowBar`; `:target` also
 *   sets the row header in weight 700; TableRow `inactive` → --role-muted;
 *   the sort Button `:hover` (not disabled) → the bare-text underline on the
 *   label (--role-accent, --border-size-2, offset --size-px-1) [D181], `:active` →
 *   inverse pair, `:focus-visible` → ring; the Scroll Area root's
 *   `data-overflow-x-start` → the pinned column's edge.
 * - Parts: base, region (the Scroll Area root; `pinned` in the scroll
 *   strategy, where the first column stays in view), cue, toggle, frame (the
 *   `table`: top and bottom rules), caption, captionInner, captionLabel,
 *   captionTitle, captionNote, headerRule (`thead`), body, cadence (a
 *   `tbody` of more than 10 rows), totalRule (`tfoot`), row, headCell,
 *   rowHeader, cell, lead (each row's first cell), rowBar, numeric,
 *   optional, cellLabel, cellValue, sortButton, sortLabel, sortGlyph,
 *   sortState, notes.
 * - Scope: none.
 * - Container: `base` is an inline-size container. Records (`stack`) show
 *   as blocks below 768 px of it and as a table from 768; baseline without
 *   support: stacked below --md-n-above (screen only). Print always shows
 *   the full table with its header row repeated.
 */
export const table = cva(styles.base, {
  variants: {
    strategy: {
      stack: styles.stack,
      fit: styles.fit,
      scroll: styles.scroll,
      prioritize: styles.prioritize,
    },
    grid: {
      true: styles.grid,
    },
    density: {
      compact: styles.compact,
      default: styles.densityDefault,
    },
    interactive: {
      true: styles.interactive,
    },
    onSolid: {
      true: styles.onSolid,
    },
    expanded: {
      true: styles.expanded,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    strategy: 'stack',
    grid: false,
    interactive: false,
    onSolid: false,
    expanded: false,
  },
})

type TableVariants = VariantProps<typeof table>

/** The column's sort state, mirrored to `aria-sort`. */
export type TableSort = 'ascending' | 'descending' | 'none'

type Section = 'head' | 'body' | 'foot'

interface TableContextValue {
  /** Header labels by column index, repeated in stacked records. */
  columnLabels: readonly React.ReactNode[]
}

const TableContext = React.createContext<TableContextValue>({ columnLabels: [] })
const SectionContext = React.createContext<Section>('body')
const ColumnContext = React.createContext<number>(-1)

/** Props for Table: `table` props, the strategy, density and color axes, and the chrome around the table. */
export type TableProps = Omit<React.ComponentPropsWithRef<'table'>, 'className'> & {
  /** Class for the root wrapper (the container that holds the cue, the Scroll Area and the notes). */
  className?: string
  /**
   * The responsive strategy (§8.2), one per table. `stack` (default, for
   * records): below 768 px of the table's width each row becomes a block,
   * its row header over a leader list of header → value. `fit`: ≤ 4 short
   * columns, a table at every width. `scroll`: comparison matrices; the
   * first column stays pinned while the rest scrolls. `prioritize`: cells
   * marked `optional` hide behind a "Show All n Columns" toggle; they always
   * print.
   */
  strategy?: TableVariants['strategy']
  /** The full matrix grid (`--border-size-1` `--role-rule`), for matrices only: marks in cells, centered headers. */
  grid?: boolean
  /**
   * `compact`: `--size-px-2` × `--size-px-2-5` cell padding, rows at least
   * 32 px, `--role-rule` row rules. `default`: `--size-px-2-5` ×
   * `--size-px-3`. Never defaulted: omitted, the table follows its scope's
   * density (a Ground's `density`, through the `--fgd-table-*` tokens).
   */
  density?: TableVariants['density']
  /** Rows are click targets: `--role-rule` row rules and rows at least 44 px tall. */
  interactive?: boolean
  /**
   * The table sits on a saturated ground (≤ 5 rows, one ink): row rules
   * become `line-dotted-fine` in `--role-rule`. Longer data belongs on a
   * nested `white` Ground.
   */
  onSolid?: boolean
  /**
   * Primary Radix scale: every rule, text and the row bar. Never defaulted;
   * omitted, it inherits the scope [D133].
   */
  primary?: TableVariants['primary']
  /** Secondary Radix scale: unused by the table itself. Never defaulted. */
  secondary?: TableVariants['secondary']
  /**
   * A text cue above a table that scrolls, e.g. "Scroll for 3 more columns
   * →". Shown only while the table overflows.
   */
  scrollCue?: React.ReactNode
  /** `prioritize` only: the toggle label while optional columns are hidden. Default "Show All n Columns". */
  showAllLabel?: string
  /** `prioritize` only: the toggle label while they show. Default "Show Fewer Columns". */
  showFewerLabel?: string
  /**
   * Notes below the table, kept in its own notes block: "Source:" and
   * "Note:" lines in `type-small` and lettered cell notes (§8.12). Define
   * "—" (empty cell) here.
   */
  notes?: React.ReactNode
}

/**
 * A three-rule data table: a `--border-size-2` `--primary12` frame above and
 * below, a `--border-size-1` `--primary12` header rule and hairline row rules,
 * with no verticals and no zebra stripes [D83]. More than 10 body rows switch
 * to the five-row cadence. Text cells wrap and are never truncated; numbers
 * are right-aligned lining tabular figures; an empty cell shows "—".
 *
 * Compose `TableCaption`, `TableHead`, `TableBody` and `TableFoot` inside;
 * rows are `TableRow`, cells `TableHeaderCell` and `TableCell`.
 */
export function Table(props: TableProps) {
  const {
    className,
    strategy,
    grid,
    density,
    interactive,
    onSolid,
    primary,
    secondary,
    scrollCue,
    showAllLabel,
    showFewerLabel,
    notes,
    id,
    children,
    ...rest
  } = props

  const scope = useScopeAttributes()
  const generatedId = React.useId()
  const tableId = id ?? `table-${generatedId}`
  const [expanded, setExpanded] = React.useState(false)

  const columnLabels = React.useMemo(() => readColumnLabels(children), [children])
  const context = React.useMemo(() => ({ columnLabels }), [columnLabels])
  const prioritized = strategy === 'prioritize'

  return (
    <div
      {...scope}
      className={table({
        strategy,
        grid,
        density,
        interactive,
        onSolid,
        expanded: prioritized && expanded,
        primary,
        secondary,
        className,
      })}
    >
      {prioritized ? (
        <div className={styles.toggle}>
          <Button
            variant="text"
            icon="expand_more"
            iconPosition="end"
            aria-expanded={expanded}
            aria-controls={tableId}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded
              ? (showFewerLabel ?? 'Show Fewer Columns')
              : (showAllLabel ?? `Show All ${columnLabels.length} Columns`)}
          </Button>
        </div>
      ) : null}
      {scrollCue == null ? null : <p className={styles.cue}>{scrollCue}</p>}
      <ScrollArea
        kind="wide"
        className={strategy === 'scroll' ? `${styles.region} ${styles.pinned}` : styles.region}
      >
        <TableContext.Provider value={context}>
          <table {...rest} id={tableId} className={styles.frame}>
            {children}
          </table>
        </TableContext.Provider>
      </ScrollArea>
      {notes == null ? null : <div className={styles.notes}>{notes}</div>}
    </div>
  )
}

/** Props for TableCaption: `caption` props plus the label and the scope note. */
export type TableCaptionProps = React.ComponentPropsWithRef<'caption'> & {
  /** The table label, e.g. "Table 2", in `type-data`. */
  label?: React.ReactNode
  /** A scope note for units or time zone, in `type-caption`. */
  note?: React.ReactNode
}

/**
 * The caption block above the table: label ("Table 2"), title (the
 * children, `type-subhead`) and an optional scope note. It stays in view
 * while a wide table scrolls.
 */
export function TableCaption(props: TableCaptionProps) {
  const { label, note, className, children, ...rest } = props
  return (
    <caption {...rest} className={cx(styles.caption, className)}>
      <span className={styles.captionInner}>
        {label == null ? null : <span className={styles.captionLabel}>{label}</span>}
        {children == null ? null : <span className={styles.captionTitle}>{children}</span>}
        {note == null ? null : <span className={styles.captionNote}>{note}</span>}
      </span>
    </caption>
  )
}

/** Props for TableHead: `thead` props. */
export type TableHeadProps = React.ComponentPropsWithRef<'thead'>

/** The header row group; its last row carries the header rule. Repeats on every printed page. */
export function TableHead(props: TableHeadProps) {
  const { className, ...rest } = props
  return (
    <SectionContext.Provider value="head">
      <thead {...rest} className={cx(styles.headerRule, className)} />
    </SectionContext.Provider>
  )
}

/** Props for TableBody: `tbody` props plus the cadence override. */
export type TableBodyProps = React.ComponentPropsWithRef<'tbody'> & {
  /**
   * The five-row cadence: dotted `--role-rule` rules between rows and a
   * solid one after every fifth row. Default: on when the body holds more
   * than 10 rows.
   */
  cadence?: boolean
}

/** The body row group. Row rules are hairlines; over 10 rows they follow the five-row cadence. */
export function TableBody(props: TableBodyProps) {
  const { cadence, className, children, ...rest } = props
  const rows = React.Children.toArray(children).filter(React.isValidElement).length
  const useCadence = cadence ?? rows > 10
  return (
    <SectionContext.Provider value="body">
      <tbody
        {...rest}
        className={cx(useCadence ? `${styles.body} ${styles.cadence}` : styles.body, className)}
      >
        {children}
      </tbody>
    </SectionContext.Provider>
  )
}

/** Props for TableFoot: `tfoot` props. */
export type TableFootProps = React.ComponentPropsWithRef<'tfoot'>

/** The total row group, opened by the `line-double-hair` total rule. */
export function TableFoot(props: TableFootProps) {
  const { className, ...rest } = props
  return (
    <SectionContext.Provider value="foot">
      <tfoot {...rest} className={cx(styles.totalRule, className)} />
    </SectionContext.Provider>
  )
}

/** Props for TableRow: `tr` props plus the selected and inactive states. */
export type TableRowProps = React.ComponentPropsWithRef<'tr'> & {
  /**
   * Draws the `--border-size-2-25` row bar at the start edge. A row holding a
   * checked Checkbox, or the `:target` of a link (give it an `id`), shows
   * the bar without this prop.
   */
  selected?: boolean
  /** Sets the row in `--role-muted`. Always add a word ("Sold out"): never tone alone. */
  inactive?: boolean
}

/** A table row. Its cells learn their column, so stacked records can repeat the header labels. */
export function TableRow(props: TableRowProps) {
  const { selected, inactive, className, children, ...rest } = props
  let column = 0
  const cells = React.Children.toArray(children).map((child) => {
    const index = column
    const span = React.isValidElement<{ colSpan?: number }>(child)
      ? (child.props.colSpan ?? 1)
      : 1
    column += span
    const key = React.isValidElement(child) ? child.key : index
    return (
      <ColumnContext.Provider key={key} value={index}>
        {child}
      </ColumnContext.Provider>
    )
  })

  const classes = [styles.row, selected ? styles.selected : '', inactive ? styles.inactive : '']
    .filter(Boolean)
    .join(' ')

  return (
    <tr {...rest} className={cx(classes, className)}>
      {cells}
    </tr>
  )
}

interface CellCommonProps {
  /** Right-aligned lining tabular figures that never wrap; use fixed decimals per column. */
  numeric?: boolean
  /** `prioritize` tables: hidden until "Show All n Columns"; always printed. */
  optional?: boolean
}

/** Props for TableHeaderCell: `th` props, alignment, and the sort state. */
export type TableHeaderCellProps = React.ComponentPropsWithRef<'th'> &
  CellCommonProps & {
    /**
     * Makes the column header a sort button: its label keeps the header's
     * caps [D165], a ▲ or ▼ follows it, and `aria-sort` carries the state.
     */
    sort?: TableSort
    /** Called when the sort button is pressed; the caller updates `sort` and the rows. */
    onSort?: (event: React.MouseEvent<HTMLButtonElement>) => void
    /**
     * The sort state as words, appended to the button's accessible name.
     * Default ", sorted ascending", ", sorted descending" or ", not sorted".
     */
    sortStateLabel?: string
  }

const sortStateWords: Record<TableSort, string> = {
  ascending: ', sorted ascending',
  descending: ', sorted descending',
  none: ', not sorted',
}

/**
 * A header cell. In the head it is a column header (`type-label` caps,
 * bottom-aligned, aligned like its data; put units here, "Mass (kg)"); in
 * the body or foot it is a row header (`type-body-ui` at weight 600).
 */
export function TableHeaderCell(props: TableHeaderCellProps) {
  const {
    numeric,
    optional,
    sort,
    onSort,
    sortStateLabel,
    scope,
    className,
    children,
    ...rest
  } = props
  const section = React.useContext(SectionContext)
  const column = React.useContext(ColumnContext)
  const isColumnHeader = section === 'head'
  const sortable = isColumnHeader && (sort !== undefined || onSort !== undefined)
  const sortState: TableSort = sort ?? 'none'

  const classes = [
    isColumnHeader ? styles.headCell : styles.rowHeader,
    column === 0 ? styles.lead : '',
    numeric ? styles.numeric : '',
    optional ? styles.optional : '',
  ]
    .filter(Boolean)
    .join(' ')

  const content = sortable ? (
    <BaseButton className={styles.sortButton} onClick={onSort}>
      <span className={styles.sortLabel}>{children}</span>
      {/* The glyph box stays when unsorted, so the label never shifts. */}
      <svg className={styles.sortGlyph} viewBox="0 0 8 8" aria-hidden="true" focusable="false">
        {sortState === 'none' ? null : (
          <path d={sortState === 'descending' ? 'M4 7 .5 1h7z' : 'M4 1 7.5 7h-7z'} />
        )}
      </svg>
      <span className={styles.sortState}>{sortStateLabel ?? sortStateWords[sortState]}</span>
    </BaseButton>
  ) : (
    children
  )

  return (
    <th
      {...rest}
      scope={scope ?? (isColumnHeader ? 'col' : 'row')}
      aria-sort={sortable ? sortState : rest['aria-sort']}
      className={cx(classes, className)}
    >
      {section === 'body' && column === 0 ? <span className={styles.rowBar} aria-hidden="true" /> : null}
      {content}
    </th>
  )
}

/** Props for TableCell: `td` props, alignment, and the stacked label. */
export type TableCellProps = React.ComponentPropsWithRef<'td'> &
  CellCommonProps & {
    /**
     * The column's label in stacked records. Default: the column header's
     * text, read from `TableHead`.
     */
    label?: React.ReactNode
  }

/** A data cell in `type-body-ui` with lining tabular figures. Never leave one blank: write "—" and define it in the notes. */
export function TableCell(props: TableCellProps) {
  const { numeric, optional, label, className, children, ...rest } = props
  const section = React.useContext(SectionContext)
  const column = React.useContext(ColumnContext)
  const { columnLabels } = React.useContext(TableContext)
  const stackedLabel = label ?? (column >= 0 ? columnLabels[column] : undefined)

  const classes = [
    styles.cell,
    column === 0 ? styles.lead : '',
    numeric ? styles.numeric : '',
    optional ? styles.optional : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <td {...rest} className={cx(classes, className)}>
      {section === 'body' && column === 0 ? <span className={styles.rowBar} aria-hidden="true" /> : null}
      {stackedLabel == null || section === 'head' ? null : (
        <span className={styles.cellLabel}>{stackedLabel}</span>
      )}
      <span className={styles.cellValue}>{children}</span>
    </td>
  )
}

/**
 * Reads the column header labels from the first row of the `TableHead`
 * among `children`, so stacked records repeat them. A header composed
 * inside another component isn't found; pass `label` to its cells instead.
 */
function readColumnLabels(children: React.ReactNode): React.ReactNode[] {
  const labels: React.ReactNode[] = []
  const head = React.Children.toArray(children).find(
    (child): child is React.ReactElement<TableHeadProps> =>
      React.isValidElement(child) && child.type === TableHead
  )
  if (!head) return labels
  const row = React.Children.toArray(head.props.children).find(
    (child): child is React.ReactElement<TableRowProps> => React.isValidElement(child)
  )
  if (!row) return labels
  React.Children.toArray(row.props.children).forEach((cell) => {
    if (!React.isValidElement<{ colSpan?: number; children?: React.ReactNode }>(cell)) return
    const span = cell.props.colSpan ?? 1
    for (let index = 0; index < span; index += 1) labels.push(cell.props.children)
  })
  return labels
}

