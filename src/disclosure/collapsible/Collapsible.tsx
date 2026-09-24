'use client'

import * as React from 'react'
import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible'
import { cva, type VariantProps } from 'class-variance-authority'

import { cx, resolveClassName } from '../../utils/className'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './collapsible.module.css'

/*
 * Collapsible (§10.13): one in-place disclosure, "Show 12 more" / "Show less".
 *
 * Implementation (CSS Modules + CVA)
 * - Module: collapsible.module.css; CVA function `collapsible`.
 * - Axes: `primary`, `secondary` → scales module classes (`secondary` unused).
 * - Compound variants: none. Defaults: none; color axes: none.
 * - Color fallback: inherits the scope.
 * - States: trigger `data-panel-open` → the disclosure glyph turns inward and
 *   takes --primary12, and `openLabel` replaces the label; `:hover` (not
 *   disabled) → the bare-text underline on the label (--role-accent at
 *   --border-size-2, offset --size-px-1), the glyph unchanged [D109, D181];
 *   `:focus-visible` → ring;
 *   `data-disabled` → label and glyph --role-muted. Panel `data-starting-style`
 *   / `data-ending-style` → the clip reveal at --ds-duration-disclosure,
 *   instant under --motionNotOK, never opacity [D91].
 * - Parts: base, trigger, glyph, label, panel (+ `content`, the padded inner box).
 * - Scope: none. Container: none; inherits its context.
 *
 * The disclosure glyph (DisclosureGlyph) is a custom glyph, the one
 * indicator for anything that expands in place [D109]; it is a §1.5.12 /
 * §6.10 exception to Material Symbols and is never `expand_more`.
 */
export const collapsible = cva(styles.base, {
  variants: {
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
})

type CollapsibleVariants = VariantProps<typeof collapsible>

/** The disclosure glyph's two tiers (§10.13). */
export const disclosureGlyph = cva(styles.glyph, {
  variants: {
    size: {
      row: styles.glyphRow,
      chrome: styles.glyphChrome,
    },
  },
  defaultVariants: {
    size: 'row',
  },
})

/**
 * Add to an icon-only control whose only content is the disclosure glyph
 * (the staircase or section-bar toggle): hover and press then swap the
 * glyph to the next tier's weight (§10.1 icon states) [D181]. Trigger rows
 * (Accordion, FAQ, Collapsible) never take it: their glyph does not change
 * on hover [D109].
 */
export const disclosureGlyphHost: string = styles.glyphHost

/** Props for DisclosureGlyph: SVG props (without `children`) and the tier. */
export type DisclosureGlyphProps = Omit<React.ComponentPropsWithRef<'svg'>, 'children'> & {
  /**
   * `row` (default): `--size-px-4` (20 px) at `--ds-stroke-1-5`, for trigger
   * rows (Accordion, FAQ). `chrome`: `--size-px-3` (16 px) at
   * `--ds-stroke-1-25`, for bars, drawer groups and an inline "Show more".
   */
  size?: VariantProps<typeof disclosureGlyph>['size']
}

/**
 * The expand/collapse glyph [D109]: two thin arrows pointing outward from
 * a short center hairline when collapsed, inward when expanded (§6.10). It
 * reads the state from the nearest Base UI trigger's `data-panel-open`, so
 * place it inside an Accordion or Collapsible trigger. The direction swaps
 * instantly and never rotates; collapsed it is --role-muted, expanded
 * --primary12. Decorative: the trigger carries the state (`aria-expanded`).
 */
export function DisclosureGlyph({ size, className, ...rest }: DisclosureGlyphProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      focusable="false"
      {...rest}
      className={disclosureGlyph({ size, className })}
    >
      {/* Collapsed: arrows point outward (open V heads at ±30°, §6.2). */}
      <g className={styles.glyphOut}>
        <path d="M5 10h10" vectorEffect="non-scaling-stroke" />
        <path d="M10 7.5v-5M8 5.96l2-3.46 2 3.46" vectorEffect="non-scaling-stroke" />
        <path d="M10 12.5v5M8 14.04l2 3.46 2-3.46" vectorEffect="non-scaling-stroke" />
      </g>
      {/* Expanded: arrows point inward, onto the hairline. */}
      <g className={styles.glyphIn}>
        <path d="M5 10h10" vectorEffect="non-scaling-stroke" />
        <path d="M10 2.5v5M8 4.04l2 3.46 2-3.46" vectorEffect="non-scaling-stroke" />
        <path d="M10 17.5v-5M8 15.96l2-3.46 2 3.46" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  )
}

/** Props for Collapsible: Base UI Collapsible Root props plus the color axes. */
export type CollapsibleProps = BaseCollapsible.Root.Props & {
  /**
   * Primary Radix scale: label, glyph and panel text. Never defaulted;
   * omitted, it inherits the scope [D133].
   */
  primary?: CollapsibleVariants['primary']
  /** Secondary Radix scale, accepted for the shared contract; no part uses it. */
  secondary?: CollapsibleVariants['secondary']
}

/**
 * One in-place disclosure (§10.13): a `CollapsibleTrigger` (the disclosure
 * glyph at the inline tier plus a label) and a `CollapsiblePanel`. Use it for
 * "Show more" on truncated lists and optional detail; never hide content a
 * task depends on. Every panel prints expanded and the trigger is hidden.
 */
export function Collapsible(props: CollapsibleProps) {
  const { primary, secondary, className, ...rest } = props
  const scope = useScopeAttributes()
  return (
    <BaseCollapsible.Root
      {...rest}
      {...scope}
      className={resolveClassName(className, (extra) =>
        collapsible({ primary, secondary, className: extra })
      )}
    />
  )
}

/** Props for CollapsibleTrigger: Base UI Collapsible Trigger props plus the open label. */
export type CollapsibleTriggerProps = BaseCollapsible.Trigger.Props & {
  /**
   * The label while the panel is open, e.g. "Show less". Omitted, the
   * children stay. Author it in sentence case.
   */
  openLabel?: React.ReactNode
}

/**
 * The trigger: the disclosure glyph (16 px, `chrome` tier) then the label,
 * e.g. "Show 12 more". The whole trigger is the ≥ 44 px target; the glyph
 * alone never is.
 */
export function CollapsibleTrigger(props: CollapsibleTriggerProps) {
  const { openLabel, className, children, ...rest } = props
  return (
    <BaseCollapsible.Trigger
      {...rest}
      className={resolveClassName(className, (extra) => cx(styles.trigger, extra))}
    >
      <DisclosureGlyph size="chrome" />
      <span className={openLabel == null ? styles.label : `${styles.label} ${styles.closedLabel}`}>
        {children}
      </span>
      {openLabel == null ? null : (
        <span className={`${styles.label} ${styles.openLabel}`}>{openLabel}</span>
      )}
    </BaseCollapsible.Trigger>
  )
}

/** Props for CollapsiblePanel: Base UI Collapsible Panel props. */
export type CollapsiblePanelProps = BaseCollapsible.Panel.Props

/**
 * The panel. It stays in the DOM while closed (`hiddenUntilFound`, default
 * `true`), so find-in-page reaches it and print shows it expanded. It opens
 * with a clip reveal at `--ds-duration-disclosure`, instant under reduced
 * motion.
 */
export function CollapsiblePanel(props: CollapsiblePanelProps) {
  const { className, children, hiddenUntilFound = true, ...rest } = props
  return (
    <BaseCollapsible.Panel
      {...rest}
      hiddenUntilFound={hiddenUntilFound}
      className={resolveClassName(className, (extra) => cx(styles.panel, extra))}
    >
      <div className={styles.content}>{children}</div>
    </BaseCollapsible.Panel>
  )
}

