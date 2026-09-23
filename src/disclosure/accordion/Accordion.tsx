'use client'

import * as React from 'react'
import { Accordion as BaseAccordion } from '@base-ui/react/accordion'
import { cva, type VariantProps } from 'class-variance-authority'

import { DisclosureGlyph } from '../collapsible'
import { Icon, iconHost, type IconName } from '../../foundations/icon'
import { cx, resolveClassName } from '../../utils/className'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './accordion.module.css'

/*
 * Accordion (§10.13): long reference content scanned by heading.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: accordion.module.css; CVA function `accordion`.
 * - Axes: `glyph` → disclosure | plusminus (the LTA glyph at the row's end,
 *   or the outline circle holding + / −, the documented alternate);
 *   `headed` → `headed` (a --border-size-2 --primary12 rule above the first
 *   item, when the accordion follows a heading); `primary`, `secondary` →
 *   scales module classes (`secondary` unused).
 * - Compound variants: none.
 * - Defaults: glyph disclosure, headed false; color axes: none.
 * - Color fallback: inherits the scope.
 * - States: trigger `data-panel-open` → the glyph flips direction and takes
 *   --primary12 (never rotates); `:hover` (not disabled) → the bare-text
 *   underline on the title (--role-accent at --border-size-2, offset
 *   --size-px-1), the disclosure glyph unchanged, the plus/minus glyph at
 *   the next tier's weight (§10.1 icon states) [D181]; `:focus-visible`
 *   → ring around the row, inside the column; `data-disabled` → title and
 *   glyph --role-muted. Item `data-open` → no fill change. Panel
 *   `data-starting-style` / `data-ending-style` → the clip reveal, instant
 *   under --motionNotOK [D91].
 * - Parts: base, item, header, trigger, icon, title, glyph, panel (+ `content`).
 * - Scope: none. Container: none; inherits its context.
 */
export const accordion = cva(styles.base, {
  variants: {
    glyph: {
      disclosure: styles.disclosure,
      plusminus: styles.plusminus,
    },
    headed: {
      true: styles.headed,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    glyph: 'disclosure',
    headed: false,
  },
})

type AccordionVariants = VariantProps<typeof accordion>
export type AccordionGlyph = NonNullable<AccordionVariants['glyph']>

const AccordionGlyphContext = React.createContext<AccordionGlyph>('disclosure')

/** Props for Accordion: Base UI Accordion Root props plus the glyph, headed and color axes. */
export type AccordionProps<Value = unknown> = BaseAccordion.Root.Props<Value> & {
  /**
   * `disclosure` (default): the LTA expand/collapse glyph at the row's end
   * [D109]. `plusminus`: the outline circle holding + or −, the documented
   * alternate for product UI. Never mix the two on one page.
   */
  glyph?: AccordionVariants['glyph']
  /**
   * Draws a `--border-size-2` `--primary12` rule above the first item. Use
   * it when the accordion directly follows a heading. Default `false`.
   */
  headed?: AccordionVariants['headed']
  /**
   * Primary Radix scale: rules, titles, glyph and panel text. Never
   * defaulted; omitted, it inherits the scope [D133].
   */
  primary?: AccordionVariants['primary']
  /** Secondary Radix scale, accepted for the shared contract; no part uses it. */
  secondary?: AccordionVariants['secondary']
}

/**
 * A set of disclosure rows divided by `--role-rule` rules, including after
 * the last item. Several items may be open at once (`multiple`, default
 * `true`). Closed panels stay in the DOM (`hiddenUntilFound`, default
 * `true`), so find-in-page reaches them and every panel prints expanded.
 * Never convert an accordion into tabs.
 */
export function Accordion<Value = unknown>(props: AccordionProps<Value>) {
  const {
    glyph,
    headed,
    primary,
    secondary,
    className,
    multiple = true,
    hiddenUntilFound = true,
    ...rest
  } = props
  const scope = useScopeAttributes()
  return (
    <AccordionGlyphContext.Provider value={glyph ?? 'disclosure'}>
      <BaseAccordion.Root<Value>
        {...rest}
        {...scope}
        multiple={multiple}
        hiddenUntilFound={hiddenUntilFound}
        className={resolveClassName(className, (extra) =>
          accordion({ glyph, headed, primary, secondary, className: extra })
        )}
      />
    </AccordionGlyphContext.Provider>
  )
}

type HeadingLevel = 2 | 3 | 4 | 5 | 6

const headingTags = {
  2: <h2 />,
  3: <h3 />,
  4: <h4 />,
  5: <h5 />,
  6: <h6 />,
} as const satisfies Record<HeadingLevel, React.ReactElement>

/** Props for AccordionItem: Base UI Accordion Item props (without `title`) plus the row content. */
export type AccordionItemProps = Omit<BaseAccordion.Item.Props, 'title'> & {
  /**
   * The row's title, `type-subhead` in `--primary12`. Write it to stand
   * alone: it becomes the printed heading.
   */
  title: React.ReactNode
  /**
   * An optional leading subject symbol (§6.10), Material Symbols Rounded at
   * the tag tier; the panel indents to the title column. Dropped below
   * 360 px so the title keeps its width.
   */
  icon?: IconName
  /** The heading level wrapping the trigger. Default `3`. */
  headingLevel?: HeadingLevel
  /** Props for the panel, such as `keepMounted`. */
  panelProps?: Omit<BaseAccordion.Panel.Props, 'children'>
}

/**
 * One row: a heading wrapping the trigger (optional icon, title, glyph at
 * the row's end, top-aligned to the title's first line) and the panel. The
 * whole row is the target. There is no fill change when it opens.
 */
export function AccordionItem(props: AccordionItemProps) {
  const {
    title,
    icon,
    headingLevel = 3,
    panelProps,
    className,
    children,
    ...rest
  } = props
  const glyph = React.useContext(AccordionGlyphContext)
  const { className: panelClassName, ...panelRest } = panelProps ?? {}

  return (
    <BaseAccordion.Item
      {...rest}
      className={resolveClassName(className, (extra) => cx(styles.item, extra))}
    >
      <BaseAccordion.Header className={styles.header} render={headingTags[headingLevel]}>
        <BaseAccordion.Trigger
          className={glyph === 'plusminus' ? `${styles.trigger} ${iconHost}` : styles.trigger}
        >
          {icon ? <Icon name={icon} size="tag" className={styles.icon} /> : null}
          <span className={styles.title}>{title}</span>
          {glyph === 'plusminus' ? (
            // The trigger hosts the sign's hover and press weight (§10.1) [D181].
            <span className={`${styles.glyph} ${styles.circle}`} aria-hidden="true">
              <Icon name="add" weight="interactive" className={styles.plus} />
              <Icon name="remove" weight="interactive" className={styles.minus} />
            </span>
          ) : (
            <DisclosureGlyph size="row" className={styles.glyph} />
          )}
        </BaseAccordion.Trigger>
      </BaseAccordion.Header>
      <BaseAccordion.Panel
        {...panelRest}
        className={resolveClassName(panelClassName, (extra) => cx(styles.panel, extra))}
      >
        <div className={styles.content}>{children}</div>
      </BaseAccordion.Panel>
    </BaseAccordion.Item>
  )
}

