'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from '../Collapsible'
import { SpecGrid } from '../SpecGrid'
import { SpecList } from '../SpecList'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './spec-sheet.module.css'

export { SpecGridItem, type SpecGridItemProps } from '../SpecGrid'
export { SpecListItem, type SpecListItemProps } from '../SpecList'

/*
 * Spec Sheet (§12.7): an item's measurable attributes, the densest module,
 * with no ornament. Composed from a `section`, the §8.3 spec grid (SpecGrid)
 * or leader list (SpecList), an optional `figure`, an optional provenance
 * line and a Collapsible for "More Details". On reference pages the
 * identity block heads the reading column [D188].
 *
 * Implementation (CSS Modules + CVA)
 * - Module: spec-sheet.module.css; CVA function `specSheet`.
 * - Axes: `kind` → glance | leader | manual | form-box → `glance`,
 *   `kindLeader` (axis-prefixed: `leader` is also a part), `manual`,
 *   `formBox`; `split` → `split` (glance only: the At a Glance split, lead
 *   beside the grid from --lg-n-above [D188]; excluded in the types for the
 *   other kinds); `primary`, `secondary` → scales module classes.
 * - Compound variants: none.
 * - Defaults: kind glance, split false; color axes: none [D133].
 * - Color fallback: inherits the scope. Secondary drives nothing in the
 *   sheet (no accents, P6); only a linked provenance title takes the
 *   --role-accent underline.
 * - States: static. The estimated cell (SpecGridItem `estimated`) is a data
 *   flag drawn by SpecGrid. The Collapsible's `data-panel-open` (Trigger)
 *   and `data-open` (Panel) follow §10.13 in its own module; `:hover` and
 *   `:focus-visible` on the provenance link follow the body link (§9.3).
 * - Parts: base (with `figured` while it holds a figure), identity
 *   (portrait, names, commonName, secondaryName), heading (moduleHeading
 *   at levels 3 and 4), intro, lead, provenance, body, sheet, grid (the
 *   SpecGrid or SpecList: cell, rule, icon, label, value and leader are
 *   theirs), frame and frameContent (manual), figure, more (Collapsible
 *   Root), moreTrigger, morePanel.
 * - Scope: none.
 * - Container: `base` is the inline-size container named `spec-grid`; the
 *   figure layout queries it (sheet beside its figure, 5 / 7, from 1024 px;
 *   viewport fallback --lg-n-above). The grid is its own `spec-grid`
 *   container (SpecGrid), so with `split` its ≈ 350–450 px half keeps it
 *   2-up by the §8.3 thresholds. The split itself is a page-grid placement
 *   on viewport media (--lg-n-above); its baseline is the lead stacked above
 *   the grid [D163, D188].
 *
 * Audubon's sticky scroll-spy rail and its sticky aside cards are rejected
 * [D188]: nothing in the sheet is sticky, and the identity block heads the
 * reading column in the flow.
 */
export const specSheet = cva(styles.base, {
  variants: {
    kind: {
      glance: styles.glance,
      leader: styles.kindLeader,
      manual: styles.manual,
      'form-box': styles.formBox,
    },
    split: {
      true: styles.split,
    },
    // Computed from `figure`, never a prop: the sheet may sit beside it.
    figured: {
      true: styles.figured,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'glance',
    split: false,
  },
})

type SpecSheetVariants = Omit<VariantProps<typeof specSheet>, 'figured'>

/** The reference-page identity block [D188]: portrait, common name and secondary name. */
export interface SpecSheetIdentity {
  /** A §10.12 Avatar at one of its fixed steps (e.g. `size="xl"`, 128 px). */
  portrait?: React.ReactNode
  /** The common name, `type-itemhead` in `--primary12`. */
  commonName: React.ReactNode
  /** The secondary (scientific) name, `type-secondary-name` in italic. */
  secondaryName?: React.ReactNode
}

/** The optional "More Details" disclosure (§10.13). */
export interface SpecSheetMore {
  /** The trigger label, title case: "More Details" [D160]. */
  label: React.ReactNode
  /** The label while open, e.g. "Fewer Details". Omitted, `label` stays. */
  openLabel?: React.ReactNode
  /** The further spec rows (SpecGridItems, or SpecListItems in a leader sheet). */
  children: React.ReactNode
}

type HeadingLevel = 2 | 3 | 4

interface SpecSheetCommonProps extends Omit<React.ComponentPropsWithRef<'section'>, 'children'> {
  /**
   * The section head: the chapter-stack H2 ("At a Glance") in `type-h2`
   * and `--role-heading`; `headingLevel` 3 or 4 sets it as a module head
   * in `type-itemhead` and `--primary12`.
   */
  heading?: React.ReactNode
  /** The heading level. Default `2`. */
  headingLevel?: HeadingLevel
  /** Reference pages: the identity block above the sheet, heading the reading column [D188]. */
  identity?: SpecSheetIdentity
  /** The lead, `type-lead` (§3.5 Recipe C). Beside the grid with `split`. */
  lead?: React.ReactNode
  /**
   * The provenance line, `type-small`: "Text adapted from *Lives of North
   * American Birds*". Set book titles in `<cite>`; a linked title takes the
   * body link's underline.
   */
  provenance?: React.ReactNode
  /** An optional figure (a §8.5 Figure). From 1024 px of the sheet it sits beside the grid (5 / 7). */
  figure?: React.ReactNode
  /** Accessible name for the grid when no `heading` labels it. */
  label?: string
  /** The "More Details" disclosure for long sheets; it prints expanded. */
  more?: SpecSheetMore
  /**
   * Primary Radix scale: rules, labels, values, frames and focus rings.
   * Never defaulted; omitted, it inherits the scope [D133].
   */
  primary?: SpecSheetVariants['primary']
  /** Secondary Radix scale: only a linked provenance title's underline. Never defaulted. */
  secondary?: SpecSheetVariants['secondary']
}

interface SpecSheetGlanceProps extends SpecSheetCommonProps {
  /**
   * `glance` (default): the rule-topped At a Glance grid (SpecGrid; pass
   * `SpecGridItem`s). `leader`: one column of "Label ···· Value" rows
   * (SpecList; pass `SpecListItem`s). `manual`: a `line-double` frame for a
   * full-page item (title, figure, numbered list, price, allergen matrix).
   * `form-box`: a ruled box around the grid.
   */
  kind?: 'glance'
  /**
   * The At a Glance split, on reference pages [D188]: from `--lg-n-above`
   * the lead and provenance take the first half of the reading span and the
   * grid the second, staying 2-up; below, the lead stacks above the grid.
   * Default `false`.
   */
  split?: boolean
  /** The spec cells: `SpecGridItem`s. */
  children: React.ReactNode
}

interface SpecSheetLeaderProps extends SpecSheetCommonProps {
  kind: 'leader'
  split?: never
  /** The rows: `SpecListItem`s. */
  children: React.ReactNode
}

interface SpecSheetManualProps extends SpecSheetCommonProps {
  kind: 'manual'
  split?: never
  /** The manual page's content: a title, a Figure, an `ol`, a price, a SpecList or a table. */
  children: React.ReactNode
}

interface SpecSheetFormBoxProps extends SpecSheetCommonProps {
  kind: 'form-box'
  split?: never
  /** The cells: `SpecGridItem`s, each a small caps label at the top left over its value. */
  children: React.ReactNode
}

/**
 * Props for SpecSheet: `section` props, the kind and split, the sheet's
 * parts and the color axes. `split` is accepted only with `kind="glance"`.
 */
export type SpecSheetProps =
  SpecSheetGlanceProps | SpecSheetLeaderProps | SpecSheetManualProps | SpecSheetFormBoxProps

const headingTags = { 2: 'h2', 3: 'h3', 4: 'h4' } as const

/**
 * A spec sheet. It prints as on screen, stacked, with black 0.75 pt rules
 * and leaders; cells never split across pages.
 */
export function SpecSheet(props: SpecSheetProps) {
  const {
    kind,
    split,
    heading,
    headingLevel = 2,
    identity,
    lead,
    provenance,
    figure,
    label,
    more,
    primary,
    secondary,
    className,
    children,
    ...rest
  } = props

  const scope = useScopeAttributes()
  const headingId = React.useId()
  const resolvedKind = kind ?? 'glance'
  const HeadingTag = headingTags[headingLevel]
  const isSplit = resolvedKind === 'glance' && split === true

  const renderRows = (rows: React.ReactNode, extraLabel?: string) => {
    if (resolvedKind === 'leader') {
      return (
        <SpecList className={styles.grid} aria-label={extraLabel}>
          {rows}
        </SpecList>
      )
    }
    if (resolvedKind === 'manual') {
      return <div className={styles.frameContent}>{rows}</div>
    }
    return (
      <SpecGrid className={styles.grid} label={extraLabel}>
        {rows}
      </SpecGrid>
    )
  }

  const gridLabel = heading == null ? label : undefined
  const intro =
    lead != null || provenance != null ? (
      <div className={styles.intro}>
        {lead != null ? <div className={styles.lead}>{lead}</div> : null}
        {provenance != null ? <p className={styles.provenance}>{provenance}</p> : null}
      </div>
    ) : null

  const rows = renderRows(children, gridLabel)
  const main = resolvedKind === 'manual' ? <div className={styles.frame}>{rows}</div> : rows

  return (
    <section
      {...rest}
      {...scope}
      aria-labelledby={heading != null ? headingId : rest['aria-labelledby']}
      className={specSheet({
        kind: resolvedKind,
        split: isSplit,
        figured: figure != null,
        primary,
        secondary,
        className,
      })}
    >
      {identity ? (
        <div className={styles.identity}>
          {identity.portrait != null ? (
            <div className={styles.portrait}>{identity.portrait}</div>
          ) : null}
          <div className={styles.names}>
            <p className={styles.commonName}>{identity.commonName}</p>
            {identity.secondaryName != null ? (
              <p className={styles.secondaryName}>{identity.secondaryName}</p>
            ) : null}
          </div>
        </div>
      ) : null}
      {heading != null ? (
        <HeadingTag
          id={headingId}
          className={headingLevel === 2 ? styles.heading : styles.moduleHeading}
        >
          {heading}
        </HeadingTag>
      ) : null}
      <div className={styles.body}>
        {intro}
        <div className={styles.sheet}>
          {main}
          {more ? (
            <Collapsible className={styles.more}>
              <CollapsibleTrigger className={styles.moreTrigger} openLabel={more.openLabel}>
                {more.label}
              </CollapsibleTrigger>
              <CollapsiblePanel className={styles.morePanel}>
                {renderRows(more.children)}
              </CollapsiblePanel>
            </Collapsible>
          ) : null}
        </div>
        {figure != null ? <div className={styles.figure}>{figure}</div> : null}
      </div>
    </section>
  )
}
