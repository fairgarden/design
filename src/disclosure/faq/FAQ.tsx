'use client'

import * as React from 'react'
import { Accordion as BaseAccordion } from '@base-ui/react/accordion'
import { useRender } from '@base-ui/react/use-render'
import { mergeProps } from '@base-ui/react/merge-props'
import { cva, type VariantProps } from 'class-variance-authority'

import { DisclosureGlyph } from '../collapsible'
import { Icon, type IconName } from '../../foundations/icon'
import { cx, resolveClassName } from '../../utils/className'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './faq.module.css'

/*
 * FAQ (§12.5): 4–15 independent question-and-answer pairs that readers scan.
 * Built on the Base UI Accordion in the §10.13 Ruled form (LTA disclosure
 * glyph) with the Strong top rule; motion follows §10.13.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: faq.module.css; CVA function `faq`.
 * - Axes: `kind` → ruled | keyed | split; `barred` → `barred` (the open bar
 *   on open items); `primary`, `secondary` → scales module classes.
 * - Compound variants: none.
 * - Defaults: kind ruled, barred false; color axes: none.
 * - Color fallback: inherits the scope.
 * - States: Trigger `data-panel-open` → glyph direction and color, and
 *   `openBar` under `barred`; Panel `data-starting-style` /
 *   `data-ending-style` → the §10.13 clip reveal, never opacity [D91];
 *   `:hover` (not disabled) on `trigger` → the bare-text underline on the
 *   question (--role-accent at --border-size-2, offset --size-px-1)
 *   [D181]; `:focus-visible` on `trigger` → the ring. No disabled
 *   state.
 * - Parts: base, header, title, intro, list (Accordion Root), item (Item),
 *   heading (Header), trigger (Trigger), icon (keyed), question, glyph,
 *   openBar, panel (Panel), answer, contact.
 * - Scope: none.
 * - Container: none. The list does not reflow; `split` is a page-grid
 *   placement on viewport media (--lg-n-above) [D163].
 */
export const faq = cva(styles.base, {
  variants: {
    kind: {
      ruled: styles.ruled,
      keyed: styles.keyed,
      split: styles.split,
    },
    barred: {
      true: styles.barred,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'ruled',
    barred: false,
  },
})

type FAQVariants = VariantProps<typeof faq>

/** Props for FAQ: `section` props, `render`, and the kind, bar and color axes. */
export type FAQProps = useRender.ComponentProps<'section'> & {
  /**
   * `ruled` (default): bare rows between `--role-rule` rules. `keyed`: a
   * leading block icon per row (`FAQItem icon`), answers indented to the
   * question column. `split`: from 1024 px of viewport, header and intro in
   * the left third and the list in the right two thirds.
   */
  kind?: FAQVariants['kind']
  /**
   * Shows a `--ds-stroke-3` `--primary12` bar at the start of each open
   * item's row: a bolder line, never a fill. Default `false`.
   */
  barred?: FAQVariants['barred']
  /**
   * Primary Radix scale: rules, questions, glyph and answers. Never
   * defaulted; omitted, it inherits the scope [D133].
   */
  primary?: FAQVariants['primary']
  /**
   * Secondary Radix scale: only the link underlines inside answers and on
   * the contact link (`--role-accent`). Never defaulted.
   */
  secondary?: FAQVariants['secondary']
}

/**
 * The FAQ module: `FAQHeader` (with `FAQTitle` and an optional `FAQIntro`),
 * `FAQList` holding `FAQItem`s, and an optional closing `FAQContact`. Place
 * it on light or deep grounds; on saturated grounds keep to five items with
 * answers of 40 words or fewer. Every answer prints expanded.
 */
export function FAQ(props: FAQProps) {
  const { render, ref, className, kind, barred, primary, secondary, ...rest } = props
  const scope = useScopeAttributes()
  return useRender({
    defaultTagName: 'section',
    render,
    ref,
    props: mergeProps<'section'>(
      {
        ...scope,
        className: faq({ kind, barred, primary, secondary, className }),
      },
      rest
    ),
  })
}

/** Props for FAQHeader: `header` props and `render`. */
export type FAQHeaderProps = useRender.ComponentProps<'header'>

/** The module header: the chapter-stack title, then the optional intro (§3.5 Recipe A). */
export function FAQHeader(props: FAQHeaderProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'header',
    render,
    ref,
    props: mergeProps<'header'>({ className: cx(styles.header, className) }, rest),
  })
}

/** Props for FAQTitle: heading props and `render` (default `<h2>`). */
export type FAQTitleProps = useRender.ComponentProps<'h2'>

/** The section head: `type-h2` in `--role-heading`. Renders `<h2>`. */
export function FAQTitle(props: FAQTitleProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'h2',
    render,
    ref,
    props: mergeProps<'h2'>({ className: cx(styles.title, className) }, rest),
  })
}

/** Props for FAQIntro: paragraph props and `render`. */
export type FAQIntroProps = useRender.ComponentProps<'p'>

/** An optional lede under the title, within `--ds-measure-reading`. */
export function FAQIntro(props: FAQIntroProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: mergeProps<'p'>({ className: cx(styles.intro, className) }, rest),
  })
}

/** Props for FAQContact: paragraph props and `render`. */
export type FAQContactProps = useRender.ComponentProps<'p'>

/** The optional closing contact line, e.g. "Still stuck? Write to us." with a Link. */
export function FAQContact(props: FAQContactProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: mergeProps<'p'>({ className: cx(styles.contact, className) }, rest),
  })
}

/** Props for FAQList: Base UI Accordion Root props. */
export type FAQListProps<Value = unknown> = BaseAccordion.Root.Props<Value>

/**
 * The item list, a Base UI Accordion Root. Several items may be open at once
 * (`multiple`, default `true`); closed answers stay in the DOM
 * (`hiddenUntilFound`, default `true`) for find-in-page and print. Never
 * open items by hover.
 */
export function FAQList<Value = unknown>(props: FAQListProps<Value>) {
  const { className, multiple = true, hiddenUntilFound = true, ...rest } = props
  return (
    <BaseAccordion.Root<Value>
      {...rest}
      multiple={multiple}
      hiddenUntilFound={hiddenUntilFound}
      className={resolveClassName(className, (extra) => cx(styles.list, extra))}
    />
  )
}

/** Props for FAQItem: Base UI Accordion Item props (without `disabled`) plus the question. */
export type FAQItemProps = Omit<BaseAccordion.Item.Props, 'disabled' | 'title'> & {
  /** The question: `type-itemhead` in `--primary12`, inside an `h3`. */
  question: React.ReactNode
  /**
   * The leading block icon of the `keyed` kind (§6.10 subject symbol,
   * Material Symbols Rounded, block tier). Ignored by the other kinds.
   */
  icon?: IconName
  /** Props for the answer panel, such as `keepMounted`. */
  panelProps?: Omit<BaseAccordion.Panel.Props, 'children'>
}

/**
 * One question and its answer. The question is an `h3` wrapping the trigger;
 * the disclosure glyph trails it, top-aligned to its first line. The answer
 * is `type-body`, within `--ds-measure-reading`. FAQ items are never
 * disabled.
 */
export function FAQItem(props: FAQItemProps) {
  const { question, icon, panelProps, className, children, ...rest } = props
  const { className: panelClassName, ...panelRest } = panelProps ?? {}
  return (
    <BaseAccordion.Item
      {...rest}
      className={resolveClassName(className, (extra) => cx(styles.item, extra))}
    >
      <BaseAccordion.Header className={styles.heading}>
        <BaseAccordion.Trigger className={styles.trigger}>
          <span className={styles.openBar} aria-hidden="true" />
          {icon ? <Icon name={icon} size="block" className={styles.icon} /> : null}
          <span className={styles.question}>{question}</span>
          <DisclosureGlyph size="row" className={styles.glyph} />
        </BaseAccordion.Trigger>
      </BaseAccordion.Header>
      <BaseAccordion.Panel
        {...panelRest}
        className={resolveClassName(panelClassName, (extra) => cx(styles.panel, extra))}
      >
        <div className={styles.answer}>{children}</div>
      </BaseAccordion.Panel>
    </BaseAccordion.Item>
  )
}

